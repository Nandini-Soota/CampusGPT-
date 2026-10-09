import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SemesterService } from './semester.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('semester')
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMySemester(@Req() req: any) {
    return this.semesterService.getMySemester(
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async saveMySemester(
    @Req() req: any,
    @Body()
    body: {
      semesterStartDate: string;
      lastInstructionDate: string;
    },
  ) {
    return this.semesterService.saveMySemester(
      req.user.userId,
      body.semesterStartDate,
      body.lastInstructionDate,
    );
  }
}