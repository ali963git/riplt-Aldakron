import { Injectable, NotFoundException } from '@nestjs/common';
import { AzkarPeriod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AzkarService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories(period?: AzkarPeriod) {
    return this.prisma.azkarCategory.findMany({
      where: period ? { period } : undefined,
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async getCategory(id: string) {
    const category = await this.prisma.azkarCategory.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!category) throw new NotFoundException('التصنيف غير موجود');
    return category;
  }

  /** Increment the smart tasbih counter for a given zikr, capped at its repeatCount. */
  async incrementProgress(userId: string, azkarItemId: string) {
    const item = await this.prisma.azkarItem.findUnique({ where: { id: azkarItemId } });
    if (!item) throw new NotFoundException('الذكر غير موجود');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.azkarProgress.findUnique({
      where: { userId_azkarItemId_date: { userId, azkarItemId, date: today } },
    });

    const newCount = Math.min((existing?.count ?? 0) + 1, item.repeatCount);
    const completedAt =
      newCount >= item.repeatCount ? (existing?.completedAt ?? new Date()) : null;

    return this.prisma.azkarProgress.upsert({
      where: { userId_azkarItemId_date: { userId, azkarItemId, date: today } },
      update: { count: newCount, completedAt },
      create: { userId, azkarItemId, count: newCount, date: today, completedAt },
    });
  }

  async resetProgress(userId: string, azkarItemId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.azkarProgress.upsert({
      where: { userId_azkarItemId_date: { userId, azkarItemId, date: today } },
      update: { count: 0, completedAt: null },
      create: { userId, azkarItemId, count: 0, date: today },
    });
  }

  async getTodayProgress(userId: string, period: AzkarPeriod) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await this.prisma.azkarItem.findMany({
      where: { category: { period } },
      include: {
        progress: { where: { userId, date: today } },
      },
      orderBy: { order: 'asc' },
    });

    return items.map((item) => ({
      id: item.id,
      textAr: item.textAr,
      repeatCount: item.repeatCount,
      currentCount: item.progress[0]?.count ?? 0,
      completed: !!item.progress[0]?.completedAt,
    }));
  }
}
