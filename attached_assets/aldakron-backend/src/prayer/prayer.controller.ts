import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CalculationMethod } from '@prisma/client';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrayerService } from './prayer.service';
import { PrayerSettingsDto } from './dto/prayer-settings.dto';

@ApiTags('prayer')
@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('times')
  getTimes(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('method') method?: CalculationMethod,
    @Query('date') date?: string,
  ) {
    return this.prayerService.getTimesByCoordinates(
      parseFloat(lat),
      parseFloat(lng),
      method,
      date,
    );
  }

  @Get('qibla')
  getQibla(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.prayerService.getQiblaDirection(parseFloat(lat), parseFloat(lng));
  }

  @Get('hijri-date')
  getHijriDate(@Query('date') date?: string) {
    return this.prayerService.getHijriDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('settings')
  saveSettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: PrayerSettingsDto) {
    return this.prayerService.saveSettings(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('settings')
  getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.prayerService.getSettings(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('times/me')
  getMyTimesToday(@CurrentUser() user: AuthenticatedUser) {
    return this.prayerService.getMyTimesToday(user.id);
  }
}
