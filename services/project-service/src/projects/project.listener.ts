import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectService } from './project.service';
import { UserClient } from '../user/user.client';

@Controller()
export class ProjectListener {
  constructor(
    private projectService: ProjectService,
    private userClient: UserClient,
  ) {}

  // 🔒 Create Project (user already validated by gateway)
  @MessagePattern('project.create')
  async create(@Payload() data: any) {
    const { body, user } = data;

    return this.projectService.createProject({
      ...body,
      ownerId: user.sub,
    });
  }

  // 🔒 Get My Projects (with user enrichment)
  @MessagePattern('project.getAll')
  async getAll(@Payload() ownerId: string) {
    const projects = await this.projectService.getProjects(ownerId);

    return Promise.all(
      projects.map(async (project) => {
        try {
          const user = await this.userClient.getUser(project.ownerId);

          return {
            ...project,
            owner: user, // enriched data
          };
        } catch (err) {
          // fallback if user-service fails
          return {
            ...project,
            owner: null,
          };
        }
      }),
    );
  }

  // 🌐 Get single project (with user enrichment)
  @MessagePattern('project.getOne')
  async getOne(@Payload() id: string) {
    const project = await this.projectService.getProjectById(id);

    try {
      const user = await this.userClient.getUser(project.ownerId);

      return {
        ...project,
        owner: user,
      };
    } catch {
      return {
        ...project,
        owner: null,
      };
    }
  }
}