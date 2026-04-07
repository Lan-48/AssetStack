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
├── asset-frontend/                  # 前端 (uni-app)
│   ├── src/
│   │   ├── api/                     # 请求封装 (request.js) 与接口定义 (asset-api.js)
│   │   ├── assets/icons/            # 图标资源 (camera / check / delete / edit …)
│   │   ├── components/
│   │   │   ├── asset/               # 资产业务组件
│   │   │   │   ├── asset-form-popup/  # 新增 / 编辑表单弹窗
│   │   │   │   ├── asset-list/        # 资产列表
│   │   │   │   ├── asset-stats-card/  # 统计卡片
│   │   │   │   └── asset-toolbar/     # 工具栏（分类、排序、视图切换）
│   │   │   ├── common/              # 通用 UI 组件
│   │   │   │   ├── bottom-tab/        # 底部标签栏
│   │   │   │   ├── custom-nav-bar/    # 自定义导航栏
│   │   │   │   ├── dropdown/          # 下拉选择（支持二级分类）
│   │   │   │   ├── popup/             # 底部弹窗
│   │   │   │   ├── settings-cell/     # 设置项单元格
│   │   │   │   └── settings-section/  # 设置项分组
│   │   │   └── layout/              # 应用外壳 (NavBar + Slot + BottomTab)
│   │   ├── pages/
│   │   │   ├── asset/list/          # 资产列表页
│   │   │   ├── asset/detail/        # 资产详情页
│   │   │   ├── wardrobe/list/       # 服饰列表页（占位）
│   │   │   └── setting/             # 设置页（占位）
│   │   ├── styles/theme/            # 主题变量与 SCSS 样式
│   │   ├── utils/                   # 工具函数
│   │   ├── pages.json               # 路由配置
│   │   └── manifest.json            # uni-app 应用配置
│   ├── .env.example                 # 前端环境变量模板
│   ├── package.json
│   └── vite.config.js
├── asset-backend/                   # 后端 (NestJS)
│   ├── src/
│   │   ├── asset/                   # 资产模块
│   │   │   ├── asset.controller.ts    # HTTP 路由
│   │   │   ├── asset.service.ts       # 业务逻辑 + 分页查询
│   │   │   ├── asset.entity.ts        # TypeORM 实体
│   │   │   ├── asset.module.ts        # 模块注册
│   │   │   └── dto/                   # 请求验证 (create / update DTO)
│   │   ├── app.module.ts             # 根模块 (数据库连接配置)
│   │   └── main.ts                   # 启动入口 (端口、CORS、Swagger)
│   ├── .env.example                  # 后端环境变量模板
│   ├── package.json
│   └── tsconfig.json
└── .gitignore
```

> 每个组件目录遵循 `组件名.vue` + `types.ts` + `index.ts` 的三文件规范。

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

### 2. 配置环境变量

```bash
# 后端
cp asset-backend/.env.example asset-backend/.env
# 按需修改 DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_DATABASE / APP_PORT / CORS_ORIGIN

# 前端
cp asset-frontend/.env.example asset-frontend/.env
# 按需修改 VITE_API_BASE_URL / VITE_WX_APPID
```

> 后端默认端口 `8080`，前端 H5 默认端口 `5173`。

### 3. 启动后端

```bash
cd asset-backend
npm install
npm run start:dev
```

服务启动后监听 `http://localhost:8080`，API 文档访问 `http://localhost:8080/api-docs`。

### 4. 启动前端

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

响应格式：`{ code, message, data }`

## 数据模型

**Asset 实体**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int (PK) | 自增主键 |
| `name` | varchar(255) | 资产名称 |
| `price` | varchar(20) | 价格（字符串存储，避免精度问题） |
| `purchaseDate` | date | 购入日期 |
| `warrantyDate` | date | 保修截止日期（可选） |
| `status` | varchar(20) | 状态：在用 / 闲置 / 预购入 / 退役 |
| `category` | varchar(50) | 分类 |
| `additionalCost` | varchar(20) | 附加费用（默认 `"0.00"`） |
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
- [x] 资产详情页（票卡 UI、编辑、删除）
- [x] 资产新增/编辑表单弹窗（AssetFormPopup）
- [x] 通用 UI 组件（Popup、Dropdown、NavBar、BottomTab）
- [ ] 资产图片上传
- [ ] 服饰管理模块
- [ ] 设置页功能接入
- [ ] 用户认证

## License

ISC
