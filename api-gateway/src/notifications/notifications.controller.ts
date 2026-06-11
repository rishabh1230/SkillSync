import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(@Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    return firstValueFrom(
      this.chatClient.send('NOTIFICATION_GET_ALL', { userId: req.user.sub }),
    );
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead(@Req() req: any) {
    return firstValueFrom(
      this.chatClient.send('NOTIFICATION_MARK_ALL_READ', { userId: req.user.sub }),
    );
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.chatClient.send('NOTIFICATION_MARK_READ', {
        id,
        userId: req.user.sub,
      }),
    );
  }
}
