# components 层说明

components 层负责**封装可复用的 UI 组件**，提供跨页面共享的视图组件。

## 核心职责

- 🎨 **UI 渲染**：只负责 UI 展示和用户交互的视觉反馈
- 🔄 **可复用**：提供跨页面、跨模块复用的组件
- 📦 **组件封装**：封装通用的 UI 逻辑（如表单验证、动画效果）
- 🎯 **接收 Props**：通过 props 接收数据和回调函数
- ⚠️ **禁止业务逻辑**：不包含任何业务逻辑，只负责展示

## 设计原则

1. **纯展示组件**
   - ✅ 只负责 UI 渲染和交互反馈
   - ✅ 通过 props 接收数据
   - ✅ 通过回调函数（callback）向父组件传递事件
   - ❌ 不直接调用 api 层
   - ❌ 不直接访问 store（通过 props 传入）
   - ❌ 不包含业务逻辑判断

2. **按平台分类**
   - **common/**：跨平台通用组件（H5 + 小程序都能用）
   - **h5/**：H5 平台特有组件
   - **weapp/**：微信小程序特有组件
   - **其他平台/**：按需添加（如 alipay、tt 等）

3. **组件独立性**
   - ✅ 每个组件应该独立可用
   - ✅ 组件之间避免强依赖
   - ✅ 组件应该有清晰的 props 定义
   - ✅ 组件应该有默认值和容错处理

4. **统一命名前缀**
   - ✅ 使用 `uai-` 前缀（UI Abstraction Interface）
   - ✅ 便于识别和管理
   - ✅ 避免与第三方组件库命名冲突

## 目录结构

```typescript
src/components/
├── common/                      # 跨平台通用组件
│   ├── uai-button/
│   │   ├── uai-button.vue      # 组件实现（包含样式）
│   │   └── types.ts            # 组件类型定义
│   ├── uai-input/
│   │   ├── uai-input.vue       # 组件实现（包含样式）
│   │   └── types.ts
│   ├── uai-modal/
│   │   ├── uai-modal.vue        # 组件实现（包含样式）
│   │   └── types.ts
│   └── uai-list/
│       ├── uai-list.vue         # 组件实现（包含样式）
│       └── types.ts
│
├── h5/                          # H5 特有组件
│   ├── uai-navigation/         # 导航栏
│   │   └── uai-navigation.vue  # 组件实现（包含样式）
│   └── uai-sidebar/            # 侧边栏
│       └── uai-sidebar.vue     # 组件实现（包含样式）
│
└── weapp/                       # 小程序特有组件
    ├── uai-custom-tab-bar/     # 自定义 TabBar
    │   └── uai-custom-tab-bar.vue  # 组件实现（包含样式）
    └── uai-mini-program-nav/   # 小程序导航
        └── uai-mini-program-nav.vue  # 组件实现（包含样式）
```

## 命名规范

- **组件文件夹**：`uai-[组件名]/`（如 `uai-button/`、`uai-modal/`）
- **组件文件**：`uai-[组件名].vue`（如 `uai-button.vue`、`uai-modal.vue`）
- **组件名称**：使用 PascalCase（如 `UaiButton`、`UaiModal`）
- **Props 类型**：`[组件名]Props`（如 `UaiButtonProps`、`UaiModalProps`）
- **类型定义**：`types.ts`（可选，复杂组件建议单独文件）
- **样式**：样式直接写在 Vue 文件的 `<style>` 标签中，不拆分独立文件

## 完整示例

```typescript
// ============================================
// components/common/uai-button/types.ts - 组件类型定义
// ============================================

/**
 * 按钮类型
 */
export type UaiButtonType = 'primary' | 'secondary' | 'danger' | 'ghost'

/**
 * 按钮大小
 */
export type UaiButtonSize = 'small' | 'medium' | 'large'

/**
 * 按钮 Props
 */
export interface UaiButtonProps {
  // 基础属性
  type?: UaiButtonType
  size?: UaiButtonSize
  disabled?: boolean
  loading?: boolean
  
  // 事件（✅ 只有回调，不包含业务逻辑）
  onClick?: (e: any) => void
  
  // 样式
  class?: string
  style?: string | Record<string, any>
}

// ============================================
// components/common/uai-button/uai-button.vue - 按钮组件
// ============================================

<template>
  <view 
    :class="btnClass" 
    :style="style" 
    @click="handleClick"
  >
    <view v-if="loading" class="uai-button__loading" />
    <text class="uai-button__text">
      <slot />
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UaiButtonProps } from './types'

const props = withDefaults(defineProps<UaiButtonProps>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [e: any]
}>()

// ✅ 只处理 UI 交互，不包含业务逻辑
const handleClick = (e: any) => {
  if (props.disabled || props.loading) return
  emit('click', e)
  props.onClick?.(e)
}

// ✅ 只处理样式类名
const btnClass = computed(() => {
  return [
    'uai-button',
    `uai-button--${props.type}`,
    `uai-button--${props.size}`,
    {
      'uai-button--disabled': props.disabled,
      'uai-button--loading': props.loading
    },
    props.class
  ]
})
</script>

<style scoped lang="scss">
.uai-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &--primary {
    background-color: #007aff;
    color: #fff;
  }
  
  &--secondary {
    background-color: #f0f0f0;
    color: #333;
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>

// ============================================
// components/common/uai-modal/types.ts - 弹窗组件类型
// ============================================

export interface UaiModalProps {
  // 显示控制
  visible: boolean
  
  // 内容
  title?: string
  
  // 按钮配置
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
  
  // 事件回调（✅ 只有回调，不做业务判断）
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
  
  // 样式
  class?: string
}

// ============================================
// components/common/uai-modal/uai-modal.vue - 弹窗组件
// ============================================

<template>
  <view v-if="visible" class="uai-modal">
    <view class="uai-modal__mask" @click="handleMaskClick" />
    <view :class="['uai-modal__container', class]">
      <view v-if="title" class="uai-modal__header">
        <text class="uai-modal__title">{{ title }}</text>
      </view>
      
      <view class="uai-modal__body">
        <slot />
      </view>
      
      <view class="uai-modal__footer">
        <uai-button 
          v-if="showCancel" 
          type="secondary" 
          @click="handleCancel"
        >
          {{ cancelText }}
        </uai-button>
        <uai-button type="primary" @click="handleConfirm">
          {{ confirmText }}
        </uai-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { UaiButton } from '../uai-button/uai-button'
import type { UaiModalProps } from './types'

const props = withDefaults(defineProps<UaiModalProps>(), {
  showCancel: true,
  cancelText: '取消',
  confirmText: '确定'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

// ✅ 只处理 UI 交互，不做业务判断
const handleConfirm = () => {
  emit('confirm')
  props.onConfirm?.()
}

const handleCancel = () => {
  emit('cancel')
  props.onCancel?.()
}

const handleMaskClick = () => {
  emit('close')
  props.onClose?.()
}
</script>

<style scoped lang="scss">
.uai-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  &__mask {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  &__container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 8px;
    min-width: 300px;
    max-width: 90%;
  }
  
  &__header {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  &__title {
    font-size: 16px;
    font-weight: 500;
  }
  
  &__body {
    padding: 16px;
  }
  
  &__footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>

// ============================================
// ❌ 错误示例：组件中包含业务逻辑
// ============================================

// ❌ 不要在组件中直接调用 api
<template>
  <view>
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserList } from '@/api/user-api'

// ❌ 错误：不要在组件中直接调用 api
const users = ref([])

onMounted(() => {
  getUserList().then(data => users.value = data)
})
</script>

// ❌ 不要在组件中直接访问 store
<template>
  <view>{{ userInfo?.name }}</view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user-store'

// ❌ 错误：不要在组件中直接访问 store
const userStore = useUserStore()
const userInfo = userStore.userInfo
</script>

// ❌ 不要在组件中做业务逻辑判断
<template>
  <view>
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ product: Product }>()

// ❌ 错误：不要做业务逻辑判断
const canBuy = computed(() => 
  props.product.stock > 0 && 
  props.product.price > 0 && 
  !props.product.isDeleted
)
</script>

// ============================================
// ✅ 正确示例：通过 props 接收数据和回调
// ============================================

// ✅ 正确：通过 props 接收数据
<template>
  <view>
    <view 
      v-for="user in users" 
      :key="user.id" 
      @click="handleUserClick(user)"
    >
      {{ user.name }}
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ 
  users: User[]
}>()

const emit = defineEmits<{
  userClick: [user: User]
}>()

const handleUserClick = (user: User) => {
  emit('userClick', user)
}
</script>

// ✅ 正确：通过 props 接收 store 数据
<template>
  <view>{{ userInfo?.name || '未登录' }}</view>
</template>

<script setup lang="ts">
defineProps<{ userInfo: UserApiInfo | null }>()
</script>

// ✅ 正确：通过 props 接收业务判断结果
<template>
  <view>
    <text>{{ product.name }}</text>
    <uai-button :disabled="!canBuy" @click="handleBuy">
      购买
    </uai-button>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ 
  product: Product
  canBuy: boolean
}>()

const emit = defineEmits<{
  buy: []
}>()

const handleBuy = () => {
  emit('buy')
}
</script>
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **组件定位** | ✅ 纯 UI 组件，不包含业务逻辑 | 只负责渲染和交互反馈 |
| **数据获取** | ✅ 通过 props 接收数据 | `<user-list :users="users" />` |
| **状态管理** | ❌ 不直接访问 store | 通过 props 传入 store 数据 |
| **API 调用** | ❌ 不直接调用 api 层 | 由父组件或 services 层处理 |
| **业务判断** | ❌ 不做业务逻辑判断 | 通过 props 接收判断结果 |
| **事件处理** | ✅ 通过 emit 传递事件 | `@click="handleButtonClick"` |
| **组件命名** | ✅ 使用 `uai-` 前缀 | `UaiButton`、`UaiModal` |
| **类型定义** | ✅ 定义清晰的 Props 类型 | `interface UaiButtonProps { ... }` |
| **默认值** | ✅ 提供合理的默认值 | `type = 'primary'` |
| **平台适配** | ✅ 按平台分类组件 | `common/`、`h5/`、`weapp/` |

**核心原则**：
1. ✅ **纯展示组件**：只负责 UI 渲染，不包含业务逻辑
2. ✅ **Props 驱动**：所有数据通过 props 传入
3. ✅ **回调传递**：所有事件通过回调函数传递给父组件
4. ✅ **可复用性**：组件应该足够通用，可在多处使用
5. ✅ **独立性**：组件不依赖 store、api、services 等业务层
6. ❌ **禁止业务逻辑**：不做业务判断、不调用 api、不访问 store

**禁止事项**：
```typescript
// ❌ 禁止在组件中直接调用 api
import { getUserList } from '@/api/user-api'  // ❌

// ❌ 禁止在组件中直接访问 store
import { useUserStore } from '@/store/user-store'  // ❌

// ❌ 禁止在组件中做业务逻辑判断
const canEdit = user.role === 'admin' && user.permissions.includes('edit')  // ❌
```

**正确做法**：
```vue
<template>
  <view>
    <text>{{ user.name }}</text>
    <uai-button :disabled="!canEdit" @click="handleEdit">
      编辑
    </uai-button>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: User
  canEdit: boolean  // 由父组件或 service 层判断后传入
}>()

const emit = defineEmits<{
  edit: []
}>()

const handleEdit = () => {
  emit('edit')
}
</script>
```

**组件使用场景**：
- ✅ 按钮、输入框、弹窗等基础 UI 组件
- ✅ 卡片、列表项等展示型组件
- ✅ 表单控件、下拉菜单等交互组件
- ✅ 导航栏、TabBar 等布局组件
- ❌ 不要把包含复杂业务逻辑的页面部分放在 components

**调用链路**：
```
pages 层（调用 services 获取数据）
  ↓
services 层（处理业务逻辑、判断）
  ↓
components 层（接收数据和回调，纯展示）
```

-----
