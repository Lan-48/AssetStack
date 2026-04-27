// src/asset/dto/update-asset.dto.ts
import {
  IsString,
  IsDate,
  IsOptional,
  ValidateIf,
  IsInt,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === undefined) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return value;
    return undefined;
  })
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  /**
   * 可选；空字符串视为清空（存库为 null），未传字段则不更新。
   */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === '' || value === null) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsDate()
  warrantyDate?: Date | null;

  @IsOptional()
  @IsString()
  category?: string;

  /**
   * 传入数字则切换关联分类并同步 category 文案；
   * 显式传 null 则解除关联（仅保留原有 category 文案，除非同时传 category）。
   */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null || value === 'null') return null;
    if (value === '' || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  })
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(1)
  categoryId?: number | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  additionalCost?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  imageUrl?: string | null;
}
