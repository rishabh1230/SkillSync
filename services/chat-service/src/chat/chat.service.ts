import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Hackathon Public Chat ──────────────────────────────────────────────────

  async saveHackathonMessage(senderId: string, hackathonId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, roomId: hackathonId, content },
    });
  }

  async getHackathonMessages(hackathonId: string, limit = 50, before?: string) {
    return this.prisma.message.findMany({
      where: {
        roomId: hackathonId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ── Direct Messages ───────────────────────────────────────────────────────

  async findOrCreateConversation(userAId: string, userBId: string) {
    // Look for an existing conversation between exactly these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        members: {
          every: { userId: { in: [userAId, userBId] } },
        },
      },
      include: { members: true },
    });

    if (existing && existing.members.length === 2) {
      return existing;
    }

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        members: {
          create: [{ userId: userAId }, { userId: userBId }],
        },
      },
      include: { members: true },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConversationMessages(conversationId: string, limit = 50, before?: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async saveDmMessage(senderId: string, conversationId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, conversationId, content },
    });
  }

  async isConversationMember(conversationId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return !!member;
  }

  async getConversationMemberIds(conversationId: string): Promise<string[]> {
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId },
    });
    return members.map((m) => m.userId);
  }
}
