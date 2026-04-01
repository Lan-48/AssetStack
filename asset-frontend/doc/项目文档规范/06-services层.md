# services 层说明

> ⚠️ **MANDATORY FOR AI/AGENT** ⚠️
> 
> **BEFORE READING THIS SECTION**, you MUST:
> 1. First invoke: `Bash("openskills read services-authoring")`
> 2. Only read this section if the skill explicitly says to, or for specific examples after loading the skill
> 3. **DO NOT read this entire section** when a skill is available - this wastes tokens
> 
> 当需要编写或修改 services 层代码时，请优先加载 `services-authoring` skill，本部分提供完整参考与示例库使用。

services 层负责**管理页面逻辑和业务规则**，是连接基础设施层和视图层的桥梁。

services 层分为三个子层：**页面逻辑层（Composable）**、**通用函数层（Function）**、**页面通用逻辑层（可选）**。

## 整体目录结构

```typescript
src/services/
├── pages/                    # 页面逻辑层（Composable 模式）
│   ├── user/
│   │   ├── types.ts         # 类型定义（对外导出）
│   │   ├── use-user.ts      # 页面逻辑（通用版本）
│   │   ├── use-user-h5.ts   # H5 特有逻辑（可选，仅在平台有差异时添加）
│   │   └── use-user-weapp.ts # 小程序特有逻辑（可选，仅在平台有差异时添加）
│   └── product/
│       ├── types.ts         # 类型定义
│       └── use-product.ts   # 无平台差异时只需一个文件
│
├── functions/                # 通用函数层（Function 模式）
│   ├── user-function.ts     # 用户通用函数（函数 + 类型定义在同一文件）
│   ├── auth-function.ts     # 认证通用函数
│   └── order-function.ts    # 订单通用函数
│
└── pages-common/             # 页面通用逻辑层（可选）
    ├── use-loading.ts       # 加载状态管理
    ├── use-error.ts         # 错误处理
    └── use-pagination.ts    # 分页逻辑
```

> **说明**：
> - **types.ts**：类型定义文件，导出该模块对外暴露的所有类型
> - **use-[页面名].ts**：通用页面逻辑，适用于所有平台
> - **use-[页面名]-h5.ts**：H5 平台特有逻辑（**可选**，仅在与通用逻辑有差异时添加）
> - **use-[页面名]-weapp.ts**：小程序平台特有逻辑（**可选**，仅在与通用逻辑有差异时添加）
> - 如果页面在不同平台没有逻辑差异，只需保留 `use-[页面名].ts` 即可
> - **不使用 index.ts**：避免 IDE 中打开多个 `index.ts` 时难以区分

-----

## 1. pages/ - 页面逻辑层（Composable 模式）

### 职责

- 🎨 **管理页面状态**：页面级的响应式状态（loading、list、form 等）
- 🎯 **管理交互逻辑**：用户操作、事件处理、路由跳转
- 🔄 **协调调用**：调用 functions 层的通用函数和 adapters 层的基础设施
- ✅ **可依赖框架**：可以使用 Vue 框架的响应式 API
- 🚫 **单页面职责**：每个文件只服务一个页面

### 设计原则

- 📋 **状态本地化**：状态管理在 composable 内部，pages 层只负责渲染
- 🔧 **提供初始化方法**：提供 `init()` 方法，由 pages 层在生命周期中调用
- 📝 **类型完整**：定义清晰的类型和返回值
- 🎯 **职责清晰**：只负责页面级的状态和交互，复杂业务逻辑放 functions 层
- 🔀 **平台差异处理**：
  - 默认使用通用版本（`use-[页面名].ts`）
  - 仅在平台有差异时才创建平台特定文件（`use-[页面名]-h5.ts` / `use-[页面名]-weapp.ts`）
  - 在页面中直接导入对应平台的文件，或使用条件导入
- 📦 **类型导出原则**：
  - 每个模块的类型定义放在 `types.ts` 文件中
  - 只导出外部会使用到的类型，内部类型保留在实现文件中
  - 类型直接从各模块的 types.ts 导入，无需额外中转层

### 目录结构

**基础结构（无平台差异）**：

```typescript
src/services/pages/product/
├── types.ts         # 类型定义（对外导出）
└── use-product.ts   # 页面逻辑 Composable（逻辑 + 内部类型）
```

**完整结构（有平台差异）**：

```typescript
src/services/pages/user/
├── types.ts           # 类型定义（对外导出，通用 + 平台特定）
├── use-user.ts        # 通用页面逻辑
├── use-user-h5.ts     # H5 特有逻辑（可选）
└── use-user-weapp.ts  # 小程序特有逻辑（可选）
```

> **何时添加平台特定文件**：
> - ✅ 平台有特殊 API 调用（如小程序的分享、授权，H5 的浏览器 API）
> - ✅ 交互逻辑不同（如支付流程、文件上传方式）
> - ✅ 数据处理方式不同
> - ❌ 仅 UI 差异（应在 pages 或 components 层处理）
> - ❌ 样式差异（应在样式文件中处理）

### 命名规范

- **类型文件命名**：`types.ts`
- **逻辑文件命名**：
  - 通用版本：`use-[页面名].ts`（如 `use-user.ts`、`use-product.ts`）
  - H5 版本：`use-[页面名]-h5.ts`（如 `use-user-h5.ts`）
  - 小程序版本：`use-[页面名]-weapp.ts`（如 `use-user-weapp.ts`）
- **函数命名**：
  - 通用版本：`use[页面名]()`（如 `useUser()`、`useProduct()`）
  - H5 版本：`use[页面名]H5()`（如 `useUserH5()`）
  - 小程序版本：`use[页面名]Weapp()`（如 `useUserWeapp()`）
- **类型命名**：
  - 返回类型：`Use[页面名]Return`（如 `UseUserReturn`）
  - 业务类型：`[业务名]`（如 `User`、`Product`）
  - 平台特定：`Use[页面名][平台]Return`（如 `UseUserH5Return`）

### 完整示例

```typescript
// ============================================
// services/pages/user/types.ts - 类型定义
// ============================================

export interface User {
  id: string
  name: string
  email: string
}

export interface UseUserReturn {
  // 状态
  user: Ref<User | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  
  // 方法
  init: (userId: string) => Promise<void>
  refresh: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  deleteUser: () => Promise<void>
}

// ============================================
// services/pages/user/use-user.ts - 页面逻辑
// ============================================

import { ref } from 'vue'
import { http, logger, storage, router } from '@/adapters'
import type { UseUserReturn, User } from './types'

/**
 * 用户页面逻辑
 * 
 * @description 管理用户页面的状态和交互逻辑
 * @example
 * const { init, user, updateUser } = useUser()
 * onMounted(() => init('user-123'))
 */
export function useUser(): UseUserReturn {
  // ============ 状态 ============
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const userId = ref<string>('')

  // ============ 数据加载 ============
  const loadUser = async () => {
    try {
      logger.info('Loading user...', { userId: userId.value })
      const response = await http.get<User>(`/api/users/${userId.value}`)
      user.value = response.data
      error.value = null
    } catch (err) {
      error.value = err as Error
      logger.error('Failed to load user', err)
      throw err
    }
  }

  // ============ 公共方法 ============
  /**
   * 初始化页面（在 onMounted 中调用）
   */
  const init = async (id: string) => {
    userId.value = id
    isLoading.value = true
    try {
      await loadUser()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新数据
   */
  const refresh = async () => {
    isLoading.value = true
    try {
      await loadUser()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  const updateUser = async (data: Partial<User>) => {
    isLoading.value = true
    try {
      await http.put(`/api/users/${userId.value}`, data)
      await loadUser()
      logger.info('User updated successfully')
    } catch (err) {
      logger.error('Failed to update user', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除用户
   */
  const deleteUser = async () => {
    try {
      await http.delete(`/api/users/${userId.value}`)
      logger.info('User deleted')
      router.navigateBack()
    } catch (err) {
      logger.error('Failed to delete user', err)
      throw err
    }
  }

  // ============ 返回 ============
  return {
    user,
    isLoading,
    error,
    init,
    refresh,
    updateUser,
    deleteUser
  }
}

// ============================================
// pages/user/user-page.vue - 页面组件（使用）
// ============================================

<template>
  <view class="user-page">
    <view v-if="isLoading" class="loading">加载中...</view>
    <view v-else>
      <text>{{ user?.name }}</text>
      <button @click="handleUpdate">更新</button>
      <button @click="deleteUser">删除</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUser } from '@/services/pages/user/use-user'
import type { User, UseUserReturn } from '@/services/pages/user/types'
import { router } from '@/adapters'

// ✅ 获取页面逻辑（一行代码）
const { user, isLoading, init, updateUser, deleteUser } = useUser()

// ✅ 生命周期在页面层
onMounted(() => {
  const userId = router.getParams().id
  init(userId)
})

// ✅ 事件处理
const handleUpdate = async () => {
  await updateUser({ name: '新名字' })
}
</script>

<style scoped>
.user-page {
  /* 页面样式 */
}
</style>
```

-----

## 2. functions/ - 通用函数层（Function 模式）

### 职责

- 🧮 **纯业务逻辑**：处理业务规则、计算、验证
- ♻️ **跨页面复用**：多个页面共享的业务逻辑
- 🧪 **易于测试**：无视图依赖，纯函数
- 🚫 **框架无关**：不依赖任何 UI 框架，不使用 ref/reactive
- 🚫 **无状态管理**：不管理页面状态，只处理业务逻辑

### 设计原则

- 📋 **单一职责**：每个函数文件只负责一个业务领域
- 🔄 **纯函数**：不包含响应式状态，不依赖框架
- 🧪 **可测试**：易于编写单元测试

### 命名规范

- **文件命名**：`[业务领域]-function.ts`（如 `user-function.ts`、`auth-function.ts`）
- **函数命名**：使用动词开头（如 `checkPermission()`、`validateToken()`）

### 完整示例

```typescript
// ============================================
// services/functions/auth-function.ts
// ============================================

import { http, storage } from '@/adapters'

/**
 * 检查用户权限
 */
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const response = await http.get(`/api/users/${userId}/permissions`)
  return response.data.includes(permission)
}

/**
 * 验证 Token 有效性
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await http.post('/api/auth/validate', { token })
    return response.data.valid
  } catch {
    return false
  }
}

/**
 * 计算密码强度
 */
export function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) return 'weak'
  if (password.length < 12) return 'medium'
  return 'strong'
}

/**
 * 判断是否需要重新登录
 */
export function shouldReLogin(lastLoginTime: number): boolean {
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return now - lastLoginTime > sevenDays
}

// ============================================
// 在 pages 层使用 functions 层
// ============================================

// services/pages/login/use-login.ts
import { ref, watch } from 'vue'
import { calculatePasswordStrength, validateToken } from '@/services/functions/auth-function'

export function useLogin() {
  const password = ref('')
  const strength = ref<'weak' | 'medium' | 'strong'>('weak')

  // 监听密码变化，计算强度
  watch(password, (newPassword) => {
    strength.value = calculatePasswordStrength(newPassword)
  })

  const login = async (token: string) => {
    // 使用 functions 层的函数
    const isValid = await validateToken(token)
    if (!isValid) {
      throw new Error('Token 无效')
    }
    // ... 登录逻辑
  }

  return { password, strength, login }
}
```

-----

## 3. pages-common/ - 页面通用逻辑层（可选）

### 职责

- 🔄 **通用逻辑**：多个页面都会用到的通用逻辑（如加载、分页、错误处理）
- ♻️ **可复用**：可以被任何 pages 层的 composable 使用
- 📦 **独立性**：不依赖具体业务逻辑

### 命名规范

- **文件命名**：`use-[功能名].ts`（如 `use-loading.ts`、`use-pagination.ts`）

### 示例

```typescript
// ============================================
// services/pages-common/use-list.ts - 列表通用逻辑
// ============================================

import { ref, computed } from 'vue'
import { logger } from '@/adapters'

/**
 * 列表通用逻辑（加载、刷新、分页）
 */
export function useList<T>() {
  const list = ref<T[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)

  const hasMore = computed(() => list.value.length < total.value)

  /**
   * 加载数据
   */
  const load = async (fetchFn: (page: number, size: number) => Promise<{ data: T[]; total: number }>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await fetchFn(page.value, pageSize.value)
      list.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err as Error
      logger.error('Failed to load list', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载更多
   */
  const loadMore = async (fetchFn: (page: number, size: number) => Promise<{ data: T[]; total: number }>) => {
    if (!hasMore.value || isLoading.value) return
    
    page.value++
    isLoading.value = true
    
    try {
      const result = await fetchFn(page.value, pageSize.value)
      list.value.push(...result.data)
      total.value = result.total
    } catch (err) {
      error.value = err as Error
      logger.error('Failed to load more', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新
   */
  const refresh = async (fetchFn: (page: number, size: number) => Promise<{ data: T[]; total: number }>) => {
    page.value = 1
    await load(fetchFn)
  }

  return {
    list,
    isLoading,
    error,
    hasMore,
    load,
    loadMore,
    refresh
  }
}

// ============================================
// 在 pages 层使用 pages-common 层
// ============================================

// services/pages/product/use-product.ts
import { useList } from '@/services/pages-common/use-list'
import { http } from '@/adapters'

export function useProduct() {
  const { list, isLoading, hasMore, load, loadMore } = useList<Product>()

  const fetchProducts = async (page: number, size: number) => {
    const response = await http.get('/api/products', { 
      params: { page, size } 
    })
    return {
      data: response.data.items,
      total: response.data.total
    }
  }

  const init = async () => {
    await load(fetchProducts)
  }

  const onReachBottom = async () => {
    await loadMore(fetchProducts)
  }

  return {
    productList: list,
    isLoading,
    hasMore,
    init,
    onReachBottom
  }
}
```

-----

## 最佳实践总结

| 场景 | 使用层级 | 模式 | 示例 |
|------|---------|------|------|
| **页面状态管理** | services/pages/ | Composable | `useUser()` 管理用户页面的状态和交互 |
| **跨页面业务逻辑** | services/functions/ | Function | `checkPermission()` 处理认证相关的业务规则 |
| **通用功能逻辑** | services/pages-common/ | Composable | `useList()` 提供列表加载、分页功能 |
| **pages 层** | pages/ | 组件 | 只负责生命周期和 UI 渲染 |

**核心原则**：
1. ✅ **pages 层极简**：只有生命周期和 UI，调用 services/pages/
2. ✅ **状态在 services/pages/**：所有页面状态和交互逻辑都在 Composable 中
3. ✅ **业务逻辑在 services/functions/**：跨页面复用的业务规则用纯函数
4. ✅ **通用逻辑在 services/pages-common/**：通用功能（分页、加载等）可复用
5. ✅ **类型定义清晰**：每个 pages 模块都有 types.ts

-----
