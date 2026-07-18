import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class BookmarkDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(286) // longest surah (Al-Baqarah) has 286 ayahs
  ayahNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
