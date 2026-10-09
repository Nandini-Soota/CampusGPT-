import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

async findMySchedule(userId: string) {
  return this.prisma.scheduleEntry.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [
      { day: 'asc' },
      { startTime: 'asc' },
    ],
  });
}

async saveMySchedule(userId: string, schedule: any[]) {
  if (!schedule || schedule.length === 0) {
    return [];
  }

  // Validate every class before changing the existing timetable.
  for (const entry of schedule) {
    if (
      !entry.courseName?.trim() ||
      !entry.courseCode?.trim() ||
      !entry.room?.trim() ||
      !entry.instructor?.trim()
    ) {
      throw new BadRequestException(
        'Course name, course code, room, and instructor are required for every class.',
      );
    }
  }

  // Mark the previous timetable as inactive.
  // We keep the old entries because attendance history
  // may still be linked to them.
  await this.prisma.scheduleEntry.updateMany({
    where: { userId },
    data: { isActive: false },
  });

  // Create the new/current timetable.
  await this.prisma.scheduleEntry.createMany({
    data: schedule.map((entry) => ({
      userId,
      courseName: entry.courseName.trim(),
      courseCode: entry.courseCode.trim(),
      day: entry.day,
      slotCode: entry.slotCode,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room.trim(),
      instructor: entry.instructor.trim(),
      isActive: true,
    })),
  });

  return this.findMySchedule(userId);
}
}