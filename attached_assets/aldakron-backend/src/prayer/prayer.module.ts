import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrayerController } from './prayer.controller';
import { PrayerService } from './prayer.service';

@Module({
  imports: [HttpModule],
  controllers: [PrayerController],
  providers: [PrayerService],
})
export class PrayerModule {}
