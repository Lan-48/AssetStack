import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsCode } from './sms-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsCode])],
  exports: [TypeOrmModule],
})
export class SmsModule {}
