import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ScheduleService } from './schedule.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMySchedule(@Req() req: any) {
    return this.scheduleService.findMySchedule(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async saveMySchedule(
    @Req() req: any,
    @Body() schedule: any[],
  ) {
    return this.scheduleService.saveMySchedule(
      req.user.userId,
      schedule,
    );
  }
}