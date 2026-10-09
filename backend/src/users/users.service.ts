import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      branch: true,
      year: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

  async createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'PROCTOR' | 'CLUB_ADMIN' | 'ADMIN';
  branch?: string;
  year?: number;
  phone?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  return this.prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? 'STUDENT',
      branch: data.branch,
      year: data.year,
      phone: data.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      branch: true,
      year: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
 }
}