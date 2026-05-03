// project-member.service.ts
import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectMemberService {
  constructor(private prisma: PrismaService) {}

  // ✅ Add member
  async addMember(projectId: string, userId: string, role: ProjectRole) {
    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
    });
  }

  // ✅ Get all members
  async getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
    });
  }

  // ✅ Get specific membership (IMPORTANT)
  async getMembership(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  // ✅ Update role
  async updateRole(projectId: string, userId: string, role: ProjectRole) {
    return this.prisma.projectMember.update({
      where: {
        projectId_userId: { projectId, userId },
      },
      data: { role },
    });
  }

  // ✅ Remove member
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

  // 🔐 RBAC CHECK (CRITICAL)
  async validateAccess(
    projectId: string,
    userId: string,
    allowedRoles: ProjectRole[],
  ) {
    const membership = await this.getMembership(projectId, userId);

    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Access denied');
    }

    return membership;
  }
}