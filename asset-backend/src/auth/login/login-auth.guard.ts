import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginService } from './login.service';

@Injectable()
export class LoginAuthGuard implements CanActivate {
  constructor(private readonly loginService: LoginService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const rawToken = request.headers?.token;
    const token =
      typeof rawToken === 'string'
        ? rawToken
        : Array.isArray(rawToken)
          ? rawToken[0]
          : undefined;

    if (!token) {
      throw new UnauthorizedException('缺少 token');
    }

    this.loginService.verifyToken(token);
    return true;
  }
}
