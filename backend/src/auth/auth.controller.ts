import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body()
    data: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.validateUser(data.email, data.password);
  }
}