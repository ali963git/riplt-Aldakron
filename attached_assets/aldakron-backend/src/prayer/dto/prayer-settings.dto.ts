import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalculationMethod } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Max, Min } from 'class-validator';

export class PrayerSettingsDto {
  @ApiProperty()
  @IsLatitude()
  latitude: number;

  @ApiProperty()
  @IsLongitude()
  longitude: number;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiPropertyOptional({ enum: CalculationMethod })
  @IsOptional()
  @IsEnum(CalculationMethod)
  calculationMethod?: CalculationMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyFajr?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyDhuhr?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyAsr?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyMaghrib?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyIsha?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  reminderMinutesBefore?: number;
}
