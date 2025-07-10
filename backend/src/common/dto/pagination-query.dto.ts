import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number) // Transform query param string to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number) // Transform query param string to number
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
