<template>
  <Layout>
    <view class="page">
      <!-- 内容区域 -->
      <view class="content">
        <!-- 加载失败：可点击重试 -->
        <view v-if="loadError" class="state-tip state-tip--error">
          <text class="state-text">加载失败，请检查网络后重试</text>
          <view class="retry-btn" @tap="loadAssets">重新加载</view>
        </view>

        <template v-else>
          <!-- 统计卡片：与筛选结果联动（count / 总金额 / 总日均） -->
          <AssetStatsCard
            v-if="sortedAndFilteredAssets"
            :count="filteredAssets.length"
            :total-count="assets.length"
            :left-value="totalAmount"
            :right-value="dailyAvg"
            @filter-change="onFilterChange"
          />

          <!-- 操作栏：分类 + 视图切换；分类变更通过 filter-category-change 同步到列表筛选 -->
          <AssetToolbar
            v-if="viewMode"
            v-model:viewMode="viewMode"
            v-model:category-filter-id="filterCategoryId"
            :options="categoryDropdownOptions"
            @sort-change="onSortChange"
            @filter-category-change="onCategoryFilterChange"
          />

          <!-- 资产列表（可滚动）；首屏加载中时仅展示轻提示，避免空白误解 -->
          <view class="scrollable-container">
            <view v-if="loading" class="state-tip state-tip--inline">
              <text class="state-text">加载中…</text>
            </view>
            <template v-else>
              <AssetList
                :assets="sortedAndFilteredAssets"
                :view-mode="viewMode"
                :filter-status="filterStatus"
              />
              <!-- 列表为空时的说明（无数据 vs 筛选无结果） -->
              <view v-if="sortedAndFilteredAssets.length === 0" class="empty-tip">
                <text>{{ assets.length === 0 ? '暂无资产数据' : '当前筛选下暂无资产' }}</text>
              </view>
            </template>
          </view>
        </template>
      </view>
    </view>
  </Layout>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchAssetList, fetchCategoryTree, type AssetCategoryTreeNode } from '@/api'
import type {
  AssetToolbarCategoryOption,
  AssetToolbarViewMode,
  CategoryFilterPayload
} from '@/components/asset/asset-toolbar/types'
import Layout from '@/components/layout/layout.vue'
import AssetStatsCard from '@/components/asset/asset-stats-card/asset-stats-card.vue'
import AssetToolbar from '@/components/asset/asset-toolbar/asset-toolbar.vue'
import AssetList from '@/components/asset/asset-list/asset-list.vue'
import { calculateDaysToNow } from '@/utils/date-utils'

type AssetRow = Record<string, unknown> & {
  id?: string | number
  name?: string
  price?: string | number
  status?: string
  category?: string
  purchaseDate?: string
  categoryId?: number | null
  category_id?: number | null
}

const assets = ref<AssetRow[]>([])
const loading = ref(true)
const loadError = ref(false)

/** GET /asset-categories/tree，供工具栏下拉与筛选用 */
const categoryTree = ref<AssetCategoryTreeNode[]>([])
/** 与 AssetToolbar v-model:category-filter-id 同步；0 为全部 */
const filterCategoryId = ref(0)
/** 当前分类筛选项（id + 展示名），与工具栏 change 一致 */
const activeCategoryFilter = ref<CategoryFilterPayload>({ value: 0, label: '全部' })

const loadAssets = async () => {
  loadError.value = false
  loading.value = true
  try {
    const response = (await fetchAssetList()) as { data?: { list?: unknown } }
    // 打印后端返回的完整数据结构（联调时可对照字段）
    console.log('后端返回的完整数据:', response)
    const list = response?.data?.list
    assets.value = Array.isArray(list) ? (list as AssetRow[]) : []
  } catch (error) {
    console.error('获取资产失败:', error)
    loadError.value = true
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function loadCategoryTree() {
  try {
    const res = await fetchCategoryTree()
    const raw = (res as { data?: unknown })?.data
    const list = Array.isArray(raw) ? (raw as AssetCategoryTreeNode[]) : []
    categoryTree.value = list
    filterCategoryId.value = 0
    activeCategoryFilter.value = { value: 0, label: '全部' }
  } catch (e) {
    console.error('拉取分类树失败:', e)
  }
}

function treeToToolbarOptions(tree: AssetCategoryTreeNode[]): AssetToolbarCategoryOption[] {
  const out: AssetToolbarCategoryOption[] = [{ label: '全部', value: 0, children: [] }]
  for (const n of tree) {
    const children = (n.children ?? []).map((c) => ({ label: c.name, value: c.id }))
    out.push({ label: n.name, value: n.id, children })
  }
  return out
}

function findNodeInTree(tree: AssetCategoryTreeNode[], id: number): AssetCategoryTreeNode | null {
  for (const n of tree) {
    if (n.id === id) return n
    for (const c of n.children ?? []) {
      if (c.id === id) return c
    }
  }
  return null
}

function collectDescendantIdsAndLabels(node: AssetCategoryTreeNode): {
  ids: Set<number>
  labels: Set<string>
} {
  const ids = new Set<number>([node.id])
  const labels = new Set<string>([node.name])
  for (const ch of node.children ?? []) {
    ids.add(ch.id)
    labels.add(ch.name)
  }
  return { ids, labels }
}

function findDefaultCategory(
  tree: AssetCategoryTreeNode[]
): { id: number; name: string } | null {
  for (const n of tree) {
    if (Number(n.is_default) === 1) return { id: n.id, name: n.name }
    for (const c of n.children ?? []) {
      if (Number(c.is_default) === 1) return { id: c.id, name: c.name }
    }
  }
  return null
}

function getRowCategoryId(asset: Record<string, unknown>): number | null {
  const v = asset.categoryId ?? asset.category_id
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function isUnboundLegacyForDefault(
  asset: Record<string, unknown>,
  defaultName: string
): boolean {
  if (getRowCategoryId(asset) != null) return false
  const t = String(asset.category ?? '').trim()
  return t === '' || t === defaultName
}

/**
 * 分类筛选：支持 categoryId 与一级带子级；已绑定 id 的走 id；仅文案走名称集合。
 * 默认分类（is_default=1）同时纳入「无 category_id 的旧数据」以与产品「未设即默认」一致。
 */
function matchAssetCategory(
  asset: Record<string, unknown>,
  filter: CategoryFilterPayload,
  tree: AssetCategoryTreeNode[],
  defaultMeta: { id: number; name: string } | null
): boolean {
  if (filter.value === 0) return true
  const cid = getRowCategoryId(asset)
  const label = String(asset.category ?? '').trim()
  if (defaultMeta && filter.value === defaultMeta.id) {
    if (cid != null) return cid === defaultMeta.id
    return isUnboundLegacyForDefault(asset, defaultMeta.name) || label === defaultMeta.name
  }
  const node = findNodeInTree(tree, filter.value)
  if (!node) {
    return label === filter.label
  }
  const { ids, labels } = collectDescendantIdsAndLabels(node)
  if (cid != null) return ids.has(cid)
  return labels.has(label) || label === node.name
}

// 每次页面显示时拉取分类树与资产列表（从详情返回等会再次触发）
onShow(() => {
  void loadCategoryTree()
  void loadAssets()
})

/** 与 AppLayout 中加号提交的 uni.$emit('asset:changed') 联动；便于控制台对照弹窗与列表刷新时序 */
function onAssetChangedFromGlobal() {
  console.log('[AssetListPage] asset:changed -> loadAssets()', {
    time: Date.now(),
  })
  loadAssets()
}

onMounted(() => {
  uni.$on('asset:changed', onAssetChangedFromGlobal)
})

onUnmounted(() => {
  uni.$off('asset:changed', onAssetChangedFromGlobal)
})

// 计算后的资产列表（补充 days 等展示字段）
const computedAssets = computed(() => {
  return assets.value.map((asset) => ({
    ...asset,
    days: asset.purchaseDate
      ? calculateDaysToNow(String(asset.purchaseDate))
      : 0,
  }))
})

// 筛选条件：状态来自统计卡片；分类来自工具栏下拉（与分类表 id / 子树联动）
const filterStatus = ref('在用')

const defaultCategoryInfo = computed(() => findDefaultCategory(categoryTree.value))

const categoryDropdownOptions = computed((): AssetToolbarCategoryOption[] =>
  treeToToolbarOptions(categoryTree.value)
)

// 视图模式：列表 / 宫格
const viewMode = ref<AssetToolbarViewMode>('list')

// 排序：name | amount | days | dailyAvg（与统计卡片「排序」下拉的「天数 / 金额 / 日均」对应）
const sortType = ref<'name' | 'amount' | 'days' | 'dailyAvg'>('name')

// 仅筛选（不含排序），用于金额统计与卡片 count，避免排序影响汇总口径
const filteredAssets = computed(() => {
  const tree = categoryTree.value
  const filter = activeCategoryFilter.value
  const def = defaultCategoryInfo.value
  return computedAssets.value.filter((asset) => {
    const statusMatch = filterStatus.value === '全部' || asset.status === filterStatus.value
    const categoryMatch = matchAssetCategory(
      asset as unknown as Record<string, unknown>,
      filter,
      tree,
      def
    )
    return statusMatch && categoryMatch
  })
})

// 在筛选结果上排序，供列表展示
const sortedAndFilteredAssets = computed(() => {
  const list = [...filteredAssets.value]
  list.sort((a, b) => {
    if (sortType.value === 'name') {
      return String(a.name ?? '').localeCompare(String(b.name ?? ''))
    }
    if (sortType.value === 'amount') {
      return parseFloat(String(b.price ?? 0)) - parseFloat(String(a.price ?? 0))
    }
    if (sortType.value === 'days') {
      return b.days - a.days
    }
    if (sortType.value === 'dailyAvg') {
      const da = (x: (typeof list)[number]) =>
        x.days > 0 ? parseFloat(String(x.price)) / x.days : 0
      return da(b) - da(a)
    }
    return 0
  })
  return list
})

// 当前筛选范围内的总金额（与卡片左侧「总资产」一致）
const totalAmount = computed(() => {
  return filteredAssets.value.reduce((sum, item) => {
    // 将 amount 改为 price，与后端字段一致，并转换为数字
    return sum + (Number.parseFloat(String(item.price)) || 0)
  }, 0)
})

// 当前筛选范围内的日均之和（与卡片右侧「总日均」一致）
const dailyAvg = computed(() => {
  return filteredAssets.value
    .reduce((sum, item) => {
      const itemDailyAvg =
        item.days > 0 ? (Number.parseFloat(String(item.price)) || 0) / item.days : 0
      return sum + itemDailyAvg
    }, 0)
    .toFixed(2)
})

/**
 * 统计卡片内「状态 / 排序」下拉变更（载荷为 { type, value }）
 * - 状态：同步 filterStatus
 * - 排序：同步 sortType（下拉文案 天数/金额/日均 → 内部 key）
 */
const onFilterChange = ({ type, value }: { type: string; value: string }) => {
  if (type === '状态') {
    filterStatus.value = value || '在用'
    return
  }
  if (type === '排序') {
    const sortMap: Record<string, 'days' | 'amount' | 'dailyAvg'> = {
      天数: 'days',
      金额: 'amount',
      日均: 'dailyAvg'
    }
    const next = value ? sortMap[value] : undefined
    sortType.value = (next ?? 'name') as 'name' | 'amount' | 'days' | 'dailyAvg'
  }
}

// 工具栏预留的 sort-change（当前 UI 未绑定时可忽略）
const onSortChange = (type: 'name' | 'amount' | 'days' | 'dailyAvg') => {
  sortType.value = type
}

/** 工具栏分类：同步 id + 文案，供 matchAssetCategory 使用 */
const onCategoryFilterChange = (payload: CategoryFilterPayload) => {
  activeCategoryFilter.value = payload
  filterCategoryId.value = payload.value
}
</script>

<style scoped lang="scss">
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.scrollable-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  /* 避让 fixed BottomTab；与 bottom-tab 的 bottom + height 及安全区对齐 */
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

.state-tip {
  padding: $spacing-lg $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.state-tip--error {
  flex: 1;
  justify-content: center;
}

.state-tip--inline {
  padding: $spacing-xl 0;
}

.state-text {
  font-size: $font-sm;
  color: $text-tertiary;
}

.retry-btn {
  font-size: $font-base;
  color: $primary;
  padding: $spacing-sm $spacing-lg;
}

.empty-tip {
  padding: $spacing-xl $spacing-md $spacing-lg;
  text-align: center;
  font-size: $font-sm;
  color: $text-tertiary;
}
</style>
