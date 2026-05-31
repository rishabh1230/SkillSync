import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'project_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService]
})
export class TeamModule {}
