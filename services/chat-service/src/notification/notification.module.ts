import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService, BULK_NOTIFY_QUEUE } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BULK_NOTIFY_QUEUE,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
