import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      newUsersLast7Days,
      totalBookmarks,
      totalFavorites,
      azkarCompletionsToday,
      usersByLocale,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.quranBookmark.count(),
      this.prisma.quranFavoriteAyah.count(),
      this.prisma.azkarProgress.count({
        where: {
          completedAt: { not: null },
          date: { equals: this.startOfToday() },
        },
      }),
      this.prisma.user.groupBy({ by: ['locale'], _count: { locale: true } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersLast7Days,
      totalQuranBookmarks: totalBookmarks,
      totalQuranFavorites: totalFavorites,
      azkarCompletionsToday,
      usersByLocale: usersByLocale.map((row) => ({
        locale: row.locale,
        count: row._count.locale,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
