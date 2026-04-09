import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateUserInfoDto {
  @ApiPropertyOptional({
    example: '我的新昵称',
    description: '用户昵称（可选）',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nickname?: string;

  @ApiPropertyOptional({
    example: 'https://xxx.com/new-avatar.png',
    description: '头像URL（可选）',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '头像地址长度不能超过255个字符' })
  avatar?: string;

  @ApiPropertyOptional({
    example: '13800138000',
    description: '新手机号（可选；传入时必须同时传验证码 code）',
  })
  @IsOptional()
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({
    example: '123456',
    description: '短信验证码（可选；换绑手机号时必填）',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: '验证码格式不正确' })
  code?: string;
}
