import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HackathonService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.hackathon.create({ data });
  }

  async findAll(query: any = {}) {
    const {
      search,
      status,
      tags,
      organization,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tags) {
      // tags could be a comma-separated string or an array
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      where.tags = { hasSome: tagsArray };
    }

    if (organization) {
      const orgArray = Array.isArray(organization) ? organization : organization.split(',');
      where.organizationName = { in: orgArray };
    }

    const orderBy: any = {};
    if (sortBy === 'participantCount') {
      orderBy.participantCount = sortOrder;
    } else if (sortBy === 'registrationEndDate') {
      orderBy.registrationEndDate = sortOrder;
    } else if (sortBy === 'startDate') {
      orderBy.hackathonStartDate = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [hackathons, total] = await Promise.all([
      this.prisma.hackathon.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.prisma.hackathon.count({ where }),
    ]);

    return {
      data: hackathons,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findTrending() {
    return this.prisma.hackathon.findMany({
      where: {
        status: { in: ['REGISTRATION_OPEN', 'UPCOMING', 'ONGOING'] },
      },
      orderBy: { participantCount: 'desc' },
      take: 5,
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
    const reg = await this.prisma.hackathonRegistration.create({
      data: { hackathonId, userId }
    });
    await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: { participantCount: { increment: 1 } },
    });
    return reg;
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

    const reg = await this.prisma.hackathonRegistration.create({
      data: { hackathonId, userId, participantType },
    });
    await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: { participantCount: { increment: 1 } },
    });
    return reg;
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
          include: { team: { include: { members: true } } },
          orderBy: { submittedAt: 'asc' },
        },
      },
    });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    const isHost = hackathon.organizerId && hackathon.organizerId === requesterId;
    const isCompleted = hackathon.status === 'COMPLETED';

    const mappedSubmissions = hackathon.submissions.map((sub) => {
      const isMine = requesterId ? sub.team?.members.some(m => m.userId === requesterId) : false;
      return { ...sub, isMine };
    });

    const filtered = mappedSubmissions.filter((sub) => {
      if (isHost) return true;
      if (isCompleted) return true;
      if (sub.isMine) return true; // Always let users see their own submission
      return sub.isVisible;
    });

    // Sort to put the user's submission at the top
    filtered.sort((a, b) => {
      if (a.isMine && !b.isMine) return -1;
      if (!a.isMine && b.isMine) return 1;
      return 0;
    });

    return {
      submissions: filtered.map(s => ({ ...s, team: { ...s.team, members: undefined } })), // remove members from response
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

  // Get hackathons where the user is registered
  async getMyHackathons(userId: string) {
    const registrations = await this.prisma.hackathonRegistration.findMany({
      where: { userId },
      include: { 
        hackathon: {
          include: {
            submissions: {
              where: {
                team: { members: { some: { userId } } }
              },
              include: { team: true }
            }
          }
        } 
      },
      orderBy: { registeredAt: 'desc' },
    });
    return registrations.map((r) => {
      const h: any = { ...r.hackathon };
      h.mySubmission = h.submissions?.[0] || null;
      delete h.submissions;
      return h;
    });
  }
}
