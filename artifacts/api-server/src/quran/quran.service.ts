import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto } from './dto/bookmark.dto';

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

// In-memory cache for the reciters list (6h TTL), same as the old Express proxy.
let recitersCache: { data: unknown; expiresAt: number } | null = null;
const RECITERS_TTL_MS = 6 * 60 * 60 * 1000;

export const ALLOWED_AUDIO_HOSTS = [
  'server6.mp3quran.net',
  'server7.mp3quran.net',
  'server8.mp3quran.net',
  'server10.mp3quran.net',
  'server11.mp3quran.net',
  'server12.mp3quran.net',
  'server13.mp3quran.net',
  'server14.mp3quran.net',
  'cdn.islamic.network',
  'audio.qurancdn.com',
  'download.quranicaudio.com',
  'verses.quran.com',
  'mp3quran.net',
  'cdn.mp3quran.net',
  'podcasts.qurancentral.com',
  'ia800305.us.archive.org',
  'archive.org',
];

export function isAllowedHost(hostname: string): boolean {
  return ALLOWED_AUDIO_HOSTS.some(
    (host) => hostname === host || hostname.endsWith('.' + host),
  );
}

@Injectable()
export class QuranService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async listSurahs() {
    const { data } = await this.request(`${QURAN_API_BASE}/surah`);
    return data.data;
  }

  async getSurah(surahNumber: number, edition = 'quran-uthmani') {
    this.assertValidSurah(surahNumber);
    const { data } = await this.request(`${QURAN_API_BASE}/surah/${surahNumber}/${edition}`);
    return data.data;
  }

  async getAyahTafsir(surahNumber: number, ayahNumber: number, edition = 'ar.muyassar') {
    this.assertValidSurah(surahNumber);
    const { data } = await this.request(
      `${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}/${edition}`,
    );
    return data.data;
  }

  async search(query: string, surahNumber?: number) {
    const scope = surahNumber ?? 'all';
    const { data } = await this.request(
      `${QURAN_API_BASE}/search/${encodeURIComponent(query)}/${scope}/ar`,
    );
    return data.data;
  }

  getRecitationUrl(reciterKey: string, surahNumber: number): string {
    this.assertValidSurah(surahNumber);
    throw new NotFoundException('استخدم endpoint /reciters مع mp3quran.net');
  }

  /** Proxy mp3quran.net reciters list with 6h in-memory cache. */
  async listReciters(): Promise<unknown> {
    const now = Date.now();
    if (recitersCache && now < recitersCache.expiresAt) {
      return recitersCache.data;
    }

    try {
      const response = await firstValueFrom(
        this.http.get('https://mp3quran.net/api/v3/reciters?language=ar', { timeout: 8000 }),
      );
      recitersCache = { data: response.data, expiresAt: now + RECITERS_TTL_MS };
      return response.data;
    } catch (err) {
      if (recitersCache) return recitersCache.data; // serve stale on error
      const axiosErr = err as AxiosError;
      throw new BadGatewayException(`تعذّر جلب قائمة القراء: ${axiosErr.message}`);
    }
  }

  // --- User state ---

  async addBookmark(userId: string, dto: BookmarkDto) {
    this.assertValidSurah(dto.surahNumber);
    return this.prisma.quranBookmark.upsert({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber: dto.surahNumber,
          ayahNumber: dto.ayahNumber,
        },
      },
      update: { note: dto.note },
      create: { userId, ...dto },
    });
  }

  async removeBookmark(userId: string, id: string) {
    const bookmark = await this.prisma.quranBookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('العلامة المرجعية غير موجودة');
    }
    await this.prisma.quranBookmark.delete({ where: { id } });
    return { success: true };
  }

  listBookmarks(userId: string) {
    return this.prisma.quranBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleFavorite(userId: string, dto: BookmarkDto) {
    this.assertValidSurah(dto.surahNumber);
    const existing = await this.prisma.quranFavoriteAyah.findUnique({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber: dto.surahNumber,
          ayahNumber: dto.ayahNumber,
        },
      },
    });

    if (existing) {
      await this.prisma.quranFavoriteAyah.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.quranFavoriteAyah.create({
      data: { userId, surahNumber: dto.surahNumber, ayahNumber: dto.ayahNumber },
    });
    return { favorited: true };
  }

  listFavorites(userId: string) {
    return this.prisma.quranFavoriteAyah.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveLastRead(userId: string, dto: BookmarkDto) {
    this.assertValidSurah(dto.surahNumber);
    return this.prisma.quranLastRead.upsert({
      where: { userId },
      update: { surahNumber: dto.surahNumber, ayahNumber: dto.ayahNumber },
      create: { userId, surahNumber: dto.surahNumber, ayahNumber: dto.ayahNumber },
    });
  }

  getLastRead(userId: string) {
    return this.prisma.quranLastRead.findUnique({ where: { userId } });
  }

  private assertValidSurah(surahNumber: number) {
    if (surahNumber < 1 || surahNumber > 114) {
      throw new NotFoundException('رقم السورة غير صحيح، يجب أن يكون بين 1 و114');
    }
  }

  private async request(url: string) {
    try {
      return await firstValueFrom(this.http.get(url, { timeout: 8000 }));
    } catch (err) {
      const axiosErr = err as AxiosError;
      throw new BadGatewayException(
        `تعذّر الاتصال بخدمة القرآن الكريم الخارجية: ${axiosErr.message}`,
      );
    }
  }
}
