import {
  Inject,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_PATTERNS } from '../../../../shared/rmq/patterns';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private client: ClientProxy,
  ) {}

  // 🔐 REGISTER
  async register(data: {
    email: string;
    password: string;
    username: string;
    phone_no?: string;
  }) {
    const existingAuth = await this.prisma.auth.findUnique({
      where: { email: data.email },
    });

    if (existingAuth) {
      throw new BadRequestException('User already exists');
    }

    if (!data.username || !data.password) {
      throw new BadRequestException('Username and password are required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const auth = await this.prisma.auth.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    // 🔥 Emit event to user-service
    this.client.emit(RMQ_PATTERNS.USER_CREATED, {
      authId: auth.id,
      email: auth.email,
      username: data.username,
      phone_no: data.phone_no,
    });

    return {
      message: 'User registered successfully',
      authId: auth.id,
      email: auth.email,
    };
  }

  // 🔑 LOGIN
  async login(data: { email: string; password: string }) {
    const auth = await this.prisma.auth.findUnique({
      where: { email: data.email },
    });

    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      auth.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: auth.id,
      email: auth.email,
    });

    return {
      message: 'Login successful',
      access_token: token,
    };
  }

  // 🔒 UPDATE PASSWORD
  async updatePassword(data: {
    email: string;
    old_password: string;
    new_password: string;
  }) {
    const auth = await this.prisma.auth.findUnique({
      where: { email: data.email },
    });

    if (!auth) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      data.old_password,
      auth.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(data.new_password, 10);

    await this.prisma.auth.update({
      where: { email: data.email },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password updated successfully',
    };
  }
}