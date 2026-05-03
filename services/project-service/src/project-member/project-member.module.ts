// project-member.module.ts
import { Module } from '@nestjs/common';
import { ProjectMemberService } from './project-member.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ProjectMemberService, PrismaService],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}