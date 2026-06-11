import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── HTTP REST endpoints (called via API gateway) ──────────────────────────

  @Get('hackathon/:hackathonId/messages')
  @UseGuards(JwtAuthGuard)
  async getHackathonMessages(
    @Param('hackathonId') hackathonId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getHackathonMessages(
      hackathonId,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    return this.chatService.getUserConversations(req.user.sub);
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Body() body: { recipientId: string }, @Req() req: any) {
    return this.chatService.findOrCreateConversation(req.user.sub, body.recipientId);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(
    @Param('id') id: string,
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const isMember = await this.chatService.isConversationMember(id, req.user.sub);
    if (!isMember) {
      return { error: 'Forbidden' };
    }
    return this.chatService.getConversationMessages(
      id,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  // ── RabbitMQ message handlers (called from API gateway) ───────────────────

  @MessagePattern('CHAT_GET_HACKATHON_MESSAGES')
  async rmqGetHackathonMessages(@Payload() data: { hackathonId: string; limit?: number; before?: string }) {
    return this.chatService.getHackathonMessages(data.hackathonId, data.limit, data.before);
  }

  @MessagePattern('CHAT_GET_CONVERSATIONS')
  async rmqGetConversations(@Payload() data: { userId: string }) {
    return this.chatService.getUserConversations(data.userId);
  }

  @MessagePattern('CHAT_CREATE_CONVERSATION')
  async rmqCreateConversation(@Payload() data: { userId: string; recipientId: string }) {
    return this.chatService.findOrCreateConversation(data.userId, data.recipientId);
  }

  @MessagePattern('CHAT_GET_CONVERSATION_MESSAGES')
  async rmqGetConversationMessages(
    @Payload() data: { userId: string; conversationId: string; limit?: number; before?: string },
  ) {
    const isMember = await this.chatService.isConversationMember(data.conversationId, data.userId);
    if (!isMember) return { error: 'Forbidden' };
    return this.chatService.getConversationMessages(data.conversationId, data.limit, data.before);
  }
}
