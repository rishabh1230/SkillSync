import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }

  @Get()
  health() {
    return "Auth Service Running";
  }

}