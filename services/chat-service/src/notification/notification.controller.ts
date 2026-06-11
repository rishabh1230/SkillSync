import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ── HTTP REST (direct) ────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    return this.notificationService.getNotifications(req.user.sub);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markRead(id, req.user.sub);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead(@Req() req: any) {
    return this.notificationService.markAllRead(req.user.sub);
  }

  // ── RabbitMQ message handlers (from API gateway) ──────────────────────────

  @MessagePattern('NOTIFICATION_GET_ALL')
  async rmqGetAll(@Payload() data: { userId: string }) {
    return this.notificationService.getNotifications(data.userId);
  }

  @MessagePattern('NOTIFICATION_MARK_READ')
  async rmqMarkRead(@Payload() data: { id: string; userId: string }) {
    return this.notificationService.markRead(data.id, data.userId);
  }

  @MessagePattern('NOTIFICATION_MARK_ALL_READ')
  async rmqMarkAllRead(@Payload() data: { userId: string }) {
    return this.notificationService.markAllRead(data.userId);
  }

  @MessagePattern('NOTIFICATION_GET_UNREAD_COUNT')
  async rmqGetUnreadCount(@Payload() data: { userId: string }) {
    const count = await this.notificationService.getUnreadCount(data.userId);
    return { count };
  }

  @MessagePattern('NOTIFICATION_BULK_NOTIFY')
  async rmqBulkNotify(
    @Payload() data: {
      userIds: string[];
      type: any;
      title: string;
      message: string;
      metadata?: Record<string, any>;
    },
  ) {
    await this.notificationService.enqueueBulkNotify(data);
    return { queued: true, count: data.userIds.length };
  }
}
