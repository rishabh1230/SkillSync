import { Body, Controller, Post, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RMQ_PATTERNS } from '../../../shared/rmq/patterns';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return firstValueFrom(
      this.authClient.send(RMQ_PATTERNS.AUTH_REGISTER, body),
    );
  }

  @Post('login')
  async login(@Body() body: any) {
    return firstValueFrom(
      this.authClient.send(RMQ_PATTERNS.AUTH_LOGIN, body),
    );
  }
}
