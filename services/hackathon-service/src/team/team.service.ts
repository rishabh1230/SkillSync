import { Inject, Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
  ) {}

  async createTeam(hackathonId: string, teamName: string, leaderId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    const team = await this.prisma.team.create({
      data: {
        hackathonId,
        teamName,
        leaderId,
        maxMembers: hackathon.maxTeamSize,
        members: {
          create: { userId: leaderId, role: 'LEADER' }
        }
      }
    });

    // Upsert HackathonRegistration for the leader so they show up in participant lists
    await this.prisma.hackathonRegistration.upsert({
      where: { hackathonId_userId: { hackathonId, userId: leaderId } },
      create: { hackathonId, userId: leaderId, participantType: 'HAVE_IDEA_LOOKING_FOR_TEAM' },
      update: { participantType: 'HAVE_IDEA_LOOKING_FOR_TEAM' },
    });

    return team;
  }

  async getTeam(teamId: string) {
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, submissions: true }
    });
  }

  async submitProject(teamId: string, data: any, userId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const projectPayload = {
      ...data,
      isHackathonProject: true,
      hackathonId: team.hackathonId,
      teamId: team.id,
      visibility: 'PRIVATE',
      ownerId: userId,
    };

    const project = await firstValueFrom(
      this.projectClient.send('PROJECT_CREATE', { body: projectPayload, user: { sub: userId } })
    );

    const submission = await this.prisma.submission.create({
      data: {
        hackathonId: team.hackathonId,
        teamId: team.id,
        projectId: project.id,
        status: 'SUBMITTED',
      }
    });

    return submission;
  }

  // Send a join request to a team
  async sendJoinRequest(teamId: string, requesterId: string, message?: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw new NotFoundException('Team not found');

    // Must be registered for the hackathon
    const registration = await this.prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: team.hackathonId, userId: requesterId } },
    });
    if (!registration) throw new ForbiddenException('You must be registered for this hackathon to request to join a team');

    // Must not already be in a team
    const alreadyInTeam = await this.prisma.teamMember.findFirst({
      where: {
        userId: requesterId,
        team: { hackathonId: team.hackathonId },
      },
    });
    if (alreadyInTeam) throw new ConflictException('You are already in a team for this hackathon');

    // Team must have space
    if (team.members.length >= team.maxMembers) {
      throw new BadRequestException('This team is already full');
    }

    // Create join request (upsert in case they already sent one)
    try {
      return await this.prisma.joinRequest.create({
        data: {
          hackathonId: team.hackathonId,
          teamId,
          requesterId,
          message: message || null,
          status: 'PENDING',
        },
      });
    } catch {
      throw new ConflictException('You have already sent a join request to this team');
    }
  }

  // Get pending join requests for a team (leader only)
  async getJoinRequests(teamId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) throw new ForbiddenException('Only the team leader can view join requests');

    return this.prisma.joinRequest.findMany({
      where: { teamId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Accept or reject a join request
  async respondToJoinRequest(requestId: string, leaderId: string, accept: boolean) {
    const joinRequest = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { team: { include: { members: true } } },
    });
    if (!joinRequest) throw new NotFoundException('Join request not found');
    if (joinRequest.team.leaderId !== leaderId) throw new ForbiddenException('Only the team leader can respond to join requests');
    if (joinRequest.status !== 'PENDING') throw new BadRequestException('This request has already been responded to');

    if (accept) {
      // Check team still has space
      if (joinRequest.team.members.length >= joinRequest.team.maxMembers) {
        throw new BadRequestException('Team is now full');
      }

      // Add member to team
      await this.prisma.teamMember.create({
        data: { teamId: joinRequest.teamId, userId: joinRequest.requesterId, role: 'MEMBER' },
      });

      // Reject all other pending requests from this user for this hackathon
      await this.prisma.joinRequest.updateMany({
        where: { hackathonId: joinRequest.hackathonId, requesterId: joinRequest.requesterId, id: { not: requestId } },
        data: { status: 'REJECTED' },
      });
    }

    // Update request status
    return this.prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });
  }
}
