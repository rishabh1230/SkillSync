import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { REDIS_SUB_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubService implements OnModuleInit {
  private readonly logger = new Logger(RedisPubSubService.name);
  private gatewayRef: any; // Lazy-injected to avoid circular deps

  constructor(
    @Inject(REDIS_SUB_CLIENT) private readonly subClient: Redis,
  ) {}

  setGateway(gateway: any) {
    this.gatewayRef = gateway;
  }

  async onModuleInit() {
    await this.subClient.subscribe('notifications');
    this.subClient.on('message', (channel: string, raw: string) => {
      if (channel === 'notifications' && this.gatewayRef) {
        try {
          const payload = JSON.parse(raw);
          const { userId, notification, unreadCount } = payload;
          this.gatewayRef.emitToUser(userId, 'notification', notification);
          this.gatewayRef.emitToUser(userId, 'unread_count', {
            count: parseInt(unreadCount, 10) || 0,
          });
        } catch (err) {
          this.logger.error('Failed to parse notification pub/sub message', err);
        }
      }
    });

    this.logger.log('Subscribed to Redis notifications channel');
  }
}
