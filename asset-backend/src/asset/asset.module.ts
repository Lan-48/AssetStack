import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])], // 注册实体，让Service能注入Repository
  controllers: [AssetController], // 注册控制器，处理HTTP请求
  providers: [AssetService], // 注册服务，处理业务逻辑
})
export class AssetModule {}
