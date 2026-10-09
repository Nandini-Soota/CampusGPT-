import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CalendarService } from './calendar.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description?: string;
      type: string;
      eventDate: string;
      notifyBefore: number;
    },
  ) {
    return this.calendarService.createEvent(
      req.user.userId,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
@Get()
async getMyEvents(@Req() req: any) {
  return this.calendarService.getMyEvents(
    req.user.userId,
  );
}

@UseGuards(JwtAuthGuard)
@Get('notifications')
async getNotifications(@Req() req: any) {
  return this.calendarService.getDueNotifications(
    req.user.userId,
  );
}

@UseGuards(JwtAuthGuard)
@Post('notifications/:id/read')
async markNotificationAsRead(
  @Req() req: any,
  @Param('id') id: string,
) {
  return this.calendarService.markNotificationAsRead(
    req.user.userId,
    id,
  );
}

}