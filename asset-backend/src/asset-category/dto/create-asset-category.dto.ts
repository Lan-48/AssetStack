import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/** 请求体字段与 docs/API.md 蛇形命名一致 */
export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @Type(() => Number)
  @IsIn([1, 2], { message: 'category_level 只能为 1 或 2' })
  category_level: 1 | 2;

  @ValidateIf((o: CreateAssetCategoryDto) => o.category_level === 2)
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: '二级分类必须传有效的 parent_id' })
  parent_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null) return undefined;
    return value === 1 || value === '1' || value === true;
  })
  is_default?: boolean;
}
