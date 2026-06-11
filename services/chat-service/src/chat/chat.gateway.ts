import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { NotificationService } from '../notification/notification.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { NotificationType } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ── Connection Lifecycle ──────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'supersecret',
      });

      const userId = payload.sub as string;
      client.data.userId = userId;

      // Join personal room for targeted events
      client.join(`user:${userId}`);

      // Track online status in Redis (set with 1-hour expiry auto-refresh)
      await this.redis.sadd('online_users', userId);
      await this.redis.set(`user_socket:${userId}`, client.id, 'EX', 3600);

      // Push current unread count on connect
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      client.emit('unread_count', { count: unreadCount });

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch (err) {
      this.logger.warn(`Unauthorized connection attempt: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      await this.redis.srem('online_users', userId);
      await this.redis.del(`user_socket:${userId}`);
      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  // ── Hackathon Public Chat ─────────────────────────────────────────────────

  @SubscribeMessage('join_hackathon')
  async handleJoinHackathon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hackathonId: string },
  ) {
    client.join(`hackathon:${data.hackathonId}`);
    client.emit('joined_hackathon', { hackathonId: data.hackathonId });
  }

  @SubscribeMessage('leave_hackathon')
  async handleLeaveHackathon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hackathonId: string },
  ) {
    client.leave(`hackathon:${data.hackathonId}`);
  }

  @SubscribeMessage('send_hackathon_message')
  async handleHackathonMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hackathonId: string; content: string },
  ) {
    const userId = client.data?.userId;
    if (!userId) throw new WsException('Unauthorized');

    const message = await this.chatService.saveHackathonMessage(
      userId,
      data.hackathonId,
      data.content,
    );

    // Broadcast to all in the hackathon room
    this.server.to(`hackathon:${data.hackathonId}`).emit('hackathon_message', message);

    return message;
  }

  // ── Direct Messages ───────────────────────────────────────────────────────

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data?.userId;
    if (!userId) throw new WsException('Unauthorized');

    const isMember = await this.chatService.isConversationMember(
      data.conversationId,
      userId,
    );
    if (!isMember) throw new WsException('Not a member of this conversation');

    client.join(`conversation:${data.conversationId}`);
    client.emit('joined_conversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('send_dm')
  async handleDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const senderId = client.data?.userId;
    if (!senderId) throw new WsException('Unauthorized');

    const isMember = await this.chatService.isConversationMember(
      data.conversationId,
      senderId,
    );
    if (!isMember) throw new WsException('Not a member of this conversation');

    const message = await this.chatService.saveDmMessage(
      senderId,
      data.conversationId,
      data.content,
    );

    // Broadcast to conversation room
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('dm_message', message);

    // Notify the other members
    const memberIds = await this.chatService.getConversationMemberIds(
      data.conversationId,
    );
    const recipients = memberIds.filter((id) => id !== senderId);

    for (const recipientId of recipients) {
      await this.notificationService.createAndPushNotification({
        userId: recipientId,
        type: NotificationType.DM,
        title: 'New Message',
        message: data.content.length > 60 ? data.content.slice(0, 60) + '…' : data.content,
        metadata: { conversationId: data.conversationId, senderId },
      });
    }

    return message;
  }

  // ── Utility: emit to a user's personal room ───────────────────────────────

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
