import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export enum SendCodePurpose {
  /** 仅已向库中写入该手机号的用户发码（登录页） */
  Login = 'login',
  /** 仅未入库手机号可收码（新用户注册流程） */
  Register = 'register',
}

export class SendCodeDto {
  @ApiProperty({ example: '13800138000', description: '中国大陆 11 位手机号' })
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiPropertyOptional({
    enum: SendCodePurpose,
    default: SendCodePurpose.Login,
    description:
      'login：仅已存在手机号可发码；register：仅未入库手机号可发码（已存在则提示去登录）',
  })
  @IsOptional()
  @IsEnum(SendCodePurpose)
  purpose?: SendCodePurpose;
}
