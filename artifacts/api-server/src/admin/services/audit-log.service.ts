import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    adminId: string,
    action: string,
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.adminAuditLog.create({
      data: { adminId, action, targetType, targetId, metadata },
    });
  }
}
