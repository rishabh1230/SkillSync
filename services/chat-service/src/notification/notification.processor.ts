import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BULK_NOTIFY_QUEUE } from './notification.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { NotificationType } from '@prisma/client';
import Redis from 'ioredis';

interface BulkNotifyJob {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

const UNREAD_KEY = (userId: string) => `unread_notifications:${userId}`;

@Processor(BULK_NOTIFY_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Process('bulk')
  async handleBulkNotify(job: Job<BulkNotifyJob>) {
    const { userIds, type, title, message, metadata } = job.data;
    this.logger.log(`Processing bulk notify job for ${userIds.length} users`);

    const CHUNK_SIZE = 100;
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE);

      // Batch insert into DB
      await this.prisma.notification.createMany({
        data: chunk.map((userId) => ({
          userId,
          type,
          title,
          message,
          metadata: metadata ?? {},
        })),
        skipDuplicates: true,
      });

      // Increment Redis unread counters for each user in chunk
      const pipeline = this.redis.pipeline();
      for (const userId of chunk) {
        pipeline.incr(UNREAD_KEY(userId));
      }
      await pipeline.exec();

      // Publish to Redis pub/sub so the gateway can push to connected sockets
      for (const userId of chunk) {
        const unreadCount = await this.redis.get(UNREAD_KEY(userId));
        await this.redis.publish(
          'notifications',
          JSON.stringify({
            userId,
            notification: { userId, type, title, message, metadata, isRead: false, createdAt: new Date() },
            unreadCount: unreadCount || '1',
          }),
        );
      }

      this.logger.log(`Processed chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} notifications)`);
    }

    this.logger.log(`Bulk notify job completed for ${userIds.length} users`);
    return { processed: userIds.length };
  }
}
