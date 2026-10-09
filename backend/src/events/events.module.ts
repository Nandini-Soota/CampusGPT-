import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';

@Module({
  providers: [EventsService, RolesGuard],
  controllers: [EventsController],
})
export class EventsModule {}