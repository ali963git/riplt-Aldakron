import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateAzkarItemDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  textAr: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  textEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  textTr?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(1000)
  repeatCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  source?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateAzkarItemDto extends PartialType(CreateAzkarItemDto) {}
