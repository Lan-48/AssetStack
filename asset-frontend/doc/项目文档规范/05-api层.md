# API 层说明

api 层负责**封装所有 HTTP 网络请求接口**，是应用与后端服务交互的统一入口。

## 核心职责

- 🌐 **接口封装**：封装所有与后端的 HTTP 请求
- 📦 **请求聚合**：按业务模块组织接口（用户、产品、订单等）
- 🔄 **参数处理**：统一处理请求参数和响应数据
- 📝 **类型定义**：为请求和响应定义明确的 TypeScript 类型
- ⚠️ **禁止业务逻辑**：只负责接口调用，不包含业务逻辑

## 设计原则

1. **按业务模块划分**
   - ✅ 每个文件对应一个业务领域（如 user、product、order）
   - ✅ 相关接口放在同一文件中
   - ❌ 不要创建过大的文件（建议单个文件不超过 300 行）

2. **只做接口调用**
   - ✅ 调用 adapters 层的 http 实例
   - ✅ 传递参数、处理响应
   - ❌ 不包含业务逻辑（如数据计算、状态管理）
   - ❌ 不直接操作 storage、logger 等（由 services 层处理）

3. **类型优先**
   - ✅ 为每个接口定义请求参数和响应类型
   - ✅ 使用 TypeScript 泛型增强类型推导
   - ✅ 导出类型供 services 层使用

4. **统一错误处理**
   - ✅ 由 adapters 层的拦截器统一处理错误
   - ✅ api 层直接抛出异常，由 services 层捕获处理

## 目录结构

```typescript
src/api/
├── user-api.ts      # 用户相关接口
├── product-api.ts   # 产品相关接口
├── order-api.ts     # 订单相关接口
├── auth-api.ts      # 认证相关接口
└── types.ts         # API 通用类型定义（可选）
```

## 命名规范

- **文件命名**：`[业务模块]-api.ts`（如 `user-api.ts`、`product-api.ts`）
- **类型命名**：`[业务模块]Api[类型名]`（如 `UserApiInfo`、`ProductApiDetail`）
- **函数命名**：
  - 查询：`get[资源名]`（如 `getUserInfo`、`getProductList`）
  - 创建：`create[资源名]`（如 `createOrder`、`createUser`）
  - 更新：`update[资源名]`（如 `updateUserInfo`、`updateProduct`）
  - 删除：`delete[资源名]`（如 `deleteUser`、`deleteOrder`）
  - 操作：`[动词][资源名]`（如 `submitOrder`、`cancelOrder`）

> **命名说明**：
> - 使用 `-api.ts` 后缀：明确标识这是 API 接口文件，与其他层的文件区分
> - 使用 `Api` 中缀：防止与业务模型类型冲突（如 `UserApiInfo` vs `User`）
> - **避免歧义示例**：
>   - ❌ `UserInfo`：可能与 Store、Service 层的用户类型混淆
>   - ✅ `UserApiInfo`：明确表示这是 API 层返回的用户信息类型
>   - 业务层可以定义自己的 `User` 类型，与 API 层的 `UserApiInfo` 独立

## 完整示例

```typescript
// ============================================
// api/user-api.ts - 用户相关接口
// ============================================

import { http } from '@/adapters'

/**
 * 用户信息
 */
export interface UserApiInfo {
  id: string
  name: string
  email: string
  avatar?: string
  createTime: string
}

/**
 * 更新用户参数
 */
export interface UserApiUpdateParams {
  name?: string
  email?: string
  avatar?: string
}

/**
 * 用户列表查询参数
 */
export interface UserApiListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive'
}

/**
 * 用户列表响应
 */
export interface UserApiListResponse {
  list: UserApiInfo[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取用户信息
 */
export async function getUserInfo(userId: string): Promise<UserApiInfo> {
  const response = await http.get<UserApiInfo>(`/api/users/${userId}`)
  return response.data
}

/**
 * 获取用户列表
 */
export async function getUserList(params: UserApiListParams): Promise<UserApiListResponse> {
  const response = await http.get<UserApiListResponse>('/api/users', { params })
  return response.data
}

/**
 * 创建用户
 */
export async function createUser(data: Omit<UserApiInfo, 'id' | 'createTime'>): Promise<UserApiInfo> {
  const response = await http.post<UserApiInfo>('/api/users', data)
  return response.data
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, data: UserApiUpdateParams): Promise<UserApiInfo> {
  const response = await http.put<UserApiInfo>(`/api/users/${userId}`, data)
  return response.data
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<void> {
  await http.delete(`/api/users/${userId}`)
}

// ============================================
// api/product-api.ts - 产品相关接口
// ============================================

import { http } from '@/adapters'

/**
 * 产品信息
 */
export interface ProductApiInfo {
  id: string
  name: string
  price: number
  stock: number
  description?: string
}

/**
 * 产品列表响应
 */
export interface ProductApiListResponse {
  list: ProductApiInfo[]
  total: number
}

/**
 * 获取产品列表
 */
export async function getProductList(params: { 
  page: number
  pageSize: number
}): Promise<ProductApiListResponse> {
  const response = await http.get<ProductApiListResponse>('/api/products', { params })
  return response.data
}

/**
 * 获取产品详情
 */
export async function getProductDetail(productId: string): Promise<ProductApiInfo> {
  const response = await http.get<ProductApiInfo>(`/api/products/${productId}`)
  return response.data
}
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **文件命名** | ✅ 使用 `-api` 后缀 | `user-api.ts`, `product-api.ts` |
| **类型命名** | ✅ 使用 `[模块]Api[类型]` 格式 | `UserApiInfo`, `ProductApiListParams` |
| **接口封装** | ✅ 每个接口一个函数 | `getUserInfo()`, `createUser()` |
| **类型定义** | ✅ 定义请求参数和响应类型 | `UserApiInfo`, `UserApiUpdateParams` |
| **错误处理** | ✅ 直接抛出异常，由 services 层捕获 | `throw error` |
| **业务逻辑** | ❌ 禁止在 api 层处理 | 不要在 api 层做数据计算、状态管理 |
| **直接调用** | ❌ 禁止页面直接调用 api | 必须通过 services 层调用 |
| **参数处理** | ✅ 使用 TypeScript 类型约束 | `params: UserApiListParams` |
| **响应提取** | ✅ 直接返回 data | `return response.data` |

**核心原则**：
1. ✅ **职责单一**：只负责接口调用，不包含任何业务逻辑
2. ✅ **类型完整**：为所有接口定义清晰的类型
3. ✅ **按模块组织**：相关接口放在同一文件中
4. ✅ **统一入口**：所有网络请求必须通过 api 层
5. ✅ **services 调用**：只允许 services 层调用，pages 层不能直接调用
6. ✅ **命名规范**：文件使用 `-api.ts` 后缀，类型使用 `[模块]Api[类型]` 格式，避免与业务类型冲突

**调用链路**：
```
pages 层 → services 层 → api 层 → adapters/http → infrastructure/network
```
