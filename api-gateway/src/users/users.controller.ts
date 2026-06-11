import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
  Inject,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RMQ_PATTERNS } from '../../../shared/rmq/patterns';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  /**
   * GET /users/profile
   * Returns the logged-in user's profile from the user-service.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    // req.user is set by JwtAuthGuard; it contains { sub, email } from the JWT
    const authId = req.user?.sub || req.user?.id;
    return firstValueFrom(
      this.userClient.send(RMQ_PATTERNS.USER_GET_PROFILE, { authId }),
    );
  }

  /**
   * PATCH /users/profile
   * Updates the logged-in user's profile fields (username, phone_no).
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() body: {
      username?: string;
      phone_no?: string;
      githubUrl?: string;
      leetcodeUrl?: string;
      portfolioUrl?: string;
      skills?: string[];
      education?: any;
    },
  ) {
    const authId = req.user?.sub || req.user?.id;
    return firstValueFrom(
      this.userClient.send(RMQ_PATTERNS.USER_UPDATE_PROFILE, {
        authId,
        ...body,
      }),
    );
  }

  /**
   * GET /users/:id
   * Returns any user's profile from the user-service by their authId/userId.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return firstValueFrom(
      this.userClient.send(RMQ_PATTERNS.USER_GET_PROFILE, { authId: id }),
    );
  }
}
