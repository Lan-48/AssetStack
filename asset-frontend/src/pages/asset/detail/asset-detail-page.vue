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
      <view class="detail-toolbar">
        <view
          class="detail-toolbar__btn"
          :class="{ 'is-disabled': deletingAsset }"
          @tap="onDeleteTap"
        >
          <image class="detail-toolbar__icon" :src="deleteIcon" mode="aspectFit" />
        </view>
        <view class="detail-toolbar__btn" @tap="onEditTap">
          <image class="detail-toolbar__icon" :src="editIcon" mode="aspectFit" />
        </view>
      </view>

      <view class="asset-hero">
        <view class="asset-hero__image-wrap">
          <view v-if="heroImageUrl" class="image-placeholder image-placeholder--photo">
            <image class="image-placeholder__photo" :src="heroImageUrl" mode="aspectFill" />
          </view>
          <view v-else class="image-placeholder">
            <image class="image-placeholder__icon" :src="cameraIcon" mode="aspectFit" />
          </view>
        </view>
        <view class="asset-hero__chips">
          <view class="hero-chip" :class="statusClass">{{ detail.status || '未设置' }}</view>
          <view class="hero-chip">{{ detail.category || '未分类' }}</view>
        </view>
      </view>

      <view class="ticket-card">
        <text class="asset-name">{{ detail.name || '--' }}</text>

        <view class="ticket-divider" />

        <view class="info-row">
          <text class="row-label">购入价格</text>
          <text class="row-value row-value--price">¥{{ formatPrice(detail.price) }}</text>
        </view>
        <view class="ticket-line" />

        <view class="info-row">
          <text class="row-label">购买日期</text>
          <text class="row-value">{{ formatDate(detail.purchaseDate) }}</text>
        </view>
        <view class="ticket-line" />

        <view class="info-row">
          <text class="row-label">保修日期</text>
          <text class="row-value">{{ formatDate(detail.warrantyDate) }}</text>
        </view>
        <view class="ticket-line" />

        <view class="ticket-remarks">
          <text class="ticket-remarks__title">备注</text>
          <view class="ticket-remarks__body">
            <text
              class="ticket-remarks__text"
              :class="{ 'ticket-remarks__text--empty': !remarkText }"
            >{{ remarkText || '暂无备注' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AssetFormPopup
      v-model:show="showEditPopup"
      mode="edit"
      :model-value="detail"
      :submitting="submittingEdit"
      @submit="onEditSubmit"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { deleteAsset, fetchAssetDetail, updateAsset } from '@/api'
import AssetFormPopup from '@/components/asset/asset-form-popup/asset-form-popup.vue'
import cameraIcon from '@/assets/icons/camera.png'
import { isRemoteAvatarUrl } from '@/utils/upload-avatar'
import deleteIcon from '@/assets/icons/delete.png'
import editIcon from '@/assets/icons/edit.png'

const detail = ref({})
const loading = ref(true)
const loadError = ref(false)
const errorMessage = ref('加载失败，请稍后重试')
const assetId = ref('')
const showEditPopup = ref(false)
const submittingEdit = ref(false)
/** 详情页删除（与编辑提交独立，避免互锁） */
const deletingAsset = ref(false)

const statusClass = computed(() => {
  const status = detail.value.status || ''
  if (status === '在用') return 'status-tag--using'
  if (status === '闲置') return 'status-tag--idle'
  if (status === '预购入') return 'status-tag--incoming'
  if (status === '退役') return 'status-tag--retired'
  return 'status-tag--default'
})

const remarkText = computed(() => String(detail.value.description ?? '').trim())

const heroImageUrl = computed(() => {
  const raw = String(detail.value.imageUrl ?? '').trim()
  return raw && isRemoteAvatarUrl(raw) ? raw : ''
})

onLoad((query) => {
  const id = String(query?.id || '')
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
  if (!assetId.value) {
    uni.showToast({ title: '缺少资产 id', icon: 'none' })
    return
  }
  showEditPopup.value = true
}

async function onEditSubmit(payload) {
  if (submittingEdit.value || !assetId.value) return
  submittingEdit.value = true

  const cover = (payload.imageUrl ?? '').trim()
  const warranty = (payload.warrantyDate ?? '').trim()
  const requestPayload = {
    name: payload.name,
    category: payload.category,
    categoryId: payload.categoryId ?? null,
    price: payload.price,
    purchaseDate: payload.purchaseDate,
    warrantyDate: warranty === '' ? null : warranty,
    status: payload.status,
    description: payload.description,
    imageUrl: cover === '' ? null : cover,
  }

  try {
    const response = await updateAsset(assetId.value, requestPayload)
    showEditPopup.value = false
    uni.showToast({ title: '更新成功', icon: 'success' })
    uni.$emit('asset:changed')
    // 更新接口已返回与详情一致的 data，直接写入即可，避免多一次 GET 与整页 loading 闪烁
    const next = response?.data
    if (next != null && typeof next === 'object') {
      detail.value = next
    } else {
      await loadDetail()
    }
  } catch (error) {
    console.error('更新资产失败:', error)
    uni.showToast({ title: '更新失败，请稍后重试', icon: 'none' })
  } finally {
    submittingEdit.value = false
  }
}

function onDeleteTap() {
  if (deletingAsset.value || !assetId.value) {
    if (!assetId.value) uni.showToast({ title: '缺少资产 id', icon: 'none' })
    return
  }

  uni.showModal({
    title: '删除资产',
    content: '删除后不可恢复，确认删除吗？',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) confirmDeleteAsset()
    },
  })
}

async function confirmDeleteAsset() {
  if (deletingAsset.value || !assetId.value) return
  deletingAsset.value = true

  try {
    await deleteAsset(assetId.value)
    showEditPopup.value = false
    uni.showToast({ title: '删除成功', icon: 'success' })
    uni.$emit('asset:changed')

    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.redirectTo({ url: '/pages/asset/list/asset-list-page' })
    }
  } catch (error) {
    console.error('删除资产失败:', error)
    uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
  } finally {
    deletingAsset.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.page {
  box-sizing: border-box;
  background-color: $bg-secondary;
}

.detail-scroll {
  height: 100%;
  padding: $spacing-base $spacing-base calc($spacing-xl + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.detail-toolbar__btn {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background-color: $bg-primary;
  box-shadow: $shadow-sm;
  box-sizing: border-box;
}

.detail-toolbar__icon {
  width: 44rpx;
  height: 44rpx;
}

.detail-toolbar__btn.is-disabled {
  opacity: $opacity-disabled;
}

.asset-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.asset-hero__image-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.asset-hero__chips {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.hero-chip {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  background-color: $border-subtle;
  font-size: $font-sm;
  color: $text-primary;
}

.ticket-card {
  position: relative;
  overflow: hidden;
  padding: $spacing-base $spacing-base 0;
  background-color: $bg-primary;
  box-shadow: $shadow-elev-1;
}

/* 撕边齿孔内嵌在票身底部（与票面同一块白底，不再外挂负 margin 条带） */
.ticket-card::after {
  content: '';
  display: block;
  height: 28rpx;
  margin-top: $spacing-base;
  margin-left: (-$spacing-base);
  margin-right: (-$spacing-base);
  background: radial-gradient(circle at 16rpx -5rpx, transparent 16rpx, $bg-secondary 17rpx) repeat-x;
  background-size: 44rpx 28rpx;
}

.asset-name {
  display: block;
  width: 100%;
  text-align: center;
  font-size: $font-base;
  color: $text-primary;
  word-break: break-all;
  margin-bottom: $spacing-base;
  box-sizing: border-box;
}

.image-placeholder {
  width: 280rpx;
  height: 280rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background-color: $border-subtle;
  box-sizing: border-box;
}

.image-placeholder__icon {
  width: 96rpx;
  height: 96rpx;
}

.image-placeholder--photo {
  padding: 0;
  overflow: hidden;
}

.image-placeholder__photo {
  width: 100%;
  height: 100%;
  display: block;
}

.ticket-divider {
  position: relative;
  margin: 0 (-$spacing-base) $spacing-base;
  border-bottom: 1px dashed $border;
}

.ticket-divider::before,
.ticket-divider::after {
  content: '';
  position: absolute;
  bottom: -32rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-full;
  background-color: $bg-secondary;
}

.ticket-divider::before {
  left: -32rpx;
}

.ticket-divider::after {
  right: -32rpx;
}

.info-row {
  padding: $spacing-md;
  min-height: 72rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-label {
  font-size: $font-base;
  color: $text-primary;
}

.row-value {
  max-width: 60%;
  text-align: right;
  font-size: $font-base;
  color: $text-secondary;
  word-break: break-all;
}

.row-value--price {
  color: $primary;
}

.ticket-line {
  width: 100%;
  height: 1px;
  border-bottom: 1px solid $border-subtle;
}

.ticket-remarks {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background-color: $border-subtle;
  border-radius: $radius-md;
  box-sizing: border-box;
}

.ticket-remarks__title {
  display: block;
  font-size: $font-base;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.ticket-remarks__body {
  background-color: $bg-primary;
  border-radius: $radius-xs;
  padding: $spacing-xs;
  min-height: 120rpx;
  box-sizing: border-box;
}

.ticket-remarks__text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}

.ticket-remarks__text--empty {
  color: $text-tertiary;
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
