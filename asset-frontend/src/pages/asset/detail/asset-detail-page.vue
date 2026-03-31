<template>
    <view class="page">
      <text class="hint">待开发</text>
    </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;
.page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding-bottom: 120rpx;
}

.hint {
  font-size: $font-base;
  color: $text-tertiary;
}
</style>
