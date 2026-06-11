import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { NotificationType } from '@prisma/client';

export const BULK_NOTIFY_QUEUE = 'bulk-notify';
const UNREAD_KEY = (userId: string) => `unread_notifications:${userId}`;

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue(BULK_NOTIFY_QUEUE) private readonly bulkQueue: Queue,
  ) {}

  // ── Core: create single notification + push to socket via Redis pub/sub ───

  async createAndPushNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? {},
      },
    });

    // Increment unread counter in Redis
    await this.redis.incr(UNREAD_KEY(data.userId));

    // Publish to Redis channel — ChatGateway sub client will pick this up
    await this.redis.publish(
      'notifications',
      JSON.stringify({
        userId: data.userId,
        notification,
        unreadCount: await this.redis.get(UNREAD_KEY(data.userId)),
      }),
    );

    return notification;
  }

  // ── REST: get all notifications for user ──────────────────────────────────

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── REST: mark single notification read ───────────────────────────────────

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification || notification.isRead) return notification;

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const current = await this.redis.get(UNREAD_KEY(userId));
    if (current && parseInt(current, 10) > 0) {
      await this.redis.decr(UNREAD_KEY(userId));
    }

    return updated;
  }

  // ── REST: mark all read ────────────────────────────────────────────────────

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    await this.redis.set(UNREAD_KEY(userId), 0);
    return { success: true };
  }

  // ── Redis: get unread count (fast) ────────────────────────────────────────

  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.redis.get(UNREAD_KEY(userId));
    if (count !== null) return parseInt(count, 10);

    // Fallback: count from DB and sync to Redis
    const dbCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    await this.redis.set(UNREAD_KEY(userId), dbCount);
    return dbCount;
  }

  // ── BullMQ: enqueue bulk notification job ────────────────────────────────

  async enqueueBulkNotify(data: {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    return this.bulkQueue.add('bulk', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  // ── Online status ─────────────────────────────────────────────────────────

  async getOnlineUsers(): Promise<string[]> {
    return this.redis.smembers('online_users');
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return (await this.redis.sismember('online_users', userId)) === 1;
  }
}
