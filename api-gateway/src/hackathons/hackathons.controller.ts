import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('hackathons')
export class HackathonsController {
  constructor(
    @Inject('HACKATHON_SERVICE') private readonly hackathonClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_CREATE', { body, user: req.user }));
  }

  @Get()
  async findAll() {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_ALL', {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_BY_ID', { hackathonId: id }));
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_REGISTER', { hackathonId: id, user: req.user }));
  }

  // Register as solo participant (no team creation)
  @Post(':id/register-solo')
  @UseGuards(JwtAuthGuard)
  async registerSolo(@Param('id') id: string, @Body() body: { participantType: string }, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_REGISTER_SOLO', {
      hackathonId: id,
      user: req.user,
      participantType: body.participantType,
    }));
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_PARTICIPANTS', { hackathonId: id }));
  }

  // Solo participants (registered but not in a team)
  @Get(':id/solo-participants')
  async getSoloParticipants(@Param('id') id: string) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_SOLO_PARTICIPANTS', { hackathonId: id }));
  }

  @Get(':id/projects')
  @UseGuards(OptionalJwtAuthGuard)
  async getProjects(@Param('id') id: string, @Req() req: any) {
    const requesterId = req.user?.sub ?? null;
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_PROJECTS', { hackathonId: id, requesterId }));
  }

  @Patch(':id/submissions/:submissionId/visibility')
  @UseGuards(JwtAuthGuard)
  async toggleVisibility(@Param('id') id: string, @Param('submissionId') submissionId: string, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_TOGGLE_PROJECT_VISIBILITY', {
      hackathonId: id, submissionId, user: req.user,
    }));
  }
}
