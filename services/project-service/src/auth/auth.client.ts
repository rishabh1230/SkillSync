import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';

@Injectable()
export class AuthClient {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async validateToken(token: string) {
    return firstValueFrom(
      this.client.send(RMQ_PATTERNS.AUTH_VALIDATE_TOKEN, { token }),
    );
  }
}