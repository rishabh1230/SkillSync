import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectService } from './project.service';
import { ProjectMemberService } from '../project-member/project-member.service';
import { ProjectRole } from '@prisma/client';
import { MicroserviceExceptionFilter } from '../common/filters/microservice-exception.filter';

@Controller()
@UseFilters(MicroserviceExceptionFilter)
export class ProjectListener {
  constructor(
    private readonly projectService: ProjectService,
    private readonly memberService: ProjectMemberService,
  ) {}

  // ✅ Create Project
  @MessagePattern('project.create')
  async create(@Payload() data: any) {
    const { body, user } = data;
    return this.projectService.createProject({ ...body, ownerId: user.sub });
  }

  // ✅ Create Hackathon Project
  @MessagePattern('PROJECT_CREATE')
  async createHackathonProject(@Payload() data: any) {
    const { body, user } = data;
    return this.projectService.createProject({ ...body, ownerId: user.sub });
  }

  // ✅ Get My Projects
  @MessagePattern('project.getAll')
  async getAll(@Payload() data: any) {
    return this.projectService.getProjects(data.user.sub);
  }

  // ✅ Get One Project
  @MessagePattern('project.getOne')
  async getOne(@Payload() data: any) {
    return this.projectService.getProjectById(data.projectId);
  }

  // ✅ Update Project
  @MessagePattern('project.update')
  async update(@Payload() data: any) {
    const { projectId, body, user } = data;
    return this.projectService.updateProject(projectId, user.sub, body);
  }

  // ✅ Delete Project
  @MessagePattern('project.delete')
  async delete(@Payload() data: any) {
    return this.projectService.deleteProject(data.projectId, data.user.sub);
  }

  // ✅ Add Member
  @MessagePattern('project.addMember')
  async addMember(@Payload() data: any) {
    const { projectId, userId, role, user } = data;

    await this.memberService.validateAccess(
      projectId,
      user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    return this.memberService.addMember(projectId, userId, role);
  }

  // ✅ Get Members
  @MessagePattern('project.getMembers')
  async getMembers(@Payload() data: any) {
    const { projectId, user } = data;

    await this.memberService.validateAccess(
      projectId,
      user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER],
    );

    return this.memberService.getMembers(projectId);
  }

  // ✅ Update Role
  @MessagePattern('project.updateMemberRole')
  async updateRole(@Payload() data: any) {
    const { projectId, targetUserId, role, user } = data;

    await this.memberService.validateAccess(
      projectId,
      user.sub,
      [ProjectRole.OWNER],
    );

    return this.memberService.updateRole(projectId, targetUserId, role);
  }

  // ✅ Remove Member
  @MessagePattern('project.removeMember')
  async removeMember(@Payload() data: any) {
    const { projectId, targetUserId, user } = data;

    await this.memberService.validateAccess(
      projectId,
      user.sub,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    return this.memberService.removeMember(projectId, targetUserId);
  }

  // ✅ Update Visibility (Hackathon Service)
  @MessagePattern('PROJECT_UPDATE_VISIBILITY')
  async updateVisibility(@Payload() data: any) {
    const { projectId, visibility } = data;
    return this.projectService.updateVisibility(projectId, visibility);
  }
}