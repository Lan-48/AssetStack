import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Put,
  Query,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  LoginByCodeDto,
  SendCodeDto,
  SendCodePurpose,
  UpdateUserInfoDto,
} from './dto';
import { LoginService } from './login.service';
import { LoginAuthGuard } from './login-auth.guard';
import { OssService } from '../../oss/oss.service';

@ApiTags('用户认证')
@Controller('user')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly ossService: OssService,
  ) {}

  @Post('send-code')
  @HttpCode(200)
  @ApiOperation({ summary: '发送登录验证码' })
  @ApiBody({ type: SendCodeDto })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({
    status: 400,
    description: '手机号格式不正确；登录发码：未注册；注册发码：手机号已在库中',
  })
  async sendCode(@Body() dto: SendCodeDto) {
    const purpose = dto.purpose ?? SendCodePurpose.Login;
    const data = await this.loginService.sendCode(dto.phone, purpose);
    return { code: 200, msg: '发送成功', data };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '手机号 + 验证码登录' })
  @ApiBody({ type: LoginByCodeDto })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '验证码错误或已过期' })
  async login(@Body() dto: LoginByCodeDto) {
    const data = await this.loginService.loginByCode(dto.phone, dto.code);
    return { code: 200, msg: '登录成功', data };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '退出登录' })
  @ApiHeader({
    name: 'token',
    required: false,
    description: '用户登录令牌',
    example: 'mock_92ab39d3f5b1...',
  })
  @ApiResponse({ status: 200, description: '退出成功' })
  logout(@Headers('token') token?: string) {
    if (token) {
      this.loginService.logout(token);
    }
    return { code: 200, msg: '退出成功', data: null };
  }

  @Get('info')
  @HttpCode(200)
  @ApiOperation({ summary: '获取用户信息' })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '用户登录令牌（必填）',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未登录或 token 已过期' })
  async info(@Headers('token') token: string) {
    const data = await this.loginService.getUserInfoByToken(token);
    return { code: 200, msg: '获取成功', data };
  }

  @Post('upload-avatar')
  @HttpCode(200)
  @UseGuards(LoginAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: '上传头像到 OSS（需登录，multipart 字段名 file）' })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '用户登录令牌（必填）',
  })
  @ApiResponse({
    status: 200,
    description:
      '上传成功：data.key 为持久化的 OSS 对象键（写入库）；data.url 为短时读签名 URL（仅用于回显）',
  })
  @ApiResponse({ status: 400, description: '未选择文件或类型不支持' })
  @ApiResponse({ status: 401, description: '未登录' })
  @ApiResponse({ status: 503, description: '服务端未配置 OSS' })
  async uploadAvatar(
    @Headers('token') token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('请选择图片文件');
    }
    const phone = this.loginService.getPhoneFromToken(token);
    const objectKey = await this.ossService.uploadAvatarImage(
      phone,
      file.buffer,
      file.originalname ?? 'avatar.jpg',
      file.mimetype,
    );
    const url = await this.ossService.getSignedUrlByKey(
      objectKey,
      this.ossService.getUploadPreviewExpiresSeconds(),
    );
    return { code: 200, msg: '上传成功', data: { key: objectKey, url } };
  }

  @Get('oss-read-url')
  @HttpCode(200)
  @UseGuards(LoginAuthGuard)
  @ApiOperation({
    summary: '根据 OSS 对象键生成短时读签名 URL（需登录，仅允许 avatars/ 前缀）',
  })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '用户登录令牌（必填）',
  })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 400, description: '参数非法' })
  @ApiResponse({ status: 401, description: '未登录' })
  @ApiResponse({ status: 503, description: '服务端未配置 OSS' })
  async ossReadUrl(@Query('key') key?: string) {
    const k = key?.trim() ?? '';
    if (!k) {
      throw new BadRequestException('缺少参数 key');
    }
    if (!this.ossService.isSafeObjectKey(k)) {
      throw new BadRequestException('非法的对象路径');
    }
    const url = await this.ossService.getSignedUrlByKey(k);
    if (!url) {
      throw new ServiceUnavailableException('OSS 未配置');
    }
    return { code: 200, msg: '成功', data: { url } };
  }

  @Put('update')
  @HttpCode(200)
  @ApiOperation({ summary: '更新用户信息' })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '用户登录令牌（必填）',
  })
  @ApiBody({ type: UpdateUserInfoDto })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({
    status: 400,
    description: '参数错误、验证码无效、手机号已被占用',
  })
  @ApiResponse({ status: 401, description: '未登录或 token 已过期' })
  async update(
    @Headers('token') token: string,
    @Body() body: UpdateUserInfoDto,
  ) {
    const data = await this.loginService.updateUserInfoByToken(token, body);
    return { code: 200, msg: '修改成功', data };
  }
}
