import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectMemberService } from '../project-member/project-member.service';
import { ProjectRole } from '@prisma/client';

@Controller()
export class ProjectListener {
  constructor(
    private readonly memberService: ProjectMemberService,
  ) {}

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
}