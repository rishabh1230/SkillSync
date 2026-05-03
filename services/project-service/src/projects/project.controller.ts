import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectMemberService } from '../project-member/project-member.service';
import { ProjectRole } from '@prisma/client';

@Controller('projects')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService,
  ) {}

  // 🔒 Create Project
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() body) {
    return this.projectService.createProject({
      ...body,
      ownerId: req.user.sub,
    });
  }

  // 🔒 Get My Projects
  @UseGuards(JwtAuthGuard)
  @Get()
  getMy(@Req() req) {
    return this.projectService.getProjects(req.user.sub);
  }

  // 🌐 Public Get One
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }

  // 🔐 Update Project (OWNER / ADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req, @Body() body) {
    return this.projectService.updateProject(
      id,
      req.user.sub,
      body,
    );
  }

  // 🔐 Delete Project (ONLY OWNER)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.projectService.deleteProject(
      id,
      req.user.sub,
    );
  }

  // =========================
  // 👥 PROJECT MEMBERS APIs
  // =========================

  // 🔐 Add Member (OWNER / ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  async addMember(
    @Param('id') projectId: string,
    @Body() body,
    @Req() req,
  ) {
    await this.projectMemberService.validateAccess(
      projectId,
      req.user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    return this.projectMemberService.addMember(
      projectId,
      body.userId,
      body.role,
    );
  }

  // 🔐 Get Members (ALL MEMBERS)
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(@Param('id') projectId: string, @Req() req) {
    await this.projectMemberService.validateAccess(
      projectId,
      req.user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER],
    );

    return this.projectMemberService.getMembers(projectId);
  }

  // 🔐 Update Role (ONLY OWNER)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/members/:userId')
  async updateRole(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @Body() body,
    @Req() req,
  ) {
    await this.projectMemberService.validateAccess(
      projectId,
      req.user.sub,
      [ProjectRole.OWNER],
    );

    return this.projectMemberService.updateRole(
      projectId,
      targetUserId,
      body.role,
    );
  }

  // 🔐 Remove Member (OWNER / ADMIN)
  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @Req() req,
  ) {
    await this.projectMemberService.validateAccess(
      projectId,
      req.user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    return this.projectMemberService.removeMember(
      projectId,
      targetUserId,
    );
  }
}