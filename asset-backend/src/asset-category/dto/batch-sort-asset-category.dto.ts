import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class BatchSortItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @Type(() => Number)
  @IsInt()
  sort_order: number;
}
