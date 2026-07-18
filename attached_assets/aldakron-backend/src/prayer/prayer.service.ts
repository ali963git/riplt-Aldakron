import { BadGatewayException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CalculationMethod } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrayerSettingsDto } from './dto/prayer-settings.dto';

// Aladhan is a free, widely-used public API for prayer times / Qibla / Hijri
// calendar calculations (https://aladhan.com/prayer-times-api).
const ALADHAN_BASE = 'https://api.aladhan.com/v1';

const METHOD_MAP: Record<CalculationMethod, number> = {
  MWL: 3,
  ISNA: 2,
  EGYPT: 5,
  MAKKAH: 4,
  KARACHI: 1,
  TEHRAN: 7,
  JAFARI: 0,
};

@Injectable()
export class PrayerService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getTimesByCoordinates(
    latitude: number,
    longitude: number,
    method: CalculationMethod = CalculationMethod.MWL,
    date?: string, // DD-MM-YYYY, defaults to today
  ) {
    const path = date ? `/timings/${date}` : '/timings';
    const { data } = await this.request(`${ALADHAN_BASE}${path}`, {
      latitude,
      longitude,
      method: METHOD_MAP[method],
    });
    return data.data;
  }

  async getQiblaDirection(latitude: number, longitude: number) {
    const { data } = await this.request(`${ALADHAN_BASE}/qibla/${latitude}/${longitude}`);
    return data.data; // { latitude, longitude, direction (degrees from true north) }
  }

  async getHijriDate(date?: string) {
    const path = date ? `/gToH/${date}` : '/gToH';
    const { data } = await this.request(`${ALADHAN_BASE}${path}`);
    return data.data.hijri;
  }

  // --- Per-user saved settings ---

  async saveSettings(userId: string, dto: PrayerSettingsDto) {
    return this.prisma.prayerSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  getSettings(userId: string) {
    return this.prisma.prayerSettings.findUnique({ where: { userId } });
  }

  /** Convenience: today's prayer times using the user's saved settings. */
  async getMyTimesToday(userId: string) {
    const settings = await this.getSettings(userId);
    if (!settings) return null;
    return this.getTimesByCoordinates(
      settings.latitude,
      settings.longitude,
      settings.calculationMethod,
    );
  }

  private async request(url: string, params?: Record<string, unknown>) {
    try {
      return await firstValueFrom(this.http.get(url, { params, timeout: 8000 }));
    } catch (err) {
      const axiosErr = err as AxiosError;
      throw new BadGatewayException(
        `تعذّر الاتصال بخدمة مواقيت الصلاة الخارجية: ${axiosErr.message}`,
      );
    }
  }
}
