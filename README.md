# AssetStack — 资产管理系统

个人资产管理应用，支持微信小程序和 H5 双端。前端基于 uni-app (Vue 3)，后端基于 NestJS + TypeORM + MySQL。

## 技术栈

| 层级       | 技术                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| **前端**   | uni-app · Vue 3 · TypeScript · Vite 5 · Sass · uni-ui                    |
| **后端**   | NestJS 11 · TypeORM 0.3 · MySQL · JWT · Swagger · 阿里云 OSS（头像存储） |
| **工具链** | ESLint · Prettier · TypeScript 5.7 · Jest                                |

## 项目结构

```
AssetStack/
├── asset-frontend/                  # 前端 (uni-app)
│   ├── src/
│   │   ├── api/                     # 请求封装 (request.ts) 与接口定义
│   │   │   ├── request.ts             # axios 二次封装（Token 注入、错误拦截）
│   │   │   ├── asset-api.ts           # 资产接口
│   │   │   ├── asset-category-api.ts # 资产分类（树 / 增删改）
│   │   │   ├── auth-api.ts            # 认证接口（登录/注册/发验证码/更新用户信息）
│   │   │   ├── config.ts              # 环境变量配置
│   │   │   └── index.ts              # 统一导出
│   │   ├── assets/
│   │   │   ├── icons/                 # 图标资源
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
│   │   │   │   ├── popover/           # 通用气泡菜单（支持 reference 插槽与动作列表）
│   │   │   │   ├── popup/             # 底部弹窗
│   │   │   │   ├── profile-edit-popup/ # 个人信息编辑弹窗
│   │   │   │   ├── settings-cell/     # 设置项单元格
│   │   │   │   └── settings-section/  # 设置项分组
│   │   │   ├── setting/             # 设置相关
│   │   │   │   └── category-name-dialog/ # 新增/修改分类名称弹层（视觉对齐资料弹窗）
│   │   │   └── layout/              # 应用外壳 (NavBar + Slot + BottomTab)
│   │   ├── env.d.ts                 # Vite 客户端类型与全局 uni 最小类型声明
│   │   ├── constants/
│   │   │   └── auth-error-codes.ts    # 认证业务错误码（与后端保持同步）
│   │   ├── pages/
│   │   │   ├── asset/list/          # 资产列表页
│   │   │   ├── asset/detail/        # 资产详情页
│   │   │   ├── login/               # 登录 / 注册页
│   │   │   ├── setting/             # 设置页、分类管理页（资产分类树维护）
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
│   │   │   ├── upload-avatar.ts       # 头像文件上传至后端（multipart，由后端转存 OSS）
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
│   │   │   ├── asset.service.ts       # 业务逻辑 + 分页查询 + 分类关联与 item_count
│   │   │   ├── asset.entity.ts        # TypeORM 实体（含 category_id 关联分类表）
│   │   │   ├── asset.module.ts        # 模块注册
│   │   │   └── dto/                   # 请求验证 (create / update DTO)
│   │   ├── asset-category/            # 资产分类（实体 + CRUD / 树 / 排序）
│   │   │   ├── asset-category.entity.ts
│   │   │   ├── asset-category.module.ts
│   │   │   ├── asset-category.controller.ts
│   │   │   ├── asset-category.service.ts
│   │   │   ├── asset-category-serializer.ts
│   │   │   └── dto/
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
│   │   ├── oss/                      # 阿里云 OSS 封装（头像上传）
│   │   │   ├── oss.module.ts
│   │   │   └── oss.service.ts         # ali-oss 上传、对象 ACL public-read
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
# 头像上传至 OSS：在 asset-backend/.env 中配置 OSS_REGION / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET（详见下文「头像与 OSS」）

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

### 微信小程序联调时验证码在哪里看

当前为**内存模拟发码**（未接真实短信通道），登录时请按下面方式取 6 位数字：

1. **看后端终端（最稳妥）**  
   运行 `npm run start:dev` 的窗口里，每次点击「发送验证码」都会出现一行：  
   `[LOGIN] send code => phone=手机号, code=六位数字`  
   真机预览、体验版、以及未打印前端日志时都以这里为准。

2. **看微信开发者工具控制台（仅部分场景）**  
   使用 `npm run devwx` 生成开发版，在工具里打开「调试器 → Console」。  
   仅当**开发构建**且接口响应里带有 `mockCode`（后端默认 `SMS_MOCK_MODE` 未关）时，登录页才可能打出联调日志；**生产构建**的小程序包不会在控制台打印验证码。

3. **上线接短信后**  
   验证码以**手机短信**为准，不再依赖上述日志。

## API 接口

所有接口前缀：`/api`

### 资产接口

| 方法     | 路径                | 说明                    |
| -------- | ------------------- | ----------------------- |
| `POST`   | `/asset/add`        | 新增资产                |
| `GET`    | `/asset/list`       | 资产列表（分页 + 筛选） |
| `GET`    | `/asset/detail?id=` | 资产详情                |
| `PUT`    | `/asset/update?id=` | 更新资产                |
| `DELETE` | `/asset/delete?id=` | 删除资产                |

查询参数：`pageNum`、`pageSize`、`status`、`category`（仍按展示名筛选，与 `category` 字段一致）。以上资产接口均按请求头 `token` 解析用户，**仅操作该用户名下数据**；他人资产 id 会返回 404。

**资产与分类表关联：** 新增/更新资产时可传 `categoryId`（当前用户名下 `asset_categories` 主键）。传入后服务端会校验归属，将 `category` 展示名同步为该分类的 `name`，并在 `category_id` 上建立外键；同时维护分类行上的 `item_count`（仅统计已关联该分类的资产）。不传 `categoryId` 时仍可按原方式只传 `category` 文案（`category_id` 为空，不参与 `item_count`）。更新资产时传 `categoryId: null` 可解除关联并扣减原分类计数。已有库可执行 `docs/migrate-asset-category-id.sql`（若已用 TypeORM 同步出列则无需重复执行）。仅存在 `category` 文案、需按同名回填 `category_id` 时见 `docs/migrate-asset-category-backfill.sql`。资产列表页工具栏分类来自 `GET /asset-categories/tree`，筛选用 `categoryId` 与分类子树及默认分类规则。

### 资产分类接口

路径、请求体与响应示例见 [docs/API.md](./docs/API.md) 第 6 节。摘要如下（均须请求头 `token`，前缀 `/api`）：

| 方法     | 路径                     | 说明                                            |
| -------- | ------------------------ | ----------------------------------------------- |
| `GET`    | `/asset-categories/tree` | 当前用户一二级分类树，`sort_order` 升序         |
| `POST`   | `/asset-categories`      | 新增一级或二级分类                              |
| `GET`    | `/asset-categories/{id}` | 分类详情（编辑回显）                            |
| `PUT`    | `/asset-categories/{id}` | 修改名称、排序（系统分类禁止）                  |
| `DELETE` | `/asset-categories/{id}` | 逻辑删除；一级级联子级；有资产或系统/默认则拒绝 |
| `PUT`    | `/asset-categories/sort` | 批量更新排序（拖拽）；请求体为 JSON 数组        |

更新资产时 `warrantyDate` 为可选项：未填时不要传空字符串（前端会转为 `null` 以清空或省略该字段）；服务端已启用请求体验证管道 `transform`，并对空串做了兼容。

### 认证接口

| 方法   | 路径                  | 认证 | 说明                                                                                                                                                                              |
| ------ | --------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/user/send-code`     | 否   | 发送手机验证码（支持 `purpose: login / register`）                                                                                                                                |
| `POST` | `/user/login`         | 否   | 手机号 + 验证码登录（新用户自动注册）                                                                                                                                             |
| `POST` | `/user/logout`        | 是   | 退出登录（Token 加入黑名单）                                                                                                                                                      |
| `GET`  | `/user/info`          | 是   | 获取当前用户信息                                                                                                                                                                  |
| `PUT`  | `/user/update`        | 是   | 更新用户信息（昵称/头像/换绑手机号）                                                                                                                                              |
| `POST` | `/user/upload-avatar` | 是   | 上传至**私有** OSS（`multipart/form-data`，字段名 `file`，最大约 5MB）；成功时 `data.key` 为对象键（写入库），`data.url` 为短时读签名仅用于界面回显；头像与**资产封面**共用此接口 |
| `GET`  | `/user/oss-read-url`  | 是   | `query.key` 为已入库的 `avatars/...` 对象键，返回短时读签名 URL（表单内纯 key 展示封面时使用）                                                                                    |

响应格式：`{ code, msg, data }`

未配置 OSS 时，`POST /user/upload-avatar` 与 `GET /user/oss-read-url` 会返回 **503**。

### 头像与 OSS（私有 Bucket + 读签名）

Bucket 建议：**阻止公共访问**、对象默认私有、**禁止**依赖匿名 `GetObject`。上传仍走服务端 RAM密钥；**库中** `user.avatar` 与 `asset.imageUrl` 存 **OSS 对象键**（形如 `avatars/手机号/uuid.jpg`），兼容历史数据中存过的完整 URL（接口会解析路径后签名）。

读链路：**列表 / 详情 / 用户信息** 等接口在返回 JSON 时，由后端将对象键转为 **带过期时间的 GET 签名 URL**。签名有效期默认约 1 小时，过期后需重新请求接口刷新列表或详情。前端上传成功后须将 **`data.key`** 写入业务接口，勿把短时 `data.url` 当作永久地址入库。

**小程序里 OSS 已用 SigV4（`x-oss-signature-version=OSS4-HMAC-SHA256`）仍 403：** 开发者工具 Network 里该图片请求状态多为 **403**（若列表里还有 **304**，一般是其它静态资源缓存，与 OSS 图无关）。此时请看请求头里的 **Referer**，常见为 `https://servicewechat.com/...`。若 Bucket 启用了 **防盗链（Referer 白名单）**且未包含微信来源，OSS 会拒绝访问（与签名是否正确无关）。请到 OSS 控制台 → 该 Bucket → **数据安全 → 防盗链**：在白名单中**追加**（勿只留本地）例如 **`https://servicewechat.com`** 与 **`https://servicewechat.com/`**；本地 H5 可继续保留 **`http://localhost:5173`**。**允许空 Referer** 只放行「无 Referer」的请求，不能代替放行微信 Referer。另在响应 **XML** 中查看 **`Code`**（如 `AccessDenied`）辅助判断。

| 环境变量                             | 说明                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OSS_REGION`                         | 区域，如 `oss-cn-hangzhou`                                                                                                                                       |
| `OSS_ACCESS_KEY_ID`                  | RAM 子账号 AccessKey ID（建议最小权限：PutObject、GetObject 等）                                                                                                 |
| `OSS_ACCESS_KEY_SECRET`              | AccessKey Secret                                                                                                                                                 |
| `OSS_BUCKET`                         | Bucket 名称                                                                                                                                                      |
| `OSS_AUTHORIZATION_V4`               | 可选；`true`（默认）时用 SDK **SigV4** 生成读链（`signatureUrlV4`），与控制台新版 Bucket 一致；链上多为 `x-oss-*` 查询参数。若桶仅支持旧版 V1 且异常可设 `false` |
| `OSS_SIGN_URL_EXPIRES_SECONDS`       | 可选；读签名默认有效期（秒），默认 `3600`                                                                                                                        |
| `OSS_UPLOAD_PREVIEW_EXPIRES_SECONDS` | 可选；上传接口里 `data.url` 回显签名有效期（秒），默认 `1800`                                                                                                    |

AccessKey 仅配置在 **`asset-backend/.env`**。前端 `utils/upload-avatar.ts` 中 `uploadAvatarFile` 返回 `{ key, url }`，`isRemoteAvatarUrl` 同时识别 `avatars/` 对象键与 `http(s)` 引用（排除 `http://tmp/`临时路径）。

服务端创建 OSS 客户端时启用 **`secure: true`**，读签名为 **HTTPS**。默认 **`OSS_AUTHORIZATION_V4=true`**（读链含 `x-oss-*`）；旧桶仅 V1 时可设 `OSS_AUTHORIZATION_V4=false`。另请核对 **RAM** 的 `GetObject`、**防盗链与 Referer**（见上节小程序说明）、以及响应 XML 中的 **`Code`**。微信公众平台需将 OSS 域名加入 **downloadFile 合法域名**。

## 数据模型

### Asset 实体

| 字段             | 类型           | 说明                                                                                                                |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`             | int (PK)       | 自增主键                                                                                                            |
| `userId`         | bigint (FK)    | 归属用户，关联 `user.id`，**非空**；列表/详情/改删均仅当前登录用户可见；历史数据见 `docs/migrate-asset-user-id.sql` |
| `name`           | varchar(255)   | 资产名称                                                                                                            |
| `price`          | varchar(20)    | 价格（字符串存储，避免精度问题）                                                                                    |
| `purchaseDate`   | date           | 购入日期                                                                                                            |
| `warrantyDate`   | date           | 保修截止日期（可选）                                                                                                |
| `status`         | varchar(20)    | 状态：在用 / 闲置 / 预购入 / 退役                                                                                   |
| `categoryId`     | int (FK, 可空) | 关联 `asset_categories.id`；空表示仅文案分类                                                                        |
| `category`       | varchar(50)    | 分类展示名；有关联时与分类表 `name` 一致                                                                            |
| `additionalCost` | varchar(20)    | 附加费用（默认 `"0.00"`）                                                                                           |
| `description`    | text           | 备注（可选）                                                                                                        |
| `imageUrl`       | varchar(512)   | 封面图 OSS 对象键或历史 URL（可选；接口对外返回短时读签名 URL）                                                     |
| `createdAt`      | timestamp      | 创建时间                                                                                                            |

### User 实体

| 字段         | 类型         | 说明                                                                   |
| ------------ | ------------ | ---------------------------------------------------------------------- |
| `id`         | bigint (PK)  | 自增主键                                                               |
| `phone`      | varchar(11)  | 手机号（唯一索引）                                                     |
| `nickname`   | varchar(50)  | 用户昵称（可选）                                                       |
| `avatar`     | varchar(255) | 头像 OSS 对象键或历史 URL（可选；`/user/info` 对外返回短时读签名 URL） |
| `password`   | varchar(64)  | 密码 MD5（可选，验证码登录可不用）                                     |
| `status`     | tinyint      | 0 = 禁用，1 = 正常                                                     |
| `createTime` | datetime     | 创建时间                                                               |
| `updateTime` | datetime     | 更新时间                                                               |

### AssetCategory 实体（表 `asset_categories`）

对应代码：`asset-backend/src/asset-category/asset-category.entity.ts`；开发环境 `synchronize: true` 时启动后端会自动建表。手工建表可参考 `docs/schema-asset-categories.sql`。

| 字段            | 类型        | 说明                                         |
| --------------- | ----------- | -------------------------------------------- |
| `id`            | int (PK)    | 自增主键                                     |
| `userId`        | bigint (FK) | 归属用户，关联 `user.id`，级联删除           |
| `name`          | varchar(50) | 分类名称                                     |
| `parentId`      | int (FK)    | 父级分类，顶级为 `null`；删除限制 `RESTRICT` |
| `categoryLevel` | tinyint     | 层级，默认 1                                 |
| `isDefault`     | tinyint     | 是否默认类目                                 |
| `isSystem`      | tinyint     | 是否系统预置                                 |
| `sortOrder`     | int         | 同级排序                                     |
| `itemCount`     | int         | 下属资产数（冗余）                           |
| `createdAt`     | timestamp   | 创建时间                                     |
| `updatedAt`     | timestamp   | 更新时间                                     |
| `deletedAt`     | timestamp   | 软删（`DeleteDateColumn`）                   |

### SmsCode 实体

| 字段         | 类型        | 说明           |
| ------------ | ----------- | -------------- |
| `id`         | bigint (PK) | 自增主键       |
| `phone`      | varchar(11) | 手机号         |
| `code`       | varchar(6)  | 验证码         |
| `expiresAt`  | bigint      | 过期时间戳     |
| `lastSentAt` | bigint      | 最后发送时间戳 |

### 认证错误码

前后端共享同一套业务错误码，定义于 `auth-error-codes.ts`：

| 错误码  | 常量名                      | 说明                         |
| ------- | --------------------------- | ---------------------------- |
| 4001001 | `PHONE_NOT_REGISTERED`      | 手机号未注册                 |
| 4001002 | `PHONE_ALREADY_EXISTS`      | 手机号已存在                 |
| 4001003 | `SEND_CODE_TOO_FREQUENT`    | 验证码发送过于频繁           |
| 4001004 | `VERIFY_CODE_NOT_SENT`      | 验证码未发送                 |
| 4001005 | `VERIFY_CODE_INVALID`       | 验证码错误或已过期           |
| 4001006 | `LOGIN_TRY_TOO_MANY`        | 登录尝试次数过多             |
| 4001007 | `USER_UPDATE_EMPTY_PAYLOAD` | 更新信息为空                 |
| 4001008 | `VERIFY_CODE_REQUIRED`      | 换绑手机号时必须提供验证码   |
| 4001009 | `SAME_BOUND_PHONE`          | 新手机号与当前绑定手机号相同 |

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
  ├── login/     → 登录控制器 + 服务（验证码管理、JWT 签发、用户 CRUD；含头像上传路由）
  ├── user/      → 用户实体 + 模块
  └── sms/       → 短信验证码实体 + 模块
oss/             → 阿里云 OSS 封装（供登录模块注入）
asset/           → 资产控制器 + 服务 + 实体
```

认证采用 JWT Bearer Token，通过自定义 `LoginAuthGuard` 守卫保护需要登录的接口。

## 可用脚本

### 前端

| 命令              | 说明               |
| ----------------- | ------------------ |
| `npm run devwx`   | 微信小程序开发模式 |
| `npm run devpc`   | H5 开发模式        |
| `npm run buildwx` | 微信小程序生产构建 |
| `npm run buildpc` | H5 生产构建        |
| `npm run lint`    | ESLint 检查并修复  |

### 后端

| 命令                 | 说明               |
| -------------------- | ------------------ |
| `npm run start:dev`  | 开发模式（热重载） |
| `npm run start:prod` | 生产模式           |
| `npm run build`      | 编译 TypeScript    |
| `npm run lint`       | ESLint 检查并修复  |
| `npm run test`       | 运行单元测试       |

## 开发状态

- [x] 资产列表（分页、筛选、排序、列表/网格视图；
- [x] 资产统计（数量、总金额、日均消费；统计卡片状态
- [x] 资产 CRUD API + Swagger 文档
- [x] 资产详情页（票卡 UI、编辑、删除）
- [x] 资产新增/编辑表单弹窗（AssetFormPopup，封面图用 `file-uploader` + 上传接口）
- [x] 通用 UI 组件（Popup、Dropdown、NavBar、BottomTab、FileUploader、ProfileEditPopup）
- [x] 分类管理页（自定义顶栏）
- [x] 用户认证（手机号 + 验证码登录/注册、JWT Token、登出）
- [x] 登录 / 注册页面（双表单模式、表单校验、行内错误提示）
- [x] 设置页（用户信息展示、昵称/手机号/头像独立编辑弹窗、退出登录）
- [x] 换绑手机号（发送验证码 → 校验 → 更新 → 刷新 Token）
- [x] 前后端错误码驱动的错误处理机制
- [x] 前端 JS → TypeScript 全面迁移
- [x] 前端 services 层重构（Composable 模式）
- [x] 用户头像上传至阿里云 OSS（服务端中转 + 数据库存 HTTPS URL）
- [x] 资产封面图（与头像共用上传接口，落库 `asset.imageUrl`）
- [x] 资产与用户关联（userId 绑定，实体侧 `user` 非空）
- [ ] 服饰管理模块

## License

ISC
