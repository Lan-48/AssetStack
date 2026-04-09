import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { SmsModule } from './sms/sms.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [LoginModule, SmsModule, UserModule],
  exports: [LoginModule, SmsModule, UserModule],
})
export class AuthModule {}
