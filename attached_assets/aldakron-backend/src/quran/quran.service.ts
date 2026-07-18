import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto } from './dto/bookmark.dto';

// Al-Quran Cloud is a free, public, well-established Quran API
// (https://alquran.cloud/api) - used here as the real source of truth for
// Quran text/audio/tafsir instead of storing/duplicating the Mushaf locally.
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

const RECITER_EDITIONS: Record<string, string> = {
  alafasy: 'ar.alafasy', // مشاري راشد العفاسي
  dossari: 'ar.yasseraldossari', // ياسر الدوسري
  husary: 'ar.husary',
  minshawi: 'ar.minshawi',
};

@Injectable()
export class QuranService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /** List of all 114 surahs with metadata. */
  async listSurahs() {
    const { data } = await this.request(`${QURAN_API_BASE}/surah`);
    return data.data;
  }

  /** Full surah text with tashkeel (diacritics), edition = quran-uthmani by default. */
  async getSurah(surahNumber: number, edition = 'quran-uthmani') {
    this.assertValidSurah(surahNumber);
    const { data } = await this.request(
      `${QURAN_API_BASE}/surah/${surahNumber}/${edition}`,
    );
    return data.data;
  }

  /** A single ayah with its tafsir (default: Tafsir Ibn Kathir, abridged). */
  async getAyahTafsir(surahNumber: number, ayahNumber: number, edition = 'ar.muyassar') {
    this.assertValidSurah(surahNumber);
    const { data } = await this.request(
      `${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}/${edition}`,
    );
    return data.data;
  }

  /** Full-text search across the Quran. */
  async search(query: string, surahNumber?: number) {
    const scope = surahNumber ?? 'all';
    const { data } = await this.request(
      `${QURAN_API_BASE}/search/${encodeURIComponent(query)}/${scope}/ar`,
    );
    return data.data;
  }

  /** Recitation audio URL for a given reciter + surah (streamed from CDN). */
  getRecitationUrl(reciterKey: string, surahNumber: number): string {
    this.assertValidSurah(surahNumber);
    const edition = RECITER_EDITIONS[reciterKey];
    if (!edition) {
      throw new NotFoundException('القارئ غير متوفر');
    }
    const padded = String(surahNumber).padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${padded}.mp3`;
  }

  listReciters() {
    return Object.keys(RECITER_EDITIONS);
  }

  // --- User state: bookmarks, favorites, last read position ---

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

  // --- Helpers ---

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
