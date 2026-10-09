
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClubsService } from './clubs.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyClubs(@Req() req: AuthenticatedRequest) {
    return this.clubsService.getMyClubs(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinClub(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clubsService.joinClub(req.user.userId, id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  leaveClub(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clubsService.leaveClub(req.user.userId, id);
  }
}
