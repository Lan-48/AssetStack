import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('APP_PORT', 8080);
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:5173');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // 👇 新增：启用 CORS（解决跨域问题）
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  // 👇 新增：Swagger 配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('资产管理 API')
    .setDescription('提供资产的增、删、改、查等核心功能')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}/api`, '本地开发环境')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // 文档访问路径：/api-docs

  await app.listen(port);
  console.log(`服务启动成功：http://localhost:${port}/api`);
  console.log(`Swagger 文档地址：http://localhost:${port}/api-docs`);
}

// 添加错误处理
bootstrap().catch((error) => {
  console.error('服务启动失败:', error);
  process.exit(1);
});
