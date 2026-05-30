import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../user/user.service';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';
import { MicroserviceExceptionFilter } from '../common/filters/microservice-exception.filter';

@Controller()
@UseFilters(MicroserviceExceptionFilter)
export class UserEvents {
  constructor(private userService: UserService) {}

  // ── Event: user created from auth-service ──
  @EventPattern(RMQ_PATTERNS.USER_CREATED)
  async handleUserCreated(@Payload() data: any) {
    return this.userService.create({
      authId: data.authId,
      email: data.email,
      username: data.username,
      phone_no: data.phone_no,
    });
  }

  // ── RPC: get profile ──
  @MessagePattern(RMQ_PATTERNS.USER_GET_PROFILE)
  async handleGetProfile(@Payload() data: { authId: string }) {
    return this.userService.findOne(data.authId);
  }

  // ── RPC: update profile ──
  @MessagePattern(RMQ_PATTERNS.USER_UPDATE_PROFILE)
  async handleUpdateProfile(
    @Payload() data: {
      authId: string;
      username?: string;
      phone_no?: string;
      githubUrl?: string;
      leetcodeUrl?: string;
      portfolioUrl?: string;
      skills?: string[];
      education?: any;
    },
  ) {
    const { authId, ...updateData } = data;
    return this.userService.update(authId, updateData);
  }
}