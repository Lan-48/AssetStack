import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AuthModule } from '../auth/auth.module';
import { OssModule } from '../oss/oss.module';
import { AssetCategoryModule } from '../asset-category/asset-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    AssetCategoryModule,
    AuthModule,
    OssModule,
  ],
  controllers: [AssetController], // 注册控制器，处理HTTP请求
  providers: [AssetService], // 注册服务，处理业务逻辑
})
export class AssetModule {}
