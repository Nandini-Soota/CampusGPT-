
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.club.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async joinClub(userId: string, clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club || !club.isActive) {
      throw new NotFoundException('Active club not found');
    }

    const existingMembership = await this.prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('You have already joined this club');
    }

    return this.prisma.clubMembership.create({
      data: {
        userId,
        clubId,
      },
      select: {
        id: true,
        userId: true,
        clubId: true,
        joinedAt: true,
      },
    });
  }

  async leaveClub(userId: string, clubId: string) {
    const membership = await this.prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this club');
    }

    await this.prisma.clubMembership.delete({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    return {
      message: 'Successfully left the club',
    };
  }

  async getMyClubs(userId: string) {
    return this.prisma.clubMembership.findMany({
      where: {
        userId,
      },
      include: {
        club: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }
}
