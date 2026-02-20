import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export const SUPPORTED_MINIGAME_TYPES = [
  'PHISHING_DETECTOR',
  'PASSWORD_STRENGTH',
] as const;

export type SupportedMinigameType = (typeof SUPPORTED_MINIGAME_TYPES)[number];

export class SaveMinigameResultDto {
  @ApiProperty({ enum: SUPPORTED_MINIGAME_TYPES })
  @IsIn(SUPPORTED_MINIGAME_TYPES)
  type!: SupportedMinigameType;

  @ApiPropertyOptional({
    description: 'Количество правильных ответов / достижений в игре',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  score?: number = 0;

  @ApiPropertyOptional({
    description: 'Максимально возможный результат в текущем раунде',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  total?: number = 0;

  @ApiPropertyOptional({
    description: 'Количество очков для начисления пользователю',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsEarned?: number = 0;

  @ApiPropertyOptional({
    description: 'Произвольные детали прохождения',
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}
