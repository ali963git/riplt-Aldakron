import { Module } from '@nestjs/common';
import { AzkarController } from './azkar.controller';
import { AzkarService } from './azkar.service';

@Module({
  controllers: [AzkarController],
  providers: [AzkarService],
})
export class AzkarModule {}
