<template>
  <view class="page">
    <view v-if="loading" class="state-tip">
      <text class="state-text">详情加载中…</text>
    </view>

    <view v-else-if="loadError" class="state-tip">
      <text class="state-text">{{ errorMessage }}</text>
      <view class="retry-btn" @tap="loadDetail">重新加载</view>
    </view>

    <scroll-view v-else class="detail-scroll" scroll-y>
      <view class="ticket-card">
        <view class="asset-name-row">
          <view class="asset-name-row__spacer" />
          <text class="asset-name">{{ detail.name || '--' }}</text>
          <view class="asset-name-edit" @tap="onEditTap">
            <image class="asset-name-edit__icon" :src="editIcon" mode="aspectFit" />
          </view>
        </view>

        <view class="image-placeholder-wrap">
          <view class="image-placeholder">
            <image class="image-placeholder__icon" :src="cameraIcon" mode="aspectFit" />
          </view>
        </view>

        <view class="status-row">
          <text class="row-label">使用状态</text>
          <view class="status-tag" :class="statusClass">
            {{ detail.status || '未设置' }}
          </view>
        </view>

        <view class="info-row">
          <text class="row-label">分类</text>
          <text class="row-value">{{ detail.category || '--' }}</text>
        </view>
        <view class="dashed-line" />

        <view class="info-row">
          <text class="row-label">购入日期</text>
          <text class="row-value">{{ formatDate(detail.purchaseDate) }}</text>
        </view>
        <view class="dashed-line" />

        <view class="info-row">
          <text class="row-label">购买价格</text>
          <text class="row-value row-value--price">¥{{ formatPrice(detail.price) }}</text>
        </view>
        <view class="dashed-line" />

        <view class="info-row">
          <text class="row-label">日均价格</text>
          <text class="row-value">¥{{ dailyAvgPrice }}/天</text>
        </view>
        <view class="dashed-line" />

        <view class="info-row">
          <text class="row-label">保修日期</text>
          <text class="row-value">{{ formatDate(detail.warrantyDate) }}</text>
        </view>
        <view class="dashed-line" />

        <view class="remark-row">
          <text class="row-label">备注</text>
          <view class="remark-box">
            <text class="remark-text">{{ detail.description || '暂无备注' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchAssetDetail } from '@/api'
import cameraIcon from '@/assets/icons/camera.png'
import editIcon from '@/assets/icons/edit.png'
import { calculateDaysToNow } from '@/utils/date-utils.js'

const detail = ref({})
const loading = ref(true)
const loadError = ref(false)
const errorMessage = ref('加载失败，请稍后重试')
const assetId = ref('')
/** 列表页跳转时带入，与列表「¥xx/天」一致；无参数时（直达/分享）用接口数据现算 */
const prefDailyAvg = ref('')

const statusClass = computed(() => {
  const status = detail.value.status || ''
  if (status === '在用') return 'status-tag--using'
  if (status === '闲置') return 'status-tag--idle'
  if (status === '预购入') return 'status-tag--incoming'
  if (status === '退役') return 'status-tag--retired'
  return 'status-tag--default'
})

const dailyAvgPrice = computed(() => {
  const q = prefDailyAvg.value.trim()
  if (q !== '') {
    const n = Number.parseFloat(q)
    if (Number.isFinite(n)) return n.toFixed(2)
  }
  const price = Number.parseFloat(String(detail.value?.price ?? ''))
  const days = calculateDaysToNow(detail.value?.purchaseDate)
  if (!Number.isFinite(price) || !days) return '0.00'
  return (price / days).toFixed(2)
})

onLoad((query) => {
  const id = String(query?.id || '')
  prefDailyAvg.value = query?.dailyAvg != null ? decodeURIComponent(String(query.dailyAvg)) : ''
  assetId.value = id
  if (!id) {
    loading.value = false
    loadError.value = true
    errorMessage.value = '缺少资产 id，无法查看详情'
    return
  }
  loadDetail()
})

async function loadDetail() {
  if (!assetId.value) return
  loading.value = true
  loadError.value = false

  try {
    const response = await fetchAssetDetail(assetId.value)
    detail.value = response?.data ?? {}
  } catch (error) {
    console.error('获取资产详情失败:', error)
    loadError.value = true
    errorMessage.value = '加载失败，请检查网络后重试'
    uni.showToast({ title: '详情加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function formatDate(value) {
  if (!value) return '--'
  const text = String(value).trim()
  if (!text) return '--'
  return text.slice(0, 10)
}

function formatPrice(value) {
  const num = Number.parseFloat(String(value ?? ''))
  if (!Number.isFinite(num)) return '--'
  return num.toFixed(2)
}

function onEditTap() {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: $bg-secondary;
}

.detail-scroll {
  height: 100vh;
  padding: $spacing-base $spacing-base calc($spacing-xl + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.ticket-card {
  padding: $spacing-base;
  border-radius: $radius-lg;
  background-color: $bg-primary;
  box-shadow: $shadow-elev-1;
}

.asset-name-row {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

/* 与右侧编辑按钮同宽，保证标题在卡片内视觉居中 */
.asset-name-row__spacer {
  width: 72rpx;
  flex-shrink: 0;
}

.asset-name {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: $font-lg;
  color: $text-primary;
  word-break: break-all;
}

.asset-name-edit {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
}

.asset-name-edit__icon {
  width: 44rpx;
  height: 44rpx;
}

.image-placeholder-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.image-placeholder {
  width: 280rpx;
  height: 280rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background-color: $bg-tertiary;
  border: 1px dashed $border-subtle;
  box-sizing: border-box;
  box-shadow: $shadow-sm;
}

.image-placeholder__icon {
  width: 88rpx;
  height: 88rpx;
}

.status-row,
.info-row {
  min-height: 72rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remark-row {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding-top: $spacing-xs;
}

.remark-box {
  width: 100%;
  box-sizing: border-box;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-sm;
  background-color: $bg-secondary;
}

.row-label {
  font-size: $font-base;
  color: $text-secondary;
}

.row-value {
  max-width: 66%;
  text-align: right;
  font-size: $font-base;
  color: $text-primary;
  word-break: break-all;
}

.row-value--price {
  color: $primary;
  font-weight: 600;
}

.remark-text {
  display: block;
  width: 100%;
  font-size: $font-sm;
  line-height: 1.7;
  color: $text-secondary;
  word-break: break-all;
}

.dashed-line {
  width: 100%;
  height: 1px;
  border-bottom: 1px dashed $border-subtle;
}

.status-tag {
  padding: 6rpx $spacing-sm;
  border-radius: $radius-xs;
  font-size: $font-xs;
}

.status-tag--using {
  color: $success;
  background-color: rgba($success, 0.12);
}

.status-tag--idle {
  color: $text-secondary;
  background-color: $bg-tertiary;
}

.status-tag--incoming {
  color: $caution;
  background-color: rgba($caution, 0.12);
}

.status-tag--retired {
  color: $danger;
  background-color: rgba($danger, 0.12);
}

.status-tag--default {
  color: $text-tertiary;
  background-color: $bg-tertiary;
}

.state-tip {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
}

.state-text {
  font-size: $font-sm;
  color: $text-tertiary;
}

.retry-btn {
  font-size: $font-base;
  color: $primary;
  padding: $spacing-sm $spacing-md;
}
</style>
