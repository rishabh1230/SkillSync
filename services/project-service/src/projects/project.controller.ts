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

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  // 🔒 Create
 @UseGuards(JwtAuthGuard)
 @Post()
 @UseGuards(JwtAuthGuard)
 create(@Req() req, @Body() body) {
  return this.projectService.createProject({
    ...body,
    ownerId: req.user.sub, // ✅ FIX HERE
  });
}

  // 🔒 My projects
  @UseGuards(JwtAuthGuard)
  @Get()
  getMy(@Req() req) {
    return this.projectService.getProjects(req.user.userId);
  }

  // Public
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }

  // 🔒 Update
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() body) {
    return this.projectService.updateProject(
      id,
      req.user.userId,
      body,
    );
  }

  // 🔒 Delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.projectService.deleteProject(
      id,
      req.user.userId,
    );
  }
}