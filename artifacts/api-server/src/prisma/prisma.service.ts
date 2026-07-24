import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('⚠️  DATABASE_URL not set — database features are disabled.');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL via Prisma');
    } catch (err) {
      this.logger.error('❌ Failed to connect to PostgreSQL — database features are disabled.', err);
    }
  }

  async onModuleDestroy() {
    if (!process.env.DATABASE_URL) return;
    await this.$disconnect();
  }
}
