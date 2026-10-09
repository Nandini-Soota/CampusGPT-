import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CampusService } from './campus.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Get('locations')
  async getAllLocations() {
    return this.campusService.getAllLocations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('locations')
  async createLocation(
    @Body()
    data: {
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
    },
  ) {
    return this.campusService.createLocation(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('locations/:id')
  async deleteLocation(@Param('id') id: string) {
   return this.campusService.deleteLocation(id);
  }
    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('locations/:id')
  async updateLocation(
    @Param('id') id: string,
    @Body()
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
    return this.campusService.updateLocation(id, data);
  }
}