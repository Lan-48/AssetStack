import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Put,
} from '@nestjs/common';
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

@ApiTags('用户认证')
@Controller('user')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

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
