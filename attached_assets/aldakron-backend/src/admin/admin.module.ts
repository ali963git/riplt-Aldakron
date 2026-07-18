import { Module } from '@nestjs/common';

import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminAzkarController } from './controllers/admin-azkar.controller';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';

import { AdminUsersService } from './services/admin-users.service';
import { AdminAzkarService } from './services/admin-azkar.service';
import { AdminNotificationsService } from './services/admin-notifications.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AuditLogService } from './services/audit-log.service';

@Module({
  controllers: [
    AdminUsersController,
    AdminAzkarController,
    AdminNotificationsController,
    AdminStatsController,
  ],
  providers: [
    AdminUsersService,
    AdminAzkarService,
    AdminNotificationsService,
    AdminStatsService,
    AuditLogService,
  ],
})
export class AdminModule {}
