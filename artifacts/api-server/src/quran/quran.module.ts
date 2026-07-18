import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';

@Module({
  imports: [HttpModule],
  controllers: [QuranController],
  providers: [QuranService],
})
export class QuranModule {}
