import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  // 🔥 RabbitMQ event listener
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: any) {
    console.log('Event received:', data);
    return this.userService.create(data);
  }

  // ✅ Keep for fetching
  @Get('users/:userId')
  get(@Param('userId') userId: string) {
    return this.userService.findOne(Number(userId));
  }

  // ✅ Keep for updating
  @Patch('users/:userId')
  update(@Param('userId') userId: string, @Body() body: any) {
    return this.userService.update(Number(userId), body);
  }
}