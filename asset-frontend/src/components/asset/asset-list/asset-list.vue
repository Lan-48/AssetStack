<!--
  组件名称：AssetList

  组件描述：资产列表展示组件，支持网格与列表两种视图，在父级已筛好分类的前提下按状态再筛并展示；网格模式为左图、右侧上下为天数字与名称；名称单行展示，超出省略。

  组件参数说明：
  - assets: 资产数组，每项含 id、name、price、days，可选 status、category、imageUrl；无图时用本地默认产品图
  - viewMode: 视图模式，grid 为宫格卡片，list 为行列表
  - filterStatus: 状态筛选文案，为「全部」时不按状态过滤
  - 分类筛选在列表页父级完成，本组件仅按状态筛（避免与按 categoryId 子树逻辑重复）

  组件事件说明：
  - 无: 暂无对外事件（点击跳转由组件内 uni.navigateTo 完成）

  组件使用示例：
  <AssetList
    :assets="assetList"
    view-mode="grid"
    filter-status="在用"
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
          <view class="card-top">
            <view class="asset-icon">
              <image class="asset-icon-img" :src="assetCoverSrc(item)" mode="aspectFill" />
            </view>
            <view class="card-top-right">
              <text class="days">{{ item.days }}天</text>
              <text class="asset-name">{{ item.name }}</text>
            </view>
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
          <image class="item-icon-img" :src="assetCoverSrc(item)" mode="aspectFill" />
        </view>

        <view class="item-content">
          <text class="item-name">{{ item.name }}</text>
          <view class="item-price">
            <text class="price">¥{{ item.price }}</text>
            <text class="daily">¥{{ dailyAvgPerDay(item) }}/天</text>
          </view>
        </view>

        <view class="item-days">{{ item.days }}天</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import productPlaceholder from '@/assets/icons/product.png'
  import { isRemoteAvatarUrl } from '@/utils/upload-avatar'
  import type { AssetListItem, AssetListProps } from './types'

  const props = withDefaults(defineProps<AssetListProps>(), {
    assets: () => [],
    viewMode: 'grid',
    filterStatus: '在用'
  })

  defineOptions({ name: 'AssetList' })

  const filteredAssets = computed(() => {
    return props.assets.filter((item) => {
      return props.filterStatus === '全部' || item.status === props.filterStatus
    })
  })

  function assetCoverSrc(item: AssetListItem): string {
    const url = item.imageUrl != null ? String(item.imageUrl).trim() : ''
    return url !== '' && isRemoteAvatarUrl(url) ? url : productPlaceholder
  }

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
      }
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
    border-radius: $radius-md;
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    box-sizing: border-box;
    box-shadow: $shadow-elev-1;
  }

  .card-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $spacing-sm;
  }

  .card-top-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .card-top-right .days {
    font-size: $font-xl;
    color: $text-secondary;
    line-height: 1.25;
  }

  .card-top-right .asset-name {
    display: block;
    font-size: $font-xs;
    color: $text-secondary;
    width: 100%;
    max-width: 100%;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .asset-icon {
    width: 88rpx;
    height: 88rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: $radius-sm;
  }

  .asset-icon-img {
    width: 100%;
    height: 100%;
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
    font-size: $font-sm;
    color: $text-tertiary;
  }

  .asset-item {
    display: flex;
    align-items: center;
    background-color: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-elev-1;

    .item-icon {
      width: 88rpx;
      height: 88rpx;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: $radius-sm;
    }

    .item-icon-img {
      width: 100%;
      height: 100%;
    }

    .item-content {
      flex: 1;
      min-width: 0;
      margin: 0 $spacing-md;

      .item-name {
        display: block;
        font-size: $font-base;
        color: $text-secondary;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
