import { Module } from '@nestjs/common';

import { SemesterController } from './semester.controller.js';
import { SemesterService } from './semester.service.js';

@Module({
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}