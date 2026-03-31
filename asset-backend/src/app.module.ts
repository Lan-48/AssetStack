import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AssetModule } from './asset/asset.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'asset_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      // 移除不支持的选项
      dateStrings: true,
      timezone: '+08:00',
    }),
    AssetModule,
  ],
})
export class AppModule {}
