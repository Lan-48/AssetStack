<!--
  组件名称：AssetList

  组件描述：资产列表展示组件，支持网格与列表两种视图，按状态与分类筛选后展示名称、金额、日均与天数，并支持跳转资产详情。

  组件参数说明：
  - assets: 资产数组，每项含 id、name、price、days，可选 status、category 供筛选
  - viewMode: 视图模式，grid 为宫格卡片，list 为行列表
  - filterStatus: 状态筛选文案，为「全部」时不按状态过滤
  - filterCategory: 分类筛选文案，为「全部」时不按分类过滤

  组件事件说明：
  - 无: 暂无对外事件（点击跳转由组件内 uni.navigateTo 完成）

  组件使用示例：
  <AssetList
    :assets="assetList"
    view-mode="grid"
    filter-status="全部"
    filter-category="全部"
  />
-->
<template>
  <view class="asset-list">
    <view v-if="viewMode === 'grid'" class="grid-mode">
      <view class="grid-container">
        <view
          v-for="item in filteredAssets"
          :key="item.id"
          class="asset-card"
          @click="goToDetail(item)"
        >
          <view class="card-header">
            <view class="asset-icon">
              <text>📞</text>
            </view>
            <view class="days">{{ item.days }}天</view>
          </view>
          <view class="asset-name">
            {{ item.name }}
          </view>
          <view class="card-body">
            <view class="price-row">
              <text class="price">¥{{ item.price }}</text>
              <text class="daily-avg">¥{{ dailyAvgPerDay(item) }}/天</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="list-mode">
      <view
        v-for="item in filteredAssets"
        :key="item.id"
        class="asset-item list-item"
        @click="goToDetail(item)"
      >
        <view class="item-icon">
          <text>📞</text>
        </view>

        <view class="item-content">
          <view class="item-name">{{ item.name }}</view>
          <view class="item-price">
            <text class="price">¥{{ item.price }}</text>
            <text class="daily">¥{{ dailyAvgPerDay(item) }}/天</text>
          </view>
        </view>

        <view class="item-days">
          {{ item.days }}天
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AssetListItem, AssetListProps } from './types'

  const props = withDefaults(defineProps<AssetListProps>(), {
    assets: () => [],
    viewMode: 'grid',
    filterStatus: '全部',
    filterCategory: '全部',
  })

  defineOptions({ name: 'AssetList' })

  const filteredAssets = computed(() => {
    return props.assets.filter((item) => {
      return (
        (props.filterStatus === '全部' || item.status === props.filterStatus) &&
        (props.filterCategory === '全部' || item.category === props.filterCategory)
      )
    })
  })

  function dailyAvgPerDay(item: AssetListItem): string {
    const price = parseFloat(String(item.price))
    const days = item.days
    if (!Number.isFinite(price) || !days) {
      return '0.00'
    }
    return (price / days).toFixed(2)
  }

  function goToDetail(item: AssetListItem): void {
    if (!item || !item.id) {
      uni.showToast({ title: '资产信息无效', icon: 'none' })
      return
    }

    const dailyAvg = dailyAvgPerDay(item)
    uni.navigateTo({
      url: `/pages/asset/detail/asset-detail-page?id=${item.id}&dailyAvg=${encodeURIComponent(dailyAvg)}`,
      fail: () => {
        uni.showToast({ title: '跳转失败', icon: 'none' })
      },
    })
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .asset-card {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    padding: $spacing-md $spacing-base;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    box-shadow: $shadow-elev-1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .asset-icon {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .days {
    font-size: $font-xl;
    color: $text-secondary;
  }

  .asset-name {
    font-size: $font-base;
    color: $text-secondary;
    flex-grow: 1;
    display: flex;
    align-items: center;
    margin-bottom: $spacing-xs;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price {
    font-size: $font-base;
    color: $danger;
  }

  .daily-avg {
    font-size: $font-base;
    color: $text-tertiary;
  }

  .asset-item {
    display: flex;
    align-items: center;
    background-color: $bg-primary;
    border-radius: $radius-lg;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-elev-1;

    .item-icon {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin-right: $spacing-md;
    }

    .item-content {
      flex: 1;
      margin: 0 $spacing-md;

      .item-name {
        font-size: $font-base;
        color: $text-secondary;
        margin-bottom: $spacing-xs;
      }

      .item-price {
        display: flex;
        align-items: center;

        .price {
          font-size: $font-base;
          color: $danger;
          margin-right: $spacing-sm;
        }

        .daily {
          font-size: $font-sm;
          color: $text-tertiary;
        }
      }
    }

    .item-days {
      font-size: $font-xl;
      color: $text-primary;
    }
  }
</style>
