/* ali-oss 无完整类型定义，此处仅封装 put 与签名读能力 */

/* eslint-disable @typescript-eslint/no-unsafe-call -- ali-oss */

import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { randomUUID } from 'crypto';
import * as path from 'path';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

/** 与上传路径一致：仅允许该前缀的对象参与读签名（防越权签任意 key） */
const OBJECT_KEY_PREFIX = 'avatars/';

type OssPutClient = {
  put: (
    name: string,
    data: Buffer,
    options?: { headers?: Record<string, string> },
  ) => Promise<{ url?: string }>;
  signatureUrl: (
    name: string,
    options?: { expires?: number; method?: string },
  ) => string;
  signatureUrlV4: (
    method: string,
    expires: number,
    request: undefined,
    objectName: string,
  ) => Promise<string>;
};

function envFlag(config: ConfigService, key: string, defaultTrue: boolean): boolean {
  const raw = config.get<string>(key);
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return defaultTrue;
  }
  return String(raw).trim().toLowerCase() === 'true';
}

@Injectable()
export class OssService {
  private client: OssPutClient | null = null;
  /** 新版 Bucket 常要求 SigV4；V1 签名链在浏览器里会 403，见 README 说明 */
  private readonly useAuthorizationV4: boolean;

  constructor(private readonly config: ConfigService) {
    this.useAuthorizationV4 = envFlag(
      this.config,
      'OSS_AUTHORIZATION_V4',
      true,
    );

    const accessKeyId = this.config.get<string>('OSS_ACCESS_KEY_ID')?.trim();
    const accessKeySecret = this.config
      .get<string>('OSS_ACCESS_KEY_SECRET')
      ?.trim();
    const bucket = this.config.get<string>('OSS_BUCKET')?.trim();
    const region = this.config
      .get<string>('OSS_REGION', 'oss-cn-hangzhou')
      ?.trim();

    if (accessKeyId && accessKeySecret && bucket) {
      this.client = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        secure: true,
        ...(this.useAuthorizationV4 ? { authorizationV4: true } : {}),
      }) as OssPutClient;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  /** 是否启用 OSS SDK V4 签名（读链接用 signatureUrlV4） */
  usesAuthorizationV4(): boolean {
    return this.useAuthorizationV4;
  }

  getReadUrlExpiresSeconds(): number {
    return this.config.get<number>('OSS_SIGN_URL_EXPIRES_SECONDS', 3600);
  }

  getUploadPreviewExpiresSeconds(): number {
    return this.config.get<number>('OSS_UPLOAD_PREVIEW_EXPIRES_SECONDS', 1800);
  }

  async uploadAvatarImage(
    phone: string,
    buffer: Buffer,
    originalname: string,
    mimetype?: string,
  ): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'OSS 未配置：请在环境变量中设置 OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_BUCKET',
      );
    }

    const mime = this.normalizeMime(mimetype, originalname);
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException(
        `不支持的图片类型：${mime || 'unknown'}，仅支持 JPEG/PNG/GIF/WebP`,
      );
    }

    const ext = this.extFromMime(mime);
    const safePhone = phone.replace(/\D/g, '') || 'unknown';
    const objectKey = `${OBJECT_KEY_PREFIX}${safePhone}/${randomUUID()}${ext}`;

    await this.client.put(objectKey, buffer, {
      headers: {
        'Content-Type': mime,
      },
    });

    return objectKey;
  }

  normalizeToObjectKey(stored: string): string | null {
    const t = stored.trim();
    if (!t) return null;
    if (!/^https?:\/\//i.test(t)) {
      return this.isSafeObjectKey(t) ? t : null;
    }
    try {
      const u = new URL(t);
      const p = u.pathname.replace(/^\/+/, '');
      if (this.isSafeObjectKey(p)) return p;
      return null;
    } catch {
      return null;
    }
  }

  isSafeObjectKey(key: string): boolean {
    if (!key || key.length > 512) return false;
    if (!key.startsWith(OBJECT_KEY_PREFIX)) return false;
    if (key.includes('..') || key.includes('\\')) return false;
    return true;
  }

  /**
   * 生成 GET 读签名 URL。开启 OSS_AUTHORIZATION_V4 时使用 signatureUrlV4（与控制台新版桶一致）。
   */
  async getSignedUrlByKey(
    objectKey: string,
    expiresSeconds?: number,
  ): Promise<string> {
    if (!this.client || !this.isSafeObjectKey(objectKey)) return '';
    const exp = expiresSeconds ?? this.getReadUrlExpiresSeconds();
    if (this.useAuthorizationV4) {
      return this.client.signatureUrlV4('GET', exp, undefined, objectKey);
    }
    return this.client.signatureUrl(objectKey, {
      expires: exp,
      method: 'GET',
    });
  }

  async signImageUrlForRead(
    stored: string | null | undefined,
  ): Promise<string> {
    if (stored == null || stored === '') return '';
    const raw = String(stored).trim();
    if (!raw) return '';
    if (!this.client) return raw;
    const key = this.normalizeToObjectKey(raw);
    if (!key) return raw;
    const signed = await this.getSignedUrlByKey(key);
    return signed || raw;
  }

  private normalizeMime(
    mimetype: string | undefined,
    originalname: string,
  ): string {
    if (mimetype && ALLOWED_MIME.has(mimetype)) {
      return mimetype;
    }
    const ext = path.extname(originalname || '').toLowerCase();
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return map[ext] ?? '';
  }

  private extFromMime(mime: string): string {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/gif') return '.gif';
    if (mime === 'image/webp') return '.webp';
    return '.jpg';
  }
}
