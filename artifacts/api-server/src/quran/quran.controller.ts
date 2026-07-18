import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import https from 'https';
import http from 'http';
import type { IncomingMessage } from 'http';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { QuranService, isAllowedHost } from './quran.service';
import { BookmarkDto } from './dto/bookmark.dto';

@ApiTags('quran')
@Controller('quran')
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  // --- Public ---

  @Get('surahs')
  listSurahs() {
    return this.quranService.listSurahs();
  }

  @Get('surahs/:number')
  getSurah(
    @Param('number', ParseIntPipe) number: number,
    @Query('edition') edition?: string,
  ) {
    return this.quranService.getSurah(number, edition);
  }

  @Get('surahs/:number/ayahs/:ayah/tafsir')
  getTafsir(
    @Param('number', ParseIntPipe) number: number,
    @Param('ayah', ParseIntPipe) ayah: number,
    @Query('edition') edition?: string,
  ) {
    return this.quranService.getAyahTafsir(number, ayah, edition);
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('surah', new ParseIntPipe({ optional: true })) surah?: number,
  ) {
    return this.quranService.search(q, surah);
  }

  /** Proxies the mp3quran.net reciters list with 6h in-memory cache. */
  @Get('reciters')
  listReciters() {
    return this.quranService.listReciters();
  }

  /**
   * Audio proxy: streams Quran audio from allowed CDN hosts.
   * Handles HTTP range requests and follows up to 8 redirects with SSRF
   * protection on every hop.
   */
  @Get('audio')
  audioProxy(@Query('url') url: string, @Req() req: Request, @Res() res: Response) {
    if (!url) {
      res.status(400).json({ error: 'url query parameter is required' });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      res.status(400).json({ error: 'Only http/https URLs are allowed' });
      return;
    }

    if (!isAllowedHost(parsedUrl.hostname)) {
      res.status(403).json({ error: 'Audio host not allowed' });
      return;
    }

    const rangeHeader = (req.headers.range as string) ?? '';
    const activeRequests: ReturnType<typeof https.get>[] = [];
    let aborted = false;

    const fetchUrl = (targetUrl: string, redirectCount = 0): void => {
      if (aborted) return;
      if (redirectCount > 8) {
        if (!res.headersSent) res.status(502).json({ error: 'Too many redirects' });
        return;
      }

      let parsed: URL;
      try {
        parsed = new URL(targetUrl);
      } catch {
        if (!res.headersSent) res.status(502).json({ error: 'Invalid redirect URL' });
        return;
      }

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        if (!res.headersSent) res.status(403).json({ error: 'Redirect to non-http(s) blocked' });
        return;
      }
      if (!isAllowedHost(parsed.hostname)) {
        if (!res.headersSent) res.status(403).json({ error: 'Redirect to non-allowlisted host blocked' });
        return;
      }

      const lib = parsed.protocol === 'https:' ? https : http;

      const proxyReq = lib.get(
        targetUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AldakronApp/1.0; Islamic/Audio)',
            ...(redirectCount === 0 ? { Range: rangeHeader } : {}),
            Accept: 'audio/mpeg, audio/*, */*',
            'Accept-Encoding': 'identity',
          },
          timeout: 20000,
        },
        (proxyRes: IncomingMessage) => {
          if (aborted) { proxyRes.resume(); return; }

          const status = proxyRes.statusCode ?? 0;

          if (status >= 300 && status < 400) {
            const rawLocation = proxyRes.headers['location'];
            const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
            proxyRes.resume();
            if (location) {
              let nextUrl: string;
              try { nextUrl = new URL(location, targetUrl).href; }
              catch { nextUrl = location; }
              fetchUrl(nextUrl, redirectCount + 1);
            } else {
              if (!res.headersSent) res.status(502).json({ error: 'Redirect missing Location header' });
            }
            return;
          }

          res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
          if (proxyRes.headers['content-length']) res.setHeader('Content-Length', proxyRes.headers['content-length']);
          if (proxyRes.headers['content-range']) res.setHeader('Content-Range', proxyRes.headers['content-range']);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'Range');
          res.statusCode = status || 200;
          proxyRes.pipe(res);
        },
      );

      activeRequests.push(proxyReq);

      proxyReq.on('error', () => {
        if (!aborted && !res.headersSent) res.status(502).json({ error: 'Failed to fetch audio' });
      });
      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!aborted && !res.headersSent) res.status(504).json({ error: 'Audio server timed out' });
      });
    };

    fetchUrl(url);
    req.on('close', () => {
      aborted = true;
      activeRequests.forEach((r) => { try { r.destroy(); } catch {} });
    });
  }

  // --- Protected ---

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('bookmarks')
  addBookmark(@CurrentUser() user: AuthenticatedUser, @Body() dto: BookmarkDto) {
    return this.quranService.addBookmark(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('bookmarks')
  listBookmarks(@CurrentUser() user: AuthenticatedUser) {
    return this.quranService.listBookmarks(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('bookmarks/:id')
  removeBookmark(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.quranService.removeBookmark(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('favorites/toggle')
  toggleFavorite(@CurrentUser() user: AuthenticatedUser, @Body() dto: BookmarkDto) {
    return this.quranService.toggleFavorite(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('favorites')
  listFavorites(@CurrentUser() user: AuthenticatedUser) {
    return this.quranService.listFavorites(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('last-read')
  saveLastRead(@CurrentUser() user: AuthenticatedUser, @Body() dto: BookmarkDto) {
    return this.quranService.saveLastRead(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('last-read')
  getLastRead(@CurrentUser() user: AuthenticatedUser) {
    return this.quranService.getLastRead(user.id);
  }
}
