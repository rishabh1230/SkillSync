import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService){}

  async register(data:any){

    const hashedPassword = await bcrypt.hash(data.password,10);

    return this.prisma.user.create({
      data:{
        email:data.email,
        password:hashedPassword
      }
    });

  }

}