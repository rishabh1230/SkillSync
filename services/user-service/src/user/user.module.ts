import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserEvents } from '../events/user.events';

@Module({
  imports: [PrismaModule], // 👈 IMPORTANT
  controllers: [UserController, UserEvents],
  providers: [UserService],
})
export class UserModule {}