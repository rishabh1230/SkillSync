import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { rabbitMQConfig } from '../config/rabbitmq.config';

import { AuthClient } from '../auth/auth.client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule, // ✅ DB access

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
    ]),
  ],

  controllers: [ProjectController],

  providers: [
    ProjectService,
    AuthClient,     // ✅ REQUIRED for JWT validation
    JwtAuthGuard,   // ✅ REQUIRED for route protection
  ],
})
export class ProjectsModule {}