import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TIMETABLE_DAYS } from '../schedule/schedule.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private async isWorkingDay(date: Date): Promise<boolean> {
    const calendarEntry =
      await this.prisma.academicCalendar.findUnique({
        where: {
          date,
        },
      });

    if (calendarEntry) {
      return calendarEntry.isWorkingDay;
    }

    const day = date.getUTCDay();

    if (day === 0) {
      return false;
    }

    return true;
  }

  async getMyAttendance(userId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { userId },
      include: {
        scheduleEntry: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async markAttendance(
  userId: string,
  scheduleEntryId: string,
  date: string,
  status: string,
) {
  if (!['PRESENT', 'ABSENT'].includes(status)) {
    throw new BadRequestException(
      'Status must be PRESENT or ABSENT.',
    );
  }

  const scheduleEntry =
    await this.prisma.scheduleEntry.findFirst({
      where: {
        id: scheduleEntryId,
        userId,
        isActive: true,
      },
    });

  if (!scheduleEntry) {
    throw new NotFoundException(
      'Schedule entry not found for this student.',
    );
  }

  const classDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(classDate.getTime()) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new BadRequestException(
      'Invalid date. Use YYYY-MM-DD.',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      semesterStartDate: true,
      lastInstructionDate: true,
    },
  });

  if (
    !user?.semesterStartDate ||
    !user?.lastInstructionDate
  ) {
    throw new BadRequestException(
      'Semester dates are not configured.',
    );
  }

  const semesterStart = new Date(
    user.semesterStartDate,
  );

  const semesterEnd = new Date(
    user.lastInstructionDate,
  );

  if (
    classDate < semesterStart ||
    classDate > semesterEnd
  ) {
    throw new BadRequestException(
      'Attendance date is outside the semester period.',
    );
  }

  const today = new Date();

  const todayKey =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  if (date > todayKey) {
    throw new BadRequestException(
      'Attendance cannot be marked for a future date.',
    );
  }

  const isWorkingDay =
    await this.isWorkingDay(classDate);

  if (!isWorkingDay) {
    throw new BadRequestException(
      'Attendance cannot be marked on a non-working day.',
    );
  }

  return this.prisma.attendanceRecord.upsert({
    where: {
      scheduleEntryId_date: {
        scheduleEntryId,
        date: classDate,
      },
    },
    update: {
      status,
    },
    create: {
      userId,
      scheduleEntryId,
      date: classDate,
      status,
    },
    include: {
      scheduleEntry: true,
    },
  });
}

  async getAttendanceSummary(userId: string) {
    const records =
      await this.prisma.attendanceRecord.findMany({
        where: {
          userId,
        },
        include: {
          scheduleEntry: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

    const summary: Record<
      string,
      {
        courseName: string;
        classesConducted: number;
        classesAttended: number;
        attendancePercentage: number;
      }
    > = {};

    for (const record of records) {
      const courseName = record.scheduleEntry.courseName;

      if (!summary[courseName]) {
        summary[courseName] = {
          courseName,
          classesConducted: 0,
          classesAttended: 0,
          attendancePercentage: 0,
        };
      }

      if (
        record.status === 'PRESENT' ||
        record.status === 'ABSENT'
      ) {
        summary[courseName].classesConducted += 1;
      }

      if (record.status === 'PRESENT') {
        summary[courseName].classesAttended += 1;
      }
    }

    return Object.values(summary).map((subject) => ({
      ...subject,
      attendancePercentage:
        subject.classesConducted === 0
          ? 0
          : Number(
              (
                (subject.classesAttended /
                  subject.classesConducted) *
                100
              ).toFixed(2),
            ),
    }));
  }

async getDateWiseAttendance(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new BadRequestException(
      'Invalid date. Use YYYY-MM-DD.',
    );
  }

  if (start > end) {
    throw new BadRequestException(
      'Start date must be before or equal to end date.',
    );
  }

  const user = await this.prisma.user.findUnique({
  where: {
    id: userId,
  },
  select: {
    semesterStartDate: true,
    lastInstructionDate: true,
  },
});

if (
  !user?.semesterStartDate ||
  !user?.lastInstructionDate
) {
  return [];
}

  const schedule = await this.prisma.scheduleEntry.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [
      {
        day: 'asc',
      },
      {
        startTime: 'asc',
      },
    ],
  });

  const semesterStart = new Date(
  user.semesterStartDate,
);

const semesterEnd = new Date(
  user.lastInstructionDate,
);

if (start < semesterStart) {
  start.setTime(semesterStart.getTime());
}

if (end > semesterEnd) {
  end.setTime(semesterEnd.getTime());
}

if (start > end) {
  return [];
}

  const attendanceRecords =
    await this.prisma.attendanceRecord.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

  const attendanceMap = new Map<string, string>();

  for (const record of attendanceRecords) {
    const localDate = new Date(
      record.date.getTime() + 5.5 * 60 * 60 * 1000,
    );

    const dateKey =
      localDate.getUTCFullYear() +
      '-' +
      String(localDate.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(localDate.getUTCDate()).padStart(2, '0');

    attendanceMap.set(
      `${record.scheduleEntryId}_${dateKey}`,
      record.status,
    );
  }

  const result: any[] = [];

  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayName = currentDate.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      },
    );

    const isWorkingDay =
      await this.isWorkingDay(currentDate);

    if (
      isWorkingDay &&
      TIMETABLE_DAYS.includes(
        dayName as (typeof TIMETABLE_DAYS)[number],
      )
    ) {
      const dateKey = currentDate
        .toISOString()
        .split('T')[0];

      const dayClasses = schedule.filter(
        (entry) => entry.day === dayName,
      );

      for (const entry of dayClasses) {
        const status =
          attendanceMap.get(
            `${entry.id}_${dateKey}`,
          ) || 'NOT_MARKED';

        result.push({
          date: dateKey,
          day: dayName,
          scheduleEntryId: entry.id,
          courseName: entry.courseName,
          courseCode: entry.courseCode,
          slotCode: entry.slotCode,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          status,
        });
      }
    }

    currentDate.setDate(
      currentDate.getDate() + 1,
    );
  }

  return result;
}

async getCurrentAttendance(userId: string) {
  const today = new Date();

  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      semesterStartDate: true,
    },
  });

  if (!user?.semesterStartDate) {
    throw new BadRequestException(
      'Semester start date is not configured.',
    );
  }

  const startDate = new Date(
    user.semesterStartDate,
  )
    .toISOString()
    .split('T')[0];

  const dateWise = await this.getDateWiseAttendance(
    userId,
    startDate,
    today.toISOString().split('T')[0],
  );

  /*
   * First get all subjects from the student's
   * currently active schedule.
   */
  const schedule = await this.prisma.scheduleEntry.findMany({
    where: {
      userId,
      isActive: true,
    },
  });

  const summary: Record<
    string,
    {
      courseName: string;
      classesConducted: number;
      classesAttended: number;
      classesMissed: number;
      attendancePercentage: number;
      eligible: boolean;
    }
  > = {};

  /*
   * Create an entry for every subject in the
   * currently active schedule.
   */
  for (const entry of schedule) {
    if (!summary[entry.courseName]) {
      summary[entry.courseName] = {
        courseName: entry.courseName,
        classesConducted: 0,
        classesAttended: 0,
        classesMissed: 0,
        attendancePercentage: 0,
        eligible: false,
      };
    }
  }

  /*
   * Process actual attendance records
   * belonging to the currently active schedule.
   *
   * NOT_MARKED classes are not counted as conducted.
   */
  for (const classOccurrence of dateWise) {
    if (classOccurrence.status === 'NOT_MARKED') {
      continue;
    }

    const courseName = classOccurrence.courseName;

    if (!summary[courseName]) {
      continue;
    }

    summary[courseName].classesConducted += 1;

    if (classOccurrence.status === 'PRESENT') {
      summary[courseName].classesAttended += 1;
    }

    if (classOccurrence.status === 'ABSENT') {
      summary[courseName].classesMissed += 1;
    }
  }

  /*
   * Calculate final attendance percentage
   * and 75% eligibility.
   */
  return Object.values(summary).map((subject) => ({
    ...subject,

    attendancePercentage:
      subject.classesConducted === 0
        ? 0
        : Number(
            (
              (subject.classesAttended /
                subject.classesConducted) *
              100
            ).toFixed(2),
          ),

    eligible:
      subject.classesConducted > 0 &&
      (subject.classesAttended /
        subject.classesConducted) *
        100 >=
        75,
  }));
}

private async getFutureClassCount(
  userId: string,
  courseName: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const scheduleEntries =
    await this.prisma.scheduleEntry.findMany({
      where: {
        userId,
        courseName,
        isActive: true,
      },
    });

  let count = 0;

  const currentDate = new Date(
  Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  ),
);

const finalDate = new Date(
  Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  ),
);

while (currentDate <= finalDate) {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const currentDay =
      dayNames[currentDate.getUTCDay()];

    const isWorkingDay =
      await this.isWorkingDay(currentDate);

    if (isWorkingDay) {
      const classesOnDay = scheduleEntries.filter(
        (entry) => entry.day === currentDay,
      );

      count += classesOnDay.length;
    }

    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1,
    );
  }

  return count;
}

async predictAttendance(
  userId: string,
  courseName: string,
  futureClasses: number,
  classesToAttend: number,
) {
  if (!courseName) {
    throw new BadRequestException(
      'Course name is required.',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      semesterStartDate: true,
      lastInstructionDate: true,
    },
  });

  if (
    !user?.semesterStartDate ||
    !user?.lastInstructionDate
  ) {
    throw new BadRequestException(
      'Semester dates are not configured.',
    );
  }

  const today = new Date();

  const semesterEnd = new Date(
    user.lastInstructionDate,
  );

  // Calculate future classes automatically.
  const futureStartDate = new Date(today);
  futureStartDate.setUTCDate(
    futureStartDate.getUTCDate() + 1,
  );

  futureClasses =
    futureStartDate > semesterEnd
      ? 0
      : await this.getFutureClassCount(
          userId,
          courseName,
          futureStartDate,
          semesterEnd,
        );

  if (
    !Number.isInteger(classesToAttend) ||
    classesToAttend < 0 ||
    classesToAttend > futureClasses
  ) {
    throw new BadRequestException(
      'classesToAttend must be between 0 and the remaining future classes.',
    );
  }

  const records =
    await this.prisma.attendanceRecord.findMany({
      where: {
        userId,
      },
      include: {
        scheduleEntry: true,
      },
    });

 const courseRecords = records.filter(
  (record) =>
    record.scheduleEntry.isActive &&
    record.scheduleEntry.courseName === courseName &&
    (record.status === 'PRESENT' ||
      record.status === 'ABSENT'),
);

  const classesConducted = courseRecords.length;

  const classesAttended = courseRecords.filter(
    (record) => record.status === 'PRESENT',
  ).length;

  const currentPercentage =
    classesConducted === 0
      ? 0
      : Number(
          (
            (classesAttended /
              classesConducted) *
            100
          ).toFixed(2),
        );

  const futureClassesMissed =
    futureClasses - classesToAttend;

  const predictedClassesConducted =
    classesConducted + futureClasses;

  const predictedClassesAttended =
    classesAttended + classesToAttend;

  const futureAttendancePercentage =
    futureClasses === 0
      ? 0
      : Number(
          (
            (classesToAttend /
              futureClasses) *
            100
          ).toFixed(2),
        );

  const predictedPercentage =
    predictedClassesConducted === 0
      ? 0
      : Number(
          (
            (predictedClassesAttended /
              predictedClassesConducted) *
            100
          ).toFixed(2),
        );

  let classesNeededFor75 = 0;

  if (currentPercentage < 75) {
    while (
      (classesAttended +
        classesNeededFor75) /
        (classesConducted +
          classesNeededFor75) <
      0.75
    ) {
      classesNeededFor75++;
    }
  }

let classesCanMiss = 0;

for (
  let missed = 0;
  missed <= futureClasses;
  missed++
) {
  const futureClassesAttended =
    futureClasses - missed;

  const finalAttendance =
    classesConducted + futureClasses === 0
      ? 0
      : (
          (classesAttended +
            futureClassesAttended) /
          (classesConducted +
            futureClasses)
        ) * 100;

  if (finalAttendance >= 75) {
    classesCanMiss = missed;
  }
}

  return {
    courseName,

    current: {
      classesConducted,
      classesAttended,
      attendancePercentage: currentPercentage,
    },

    prediction: {
      futureClasses,
      classesToAttend,
      classesCanMiss,
      futureClassesMissed,
      futureAttendancePercentage,
      predictedClassesConducted,
      predictedClassesAttended,
      predictedOverallAttendancePercentage:
        predictedPercentage,
    },

    eligibility: {
      currentlyEligible: currentPercentage >= 75,
      predictedEligible:
        predictedPercentage >= 75,
      classesNeededFor75,
    },
  };
}
}