import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectMemberService } from '../project-member/project-member.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private projectMemberService: ProjectMemberService,
  ) {}

  // ✅ Create Project + OWNER membership
  async createProject(data: {
    title: string;
    description: string;
    ownerId: string;
    videoLink?: string;
    images?: string[];
    isHackathonProject?: boolean;
    hackathonId?: string;
    teamId?: string;
    visibility?: any;
  }) {
    const project = await this.prisma.project.create({
      data,
    });

    // 🔥 CRITICAL: add owner as member
    await this.projectMemberService.addMember(
      project.id,
      data.ownerId,
      ProjectRole.OWNER,
    );

    return project;
  }

  // ✅ Get all (optionally by owner)
  async getProjects(ownerId?: string) {
    return this.prisma.project.findMany({
      where: ownerId ? { ownerId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get one
  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // 🔐 Update (OWNER or ADMIN)
  async updateProject(
    id: string,
    userId: string,
    data: { title?: string; description?: string; videoLink?: string; images?: string[] },
  ) {
    await this.projectMemberService.validateAccess(
      id,
      userId,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  // 🔐 Delete (ONLY OWNER)
  async deleteProject(id: string, userId: string) {
    await this.projectMemberService.validateAccess(
      id,
      userId,
      [ProjectRole.OWNER],
    );

    return this.prisma.project.delete({
      where: { id },
    });
  }

  // ✅ Update Visibility (Orchestrated by Hackathon Service or Admin)
  async updateVisibility(id: string, visibility: any) {
    return this.prisma.project.update({
      where: { id },
      data: { visibility },
    });
  }
}