import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../asset/asset.entity';
import { AuthModule } from '../auth/auth.module';
import { AssetCategory } from './asset-category.entity';
import { AssetCategoryController } from './asset-category.controller';
import { AssetCategoryService } from './asset-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetCategory, Asset]), AuthModule],
  controllers: [AssetCategoryController],
  providers: [AssetCategoryService],
  exports: [TypeOrmModule, AssetCategoryService],
})
export class AssetCategoryModule {}
