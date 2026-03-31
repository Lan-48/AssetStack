import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @IsDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return undefined;
  })
  warrantyDate?: Date;

  @IsNotEmpty({ message: '状态不能为空' })
  @IsString()
  @IsEnum(['在用', '闲置', '预购入', '退役'], {
    message: '状态必须是：在用、闲置、预购入、退役',
  })
  status: string;

  @IsNotEmpty({ message: '分类不能为空' })
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  additionalCost?: string = '0.00';

  @IsOptional()
  @IsString()
  description?: string;
}
