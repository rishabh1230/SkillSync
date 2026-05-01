import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create
  async createProject(data: {
    title: string;
    description: string;
    ownerId: string;
  }) {
    return this.prisma.project.create({
      data,
    });
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

  // 🔒 Update (owner only)
  async updateProject(
    id: string,
    ownerId: string,
    data: { title?: string; description?: string },
  ) {
    const project = await this.getProjectById(id);

    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  // 🔒 Delete (owner only)
  async deleteProject(id: string, ownerId: string) {
    const project = await this.getProjectById(id);

    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }
}