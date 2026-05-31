import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeamService } from './team.service';
import { MicroserviceExceptionFilter } from '../common/filters/microservice-exception.filter';

@Controller()
@UseFilters(MicroserviceExceptionFilter)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @MessagePattern('HACKATHON_CREATE_TEAM')
  async createTeam(@Payload() data: { hackathonId: string; teamName: string; user: any }) {
    return this.teamService.createTeam(data.hackathonId, data.teamName, data.user.sub);
  }

  @MessagePattern('HACKATHON_GET_TEAM')
  async getTeam(@Payload() data: { teamId: string }) {
    return this.teamService.getTeam(data.teamId);
  }

  @MessagePattern('HACKATHON_SUBMIT_PROJECT')
  async submitProject(@Payload() data: { teamId: string; body: any; user: any }) {
    return this.teamService.submitProject(data.teamId, data.body, data.user.sub);
  }

  @MessagePattern('TEAM_SEND_JOIN_REQUEST')
  async sendJoinRequest(@Payload() data: { teamId: string; user: any; message?: string }) {
    return this.teamService.sendJoinRequest(data.teamId, data.user.sub, data.message);
  }

  @MessagePattern('TEAM_GET_JOIN_REQUESTS')
  async getJoinRequests(@Payload() data: { teamId: string; user: any }) {
    return this.teamService.getJoinRequests(data.teamId, data.user.sub);
  }

  @MessagePattern('TEAM_RESPOND_JOIN_REQUEST')
  async respondToJoinRequest(@Payload() data: { requestId: string; user: any; accept: boolean }) {
    return this.teamService.respondToJoinRequest(data.requestId, data.user.sub, data.accept);
  }
}
