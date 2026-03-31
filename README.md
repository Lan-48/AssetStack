# AssetStack — 资产管理系统

个人资产管理应用，支持微信小程序和 H5 双端。前端基于 uni-app (Vue 3)，后端基于 NestJS + TypeORM + MySQL。

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | uni-app · Vue 3 · Vite 5 · Sass · uni-ui |
| **后端** | NestJS 11 · TypeORM 0.3 · MySQL · Swagger |
| **工具链** | ESLint · Prettier · TypeScript 5.7 · Jest |

## 项目结构

```
AssetStack/
├── asset-frontend/          # 前端 (uni-app)
│   ├── src/
│   │   ├── api/             # 请求封装与接口定义
│   │   ├── components/      # 公共组件 (布局、底部导航、资产卡片等)
│   │   ├── pages/           # 页面 (资产列表、资产详情、服饰、设置)
│   │   ├── styles/theme/    # 主题变量与 SCSS 样式
│   │   ├── utils/           # 工具函数
│   │   ├── pages.json       # 路由配置
│   │   └── manifest.json    # uni-app 应用配置
│   ├── package.json
│   └── vite.config.js
├── asset-backend/           # 后端 (NestJS)
│   ├── src/
│   │   ├── asset/           # 资产模块 (Controller / Service / Entity / DTO)
│   │   ├── app.module.ts    # 根模块 (数据库连接配置)
│   │   └── main.ts          # 启动入口 (端口、CORS、Swagger)
│   ├── package.json
│   └── tsconfig.json
└── .gitignore
```

## 快速开始

### 环境要求

- **Node.js** >= 18
- **MySQL** >= 8.0
- **微信开发者工具**（仅小程序开发需要）

### 1. 准备数据库

在 MySQL 中创建数据库（TypeORM 会自动同步表结构）：

```sql
CREATE DATABASE asset_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

> 默认连接配置位于 `asset-backend/src/app.module.ts`，使用 `root / 123456`。请根据实际环境修改。

### 2. 启动后端

```bash
cd asset-backend
npm install
npm run start:dev
```

服务启动后监听 `http://localhost:8080`，API 文档访问 `http://localhost:8080/api-docs`。

### 3. 启动前端

```bash
cd asset-frontend
npm install

# 微信小程序
npm run devwx
# 然后用微信开发者工具打开 dist/dev/mp-weixin 目录

# H5
npm run devpc
# 浏览器访问 http://localhost:5173
```

## API 接口

所有接口前缀：`/api`

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/asset/add` | 新增资产 |
| `GET` | `/asset/list` | 资产列表（分页 + 筛选） |
| `GET` | `/asset/detail?id=` | 资产详情 |
| `PUT` | `/asset/update?id=` | 更新资产 |
| `DELETE` | `/asset/delete?id=` | 删除资产 |

查询参数：`pageNum`、`pageSize`、`status`、`category`

## 数据模型

**Asset 实体**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int (PK) | 自增主键 |
| `name` | string | 资产名称 |
| `price` | varchar(20) | 价格 |
| `purchaseDate` | date | 购入日期 |
| `warrantyDate` | date | 保修截止日期（可选） |
| `status` | string | 状态：在用 / 闲置 / 预购入 / 退役 |
| `category` | string | 分类 |
| `additionalCost` | varchar | 附加费用 |
| `description` | text | 备注（可选） |
| `createdAt` | timestamp | 创建时间 |

## 可用脚本

### 前端

| 命令 | 说明 |
|------|------|
| `npm run devwx` | 微信小程序开发模式 |
| `npm run devpc` | H5 开发模式 |
| `npm run buildwx` | 微信小程序生产构建 |
| `npm run buildpc` | H5 生产构建 |
| `npm run lint` | ESLint 检查并修复 |

### 后端

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 开发模式（热重载） |
| `npm run start:prod` | 生产模式 |
| `npm run build` | 编译 TypeScript |
| `npm run lint` | ESLint 检查并修复 |
| `npm run test` | 运行单元测试 |

## 开发状态

- [x] 资产列表（分页、筛选、排序、列表/网格视图）
- [x] 资产统计（数量、总金额、日均消费）
- [x] 资产 CRUD API + Swagger 文档
- [ ] 资产详情页
- [ ] 服饰管理模块
- [ ] 设置页功能接入
- [ ] 用户认证

## License

ISC
