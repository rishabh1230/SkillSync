import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { RmqModule } from '../rmq/rmq.module';
import { AuthListener } from '../rmq/auth.listener';


@Module({
  imports: [
    RmqModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, AuthListener],
  providers: [AuthService],
})
export class AuthModule {}