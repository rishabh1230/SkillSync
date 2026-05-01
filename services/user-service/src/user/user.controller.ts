import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // ✅ GET /users/:authId
  @Get(':authId')
  get(@Param('authId') authId: string) {
    return this.userService.findOne(authId);
  }

  // ✅ PATCH /users/:authId
  @Patch(':authId')
  update(
    @Param('authId') authId: string,
    @Body() body: { username?: string; phone_no?: string },
  ) {
    return this.userService.update(authId, body);
  }
}