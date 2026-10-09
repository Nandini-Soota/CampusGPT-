import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventCategory } from '@prisma/client';

interface CreateEventData {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  startsAt: string;
  endsAt?: string;
  capacity?: number | null;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async createEvent(data: CreateEventData, organizerId: string) {
    const startsAt = new Date(data.startsAt);
    const endsAt = data.endsAt ? new Date(data.endsAt) : null;

    if (
      !data.title?.trim() ||
      !data.description?.trim() ||
      !data.venue?.trim()
    ) {
      throw new BadRequestException(
        'Title, description, and venue are required',
      );
    }

    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid event start date');
    }

    if (endsAt && Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid event end date');
    }

    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException(
        'Event end time must be after start time',
      );
    }

    if (
      data.capacity !== undefined &&
      data.capacity !== null &&
      (!Number.isInteger(data.capacity) || data.capacity <= 0)
    ) {
      throw new BadRequestException(
        'Capacity must be a positive whole number',
      );
    }

    return this.prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        venue: data.venue.trim(),
        startsAt,
        endsAt,
        capacity: data.capacity ?? null,
        organizerId,
        isPublished: false,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event || !event.isPublished) {
      throw new NotFoundException('Event not found');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered for this event');
    }

    if (
      event.capacity !== null &&
      event._count.registrations >= event.capacity
    ) {
      throw new ConflictException('Event is full');
    }

    return this.prisma.eventRegistration.create({
      data: { userId, eventId },
      include: { event: true },
    });
  }

  async findMyEvents(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.eventRegistration.delete({
      where: { id: registration.id },
    });
  }
}
