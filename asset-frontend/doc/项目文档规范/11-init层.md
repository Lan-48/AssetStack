# init 层说明

init 层负责**应用启动时的初始化工作**，是应用的入口层，负责调用 adapters 层的初始化函数和进行应用级别的配置。

## 核心职责

- 🚀 **应用启动**：在应用启动时执行初始化逻辑
- 🔧 **调用初始化**：调用 adapters 层的 `setupInfrastructure()` 初始化基础设施
- ⚙️ **应用配置**：进行应用级别的配置（如主题、语言、全局错误处理等）
- 📱 **平台适配**：根据平台（H5、小程序）执行不同的初始化逻辑
- 🎯 **统一入口**：提供统一的初始化入口函数

## 设计原则

1. **平台分离**
   - ✅ 不同平台有独立的初始化文件（`init-h5.ts`、`init-weapp.ts`）
   - ✅ 通用逻辑放在 `init.ts` 中
   - ✅ 平台特定逻辑在对应平台文件中处理

2. **职责单一**
   - ✅ 只负责应用启动时的初始化
   - ✅ 调用 adapters 层的初始化函数
   - ❌ 不包含业务逻辑（业务逻辑在 services 层）
   - ❌ 不包含基础设施初始化（由 adapters 层负责）

3. **执行顺序**
   - ✅ 先初始化基础设施（adapters）
   - ✅ 再初始化应用配置
   - ✅ 最后执行平台特定的初始化

## 目录结构

```typescript
src/init/
├── init-h5.ts     # H5 平台初始化入口
├── init-weapp.ts  # 小程序平台初始化入口
└── init.ts        # 统一入口（根据平台自动选择初始化函数）
```

**文件说明**：

| 文件 | 职责 | 说明 |
|------|------|------|
| `init.ts` | 统一入口 | 根据 `process.env.UNI_PLATFORM` 自动选择对应平台的初始化函数 |
| `init-h5.ts` | H5 平台初始化 | 包含 H5 平台的初始化逻辑（全局错误处理、PWA 等） |
| `init-weapp.ts` | 小程序平台初始化 | 包含小程序平台的初始化逻辑（分享配置、云开发等） |

> **说明**：
> - 每个平台文件只负责该平台的初始化逻辑
> - 通用初始化逻辑可以提取到公共函数中
> - `init.ts` 负责平台判断和动态导入，不包含具体初始化逻辑

## 完整示例

```typescript
/**
 * 应用初始化入口
 * 根据平台自动选择对应的初始化函数
 */
export function initApp() {
  const platform = process.env.UNI_PLATFORM

  if (platform === 'h5') {
    return import('./init-h5').then(module => module.initH5App())
  } else if (platform === 'mp-weixin') {
    return import('./init-weapp').then(module => module.initWeappApp())
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

// ============================================
// init/init-h5.ts - H5 平台初始化
// ============================================

import { setupInfrastructure } from '@/adapters/setup'
import { logger } from '@/adapters/logger'

/**
 * H5 平台应用初始化
 */
export async function initH5App() {
  try {
    // 1. 初始化基础设施
    setupInfrastructure()
    logger.info('Infrastructure initialized')

    // 2. 应用级别配置
    initAppConfig()

    // 3. H5 特定初始化
    initH5Specific()

    logger.info('H5 app initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize H5 app', error)
    throw error
  }
}

/**
 * 应用配置初始化
 */
function initAppConfig() {
  // 设置全局错误处理
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error)
  })

  // 设置未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason)
  })
}

/**
 * H5 特定初始化
 */
function initH5Specific() {
  // H5 平台特定的初始化逻辑
  // 如：设置视口、初始化 PWA、设置主题等
}

// ============================================
// init/init-weapp.ts - 小程序平台初始化
// ============================================

import { setupInfrastructure } from '@/adapters/setup'
import { logger } from '@/adapters/logger'

/**
 * 小程序平台应用初始化
 */
export async function initWeappApp() {
  try {
    // 1. 初始化基础设施
    setupInfrastructure()
    logger.info('Infrastructure initialized')

    // 2. 应用级别配置
    initAppConfig()

    // 3. 小程序特定初始化
    initWeappSpecific()

    logger.info('Weapp app initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize Weapp app', error)
    throw error
  }
}

/**
 * 应用配置初始化
 */
function initAppConfig() {
  // 设置全局错误处理（uni-app 会自动处理，这里可以添加额外逻辑）
  // uni-app 的全局错误处理在 App.vue 中配置
}

/**
 * 小程序特定初始化
 */
function initWeappSpecific() {
  // 小程序平台特定的初始化逻辑
  // 如：检查更新、设置分享、初始化云开发等
}

// ============================================
// App.vue - 应用入口（使用）
// ============================================

<template>
  <view>
    <!-- uni-app 会自动渲染当前页面 -->
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initApp } from '@/init'

// 应用启动时调用
onLaunch(() => {
  initApp().then(() => {
    console.log('App initialized')
  }).catch((error) => {
    console.error('Failed to initialize app', error)
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **平台分离** | ✅ 不同平台独立文件 | `init-h5.ts`, `init-weapp.ts` |
| **初始化顺序** | ✅ 先基础设施，再应用配置 | `setupInfrastructure()` → `initAppConfig()` |
| **统一入口** | ✅ 使用 init.ts 作为平台选择入口 | `initApp()` 根据平台自动选择 |
| **错误处理** | ✅ 全局错误处理在 init 层设置 | `window.addEventListener('error')` |
| **业务逻辑** | ❌ 不包含业务逻辑 | 业务逻辑在 services 层 |
| **基础设施初始化** | ❌ 不直接初始化基础设施 | 调用 adapters 层的 `setupInfrastructure()` |

**核心原则**：
1. ✅ **平台分离**：不同平台有独立的初始化文件
2. ✅ **职责单一**：只负责应用启动时的初始化
3. ✅ **调用 adapters**：基础设施初始化由 adapters 层负责
4. ✅ **统一入口**：提供统一的初始化入口函数
5. ✅ **错误处理**：设置全局错误处理机制

**调用链路**：
```
App.vue (应用入口)
  ↓ 调用
init 层（应用初始化）
  ↓ 调用
adapters/setup.ts（基础设施初始化）
  ↓ 初始化
infrastructure 层（基础设施模块）
```

-----




