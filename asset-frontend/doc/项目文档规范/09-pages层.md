# pages 层说明

pages 层负责**页面视图的渲染和生命周期管理**，是应用的视图入口，只负责 UI 呈现和生命周期。

## 核心职责

- 🎨 **UI 渲染**：负责页面的视图渲染
- 🔄 **生命周期管理**：处理页面的生命周期钩子（onLoad、onShow、onReady 等）
- 📡 **调用 Services**：从 services/pages 层获取页面逻辑和状态
- 🎯 **事件绑定**：将 UI 事件与 services 层的方法绑定
- ⚠️ **禁止业务逻辑**：不包含任何业务逻辑，只负责展示和调用

## 设计原则

1. **极简原则**
   - ✅ 页面文件只包含生命周期和 UI 渲染
   - ✅ 所有页面逻辑和状态管理放在 services/pages 层
   - ✅ 使用 Composable/Hooks 获取页面逻辑
   - ❌ 不直接调用 api 层
   - ❌ 不直接访问 store（通过 services 层）
   - ❌ 不包含业务逻辑判断

2. **按平台分类**
   - **h5/**：H5 平台页面
   - **weapp/**：微信小程序页面
   - **common/**：跨平台通用页面（如登录页）
   - **其他平台/**：按需添加（如 alipay、tt 等）

3. **页面组件化**
   - ✅ 复杂页面使用 `parts/` 子目录拆分为多个子组件
   - ✅ 子组件命名为 `[功能名]-part.vue`
   - ✅ 子组件通过 props 接收数据和回调
   - ✅ 保持页面文件的简洁性

4. **统一命名后缀**
   - ✅ 页面文件使用 `-page.vue` 后缀
   - ✅ 页面子组件使用 `-part.vue` 后缀
   - ✅ 便于识别和管理

## 目录结构

```typescript
src/pages/
├── h5/                          # H5 平台页面
│   ├── home/
│   │   ├── home-page.vue       # 首页主文件（包含样式）
│   │   └── parts/              # 页面子组件
│   │       ├── search-part.vue
│   │       ├── user-part.vue
│   │       └── product-list-part.vue
│   ├── user/
│   │   ├── user-page.vue       # 用户页面（包含样式）
│   │   └── parts/
│   │       ├── update-info-part.vue
│   │       ├── share-user-part.vue
│   │       └── delete-user-part.vue
│   └── product/
│       └── product-page.vue    # 产品页面（包含样式）
│
├── weapp/                       # 微信小程序页面
│   ├── home/
│   │   ├── home-page.vue       # 首页主文件（包含样式）
│   │   └── parts/
│   │       ├── search-part.vue
│   │       ├── user-part.vue
│   │       └── product-list-part.vue
│   ├── user/
│   │   ├── user-page.vue       # 用户页面（包含样式）
│   │   └── parts/
│   │       ├── update-info-part.vue
│   │       ├── share-user-part.vue
│   │       └── delete-user-part.vue
│   └── product/
│       └── product-page.vue    # 产品页面（包含样式）
│
└── common/                      # 跨平台通用页面
    └── login/
        └── login-page.vue       # 登录页面（包含样式）
```

## 命名规范

- **页面文件夹**：`[页面名]/`（如 `home/`、`user/`）
- **页面文件**：`[页面名]-page.vue`（如 `home-page.vue`、`user-page.vue`）
- **页面子组件文件夹**：`parts/`
- **页面子组件文件**：`[功能名]-part.vue`（如 `search-part.vue`、`user-part.vue`）
- **页面配置文件**：`[页面名]-page.config.ts`（uni-app 页面配置，可选）
- **样式**：样式直接写在 Vue 文件的 `<style>` 标签中，不拆分独立文件

## 完整示例

```vue
<!-- ============================================ -->
<!-- pages/h5/user/user-page.vue - 用户页面 -->
<!-- ============================================ -->

<template>
  <view class="user-page">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading">加载中...</view>

    <!-- 错误状态 -->
    <view v-if="error" class="error">
      <text>{{ error.message }}</text>
      <uai-button @click="handleRefresh">重试</uai-button>
    </view>

    <!-- 用户信息 -->
    <view v-if="user && !isLoading" class="user-content">
      <image :src="user.avatar" class="avatar" />
      <text class="name">{{ user.name }}</text>
      <text class="email">{{ user.email }}</text>
      
      <view class="actions">
        <uai-button type="primary" @click="handleUpdate">
          更新信息
        </uai-button>
        <uai-button 
          type="danger" 
          @click="() => setShowDeleteModal(true)"
        >
          删除账号
        </uai-button>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <uai-modal
      :visible="showDeleteModal"
      title="确认删除"
      @confirm="handleDeleteConfirm"
      @cancel="() => setShowDeleteModal(false)"
    >
      <text>确定要删除账号吗？此操作不可恢复。</text>
    </uai-modal>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow, onReady } from '@dcloudio/uni-app'
import { useUser } from '@/services/pages/user'
import UaiButton from '@/components/common/uai-button/uai-button.vue'
import UaiModal from '@/components/common/uai-modal/uai-modal.vue'

/**
 * 用户页面
 * 
 * @description 
 * - ✅ 只负责生命周期和 UI 渲染
 * - ✅ 所有逻辑和状态来自 services/pages/user
 * - ❌ 不包含任何业务逻辑
 */

// ============ 获取页面逻辑（一行代码） ============
const {
  // 状态
  user,
  isLoading,
  error,
  showDeleteModal,
  
  // 方法
  init,
  refresh,
  updateUser,
  deleteUser,
  setShowDeleteModal
} = useUser()

// ============ 生命周期（页面层负责） ============
onLoad((options) => {
  // ✅ 在生命周期中调用 services 层的初始化方法
  const userId = (options.id as string) || ''
  init(userId)
})

onShow(() => {
  console.log('页面显示')
})

onReady(() => {
  console.log('页面渲染完成')
})

// ============ 事件处理（简单绑定） ============
const handleRefresh = () => {
  refresh()
}

const handleUpdate = () => {
  updateUser({ name: '新名字' })
}

const handleDeleteConfirm = () => {
  deleteUser()
  setShowDeleteModal(false)
}
</script>

<style scoped lang="scss">
.user-page {
  padding: 20px;
  
  .loading { text-align: center; padding: 20px; }
  .error { color: #ff3b30; padding: 20px; }
  
  .user-content {
    .avatar { width: 80px; height: 80px; border-radius: 50%; }
    .name { font-size: 18px; font-weight: 500; }
    .email { font-size: 14px; color: #666; }
    .actions { margin-top: 20px; display: flex; gap: 12px; }
  }
}
</style>

<!-- ============================================ -->
<!-- pages/h5/home/home-page.vue - 带子组件的复杂页面 -->
<!-- ============================================ -->

<template>
  <view class="home-page">
    <!-- 搜索区域 -->
    <search-part
      :keyword="keyword"
      @search="onSearch"
    />

    <!-- 用户信息区域 -->
    <user-part :user-info="userInfo" />

    <!-- 产品列表区域 -->
    <product-list-part
      :products="productList"
      :is-loading="isLoading"
      @product-click="onProductClick"
      @load-more="loadMore"
    />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useHome } from '@/services/pages/home'
import SearchPart from './parts/search-part.vue'
import UserPart from './parts/user-part.vue'
import ProductListPart from './parts/product-list-part.vue'

/**
 * 首页
 * 
 * @description 
 * - ✅ 复杂页面使用 parts 子组件拆分
 * - ✅ 所有逻辑和状态来自 services/pages/home
 */

// ============ 获取页面逻辑 ============
const {
  // 状态
  keyword,
  userInfo,
  productList,
  isLoading,
  
  // 方法
  init,
  onSearch,
  onProductClick,
  loadMore
} = useHome()

// ============ 生命周期 ============
onLoad(() => {
  init()
})
</script>

<style scoped lang="scss">
.home-page {
  padding: 20px;
}
</style>

<!-- ============================================ -->
<!-- pages/h5/home/parts/search-part.vue - 页面子组件 -->
<!-- ============================================ -->

<template>
  <view class="search-part">
    <input
      v-model="localKeyword"
      placeholder="请输入搜索关键词"
    />
    <uai-button @click="handleSearch">搜索</uai-button>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import UaiButton from '@/components/common/uai-button/uai-button.vue'

const props = defineProps<{
  keyword: string
}>()

const emit = defineEmits<{
  search: [keyword: string]
}>()

/**
 * 搜索子组件
 * 
 * @description 
 * - ✅ 通过 props 接收状态和回调
 * - ✅ 只负责 UI 渲染
 */

const localKeyword = ref(props.keyword)

// 同步外部 keyword 变化
watch(() => props.keyword, (newVal) => {
  localKeyword.value = newVal
})

const handleSearch = () => {
  emit('search', localKeyword.value)
}
</script>

<style scoped lang="scss">
.search-part {
  display: flex;
  gap: 12px;
  padding: 16px;
}
</style>

<!-- ============================================ -->
<!-- pages/h5/home/parts/product-list-part.vue - 列表子组件 -->
<!-- ============================================ -->

<template>
  <scroll-view
    class="product-list-part"
    scroll-y
    @scrolltolower="handleLoadMore"
  >
    <view 
      v-for="product in products" 
      :key="product.id" 
      class="product-item"
      @click="handleProductClick(product)"
    >
      <text class="name">{{ product.name }}</text>
      <text class="price">¥{{ product.price }}</text>
    </view>
    
    <text v-if="isLoading">加载中...</text>
  </scroll-view>
</template>

<script setup lang="ts">
interface Product {
  id: string
  name: string
  price: number
}

const props = defineProps<{
  products: Product[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  productClick: [product: Product]
  loadMore: []
}>()

/**
 * 产品列表子组件
 */

const handleProductClick = (product: Product) => {
  emit('productClick', product)
}

const handleLoadMore = () => {
  emit('loadMore')
}
</script>

<style scoped lang="scss">
.product-list-part {
  height: 100vh;
  
  .product-item {
    padding: 16px;
    border-bottom: 1px solid #eee;
    
    .name { font-size: 16px; }
    .price { color: #ff3b30; font-weight: 500; }
  }
}
</style>

<!-- ============================================ -->
<!-- ❌ 错误示例：页面中包含业务逻辑 -->
<!-- ============================================ -->

<!-- ❌ 不要在页面中直接调用 api -->
<template>
  <view>
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api/user-api'

// ❌ 错误：不要在页面中直接调用 api
const user = ref(null)

onLoad(async (options) => {
  const data = await getUserInfo(options.id as string)
  user.value = data
})
</script>

<!-- ❌ 不要在页面中做业务逻辑判断 -->
<template>
  <view>
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProduct } from '@/services/pages/product'

const { product } = useProduct()

// ❌ 错误：不要在页面中做业务逻辑判断
const canBuy = computed(() => 
  product.value.stock > 0 && 
  product.value.price > 0 && 
  !product.value.isDeleted
)
</script>

<!-- ❌ 不要在页面中管理复杂状态 -->
<template>
  <view>
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ❌ 错误：不要在页面中管理复杂状态
const products = ref([])
const isLoading = ref(false)
const page = ref(1)

const loadProducts = async () => {
  isLoading.value = true
  // ... 复杂的加载逻辑
  isLoading.value = false
}
</script>

<!-- ============================================ -->
<!-- ✅ 正确示例：页面只负责生命周期和 UI -->
<!-- ============================================ -->

<!-- ✅ 正确：使用 services 层的 Composable -->
<template>
  <view>
    <text v-if="isLoading">加载中...</text>
    <text v-else>{{ user?.name }}</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUser } from '@/services/pages/user'

// ✅ 一行代码获取所有逻辑和状态
const { user, isLoading, init, updateUser } = useUser()

onLoad((options) => {
  // ✅ 只调用 services 层的方法
  init(options.id as string)
})
</script>

<!-- ✅ 正确：通过 services 层获取业务判断结果 -->
<template>
  <view>
    <text>{{ product?.name }}</text>
    <uai-button :disabled="!canBuy" @click="buyProduct">
      购买
    </uai-button>
  </view>
</template>

<script setup lang="ts">
import { useProduct } from '@/services/pages/product'

// ✅ canBuy 由 services 层判断后传递
const { product, canBuy, buyProduct } = useProduct()
</script>
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **页面定位** | ✅ 只负责生命周期和 UI 渲染 | 不包含任何业务逻辑 |
| **获取逻辑** | ✅ 使用 services/pages 的 Composable | `const { user, init } = useUser()` |
| **生命周期** | ✅ 在生命周期中调用 services 方法 | `onLoad(() => init())` |
| **状态管理** | ❌ 不在页面中管理复杂状态 | 状态由 services 层管理 |
| **API 调用** | ❌ 不直接调用 api 层 | 通过 services 层调用 |
| **业务判断** | ❌ 不做业务逻辑判断 | 由 services 层判断后传递结果 |
| **Store 访问** | ❌ 不直接访问 store | 通过 services 层访问 |
| **事件处理** | ✅ 简单绑定 services 层方法 | `@click="updateUser"` |
| **页面拆分** | ✅ 复杂页面使用 parts 子组件 | `<search-part />`, `<user-part />` |
| **子组件通信** | ✅ 通过 props 传递数据和回调 | `<search-part @search="onSearch" />` |

**核心原则**：
1. ✅ **极简页面**：只包含生命周期和 UI 渲染
2. ✅ **逻辑分离**：所有逻辑和状态来自 services/pages 层
3. ✅ **一行获取**：使用 Composable 一行代码获取所有逻辑
4. ✅ **组件化**：复杂页面使用 parts 子组件拆分
5. ✅ **统一命名**：使用 `-page.vue` 和 `-part.vue` 后缀
6. ❌ **禁止业务逻辑**：不做判断、不调用 api、不管理复杂状态

**禁止事项**：
```typescript
// ❌ 禁止在页面中直接调用 api
import { getUserInfo } from '@/api/user-api'  // ❌

// ❌ 禁止在页面中直接访问 store
import { useUserStore } from '@/store/user-store'  // ❌

// ❌ 禁止在页面中做业务逻辑判断
const canEdit = user.role === 'admin'  // ❌

// ❌ 禁止在页面中管理复杂状态
const products = ref([])
const page = ref(1)
const filters = ref({})  // ❌
```

**正确做法**：
```vue
<template>
  <view>
    <text>{{ user?.name }}</text>
    <uai-button :disabled="!canEdit" @click="updateUser">
      编辑
    </uai-button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUser } from '@/services/pages/user'

// ✅ 一行代码获取所有逻辑和状态
const { user, canEdit, init, updateUser } = useUser()

// ✅ 生命周期中调用初始化
onLoad((options) => {
  init(options.id as string)
})
</script>
```

**页面层职责边界**：
```
✅ pages 层应该做的：
- 页面生命周期管理（onLoad、onShow、onReady）
- UI 渲染（Vue Template）
- 事件绑定（@click、@input 等）
- 调用 services/pages 层的方法

❌ pages 层不应该做的：
- 业务逻辑判断
- API 调用
- Store 访问
- 复杂状态管理
- 数据处理和计算
```

**调用链路**：
```
pages 层（生命周期 + UI 渲染）
  ↓ 调用
services/pages 层（页面逻辑 + 状态管理）
  ↓ 调用
services/functions 层（业务逻辑）
  ↓ 调用
api 层（网络请求）
  ↓ 调用
adapters/http（HTTP 客户端）
  ↓ 调用
infrastructure/network（底层网络）
```

**与 components 层的区别**：
| 层级 | 职责 | 特点 |
|------|------|------|
| **pages 层** | 页面入口，生命周期管理 | 有生命周期，调用 services/pages |
| **components 层** | 可复用的 UI 组件 | 无生命周期，纯展示组件 |
| **parts 子组件** | 页面特定的子组件 | 属于 pages 层，不可跨页面复用 |

-----
