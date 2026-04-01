# store 层说明

store 层负责**全局状态管理**，使用 Pinia 存储跨组件/页面共享的数据。

## 核心职责

- 💾 **管理全局状态**：存储跨页面/组件共享的数据（用户信息、权限、配置等）
- 🔄 **状态响应式**：提供响应式的状态订阅和更新机制
- 📡 **状态持久化**：支持状态的本地持久化存储
- 🔐 **权限管理**：集中管理用户权限和认证状态
- 🚫 **禁止业务逻辑**：只负责状态管理，不包含复杂的业务逻辑

## 设计原则

1. **使用 Pinia 风格**
   - ✅ 使用 Pinia 的 defineStore API（简洁、轻量）
   - ✅ 支持 Composition API 和 Options API 两种写法
   - ✅ 完美的 TypeScript 类型推导

2. **按业务领域划分**
   - ✅ 每个 store 对应一个业务领域（用户、权限、配置等）
   - ✅ 避免创建过大的 store
   - ❌ 不要把所有状态放在一个 store 中

3. **状态最小化**
   - ✅ 只存储真正需要全局共享的状态
   - ❌ 不要存储页面级的临时状态（应放在 services/pages 层）
   - ❌ 不要存储可以从其他状态计算出来的数据

4. **保持纯粹性**
   - ✅ 只负责状态管理
   - ❌ 不直接调用 api 层（通过 actions 调用）
   - ❌ 不包含复杂的业务逻辑（应放在 services 层）

## 目录结构

```typescript
src/store/
├── user-store.ts        # 用户状态（包含类型定义 + 实现）
├── auth-store.ts        # 认证状态
├── permission-store.ts  # 权限状态
└── config-store.ts      # 应用配置
```

> **说明**：
> - 每个 store 文件包含类型定义和实现
> - 类型直接从各 store 文件导入（如 `import type { UserStore } from '@/store/user-store'`）

## 命名规范

- **文件命名**：`[状态名]-store.ts`（如 `user-store.ts`、`permission-store.ts`）
- **Hook 命名**：`use[状态名]Store`（如 `useUserStore`、`usePermissionStore`）
- **类型命名**：`[状态名]Store`（如 `UserStore`、`PermissionStore`）

## 完整示例

```typescript
// ============================================
// store/user-store.ts - 用户状态管理
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/adapters'
import { getUserInfo } from '@/api/user-api'
import type { UserApiInfo } from '@/api/user-api'

/**
 * 用户状态管理
 * 
 * @description 管理用户信息、登录状态等全局用户数据
 */
export const useUserStore = defineStore('user', () => {
  // ============ State ============
  const userInfo = ref<UserApiInfo | null>(null)
  const isLogin = ref(false)
  const token = ref('')

  // ============ Getters（计算属性）============
  const getUserId = computed(() => userInfo.value?.id || '')
  const getUserName = computed(() => userInfo.value?.name || '未登录')
  const getUserAvatar = computed(() => userInfo.value?.avatar || '/default-avatar.png')

  // ============ Actions ============
  /**
   * 初始化用户状态（从本地存储恢复）
   */
  async function initUser() {
    try {
      const cachedToken = await storage.get('userToken')
      const cachedUser = await storage.get('userInfo')
      
      if (cachedToken && cachedUser) {
        token.value = cachedToken
        userInfo.value = cachedUser
        isLogin.value = true
      }
    } catch (error) {
      console.error('Failed to init user state', error)
    }
  }

  /**
   * 登录
   */
  async function login(loginToken: string, userId: string) {
    // 获取用户信息
    const user = await getUserInfo(userId)
    
    token.value = loginToken
    userInfo.value = user
    isLogin.value = true
    
    // 持久化存储
    await storage.set('userToken', loginToken)
    await storage.set('userInfo', user)
  }

  /**
   * 更新用户信息
   */
  function updateUserInfo(user: Partial<UserApiInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...user }
      storage.set('userInfo', userInfo.value)
    }
  }

  /**
   * 退出登录
   */
  async function logout() {
    userInfo.value = null
    isLogin.value = false
    token.value = ''
    
    // 清除本地存储
    await storage.remove('userToken')
    await storage.remove('userInfo')
  }

  /**
   * 重置状态
   */
  function reset() {
    userInfo.value = null
    isLogin.value = false
    token.value = ''
  }

  return {
    // State
    userInfo,
    isLogin,
    token,
    // Getters
    getUserId,
    getUserName,
    getUserAvatar,
    // Actions
    initUser,
    login,
    updateUserInfo,
    logout,
    reset
  }
})

// ============================================
// store/permission-store.ts - 权限状态管理
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPermissions } from '@/api/permission'

/**
 * 权限状态管理
 */
export const usePermissionStore = defineStore('permission', () => {
  // ============ State ============
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // ============ Getters ============
  const hasPermission = computed(() => {
    return (permission: string) => permissions.value.includes(permission)
  })

  const hasRole = computed(() => {
    return (role: string) => roles.value.includes(role)
  })

  const isAdmin = computed(() => roles.value.includes('admin'))

  // ============ Actions ============
  /**
   * 加载权限
   */
  async function loadPermissions(userId: string) {
    const data = await getPermissions(userId)
    permissions.value = data.permissions
    roles.value = data.roles
  }

  /**
   * 清除权限
   */
  function clearPermissions() {
    permissions.value = []
    roles.value = []
  }

  return {
    // State
    permissions,
    roles,
    // Getters
    hasPermission,
    hasRole,
    isAdmin,
    // Actions
    loadPermissions,
    clearPermissions
  }
})

// ============================================
// store/config-store.ts - 应用配置状态
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/adapters'

/**
 * 应用配置状态管理
 */
export const useConfigStore = defineStore('config', () => {
  // ============ State ============
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')
  const fontSize = ref<'small' | 'medium' | 'large'>('medium')

  // ============ Actions ============
  /**
   * 初始化配置（从本地存储恢复）
   */
  async function initConfig() {
    const cachedTheme = await storage.get('theme')
    const cachedLanguage = await storage.get('language')
    const cachedFontSize = await storage.get('fontSize')
    
    theme.value = cachedTheme || 'light'
    language.value = cachedLanguage || 'zh-CN'
    fontSize.value = cachedFontSize || 'medium'
  }

  /**
   * 设置主题
   */
  async function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    await storage.set('theme', newTheme)
  }

  /**
   * 设置语言
   */
  async function setLanguage(newLanguage: 'zh-CN' | 'en-US') {
    language.value = newLanguage
    await storage.set('language', newLanguage)
  }

  /**
   * 设置字体大小
   */
  async function setFontSize(newSize: 'small' | 'medium' | 'large') {
    fontSize.value = newSize
    await storage.set('fontSize', newSize)
  }

  return {
    // State
    theme,
    language,
    fontSize,
    // Actions
    initConfig,
    setTheme,
    setLanguage,
    setFontSize
  }
})

// ============================================
// 在 pages 层使用 store
// ============================================

// pages/user/user-page.vue
<template>
  <view class="user-page">
    <view class="user-info">
      <image :src="userAvatar" />
      <text>{{ userName }}</text>
    </view>
    
    <button v-if="hasPermission('user:edit')" @click="handleEdit">
      编辑资料
    </button>
    
    <button @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user-store'
import { usePermissionStore } from '@/store/permission-store'
import { router } from '@/adapters'

// ✅ 使用 store（可以选择性订阅状态）
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// ✅ 获取状态值（使用computed）
const userName = computed(() => userStore.getUserName)
const userAvatar = computed(() => userStore.getUserAvatar)
const hasPermission = computed(() => permissionStore.hasPermission)

// ✅ 调用方法
const handleLogout = async () => {
  await userStore.logout()
  router.navigateTo('/pages/login/index')
}

const handleEdit = () => {
  router.navigateTo('/pages/user/edit')
}
</script>

<style scoped>
.user-page {
  /* 页面样式 */
}
</style>

// ============================================
// 在 services 层使用 store
// ============================================

// services/pages/login/use-login.ts
import { ref } from 'vue'
import { useUserStore } from '@/store/user-store'
import { usePermissionStore } from '@/store/permission-store'
import { login as loginApi } from '@/api/auth'
import { logger, router } from '@/adapters'

export function useLogin() {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  const username = ref('')
  const password = ref('')
  const isLoading = ref(false)

  const login = async () => {
    isLoading.value = true
    try {
      // 1. 调用登录接口
      const { token, userId } = await loginApi(username.value, password.value)
      
      // 2. 更新 store 状态
      await userStore.login(token, userId)
      await permissionStore.loadPermissions(userId)
      
      // 3. 跳转首页
      router.switchTab('/pages/home/index')
    } catch (error) {
      logger.error('Login failed', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    username,
    password,
    isLoading,
    login
  }
}
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **Store 定义** | ✅ 使用 Pinia defineStore API | `defineStore('user', () => ({ ... }))` |
| **状态声明** | ✅ 使用 ref 定义响应式状态 | `const userInfo = ref<UserApiInfo \| null>(null)` |
| **Getters** | ✅ 使用 computed 定义计算属性 | `const getUserName = computed(() => userInfo.value?.name)` |
| **Actions** | ✅ 直接修改 ref 值 | `userInfo.value = user` |
| **状态持久化** | ✅ 使用 storage 持久化关键状态 | `await storage.set('userToken', token)` |
| **类型定义** | ✅ TypeScript 自动推导类型 | 无需显式定义接口，类型自动推导 |
| **业务逻辑** | ❌ 不在 store 中处理复杂业务 | 复杂逻辑放在 services 层 |
| **API 调用** | ⚠️ 简单调用可以，复杂的放 services | `const user = await getUserInfo(userId)` |
| **状态重置** | ✅ 提供 reset 方法 | `function reset() { userInfo.value = null }` |
| **选择性订阅** | ✅ 按需订阅状态，避免不必要的渲染 | `const userStore = useUserStore()` |

**核心原则**：
1. ✅ **全局状态**：只存储需要跨页面/组件共享的状态
2. ✅ **轻量简洁**：使用 Pinia，避免过度设计
3. ✅ **类型安全**：完整的 TypeScript 类型定义
4. ✅ **持久化**：关键状态使用 storage 持久化
5. ✅ **职责单一**：只负责状态管理，不包含复杂业务逻辑
6. ✅ **性能优化**：使用选择性订阅，避免不必要的重新渲染

**使用场景**：
```
✅ 用户信息、登录状态
✅ 权限、角色
✅ 应用配置（主题、语言）
✅ 全局的列表缓存
❌ 页面级的临时状态（用 services/pages）
❌ 表单数据（用 services/pages）
❌ 复杂的业务计算（用 services/functions）
```

**框架说明**：
- 当前使用：**uni-app + Vue 3 + Pinia**
- 使用 Composition API 风格的 Pinia Store
- 类型自动推导，无需显式定义接口
- 不受影响的层：infrastructure、adapters、api、services/functions（60-70% 代码可复用）

-----
