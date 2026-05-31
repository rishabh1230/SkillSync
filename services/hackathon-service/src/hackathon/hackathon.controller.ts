import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HackathonService } from './hackathon.service';
import { MicroserviceExceptionFilter } from '../common/filters/microservice-exception.filter';

@Controller()
@UseFilters(MicroserviceExceptionFilter)
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @MessagePattern('HACKATHON_CREATE')
  async create(@Payload() data: any) {
    return this.hackathonService.create({ ...data.body, organizerId: data.user.sub });
  }

  @MessagePattern('HACKATHON_GET_ALL')
  async findAll(@Payload() query: any) {
    return this.hackathonService.findAll(query);
  }

  @MessagePattern('HACKATHON_GET_TRENDING')
  async findTrending() {
    return this.hackathonService.findTrending();
  }

  @MessagePattern('HACKATHON_GET_BY_ID')
  async findOne(@Payload() data: { hackathonId: string }) {
    return this.hackathonService.findOne(data.hackathonId);
  }

  @MessagePattern('HACKATHON_REGISTER')
  async register(@Payload() data: { hackathonId: string; user: any }) {
    return this.hackathonService.register(data.hackathonId, data.user.sub);
  }

  @MessagePattern('HACKATHON_REGISTER_SOLO')
  async registerSolo(@Payload() data: { hackathonId: string; user: any; participantType: string }) {
    return this.hackathonService.registerSolo(data.hackathonId, data.user.sub, data.participantType);
  }

  @MessagePattern('HACKATHON_GET_PARTICIPANTS')
  async getParticipants(@Payload() data: { hackathonId: string }) {
    return this.hackathonService.getParticipants(data.hackathonId);
  }

  @MessagePattern('HACKATHON_GET_SOLO_PARTICIPANTS')
  async getSoloParticipants(@Payload() data: { hackathonId: string }) {
    return this.hackathonService.getSoloParticipants(data.hackathonId);
  }

  @MessagePattern('HACKATHON_GET_PROJECTS')
  async getProjects(@Payload() data: { hackathonId: string; requesterId: string | null }) {
    return this.hackathonService.getProjects(data.hackathonId, data.requesterId);
  }

  @MessagePattern('HACKATHON_TOGGLE_PROJECT_VISIBILITY')
  async toggleVisibility(@Payload() data: { hackathonId: string; submissionId: string; user: any }) {
    return this.hackathonService.toggleProjectVisibility(data.hackathonId, data.submissionId, data.user.sub);
  }

  @MessagePattern('HACKATHON_GET_MY')
  async getMyHackathons(@Payload() data: { user: any }) {
    return this.hackathonService.getMyHackathons(data.user.sub);
  }
}
