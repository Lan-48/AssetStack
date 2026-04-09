import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { LoginAuthGuard } from './login-auth.guard';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LoginController],
  providers: [LoginService, LoginAuthGuard],
  exports: [LoginService, LoginAuthGuard],
})
export class LoginModule {}
