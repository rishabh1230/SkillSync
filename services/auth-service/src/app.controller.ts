import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  health() {
    return "Auth Service Running";
  }

}