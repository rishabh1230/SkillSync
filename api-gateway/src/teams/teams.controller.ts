import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('teams')
export class TeamsController {
  constructor(
    @Inject('HACKATHON_SERVICE') private readonly hackathonClient: ClientProxy,
  ) {}

  @Post(':hackathonId')
  @UseGuards(JwtAuthGuard)
  async createTeam(@Param('hackathonId') hackathonId: string, @Body() body: { teamName: string }, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_CREATE_TEAM', {
      hackathonId, teamName: body.teamName, user: req.user
    }));
  }

  @Get(':id')
  async getTeam(@Param('id') id: string) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_GET_TEAM', { teamId: id }));
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submitProject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('HACKATHON_SUBMIT_PROJECT', {
      teamId: id, body, user: req.user
    }));
  }

  // Send a join request to a team
  @Post(':id/join-request')
  @UseGuards(JwtAuthGuard)
  async sendJoinRequest(@Param('id') id: string, @Body() body: { message?: string }, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('TEAM_SEND_JOIN_REQUEST', {
      teamId: id, user: req.user, message: body.message,
    }));
  }

  // Get pending join requests for a team (leader only)
  @Get(':id/join-requests')
  @UseGuards(JwtAuthGuard)
  async getJoinRequests(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('TEAM_GET_JOIN_REQUESTS', {
      teamId: id, user: req.user,
    }));
  }

  // Accept or reject a join request
  @Patch('join-requests/:requestId/respond')
  @UseGuards(JwtAuthGuard)
  async respondToJoinRequest(@Param('requestId') requestId: string, @Body() body: { accept: boolean }, @Req() req: any) {
    return firstValueFrom(this.hackathonClient.send('TEAM_RESPOND_JOIN_REQUEST', {
      requestId, user: req.user, accept: body.accept,
    }));
  }
}
