import { Controller, Post, Body, Inject, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private client: ClientProxy,
  ) {}

@UseGuards(JwtAuthGuard)
@Post()
async create(@Req() req, @Body() body: any) {
  return firstValueFrom(
    this.client.send('project.create', {
      body,
      user: req.user, // 👈 pass decoded user
    }),
  );
}
}