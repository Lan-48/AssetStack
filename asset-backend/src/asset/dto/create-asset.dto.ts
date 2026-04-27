import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAssetDto {
  @IsNotEmpty({ message: '资产名称不能为空' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '价格不能为空' })
  @IsString()
  price: string;

  @IsNotEmpty({ message: '购买日期不能为空' })
  @IsDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return undefined;
  })
  purchaseDate: Date;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') return new Date(value);
    if (value instanceof Date) return value;
    return undefined;
  })
  @IsDate()
  warrantyDate?: Date;

  @IsNotEmpty({ message: '状态不能为空' })
  @IsString()
  @IsEnum(['在用', '闲置', '预购入', '退役'], {
    message: '状态必须是：在用、闲置、预购入、退役',
  })
  status: string;

  /**
   * 未传 category_id 时必填（兼容旧接口仅传分类名称）。
   * 传 category_id 时服务端以分类表中的名称为准，可省略本字段。
   */
  @ValidateIf((o: CreateAssetDto) => o.categoryId == null)
  @IsNotEmpty({ message: '分类不能为空' })
  @IsString()
  category?: string;

  /** 可选；传入时须为当前用户名下未删除的分类主键 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsString()
  additionalCost?: string = '0.00';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
