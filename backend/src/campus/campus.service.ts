import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CampusService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllLocations() {
    return this.prisma.campusLocation.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createLocation(data: {
    name: string;
    type:
      | 'BUILDING'
      | 'DEPARTMENT'
      | 'OFFICE'
      | 'FACULTY_CABIN'
      | 'SERVICE'
      | 'OTHER';
    description?: string;
    building?: string;
    floor?: string;
    roomNumber?: string;
    contact?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    isVerified?: boolean;
  }) {
    return this.prisma.campusLocation.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        building: data.building,
        floor: data.floor,
        roomNumber: data.roomNumber,
        contact: data.contact,
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
        isVerified: data.isVerified ?? false,
      },
    });
  }

  async deleteLocation(id: string) {
    return this.prisma.campusLocation.delete({
      where: { id },
    });
  }
  async updateLocation(
  id: string,
  data: {
    name?: string;
    type?:
      | 'BUILDING'
      | 'DEPARTMENT'
      | 'OFFICE'
      | 'FACULTY_CABIN'
      | 'SERVICE'
      | 'OTHER';
    description?: string;
    building?: string;
    floor?: string;
    roomNumber?: string;
    contact?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    isVerified?: boolean;
  },
) {
  return this.prisma.campusLocation.update({
    where: { id },
    data,
  });
}
}