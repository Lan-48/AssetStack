<!--
  组件名称：SettingsSection

  组件描述：设置页分组容器，提供与主题一致的白底圆角卡片与可选分组标题，内部由设置行等子组件填充。

  组件参数说明：
  - title: 可选，分组标题文案，显示在卡片上方

  组件事件说明：
  - 无: 暂无对外事件（布局容器，交互由子组件上报）

  组件使用示例：
  <SettingsSection title="数据">
    <SettingsCell label="数据导入" @tap="onImport" />
  </SettingsSection>
-->
<template>
  <view class="settings-section">
    <!-- 分组标题：有 title 时才渲染，与列表项区分层级 -->
    <text v-if="title" class="settings-section__title">{{ title }}</text>
    <view class="settings-section__card">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
  import type { SettingsSectionProps } from './types'

  withDefaults(defineProps<SettingsSectionProps>(), {
    title: '',
  })

  defineOptions({ name: 'SettingsSection' })
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .settings-section {
    margin-bottom: $spacing-lg;
  }

  .settings-section__title {
    display: block;
    margin-bottom: $spacing-sm;
    padding-left: $spacing-xs;
    font-size: $font-sm;
    color: $text-tertiary;
  }

  .settings-section__card {
    background-color: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-base $spacing-lg;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
</style>
