import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminNotificationsService } from '../services/admin-notifications.service';
import { BroadcastNotificationDto } from '../dto/broadcast-notification.dto';

@ApiTags('admin/notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  @Post('broadcast')
  broadcast(@CurrentUser() admin: AuthenticatedUser, @Body() dto: BroadcastNotificationDto) {
    return this.adminNotificationsService.broadcast(admin.id, dto);
  }

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.adminNotificationsService.list(
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }
}
