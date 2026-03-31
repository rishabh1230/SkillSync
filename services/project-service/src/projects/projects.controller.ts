import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RMQ_PATTERNS } from '../config/rabbitmq.config';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // HTTP Endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.projectsService.findAll(userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, req.user.userId, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(@Param('id') id: string, @Request() req) {
    return this.projectsService.publish(id, req.user.userId);
  }

  // RabbitMQ Message Handlers (for inter-service communication)
  @MessagePattern('project.get.by.user')
  async getProjectsByUser(@Payload() data: { userId: string }) {
    return this.projectsService.findAll(data.userId);
  }

  @MessagePattern('project.get.by.id')
  async getProjectById(@Payload() data: { projectId: string }) {
    return this.projectsService.findOne(data.projectId);
  }
}