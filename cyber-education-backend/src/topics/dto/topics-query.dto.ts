import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class TopicsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Только для админа' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeUnpublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  schoolId?: number;
}
