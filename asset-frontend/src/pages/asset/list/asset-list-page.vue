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
                :filter-category="filterCategory"
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

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { fetchAssetList } from '@/api'
import Layout from '@/components/layout/layout.vue'
import AssetStatsCard from '@/components/asset/asset-stats-card/asset-stats-card.vue'
import AssetToolbar from '@/components/asset/asset-toolbar/asset-toolbar.vue'
import AssetList from '@/components/asset/asset-list/asset-list.vue'
import { calculateDaysToNow } from '@/utils/date-utils'

const assets = ref([])
const loading = ref(true)
const loadError = ref(false)

const loadAssets = async () => {
  loadError.value = false
  loading.value = true
  try {
    const response = await fetchAssetList()
    // 打印后端返回的完整数据结构（联调时可对照字段）
    console.log('后端返回的完整数据:', response)
    const list = response?.data?.list
    assets.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('获取资产失败:', error)
    loadError.value = true
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 每次页面显示时拉取列表（从详情返回等场景会再次触发）
onShow(() => {
  loadAssets()
})

// 计算后的资产列表（补充 days 等展示字段）
const computedAssets = computed(() => {
  return assets.value.map((asset) => ({
    ...asset,
    days: calculateDaysToNow(asset.purchaseDate),
  }))
})

// 筛选条件：状态来自统计卡片；分类来自工具栏下拉
const filterStatus = ref('全部')
const filterCategory = ref('全部')

// 视图模式：列表 / 宫格
const viewMode = ref('list')

// 排序：name | amount | days | dailyAvg（与统计卡片「排序」下拉的「天数 / 金额 / 日均」对应）
const sortType = ref('name')

// 仅筛选（不含排序），用于金额统计与卡片 count，避免排序影响汇总口径
const filteredAssets = computed(() => {
  return computedAssets.value.filter((asset) => {
    const statusMatch = filterStatus.value === '全部' || asset.status === filterStatus.value
    const categoryMatch = filterCategory.value === '全部' || asset.category === filterCategory.value
    return statusMatch && categoryMatch
  })
})

// 在筛选结果上排序，供列表展示
const sortedAndFilteredAssets = computed(() => {
  const list = [...filteredAssets.value]
  list.sort((a, b) => {
    if (sortType.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortType.value === 'amount') {
      return parseFloat(b.price) - parseFloat(a.price)
    }
    if (sortType.value === 'days') {
      return b.days - a.days
    }
    if (sortType.value === 'dailyAvg') {
      const da = (x) => (x.days > 0 ? parseFloat(x.price) / x.days : 0)
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
const onFilterChange = ({ type, value }) => {
  if (type === '状态') {
    filterStatus.value = value || '全部'
    return
  }
  if (type === '排序') {
    const sortMap = {
      天数: 'days',
      金额: 'amount',
      日均: 'dailyAvg',
    }
    sortType.value = sortMap[value] ?? 'name'
  }
}

// 工具栏预留的 sort-change（当前 UI 未绑定时可忽略）
const onSortChange = (type) => {
  if (type) sortType.value = type
}

// 工具栏分类下拉：将选中项 label 同步为列表的 category 筛选
const onCategoryFilterChange = (label) => {
  filterCategory.value = label || '全部'
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
