import { Controller, UnauthorizedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';

@Controller()
export class AuthListener {
  constructor(private jwtService: JwtService) {}

  @MessagePattern(RMQ_PATTERNS.AUTH_VALIDATE_TOKEN)
  validate(@Payload() data: { token: string }) {
    try {
      return this.jwtService.verify(data.token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}