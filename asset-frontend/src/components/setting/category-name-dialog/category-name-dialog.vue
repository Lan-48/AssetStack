<!--
  组件名称：CategoryNameDialog

  组件描述：分类名称录入居中弹层，布局与资料编辑弹窗昵称区一致（左关闭、中标题、右勾选、白底圆角输入），仅负责展示与事件，不请求接口。

  组件参数说明：
  - show: 是否展示（v-model:show）
  - title: 弹层标题，如「新增分类」「修改分类」
  - modelValue: 输入内容（v-model）
  - maxlength: 可选，默认 50
  - zIndex: 可选，默认 2100

  组件事件说明：
  - update:show: 显隐变化（点遮罩或左侧关闭时关闭）
  - update:modelValue: 输入变化
  - confirm: 点击右侧勾选时触发，参数为 trim 后的字符串

  组件使用示例：
  <CategoryNameDialog
    v-model:show="visible"
    v-model="name"
    title="新增分类"
    @confirm="onConfirm"
  />
-->
<template>
  <view v-if="show" class="category-name-dialog" :style="rootStyle">
    <view class="category-name-dialog__overlay" @tap="onClose" />
    <view class="category-name-dialog__panel" @tap.stop>
      <view class="category-name-dialog__card">
        <view class="category-name-dialog__header">
          <view
            class="category-name-dialog__icon-btn category-name-dialog__icon-btn--left"
            @tap="onClose"
          >
            <image class="category-name-dialog__icon" :src="cancelIcon" mode="aspectFit" />
          </view>
          <text class="category-name-dialog__title">{{ title }}</text>
          <view
            class="category-name-dialog__icon-btn category-name-dialog__icon-btn--right"
            @tap="onConfirmTap"
          >
            <image class="category-name-dialog__icon" :src="checkIcon" mode="aspectFit" />
          </view>
        </view>

        <view class="category-name-dialog__field">
          <input
            v-model="inputProxy"
            class="category-name-dialog__input"
            type="text"
            :maxlength="maxlength"
            placeholder="请输入分类名称"
            placeholder-class="category-name-dialog__placeholder"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import cancelIcon from '@/assets/icons/cancel.png'
  import checkIcon from '@/assets/icons/check.png'
  import type { CategoryNameDialogEmits, CategoryNameDialogProps } from './types'

  const props = withDefaults(defineProps<CategoryNameDialogProps>(), {
    maxlength: 50,
    zIndex: 2100
  })

  const emit = defineEmits<CategoryNameDialogEmits>()

  defineOptions({ name: 'CategoryNameDialog' })

  const rootStyle = computed(() => ({
    zIndex: props.zIndex
  }))

  const inputProxy = computed({
    get: () => props.modelValue,
    set: (v: string) => {
      emit('update:modelValue', v)
    }
  })

  function onClose() {
    emit('update:show', false)
  }

  function onConfirmTap() {
    emit('confirm', props.modelValue.trim())
  }
</script>

<style lang="scss" scoped>
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  /* 与 ProfileEditPopup 居中弹层结构对齐 */
  .category-name-dialog {
    position: fixed;
    inset: 0;
  }

  .category-name-dialog__overlay {
    position: absolute;
    inset: 0;
    background-color: $overlay-40;
  }

  .category-name-dialog__panel {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 640rpx;
  }

  .category-name-dialog__card {
    padding: $spacing-lg;
    border-radius: $radius-md;
    background-color: $bg-secondary;
    box-shadow: $shadow-elev-2;
  }

  .category-name-dialog__header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: $spacing-base;
    min-height: 56rpx;
  }

  .category-name-dialog__title {
    font-size: $font-base;
    color: $text-primary;
  }

  .category-name-dialog__icon-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56rpx;
    height: 56rpx;
    border-radius: $radius-full;
    background-color: $bg-primary;
    box-shadow: $shadow-elev-1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .category-name-dialog__icon-btn--left {
    left: 0;
  }

  .category-name-dialog__icon-btn--right {
    right: 0;
  }

  .category-name-dialog__icon {
    width: 28rpx;
    height: 28rpx;
  }

  .category-name-dialog__field {
    position: relative;
  }

  /* 胶囊形输入，与稿一致；配色与资料弹窗昵称输入一致 */
  .category-name-dialog__input {
    width: 100%;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: $bg-primary;
    padding: 0 $spacing-md;
    box-sizing: border-box;
    border: 1rpx solid $border-subtle;
    font-size: $font-base;
    color: $text-primary;
  }

  :deep(.category-name-dialog__placeholder) {
    color: $text-tertiary;
    font-size: $font-base;
  }
</style>
