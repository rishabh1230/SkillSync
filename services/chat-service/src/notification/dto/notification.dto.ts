import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkNotificationJobDto {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}
