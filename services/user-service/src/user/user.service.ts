import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.profile.create({ data });
  }

  findOne(userId: number) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  update(userId: number, data: any) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }
}