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
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(@Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy) {}

  @Get('hackathon/:hackathonId/messages')
  @UseGuards(JwtAuthGuard)
  async getHackathonMessages(
    @Param('hackathonId') hackathonId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Req() req?: any,
  ) {
    return firstValueFrom(
      this.chatClient.send('CHAT_GET_HACKATHON_MESSAGES', {
        hackathonId,
        limit: limit ? parseInt(limit, 10) : 50,
        before,
      }),
    );
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    return firstValueFrom(
      this.chatClient.send('CHAT_GET_CONVERSATIONS', { userId: req.user.sub }),
    );
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Body() body: { recipientId: string }, @Req() req: any) {
    return firstValueFrom(
      this.chatClient.send('CHAT_CREATE_CONVERSATION', {
        userId: req.user.sub,
        recipientId: body.recipientId,
      }),
    );
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(
    @Param('id') id: string,
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return firstValueFrom(
      this.chatClient.send('CHAT_GET_CONVERSATION_MESSAGES', {
        userId: req.user.sub,
        conversationId: id,
        limit: limit ? parseInt(limit, 10) : 50,
        before,
      }),
    );
  }
}
