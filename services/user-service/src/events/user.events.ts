import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserService } from '../user/user.service';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';

@Controller()
export class UserEvents {
  constructor(private userService: UserService) {}

  @EventPattern(RMQ_PATTERNS.USER_CREATED)
  async handleUserCreated(@Payload() data: any) {
    return this.userService.create({
      authId: data.authId,
      email: data.email,
      username: data.username,
      phone_no: data.phone_no,
    });
  }
}