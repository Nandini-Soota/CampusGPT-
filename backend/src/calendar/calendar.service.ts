import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async createEvent(
    userId: string,
    data: {
      title: string;
      description?: string;
      type: string;
      eventDate: string;
      notifyBefore: number;
    },
  ) {
    if (!data.title?.trim()) {
      throw new BadRequestException(
        'Event title is required.',
      );
    }

    if (!data.type?.trim()) {
      throw new BadRequestException(
        'Event type is required.',
      );
    }

    if (!data.eventDate) {
      throw new BadRequestException(
        'Event date and time are required.',
      );
    }

    if (
      !Number.isInteger(data.notifyBefore) ||
      data.notifyBefore < 0
    ) {
      throw new BadRequestException(
        'Notification time must be a non-negative number of minutes.',
      );
    }

    const eventDate = new Date(data.eventDate);

    if (Number.isNaN(eventDate.getTime())) {
      throw new BadRequestException(
        'Invalid event date and time.',
      );
    }

    const notificationAt = new Date(
      eventDate.getTime() -
        data.notifyBefore * 60 * 1000,
    );

    const calendarEvent =
  await this.prisma.calendarEvent.create({
    data: {
      userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type.trim(),
      eventDate,
      notifyBefore: data.notifyBefore,
      notificationAt,
    },
  });

await this.prisma.notification.create({
  data: {
    userId,
    calendarEventId: calendarEvent.id,
    title: calendarEvent.title,
    message: `${calendarEvent.title} is coming up.`,
    scheduledAt: notificationAt,
  },
});

return calendarEvent;
  }

  async getMyEvents(userId: string) {
  return this.prisma.calendarEvent.findMany({
    where: {
      userId,
    },
    orderBy: {
      eventDate: 'asc',
    },
  });
}

async getDueNotifications(userId: string) {
  const now = new Date();

  return this.prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      scheduledAt: {
        lte: now,
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });
}

async markNotificationAsRead(
  userId: string,
  notificationId: string,
) {
  return this.prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

}