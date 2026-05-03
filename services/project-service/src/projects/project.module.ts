import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { rabbitMQConfig } from '../config/rabbitmq.config';

import { AuthClient } from '../auth/auth.client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectListener } from './project.listener';
import { UserClient } from '../user/user.client';

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
      {
  name: 'USER_SERVICE',
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'user_queue',
  },
},
    ]),
  ],

  controllers: [ProjectController , ProjectListener],

  providers: [
    ProjectService,
    AuthClient,     // ✅ REQUIRED for JWT validation
    JwtAuthGuard,   // ✅ REQUIRED for route protection
    UserClient,
  ],
})
export class ProjectsModule {}