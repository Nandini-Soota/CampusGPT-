import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';

import { EventsService } from './events.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyEvents(@Req() req: any) {
    return this.eventsService.findMyEvents(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Organizer-only event creation
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLUB_ADMIN')
  createEvent(@Body() body: any, @Req() req: any) {
    return this.eventsService.createEvent(body, req.user.userId);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.register(id, req.user.userId);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  cancelRegistration(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.cancelRegistration(id, req.user.userId);
  }
}