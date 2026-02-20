import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'custom' })
  @IsOptional()
  @IsString()
  conditionType?: string = 'custom';

  @ApiPropertyOptional({ example: { type: 'quiz_count', value: 1 } })
  @IsOptional()
  @IsObject()
  criteria?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {}
