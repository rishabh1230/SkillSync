import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { RedisPubSubService } from './redis/redis-pubsub.service';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      global: true,
    }),
    BullModule.forRoot({
      redis: {
        host: (() => {
          const url = process.env.REDIS_URL || 'redis://localhost:6379';
          try {
            return new URL(url).hostname;
          } catch {
            return 'localhost';
          }
        })(),
        port: (() => {
          const url = process.env.REDIS_URL || 'redis://localhost:6379';
          try {
            return parseInt(new URL(url).port || '6379', 10);
          } catch {
            return 6379;
          }
        })(),
      },
    }),
    ChatModule,
    NotificationModule,
  ],
  providers: [RedisPubSubService],
})
export class AppModule {
  constructor(
    private readonly pubSubService: RedisPubSubService,
    private readonly chatGateway: ChatGateway,
  ) {}

  onModuleInit() {
    // Wire up the pub/sub service with the gateway after module init
    this.pubSubService.setGateway(this.chatGateway);
  }
}
