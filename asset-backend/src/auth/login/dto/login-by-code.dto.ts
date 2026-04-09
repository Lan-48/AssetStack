import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class LoginByCodeDto {
  @ApiProperty({ example: '13800138000', description: '中国大陆 11 位手机号' })
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ example: '123456', description: '6 位短信验证码' })
  @IsString()
  @Matches(/^\d{6}$/, { message: '验证码格式不正确' })
  code: string;
}
