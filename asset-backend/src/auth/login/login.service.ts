import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AUTH_ERROR_CODE } from './auth-error-codes';
import { SendCodePurpose } from './dto/send-code.dto';

interface CodeRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
}

interface AttemptRecord {
  count: number;
  lockUntil: number;
}

@Injectable()
export class LoginService {
  private readonly codeStore = new Map<string, CodeRecord>();
  private readonly attemptStore = new Map<string, AttemptRecord>();
  private readonly tokenBlacklist = new Map<string, number>();
  private readonly jwtSecret: string;
  private readonly codeExpireMs: number;
  private readonly codeCooldownMs: number;
  private readonly maxLoginAttempts: number;
  private readonly lockDurationMs: number;
  private readonly tokenExpireSeconds: number;
  private readonly exposeMockCode: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'asset_stack_dev_secret',
    );
    this.codeExpireMs =
      this.configService.get<number>('LOGIN_CODE_EXPIRE_SECONDS', 300) * 1000;
    this.codeCooldownMs =
      this.configService.get<number>('LOGIN_CODE_COOLDOWN_SECONDS', 60) * 1000;
    this.maxLoginAttempts = this.configService.get<number>(
      'LOGIN_MAX_ATTEMPTS',
      5,
    );
    this.lockDurationMs =
      this.configService.get<number>('LOGIN_LOCK_SECONDS', 600) * 1000;
    this.tokenExpireSeconds = this.configService.get<number>(
      'JWT_EXPIRES_IN_SECONDS',
      60 * 60 * 24 * 7,
    );
    this.exposeMockCode =
      this.configService.get<string>('SMS_MOCK_MODE', 'true') !== 'false';
  }

  async sendCode(
    phone: string,
    purpose: SendCodePurpose = SendCodePurpose.Login,
  ) {
    if (purpose === SendCodePurpose.Login) {
      const exists = await this.userRepository.existsBy({ phone });
      if (!exists) {
        throw this.badRequest(
          AUTH_ERROR_CODE.PHONE_NOT_REGISTERED,
          '该手机号未注册',
        );
      }
    }

    if (purpose === SendCodePurpose.Register) {
      const exists = await this.userRepository.existsBy({ phone });
      if (exists) {
        throw this.badRequest(
          AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS,
          '该手机号已注册，请使用登录',
        );
      }
    }

    const now = Date.now();
    const previous = this.codeStore.get(phone);
    if (previous && now - previous.lastSentAt < this.codeCooldownMs) {
      const retryAfterSeconds = Math.ceil(
        (this.codeCooldownMs - (now - previous.lastSentAt)) / 1000,
      );
      throw new HttpException(
        {
          code: AUTH_ERROR_CODE.SEND_CODE_TOO_FREQUENT,
          msg: `发送太频繁，请 ${retryAfterSeconds}s 后重试`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateCode();
    const expiresAt = now + this.codeExpireMs;

    this.codeStore.set(phone, { code, expiresAt, lastSentAt: now });
    console.log(`[LOGIN] send code => phone=${phone}, code=${code}`);

    const data: Record<string, number | string> = {
      expiresIn: Math.floor(this.codeExpireMs / 1000),
    };

    // 学习/联调阶段可见验证码；生产环境可通过环境变量关闭
    if (this.exposeMockCode) {
      data.mockCode = code;
    }

    return data;
  }

  async loginByCode(phone: string, code: string) {
    this.checkLock(phone);

    const record = this.codeStore.get(phone);

    if (!record) {
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_NOT_SENT,
        '请先发送验证码',
      );
    }

    if (Date.now() > record.expiresAt) {
      this.codeStore.delete(phone);
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_INVALID,
        '验证码错误或已过期',
      );
    }

    if (record.code !== code) {
      this.markFailedAttempt(phone);
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_INVALID,
        '验证码错误或已过期',
      );
    }

    this.codeStore.delete(phone);
    this.attemptStore.delete(phone);

    const token = sign({ sub: phone, phone }, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: this.tokenExpireSeconds,
    });

    const { user, isNewUser } = await this.findOrCreateUserByPhone(phone);
    return {
      token,
      isNewUser,
      userInfo: this.toUserInfo(user),
    };
  }

  logout(token: string) {
    let payload: JwtPayload;
    try {
      payload = verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('token 无效');
    }
    const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
    this.tokenBlacklist.set(token, expiresAt);
    this.cleanupTokenBlacklist();
    return null;
  }

  verifyToken(token: string): JwtPayload {
    this.cleanupTokenBlacklist();
    if (this.tokenBlacklist.has(token)) {
      throw new UnauthorizedException('登录状态已失效');
    }

    try {
      return verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
  }

  getPhoneFromToken(token: string): string {
    const payload = this.verifyToken(token);
    const phone = typeof payload.phone === 'string' ? payload.phone : '';
    if (!phone) {
      throw new UnauthorizedException('登录状态已失效');
    }
    return phone;
  }

  async getUserInfoByToken(token: string) {
    const phone = this.getPhoneFromToken(token);
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.toUserInfo(user);
  }

  async updateUserInfoByToken(
    token: string,
    payload: {
      nickname?: string;
      avatar?: string;
      phone?: string;
      code?: string;
    },
  ) {
    const phone = this.getPhoneFromToken(token);
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const hasNickname = typeof payload.nickname === 'string';
    const hasAvatar = typeof payload.avatar === 'string';
    const nextPhone =
      typeof payload.phone === 'string' ? payload.phone.trim() : '';
    const verifyCode =
      typeof payload.code === 'string' ? payload.code.trim() : '';

    if (!hasNickname && !hasAvatar && !nextPhone) {
      throw this.badRequest(
        AUTH_ERROR_CODE.USER_UPDATE_EMPTY_PAYLOAD,
        '至少需要修改一项用户信息',
      );
    }

    if (hasNickname) {
      user.nickname = payload.nickname!.trim();
    }

    if (hasAvatar) {
      user.avatar = payload.avatar!.trim();
    }

    let refreshedToken = '';
    if (nextPhone) {
      if (!verifyCode) {
        throw this.badRequest(
          AUTH_ERROR_CODE.VERIFY_CODE_REQUIRED,
          '请先输入验证码',
        );
      }
      if (nextPhone === user.phone) {
        throw this.badRequest(
          AUTH_ERROR_CODE.SAME_BOUND_PHONE,
          '与当前绑定手机号相同',
        );
      }
      const exists = await this.userRepository.existsBy({ phone: nextPhone });
      if (exists) {
        throw this.badRequest(
          AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS,
          '该手机号已注册，请使用其他手机号',
        );
      }
      this.assertValidCode(nextPhone, verifyCode);
      user.phone = nextPhone;
      this.logout(token);
      refreshedToken = this.issueToken(nextPhone);
    }

    await this.userRepository.save(user);
    return refreshedToken ? { token: refreshedToken } : null;
  }

  private async findOrCreateUserByPhone(
    phone: string,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const existed = await this.userRepository.findOne({ where: { phone } });
    if (existed) {
      return { user: existed, isNewUser: false };
    }

    const user = this.userRepository.create({
      phone,
      nickname: '',
      avatar: '',
      status: 1,
    });
    const created = await this.userRepository.save(user);
    return { user: created, isNewUser: true };
  }

  private toUserInfo(user: User) {
    return {
      id: Number(user.id),
      phone: user.phone,
      nickname: user.nickname ?? '',
      avatar: user.avatar ?? '',
      createTime: this.formatDateTime(user.createTime),
    };
  }

  private formatDateTime(date?: Date | string) {
    if (!date) return '';
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private assertValidCode(phone: string, code: string) {
    const record = this.codeStore.get(phone);
    if (!record) {
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_NOT_SENT,
        '请先发送验证码',
      );
    }
    if (Date.now() > record.expiresAt) {
      this.codeStore.delete(phone);
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_INVALID,
        '验证码错误或已过期',
      );
    }
    if (record.code !== code) {
      throw this.badRequest(
        AUTH_ERROR_CODE.VERIFY_CODE_INVALID,
        '验证码错误或已过期',
      );
    }
    this.codeStore.delete(phone);
  }

  private issueToken(phone: string) {
    return sign({ sub: phone, phone }, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: this.tokenExpireSeconds,
    });
  }

  private checkLock(phone: string) {
    const attempt = this.attemptStore.get(phone);
    if (!attempt) return;

    if (attempt.lockUntil > Date.now()) {
      const remaining = Math.ceil((attempt.lockUntil - Date.now()) / 1000);
      throw new HttpException(
        {
          code: AUTH_ERROR_CODE.LOGIN_TRY_TOO_MANY,
          msg: `尝试次数过多，请 ${remaining}s 后再试`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.attemptStore.delete(phone);
  }

  private markFailedAttempt(phone: string) {
    const previous = this.attemptStore.get(phone);
    const nextCount = (previous?.count ?? 0) + 1;

    if (nextCount >= this.maxLoginAttempts) {
      this.attemptStore.set(phone, {
        count: nextCount,
        lockUntil: Date.now() + this.lockDurationMs,
      });
      return;
    }

    this.attemptStore.set(phone, { count: nextCount, lockUntil: 0 });
  }

  private cleanupTokenBlacklist() {
    const now = Date.now();
    for (const [token, expiresAt] of this.tokenBlacklist.entries()) {
      if (expiresAt <= now) {
        this.tokenBlacklist.delete(token);
      }
    }
  }

  private badRequest(code: number, msg: string) {
    return new HttpException({ code, msg }, HttpStatus.BAD_REQUEST);
  }
}
