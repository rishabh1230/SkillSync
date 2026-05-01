import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create user (idempotent-safe)
  async create(data: {
    authId: string;
    email: string;
    username: string;
    phone_no?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { authId: data.authId },
    });

    if (existing) return existing;

    return this.prisma.user.create({
      data,
    });
  }

  // ✅ Find user
  async findOne(authId: string) {
    const user = await this.prisma.user.findUnique({
      where: { authId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ✅ Update user
  async update(
    authId: string,
    data: { username?: string; phone_no?: string },
  ) {
    if (!data.username && !data.phone_no) {
      throw new BadRequestException('Nothing to update');
    }

    return this.prisma.user.update({
      where: { authId },
      data,
    });
  }
}