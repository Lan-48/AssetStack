<!--
  组件名称：AssetFormPopup

  组件描述：资产新增/编辑通用表单弹窗，负责收集资产基础信息并通过事件向父层提交。

  组件参数说明：
  - show: 是否显示弹窗（支持 v-model:show）
  - mode: 表单模式，create 为新增、edit 为编辑
  - modelValue: 编辑模式下的资产初始值，新增模式可不传
  - submitting: 提交中的禁用状态，由父层控制

  组件事件说明：
  - update:show: 弹窗开关状态变化时触发
  - submit: 点击右上角确认后触发表单提交，回传表单值
  - cancel: 点击关闭或遮罩关闭时触发

  组件使用示例：
  <AssetFormPopup
    v-model:show="showForm"
    mode="edit"
    :model-value="detail"
    :submitting="submitting"
    @submit="handleSubmit"
  />
-->
<template>
  <!-- z-index 需低于 H5 内置 picker 遮罩（约 999+），否则只会叠一层更暗的蒙层而选不中日期 -->
  <Popup
    :show="props.show"
    position="bottom"
    :round="true"
    :z-index="900"
    @update:show="onPopupShowChange"
    @click-overlay="handleCancel"
  >
    <view class="asset-form-popup">
      <view class="asset-form-header">
        <text class="asset-form-title">{{ titleText }}</text>
        <view class="asset-form-submit" :class="{ 'is-disabled': props.submitting }" @tap="handleSubmit">
          <image class="asset-form-submit__icon" :src="checkIcon" mode="aspectFit" />
        </view>
      </view>

      <view class="image-placeholder-wrap">
        <view class="image-placeholder">
          <image class="image-placeholder__icon" :src="cameraIcon" mode="aspectFit" />
        </view>
      </view>

      <view class="category-dropdown-wrap">
        <Dropdown
          v-model="form.category"
          title="分类"
          :options="categoryDropdownOptions"
          :support-submenu="false"
          variant="toolbar"
          width="300rpx"
          max-height="320px"
        />
      </view>

      <view class="form-row">
        <text class="form-label">资产名称</text>
        <view class="form-row__control">
          <input v-model="form.name" class="form-input" placeholder="请输入资产名称" />
        </view>
      </view>

      <view class="form-row">
        <text class="form-label">购入价格</text>
        <view class="form-row__control">
          <input v-model="form.price" class="form-input" placeholder="请输入价格" type="digit" />
        </view>
      </view>

      <view class="form-row">
        <text class="form-label">购买日期</text>
        <picker mode="date" :value="form.purchaseDate || today" @change="onPurchaseDateChange">
          <view class="form-input form-input--date">{{ form.purchaseDate || '请选择购买日期' }}</view>
        </picker>
      </view>

      <view class="form-row">
        <text class="form-label">保修日期</text>
        <picker mode="date" :value="form.warrantyDate || today" @change="onWarrantyDateChange">
          <view class="form-input form-input--date">{{ form.warrantyDate || '请选择保修日期' }}</view>
        </picker>
      </view>

      <view class="status-row">
        <text class="form-label">状态</text>
        <view class="status-options">
          <view
            v-for="status in statusOptions"
            :key="status"
            class="status-item"
            :class="{ 'status-item--active': form.status === status }"
            @tap="form.status = status"
          >
            {{ status }}
          </view>
        </view>
      </view>

      <view class="ticket-remarks">
        <text class="ticket-remarks__title">备注</text>
        <view class="ticket-remarks__body">
          <textarea
            v-model="form.description"
            class="ticket-remarks__textarea"
            maxlength="100"
            placeholder="是什么让你购买了它？"
          />
          <text class="ticket-remarks__counter">{{ form.description.length }}/100</text>
        </view>
      </view>
    </view>
  </Popup>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Popup from '@/components/common/popup/popup.vue'
import Dropdown from '@/components/common/dropdown/dropdown.vue'
import cameraIcon from '@/assets/icons/camera.png'
import checkIcon from '@/assets/icons/check.png'
import type { AssetFormPopupEmits, AssetFormPopupProps, AssetFormSubmitPayload } from './types'

const props = withDefaults(defineProps<AssetFormPopupProps>(), {
  show: false,
  mode: 'create',
  modelValue: () => ({}),
  submitting: false,
})

const emit = defineEmits<AssetFormPopupEmits>()

defineOptions({ name: 'AssetFormPopup' })

/** 与原先 selector 一致：选中项写入 form.category（提交字段不变） */
const categoryDropdownOptions = [
  { label: '数码产品', value: '数码产品' },
  { label: '家用电器', value: '家用电器' },
  { label: '办公设备', value: '办公设备' },
  { label: '其他', value: '其他' },
]
const statusOptions = ['在用', '退役', '预购入', '闲置']
const today = new Date().toISOString().slice(0, 10)

const form = reactive<AssetFormSubmitPayload>({
  name: '',
  category: '',
  price: '',
  purchaseDate: '',
  warrantyDate: '',
  status: '在用',
  description: '',
})

const titleText = computed(() => (props.mode === 'edit' ? '编辑资产' : '新增资产'))

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    syncFormFromModel(props.modelValue || {})
  },
  { immediate: true },
)

function syncFormFromModel(source: Partial<AssetFormSubmitPayload>) {
  form.name = source.name ? String(source.name) : ''
  form.category = source.category ? String(source.category) : ''
  form.price = source.price ? String(source.price) : ''
  form.purchaseDate = normalizeDate(source.purchaseDate)
  form.warrantyDate = normalizeDate(source.warrantyDate)
  form.status = source.status ? String(source.status) : '在用'
  form.description = source.description ? String(source.description) : ''
}

function normalizeDate(value?: string) {
  if (!value) return ''
  const text = String(value).trim()
  if (!text) return ''
  return text.slice(0, 10)
}

function onPopupShowChange(value: boolean) {
  emit('update:show', value)
}

function handleCancel() {
  emit('update:show', false)
  emit('cancel')
}

function handleSubmit() {
  if (props.submitting) return
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入资产名称', icon: 'none' })
    return
  }
  if (!form.price.trim()) {
    uni.showToast({ title: '请输入购入价格', icon: 'none' })
    return
  }
  // 组件层只负责收集与校验输入，不直接调接口；由父层决定 create / update。
  emit('submit', { ...form })
}

function onPurchaseDateChange(event: { detail?: { value?: string } }) {
  form.purchaseDate = String(event?.detail?.value || '')
}

function onWarrantyDateChange(event: { detail?: { value?: string } }) {
  form.warrantyDate = String(event?.detail?.value || '')
}
</script>

<style scoped lang="scss">
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.asset-form-popup {
  display: block;
  width: 100%;
  border-top-left-radius: $radius-md;
  border-top-right-radius: $radius-md;
  /* 底部弹层在部分端上子树未撑开高度时面板会为 0，导致只看到遮罩 */
  min-height: 560rpx;
  max-height: 90vh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /*
   * 安全区：勿在 Popup 上使用 safe-area-inset-bottom（面板为 $bg-primary 白底，会在底部露出白条）。
   * 由表单容器铺满主题灰底并向下延申安全区内边距。
   * 纵向滚动放在此处，避免 Popup 面板 overflow:auto + transform 截断/盖住内置 date picker。
   */
  padding: $spacing-base $spacing-base calc(#{$spacing-sm} + constant(safe-area-inset-bottom));
  padding: $spacing-base $spacing-base calc(#{$spacing-sm} + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  background-color: $bg-secondary;
}

.asset-form-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.asset-form-title {
  font-size: $font-md;
  color: $text-primary;
}

.asset-form-submit {
  position: absolute;
  right: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-full;
  background-color: $bg-primary;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-form-submit__icon {
  width: 40rpx;
  height: 40rpx;
}

.asset-form-submit.is-disabled {
  opacity: $opacity-disabled;
}

.image-placeholder-wrap {
  margin-top: $spacing-lg;
  display: flex;
  justify-content: center;
}

.image-placeholder {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-md;
  background: $fill-placeholder-neutral;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder__icon {
  width: 72rpx;
  height: 72rpx;
}

.category-dropdown-wrap {
  margin: $spacing-lg auto $spacing-md;
  display: flex;
  justify-content: center;
  width: 100%;
}

.form-row,
.status-row {
  margin-top: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.status-row {
  align-items: center;
}

.form-label {
  flex-shrink: 0;
  width: 152rpx;
  text-align: right;
  font-size: $font-base;
  color: $text-primary;
}

/* 小程序 flex 子项需 width:0 才吃满；原生 input 忌 display:flex（mp 宽度异常） */
.form-row__control {
  flex: 1;
  min-width: 0;
  width: 0;
}

.form-row__control .form-input {
  width: 100%;
  max-width: 100%;
}

/* 标签列固定宽度后，日期行右侧 picker 铺满剩余空间 */
.form-row > picker,
.form-row > uni-picker {
  flex: 1;
  min-width: 0;
  width: 0;
}

.form-input {
  width: 100%;
  min-height: 72rpx;
  border-radius: $radius-sm;
  background-color: $bg-primary;
  padding: 0 $spacing-md;
  box-sizing: border-box;
  font-size: $font-sm;
  color: $text-primary;
}

input.form-input {
  display: block;
  min-width: 0;
  height: 72rpx;
  line-height: 72rpx;
}

.form-input--date {
  display: flex;
  align-items: center;
  color: $text-secondary;
}

.status-options {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $spacing-xs;
}

.status-item {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  text-align: center;
  padding: $spacing-sm $spacing-xs;
  border-radius: $radius-sm;
  background-color: $border-subtle;
  font-size: $font-sm;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-item--active {
  background-color: $fill-tag-active-soft;
}

/* 与资产详情票卡「备注」块视觉对齐 */
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
  position: relative;
  background-color: $bg-primary;
  border-radius: $radius-xs;
  padding: $spacing-xs;
  min-height: 96rpx;
  box-sizing: border-box;
}

.ticket-remarks__textarea {
  display: block;
  width: 100%;
  min-height: 64rpx;
  padding: $spacing-sm $spacing-xs;
  padding-bottom: calc(#{$spacing-sm} + 28rpx);
  box-sizing: border-box;
  font-size: $font-sm;
  line-height: 1.5;
  color: $text-secondary;
  background-color: transparent;
  border: none;
}

.ticket-remarks__textarea::placeholder {
  color: $text-tertiary;
}

.ticket-remarks__counter {
  position: absolute;
  right: $spacing-sm;
  bottom: $spacing-xs;
  font-size: $font-xs;
  line-height: 1;
  color: $text-tertiary;
  pointer-events: none;
}
</style>
