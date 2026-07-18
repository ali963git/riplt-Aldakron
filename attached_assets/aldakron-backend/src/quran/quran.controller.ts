import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { QuranService } from './quran.service';
import { BookmarkDto } from './dto/bookmark.dto';

@ApiTags('quran')
@Controller('quran')
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  // --- Public, read-only, no auth required ---

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
  search(@Query('q') q: string, @Query('surah', new ParseIntPipe({ optional: true })) surah?: number) {
    return this.quranService.search(q, surah);
  }

  @Get('reciters')
  listReciters() {
    return this.quranService.listReciters();
  }

  @Get('reciters/:reciter/surahs/:number/audio')
  getRecitation(@Param('reciter') reciter: string, @Param('number', ParseIntPipe) number: number) {
    return { url: this.quranService.getRecitationUrl(reciter, number) };
  }

  // --- Protected: per-user reading state ---

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
