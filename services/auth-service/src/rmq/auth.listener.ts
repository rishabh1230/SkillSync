import { Controller, UnauthorizedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';
import { AuthService } from '../auth/auth.service';

@Controller()
export class AuthListener {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  @MessagePattern(RMQ_PATTERNS.AUTH_VALIDATE_TOKEN)
  validate(@Payload() data: { token: string }) {
    try {
      return this.jwtService.verify(data.token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @MessagePattern(RMQ_PATTERNS.AUTH_REGISTER)
  register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern(RMQ_PATTERNS.AUTH_LOGIN)
  login(@Payload() data: any) {
    return this.authService.login(data);
  }
}