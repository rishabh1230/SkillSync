import { Injectable, NotFoundException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RMQ_PATTERNS } from '../config/rabbitmq.config';
import { firstValueFrom, timeout } from 'rxjs';
import { Prisma, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    // Verify user exists
    const userExists = await this.verifyUser(userId);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const { driveLinks, ...projectData } = createProjectDto;

    try {
      // Use Prisma 5 transaction API
      const project = await this.prisma.project.create({
        data: {
          ...projectData,
          userId,
          tags: projectData.tags || [],
          driveLinks: driveLinks?.length ? {
            create: driveLinks,
          } : undefined,
        },
        include: {
          driveLinks: true,
        },
      });

      // Emit event asynchronously
      this.userClient.emit(RMQ_PATTERNS.PROJECT_CREATED, {
        projectId: project.id,
        userId: project.userId,
        title: project.title,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Project created: ${project.id} by user: ${userId}`);
      return project;
    } catch (error) {
      this.logger.error('Error creating project', error);
      throw error;
    }
  }

  async findAll(filters?: {
    userId?: string;
    status?: ProjectStatus;
    search?: string;
    tags?: string[];
    skip?: number;
    take?: number;
  }) {
    const { userId, status, search, tags, skip = 0, take = 10 } = filters || {};

    // Build where clause using Prisma 5 type-safe queries
    const where: Prisma.ProjectWhereInput = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    // Full-text search across title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by tags (array contains)
    if (tags?.length) {
      where.tags = {
        hasSome: tags,
      };
    }

    try {
      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          include: {
            driveLinks: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        this.prisma.project.count({ where }),
      ]);

      return {
        data: projects,
        pagination: {
          total,
          skip,
          take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching projects', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          driveLinks: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error fetching project ${id}`, error);
      throw error;
    }
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);

    // Check ownership
    if (project.userId !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    const { driveLinks, ...projectData } = updateProjectDto;

    try {
      // Use Prisma 5 nested writes
      const updated = await this.prisma.project.update({
        where: { id },
        data: {
          ...projectData,
          ...(driveLinks && {
            driveLinks: {
              deleteMany: {}, // Remove all existing links
              create: driveLinks, // Add new links
            },
          }),
        },
        include: {
          driveLinks: true,
        },
      });

      this.userClient.emit(RMQ_PATTERNS.PROJECT_UPDATED, {
        projectId: updated.id,
        userId: updated.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Project updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating project ${id}`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);

    if (project.userId !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    try {
      // Prisma 5 handles cascade delete automatically
      await this.prisma.project.delete({
        where: { id },
      });

      this.userClient.emit(RMQ_PATTERNS.PROJECT_DELETED, {
        projectId: id,
        userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Project deleted: ${id}`);
      return { message: 'Project deleted successfully', projectId: id };
    } catch (error) {
      this.logger.error(`Error deleting project ${id}`, error);
      throw error;
    }
  }

  async publish(id: string, userId: string) {
    const project = await this.findOne(id);

    if (project.userId !== userId) {
      throw new ForbiddenException('You can only publish your own projects');
    }

    if (project.status === ProjectStatus.PUBLISHED) {
      throw new ForbiddenException('Project is already published');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        driveLinks: true,
      },
    });
  }

  async archive(id: string, userId: string) {
    const project = await this.findOne(id);

    if (project.userId !== userId) {
      throw new ForbiddenException('You can only archive your own projects');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ARCHIVED,
      },
    });
  }

  // Get project statistics for a user
  async getUserStats(userId: string) {
    const [total, published, drafts, archived] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.project.count({ where: { userId, status: ProjectStatus.PUBLISHED } }),
      this.prisma.project.count({ where: { userId, status: ProjectStatus.DRAFT } }),
      this.prisma.project.count({ where: { userId, status: ProjectStatus.ARCHIVED } }),
    ]);

    return { total, published, drafts, archived };
  }

  private async verifyUser(userId: string): Promise<boolean> {
    try {
      const result = await firstValueFrom(
        this.userClient.send(RMQ_PATTERNS.USER_VERIFY, { userId }).pipe(
          timeout(5000), // 5 second timeout
        )
      );
      return result?.exists || false;
    } catch (error) {
      this.logger.error(`Error verifying user ${userId}`, error);
      return false;
    }
  }
}