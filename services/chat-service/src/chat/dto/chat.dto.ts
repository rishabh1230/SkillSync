import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendHackathonMessageDto {
  @IsString()
  @IsNotEmpty()
  hackathonId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SendDmDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  before?: string;
}
