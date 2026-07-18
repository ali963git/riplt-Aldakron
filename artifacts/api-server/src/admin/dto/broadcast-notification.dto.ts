import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class BroadcastNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  titleAr: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  bodyAr: string;

  @ApiPropertyOptional({
    description: 'اترك فارغًا لإرسال الإشعار لجميع المستخدمين، أو حدّد قائمة معرّفات مستخدمين',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10_000)
  @IsUUID('4', { each: true })
  userIds?: string[];
}
