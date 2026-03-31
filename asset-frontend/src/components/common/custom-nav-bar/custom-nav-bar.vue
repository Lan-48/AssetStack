<!--
  组件名称：CustomNavBar

  组件描述：页面顶部自定义导航条，左侧菜单、中部搜索入口、右侧圆形用户头像；右侧点击后仍会抛出 setting-click 并跳转设置页。

  组件参数说明：
  - 无: 暂无对外 props，头像资源为 @/assets/images/avatar.jpg（import 绑定）

  组件事件说明：
  - menu-click: 点击左侧菜单区域时触发
  - search-click: 点击中部搜索区域时触发
  - setting-click: 点击右侧头像区域时触发（触发后仍会 navigateTo 设置页）

  组件使用示例：
  <CustomNavBar
    @menu-click="onMenu"
    @search-click="onSearch"
    @setting-click="onSetting"
  />
-->
<template>
  <view class="custom-nav-bar">
    <view class="nav-left" @click="onMenuClick">
      <view class="menu-icon">
        <view class="menu-line" />
        <view class="menu-line" />
        <view class="menu-line" />
      </view>
    </view>

    <view class="search-bar" @click="onSearchClick">
      <text class="icon-search">🔍</text>
      <text class="search-text">输入关键词</text>
    </view>

    <view class="nav-right" @click="onSettingClick">
      <image class="avatar-img" :src="avatarImg" mode="aspectFill" />
    </view>
  </view>
</template>

<script setup lang="ts">
  import avatarImg from '@/assets/images/avatar.jpg'
  import type { CustomNavBarEmits } from './types'

  const emit = defineEmits<CustomNavBarEmits>()

  defineOptions({ name: 'CustomNavBar' })

  function onMenuClick() {
    emit('menu-click')
  }

  function onSearchClick() {
    emit('search-click')
  }

  function onSettingClick() {
    emit('setting-click')
    uni.navigateTo({
      url: '/pages/setting/setting-page',
    })
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .custom-nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: $spacing-base * 2;
    position: relative;
  }

  .nav-left {
    width: $spacing-base * 2;
    height: $spacing-base * 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $bg-primary;
    border-radius: $radius-md;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .menu-icon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-xs;
    width: $spacing-base;
  }

  .menu-line {
    height: $spacing-xs * 0.5;
    background-color: $text-primary;
    border-radius: $spacing-xs * 0.25;
  }

  .search-bar {
    flex: 1;
    height: $spacing-base * 2;
    background-color: $bg-primary;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    padding: 0 $spacing-md;
    margin: 0 $spacing-lg;
    box-sizing: border-box;
    min-width: 0;
  }

  .icon-search {
    font-size: $spacing-base;
    margin-right: $spacing-xs;
    flex-shrink: 0;
    line-height: 1;
  }

  .search-text {
    font-size: $font-base;
    color: $text-tertiary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-right {
    width: $spacing-lg * 2;
    height: $spacing-lg * 2;
    flex-shrink: 0;
    border-radius: $radius-full;
    overflow: hidden;
    background-color: $bg-primary;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
