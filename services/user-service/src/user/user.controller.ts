import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get(':userId')
  get(@Param('userId') userId: string) {
    return this.userService.findOne(Number(userId));
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() body: any) {
    return this.userService.update(Number(userId), body);
  }
}