import { ApiProperty } from '@nestjs/swagger';
import { AzkarPeriod } from '@prisma/client';
import { IsEnum, IsInt, IsString, Min, MaxLength } from 'class-validator';

export class CreateAzkarCategoryDto {
  @ApiProperty({ enum: AzkarPeriod })
  @IsEnum(AzkarPeriod)
  period: AzkarPeriod;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  titleAr: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  titleEn: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  titleTr: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;
}
