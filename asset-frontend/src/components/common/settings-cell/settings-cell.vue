<!--
  组件名称：SettingsCell

  组件描述：设置页列表行，左侧标题、右侧可选箭头，点击整行向父组件抛出事件。

  组件参数说明：
  - label: 行标题文案
  - showChevron: 是否显示右侧箭头图标，默认 true

  组件事件说明：
  - tap: 用户点击该行时触发

  组件使用示例：
  <SettingsCell label="资产管理" @tap="goAsset" />
-->
<template>
  <view class="settings-cell" @tap="onTap">
    <text class="settings-cell__label">{{ label }}</text>
    <view v-if="showChevron" class="settings-cell__right">
      <image class="settings-cell__arrow" :src="arrowBoldIcon" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup lang="ts">
  /** 与 arrow-bold 一致为朝左资源，样式中 scaleX(-1) 作为向右箭头 */
  import arrowBoldIcon from '@/assets/icons/arrow-bold.png'
  import type { SettingsCellEmits, SettingsCellProps } from './types'

  withDefaults(defineProps<SettingsCellProps>(), {
    showChevron: true,
  })

  const emit = defineEmits<SettingsCellEmits>()

  defineOptions({ name: 'SettingsCell' })

  function onTap() {
    emit('tap')
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .settings-cell {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 72rpx;
    box-sizing: border-box;
  }

  .settings-cell__label {
    flex: 1;
    font-size: $font-sm;
    color: $text-primary;
  }

  .settings-cell__right {
    display: flex;
    align-items: center;
    margin-left: $spacing-md;
  }

  .settings-cell__arrow {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.45;
    /* 资源朝左，水平翻转后指向右侧 */
    transform: scaleX(-1);
  }
</style>
