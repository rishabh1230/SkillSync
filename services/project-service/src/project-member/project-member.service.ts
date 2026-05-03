import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectMemberService {
  constructor(private prisma: PrismaService) {}

  // ✅ Add member (safe)
  async addMember(
    projectId: string,
    userId: string,
    role: ProjectRole,
  ) {
    // 🔍 check if already exists
    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'User is already a member of this project',
      );
    }

    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
    });
  }

  async getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
    });
  }

  async getMembership(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  async updateRole(
    projectId: string,
    userId: string,
    role: ProjectRole,
  ) {
    return this.prisma.projectMember.update({
      where: {
        projectId_userId: { projectId, userId },
      },
      data: { role },
    });
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.getMembership(projectId, userId);

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot remove owner');
    }

    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  // 🔐 RBAC
 async validateAccess(
  projectId: string,
  userId: string,
  allowedRoles: ProjectRole[],
) {
  const membership = await this.getMembership(projectId, userId);

  // 🔥 ADD THIS DEBUG LOG
  console.log('🔍 Membership check:', {
    projectId,
    userId,
    membership,
    allowedRoles,
  });

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new ForbiddenException('Access denied');
  }

  return membership;
}
}