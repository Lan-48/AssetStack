// src/asset/dto/update-asset.dto.ts
import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyDate?: Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  additionalCost?: string;
}
