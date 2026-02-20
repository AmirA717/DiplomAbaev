import { GameType } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  topicId!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  type!: GameType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number = 0;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean = false;
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
