import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CampusModule } from './campus/campus.module.js';
import { ClubsModule } from './clubs/clubs.module.js';
import { EventsModule } from './events/events.module.js';
import { ScheduleModule } from './schedule/schedule.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { SemesterModule } from './semester/semester.module.js';
import { CalendarModule } from './calendar/calendar.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CampusModule,
    ClubsModule,
    EventsModule,
    ScheduleModule,
    AttendanceModule,
    SemesterModule,
    CalendarModule,
  ],
})
export class AppModule {}