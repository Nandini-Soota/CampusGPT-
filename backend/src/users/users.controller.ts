import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
@UseGuards(JwtAuthGuard)
async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminTest() {
    return {
      message: 'You have ADMIN access.',
    };
  }
  @Post()
  async createUser(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      role?: 'STUDENT' | 'PROCTOR' | 'CLUB_ADMIN' | 'ADMIN';
      branch?: string;
      year?: number;
      phone?: string;
    },
  ) {
    return this.usersService.createUser(data);
  }
}