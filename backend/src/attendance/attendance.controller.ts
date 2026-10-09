import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('attendance')
export class AttendanceController {
constructor(
   private readonly attendanceService: AttendanceService,
) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyAttendance(@Req() req: any) {
    return this.attendanceService.getMyAttendance(
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark')
  async markAttendance(
    @Req() req: any,
    @Body()
    body: {
      scheduleEntryId: string;
      date: string;
      status: string;
    },
  ) {
    return this.attendanceService.markAttendance(
      req.user.userId,
      body.scheduleEntryId,
      body.date,
      body.status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getAttendanceSummary(@Req() req: any) {
    return this.attendanceService.getAttendanceSummary(
      req.user.userId,
    );
  }

    @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentAttendance(@Req() req: any) {
    return this.attendanceService.getCurrentAttendance(
      req.user.userId,
    );
  }

    @UseGuards(JwtAuthGuard)
  @Get('predict')
  async predictAttendance(
    @Req() req: any,
    @Query('courseName') courseName: string,
    @Query('futureClasses') futureClasses: string,
    @Query('classesToAttend') classesToAttend: string,
  ) {
    return this.attendanceService.predictAttendance(
      req.user.userId,
      courseName,
      Number(futureClasses),
      Number(classesToAttend),
    );
  }

    @UseGuards(JwtAuthGuard)
  @Get('date-wise')
  async getDateWiseAttendance(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getDateWiseAttendance(
      req.user.userId,
      startDate,
      endDate,
    );
  }
}