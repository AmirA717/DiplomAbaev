import { MaterialType } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  topicId!: number;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  type!: MaterialType;

  @ApiProperty()
  @IsString()
  content!: string;

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

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
