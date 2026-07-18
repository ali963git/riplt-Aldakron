import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAzkarCategoryDto } from '../dto/create-azkar-category.dto';
import { CreateAzkarItemDto, UpdateAzkarItemDto } from '../dto/azkar-item.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminAzkarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // --- Categories ---

  async createCategory(adminId: string, dto: CreateAzkarCategoryDto) {
    const category = await this.prisma.azkarCategory.create({ data: dto });
    await this.auditLog.log(adminId, 'azkar_category.create', 'AzkarCategory', category.id, dto);
    return category;
  }

  async deleteCategory(adminId: string, id: string) {
    const category = await this.prisma.azkarCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('التصنيف غير موجود');

    await this.prisma.azkarCategory.delete({ where: { id } });
    await this.auditLog.log(adminId, 'azkar_category.delete', 'AzkarCategory', id);
    return { success: true };
  }

  // --- Items ---

  async createItem(adminId: string, dto: CreateAzkarItemDto) {
    const category = await this.prisma.azkarCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('التصنيف المحدد غير موجود');

    const item = await this.prisma.azkarItem.create({ data: dto });
    await this.auditLog.log(adminId, 'azkar_item.create', 'AzkarItem', item.id, dto);
    return item;
  }

  async updateItem(adminId: string, id: string, dto: UpdateAzkarItemDto) {
    const item = await this.prisma.azkarItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الذكر غير موجود');

    const updated = await this.prisma.azkarItem.update({ where: { id }, data: dto });
    await this.auditLog.log(adminId, 'azkar_item.update', 'AzkarItem', id, dto);
    return updated;
  }

  async deleteItem(adminId: string, id: string) {
    const item = await this.prisma.azkarItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الذكر غير موجود');

    await this.prisma.azkarItem.delete({ where: { id } });
    await this.auditLog.log(adminId, 'azkar_item.delete', 'AzkarItem', id);
    return { success: true };
  }
}
