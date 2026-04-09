# AssetStack — 资产管理系统

个人资产管理应用，支持微信小程序和 H5 双端。前端基于 uni-app (Vue 3)，后端基于 NestJS + TypeORM + MySQL。

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | uni-app · Vue 3 · TypeScript · Vite 5 · Sass · uni-ui |
| **后端** | NestJS 11 · TypeORM 0.3 · MySQL · JWT · Swagger |
| **工具链** | ESLint · Prettier · TypeScript 5.7 · Jest |

## 项目结构

```
AssetStack/
├── asset-frontend/                  # 前端 (uni-app)
│   ├── src/
│   │   ├── api/                     # 请求封装 (request.ts) 与接口定义
│   │   │   ├── request.ts             # axios 二次封装（Token 注入、错误拦截）
│   │   │   ├── asset-api.ts           # 资产接口
│   │   │   ├── auth-api.ts            # 认证接口（登录/注册/发验证码/更新用户信息）
│   │   │   ├── config.ts              # 环境变量配置
│   │   │   └── index.ts              # 统一导出
│   │   ├── assets/
│   │   │   ├── icons/                 # 图标资源 (camera / check / cancel / delete / edit / logout …)
│   │   │   └── images/               # 背景图、默认头像等
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
│   │   │   │   ├── file-uploader/     # 通用图片上传组件（选择/预览/删除/自定义插槽）
│   │   │   │   ├── popup/             # 底部弹窗
│   │   │   │   ├── profile-edit-popup/ # 个人信息编辑弹窗（昵称/手机号/头像，独立弹窗模式）
│   │   │   │   ├── settings-cell/     # 设置项单元格
│   │   │   │   └── settings-section/  # 设置项分组
│   │   │   └── layout/              # 应用外壳 (NavBar + Slot + BottomTab)
│   │   ├── constants/
│   │   │   └── auth-error-codes.ts    # 认证业务错误码（与后端保持同步）
│   │   ├── pages/
│   │   │   ├── asset/list/          # 资产列表页
│   │   │   ├── asset/detail/        # 资产详情页
│   │   │   ├── login/               # 登录 / 注册页
│   │   │   ├── setting/             # 设置页（用户信息展示与编辑、退出登录）
│   │   │   └── wardrobe/list/       # 服饰列表页（占位）
│   │   ├── services/                # 业务逻辑层（Composables + 通用函数）
│   │   │   ├── functions/
│   │   │   │   └── auth-function.ts   # 通用认证工具（错误码/错误消息解析、手机号格式化）
│   │   │   └── pages/
│   │   │       ├── login/             # useLogin 组合式函数 + 类型定义
│   │   │       └── setting/           # useSetting 组合式函数 + 类型定义
│   │   ├── styles/theme/            # 主题变量与 SCSS 样式
│   │   ├── utils/
│   │   │   ├── auth.ts                # Token 存取（getToken / setToken / clearToken / isLoggedIn）
│   │   │   ├── date-utils.ts          # 日期工具
│   │   │   └── currency.ts            # 货币格式化
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
│   │   ├── auth/                    # 认证模块
│   │   │   ├── auth.module.ts         # 认证根模块
│   │   │   ├── login/
│   │   │   │   ├── login.controller.ts  # 登录/注册/登出/用户信息 HTTP 路由
│   │   │   │   ├── login.service.ts     # 验证码管理、JWT 签发、用户查询/创建/更新
│   │   │   │   ├── login.module.ts      # 登录子模块
│   │   │   │   ├── login-auth.guard.ts  # JWT 认证守卫
│   │   │   │   ├── auth-error-codes.ts  # 业务错误码常量
│   │   │   │   └── dto/                 # 请求验证 (send-code / login-by-code / update-user-info DTO)
│   │   │   ├── sms/
│   │   │   │   ├── sms.module.ts        # 短信模块
│   │   │   │   └── sms-code.entity.ts   # 验证码实体
│   │   │   └── user/
│   │   │       ├── user.module.ts       # 用户模块
│   │   │       └── user.entity.ts       # 用户实体
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
# 按需修改 DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_DATABASE / APP_PORT / CORS_ORIGIN / JWT_SECRET

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

### 资产接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/asset/add` | 新增资产 |
| `GET` | `/asset/list` | 资产列表（分页 + 筛选） |
| `GET` | `/asset/detail?id=` | 资产详情 |
| `PUT` | `/asset/update?id=` | 更新资产 |
| `DELETE` | `/asset/delete?id=` | 删除资产 |

查询参数：`pageNum`、`pageSize`、`status`、`category`

### 认证接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/user/send-code` | 否 | 发送手机验证码（支持 `purpose: login / register`） |
| `POST` | `/user/login` | 否 | 手机号 + 验证码登录（新用户自动注册） |
| `POST` | `/user/logout` | 是 | 退出登录（Token 加入黑名单） |
| `GET` | `/user/info` | 是 | 获取当前用户信息 |
| `PUT` | `/user/update` | 是 | 更新用户信息（昵称/头像/换绑手机号） |

响应格式：`{ code, msg, data }`

## 数据模型

### Asset 实体

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

### User 实体

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | bigint (PK) | 自增主键 |
| `phone` | varchar(11) | 手机号（唯一索引） |
| `nickname` | varchar(50) | 用户昵称（可选） |
| `avatar` | varchar(255) | 头像 URL（可选） |
| `password` | varchar(64) | 密码 MD5（可选，验证码登录可不用） |
| `status` | tinyint | 0 = 禁用，1 = 正常 |
| `createTime` | datetime | 创建时间 |
| `updateTime` | datetime | 更新时间 |

### SmsCode 实体

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | bigint (PK) | 自增主键 |
| `phone` | varchar(11) | 手机号 |
| `code` | varchar(6) | 验证码 |
| `expiresAt` | bigint | 过期时间戳 |
| `lastSentAt` | bigint | 最后发送时间戳 |

### 认证错误码

前后端共享同一套业务错误码，定义于 `auth-error-codes.ts`：

| 错误码 | 常量名 | 说明 |
|--------|--------|------|
| 4001001 | `PHONE_NOT_REGISTERED` | 手机号未注册 |
| 4001002 | `PHONE_ALREADY_EXISTS` | 手机号已存在 |
| 4001003 | `SEND_CODE_TOO_FREQUENT` | 验证码发送过于频繁 |
| 4001004 | `VERIFY_CODE_NOT_SENT` | 验证码未发送 |
| 4001005 | `VERIFY_CODE_INVALID` | 验证码错误或已过期 |
| 4001006 | `LOGIN_TRY_TOO_MANY` | 登录尝试次数过多 |
| 4001007 | `USER_UPDATE_EMPTY_PAYLOAD` | 更新信息为空 |
| 4001008 | `VERIFY_CODE_REQUIRED` | 换绑手机号时必须提供验证码 |
| 4001009 | `SAME_BOUND_PHONE` | 新手机号与当前绑定手机号相同 |

## 架构设计

### 前端分层

```
pages/         → 页面层：UI 渲染、生命周期钩子
services/      → 业务逻辑层
  ├── pages/     → 页面级 Composable（useLogin / useSetting）
  └── functions/ → 通用业务函数（auth-function.ts）
api/           → 接口层：HTTP 请求封装
components/    → UI 组件层：纯展示 + 事件抛出
constants/     → 常量：错误码等
utils/         → 工具函数：Token 管理、日期、货币
```

页面层尽量精简，复杂状态管理和业务逻辑委托给 `services` 层的组合式函数（Composable）。

### 后端分层

```
auth/
  ├── login/     → 登录控制器 + 服务（验证码管理、JWT 签发、用户 CRUD）
  ├── user/      → 用户实体 + 模块
  └── sms/       → 短信验证码实体 + 模块
asset/           → 资产控制器 + 服务 + 实体
```

认证采用 JWT Bearer Token，通过自定义 `LoginAuthGuard` 守卫保护需要登录的接口。

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
- [x] 通用 UI 组件（Popup、Dropdown、NavBar、BottomTab、FileUploader、ProfileEditPopup）
- [x] 用户认证（手机号 + 验证码登录/注册、JWT Token、登出）
- [x] 登录 / 注册页面（双表单模式、表单校验、行内错误提示）
- [x] 设置页（用户信息展示、昵称/手机号/头像独立编辑弹窗、退出登录）
- [x] 换绑手机号（发送验证码 → 校验 → 更新 → 刷新 Token）
- [x] 前后端错误码驱动的错误处理机制
- [x] 前端 JS → TypeScript 全面迁移
- [x] 前端 services 层重构（Composable 模式）
- [ ] 资产与用户关联（userId 绑定）
- [ ] 资产图片上传
- [ ] 服饰管理模块

## License

ISC
