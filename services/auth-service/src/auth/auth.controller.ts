import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // REGISTER
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  // LOGIN
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }


  // UPDATE PASSWORD
  @Post('update-password')
  updatePassword(@Body() body: any) {
    return this.authService.updatePassword(body);
  }

}