import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BroadcastNotificationDto } from '../dto/broadcast-notification.dto';
import { AuditLogService } from './audit-log.service';

const BROADCAST_BATCH_SIZE = 500;

@Injectable()
export class AdminNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Creates a Notification row for every target user. For "send to all" (no
   * userIds given) this streams user IDs in batches instead of loading the
   * whole user table into memory at once.
   */
  async broadcast(adminId: string, dto: BroadcastNotificationDto) {
    let totalSent = 0;

    if (dto.userIds && dto.userIds.length > 0) {
      const result = await this.prisma.notification.createMany({
        data: dto.userIds.map((userId) => ({
          userId,
          type: dto.type,
          titleAr: dto.titleAr,
          bodyAr: dto.bodyAr,
        })),
        skipDuplicates: true,
      });
      totalSent = result.count;
    } else {
      let cursor: string | undefined;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const batch = await this.prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
          take: BROADCAST_BATCH_SIZE,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          orderBy: { id: 'asc' },
        });
        if (batch.length === 0) break;

        const result = await this.prisma.notification.createMany({
          data: batch.map((u) => ({
            userId: u.id,
            type: dto.type,
            titleAr: dto.titleAr,
            bodyAr: dto.bodyAr,
          })),
        });
        totalSent += result.count;
        cursor = batch[batch.length - 1].id;
        if (batch.length < BROADCAST_BATCH_SIZE) break;
      }
    }

    await this.auditLog.log(adminId, 'notification.broadcast', 'Notification', undefined, {
      type: dto.type,
      titleAr: dto.titleAr,
      targeted: dto.userIds ? dto.userIds.length : 'all_active_users',
      totalSent,
    });

    return { totalSent };
  }

  list(page = 1, pageSize = 50) {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
