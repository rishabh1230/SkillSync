import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { ProjectsController } from './projects/projects.controller';
import { UsersController } from './users/users.controller';
import { HackathonsController } from './hackathons/hackathons.controller';
import { TeamsController } from './teams/teams.controller';
import { ChatController } from './chat/chat.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    S3Module,
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'project_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'auth_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'user_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'HACKATHON_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'hackathon_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'CHAT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'chat_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],

  controllers: [
    ProjectsController,
    AuthController,
    UsersController,
    HackathonsController,
    TeamsController,
    ChatController,
    NotificationsController,
  ],
})
export class AppModule {}