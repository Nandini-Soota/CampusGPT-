import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SemesterService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySemester(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        semesterStartDate: true,
        lastInstructionDate: true,
      },
    });

    return user;
  }

  async saveMySemester(
    userId: string,
    semesterStartDate: string,
    lastInstructionDate: string,
  ) {
    if (!semesterStartDate || !lastInstructionDate) {
      throw new BadRequestException(
        'Semester start date and last instruction date are required.',
      );
    }

    const startDate = new Date(
      `${semesterStartDate}T00:00:00Z`,
    );

    const endDate = new Date(
      `${lastInstructionDate}T00:00:00Z`,
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException(
        'Invalid date. Use YYYY-MM-DD.',
      );
    }

    if (startDate > endDate) {
      throw new BadRequestException(
        'Semester start date must be before or equal to the last instruction date.',
      );
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        semesterStartDate: startDate,
        lastInstructionDate: endDate,
      },
      select: {
        semesterStartDate: true,
        lastInstructionDate: true,
      },
    });
  }
}