import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Inject,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private client: ClientProxy,
  ) {}

  // ✅ Create Project
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() body: any) {
    return firstValueFrom(
      this.client.send('project.create', {
        body,
        user: req.user,
      }),
    );
  }

  // ✅ Get All My Projects
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req) {
    return firstValueFrom(
      this.client.send('project.getAll', { user: req.user }),
    );
  }

  // ✅ Get One Project
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req) {
    return firstValueFrom(
      this.client.send('project.getOne', { projectId: id, user: req.user }),
    );
  }

  // ✅ Update Project
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req, @Body() body: any) {
    return firstValueFrom(
      this.client.send('project.update', { projectId: id, body, user: req.user }),
    );
  }

  // ✅ Delete Project
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return firstValueFrom(
      this.client.send('project.delete', { projectId: id, user: req.user }),
    );
  }

  // =========================
  // 👥 PROJECT MEMBERS APIs
  // =========================

  // ✅ Add Member
  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  async addMember(
    @Param('id') projectId: string,
    @Body() body,
    @Req() req,
  ) {
    return firstValueFrom(
      this.client.send('project.addMember', {
        projectId,
        userId: body.userId,
        role: body.role,
        user: req.user,
      }),
    );
  }

  // ✅ Get Members
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(@Param('id') projectId: string, @Req() req) {
    return firstValueFrom(
      this.client.send('project.getMembers', {
        projectId,
        user: req.user,
      }),
    );
  }

  // ✅ Update Member Role
  @UseGuards(JwtAuthGuard)
  @Patch(':id/members/:userId')
  async updateRole(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @Body() body,
    @Req() req,
  ) {
    return firstValueFrom(
      this.client.send('project.updateMemberRole', {
        projectId,
        targetUserId,
        role: body.role,
        user: req.user,
      }),
    );
  }

  // ✅ Remove Member
  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @Req() req,
  ) {
    return firstValueFrom(
      this.client.send('project.removeMember', {
        projectId,
        targetUserId,
        user: req.user,
      }),
    );
  }
}