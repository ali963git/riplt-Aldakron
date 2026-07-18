import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: ListUsersQueryDto) {
    const { search, role, page, pageSize } = query;

    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        locale: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async update(adminId: string, targetUserId: string, dto: UpdateUserAdminDto) {
    await this.getOne(targetUserId); // 404 if not found

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: dto,
      select: { id: true, email: true, role: true, isActive: true },
    });

    await this.auditLog.log(adminId, 'user.update', 'User', targetUserId, dto);
    return updated;
  }
}
