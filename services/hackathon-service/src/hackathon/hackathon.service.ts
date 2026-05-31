import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HackathonService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.hackathon.create({ data });
  }

  async findAll() {
    return this.prisma.hackathon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        problemStatements: true,
        teams: {
          include: {
            members: true,
            submissions: true,
            joinRequests: {
              where: { status: 'PENDING' },
            },
          }
        },
        _count: {
          select: { registrations: true, teams: true, submissions: true }
        }
      }
    });

    if (!hackathon) throw new NotFoundException('Hackathon not found');
    return hackathon;
  }

  async update(id: string, data: any) {
    return this.prisma.hackathon.update({
      where: { id },
      data
    });
  }

  async register(hackathonId: string, userId: string) {
    return this.prisma.hackathonRegistration.create({
      data: { hackathonId, userId }
    });
  }

  // Register as solo participant (no team creation)
  async registerSolo(hackathonId: string, userId: string, participantType: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    // Check if already registered
    const existing = await this.prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId, userId } },
    });
    if (existing) throw new ConflictException('Already registered for this hackathon');

    return this.prisma.hackathonRegistration.create({
      data: { hackathonId, userId, participantType },
    });
  }

  // Get all participants (teams + members) for a hackathon
  async getParticipants(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: {
          include: {
            members: true,
            joinRequests: {
              where: { status: 'PENDING' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    return hackathon.teams;
  }

  // Get solo participants — registered but not in any team
  async getSoloParticipants(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: { include: { members: true } },
      },
    });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    // Collect all userIds that are already in a team
    const teamMemberIds = new Set(
      hackathon.teams.flatMap((t) => t.members.map((m) => m.userId))
    );

    // Get registrations for users NOT in any team
    const soloRegistrations = await this.prisma.hackathonRegistration.findMany({
      where: {
        hackathonId,
        userId: { notIn: [...teamMemberIds] },
        status: 'REGISTERED',
      },
      orderBy: { registeredAt: 'asc' },
    });

    return soloRegistrations;
  }

  // Get submissions/projects for a hackathon with access control
  async getProjects(hackathonId: string, requesterId: string | null) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        submissions: {
          include: { team: true },
          orderBy: { submittedAt: 'asc' },
        },
      },
    });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    const isHost = hackathon.organizerId && hackathon.organizerId === requesterId;
    const isCompleted = hackathon.status === 'COMPLETED';

    const filtered = hackathon.submissions.filter((sub) => {
      if (isHost) return true;
      if (isCompleted) return true;
      return sub.isVisible;
    });

    return {
      submissions: filtered,
      isHost,
      isCompleted,
      hackathonStatus: hackathon.status,
    };
  }

  // Host toggles a project's visibility
  async toggleProjectVisibility(hackathonId: string, submissionId: string, requesterId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.organizerId !== requesterId) throw new ForbiddenException('Only the organizer can change visibility');

    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission || submission.hackathonId !== hackathonId) throw new NotFoundException('Submission not found');

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { isVisible: !submission.isVisible },
    });
  }
}
