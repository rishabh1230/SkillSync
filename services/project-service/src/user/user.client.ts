import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserClient {
  constructor(
    @Inject('USER_SERVICE') private client: ClientProxy,
  ) {}

  getUser(authId: string) {
    return firstValueFrom(
      this.client.send('user.get', authId),
    );
  }
}