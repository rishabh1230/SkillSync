import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectListener } from './project.listener';

import { PrismaModule } from '../prisma/prisma.module';
import { rabbitMQConfig } from '../config/rabbitmq.config';

import { AuthClient } from '../auth/auth.client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserClient } from '../user/user.client';

import { ProjectMemberModule } from '../project-member/project-member.module';

@Module({
  imports: [
    PrismaModule,

    // ✅ FIX: properly import member module
    ProjectMemberModule,

    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: rabbitMQConfig.urls,
          queue: 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672' ],
          queue: 'user_queue',
        },
      },
    ]),
  ],

  controllers: [ProjectController, ProjectListener],

  providers: [
    ProjectService,
    AuthClient,
    JwtAuthGuard,
    UserClient,
    // ❌ REMOVE ProjectMemberService from here
  ],
})
export class ProjectsModule {}