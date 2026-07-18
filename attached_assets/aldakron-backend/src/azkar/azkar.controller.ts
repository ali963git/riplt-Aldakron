import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AzkarPeriod } from '@prisma/client';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AzkarService } from './azkar.service';

@ApiTags('azkar')
@Controller('azkar')
export class AzkarController {
  constructor(private readonly azkarService: AzkarService) {}

  @Get('categories')
  listCategories(@Query('period') period?: AzkarPeriod) {
    return this.azkarService.listCategories(period);
  }

  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.azkarService.getCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('progress')
  getTodayProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Query('period') period: AzkarPeriod = AzkarPeriod.MORNING,
  ) {
    return this.azkarService.getTodayProgress(user.id, period);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('items/:id/increment')
  increment(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.azkarService.incrementProgress(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('items/:id/reset')
  reset(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.azkarService.resetProgress(user.id, id);
  }
}
