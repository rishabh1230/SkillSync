import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // 🔐 REGISTER
  async register(data: any) {

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    if(data.username == null || data.password == null) {
      throw new BadRequestException('Username and password are required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        phone_no: data.phone_no,
        username: data.username
      },
    });

    return {
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone_no: user.phone_no
      }
    };
  }

  // 🔑 LOGIN
  async login(data: any) {

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Login successful",
      access_token: token,
    };
  }

  // 🔒 UPDATE PASSWORD
  async updatePassword(data : any){
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if(!user){
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      data.old_password,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(data.new_password, 10);

    await this.prisma.user.update({
      where: { email: data.email },
      data: { password: hashedPassword },
    });

    return{
      message: "Password updated successfully"
    }
  }

}