import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👇 新增：Swagger 相关导入

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // 全局前缀：所有接口都加 /api 前缀

  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // 👇 新增：启用 CORS（解决跨域问题）
  app.enableCors({
    origin: ['http://localhost:5173'], // 允许前端开发服务器访问
    credentials: true,
  });

  // 👇 新增：Swagger 配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('资产管理 API')
    .setDescription('提供资产的增、删、改、查等核心功能')
    .setVersion('1.0')
    .addServer('http://localhost:8080/api', '本地开发环境')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // 文档访问路径：/api-docs

  await app.listen(8080); // 监听8080端口
  console.log(`服务启动成功：http://localhost:8080/api`);
  console.log(`📚 Swagger 文档地址：http://localhost:8080/api-docs`);
}

// 添加错误处理
bootstrap().catch((error) => {
  console.error('服务启动失败:', error);
  process.exit(1);
});
