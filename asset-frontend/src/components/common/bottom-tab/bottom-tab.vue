<!--
  组件名称：BottomTab

  组件描述：应用底部主导航，提供「资产」「服饰」切换与中间加号占位，并根据当前页面路由高亮对应 Tab。

  组件参数说明：
  - default: 无 props，高亮状态由当前路由与点击切换共同决定

  组件事件说明：
  - add-click: 点击中间加号按钮时触发

  组件使用示例：
  <BottomTab />
-->
<template>
  <view class="bottom-tab-container">
    <view class="tab-item" :class="{ active: activeTab === 'asset' }" @click="switchTab('asset')">
      <view class="tab-icon">资产</view>
    </view>
    <view class="tab-item add-btn" @click="addItem">
      <view class="add-icon">+</view>
    </view>
    <view class="tab-item" :class="{ active: activeTab === 'wardrobe' }" @click="switchTab('wardrobe')">
      <view class="tab-icon">服饰</view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { BottomTabName } from './types'

  defineOptions({ name: 'BottomTab' })
  const emit = defineEmits<{
    'add-click': []
  }>()

  const activeTab = ref<BottomTabName>('asset')

  /** 通知上层打开新增入口弹窗 */
  function addItem() {
    emit('add-click')
  }

  /** 根据当前页路由初始化高亮 Tab */
  onMounted(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
      const route = currentPage.route || ''
      activeTab.value = route.includes('wardrobe') ? 'wardrobe' : 'asset'
    }
  })

  function switchTab(tabName: BottomTabName) {
    activeTab.value = tabName

    if (tabName === 'asset') {
      uni.navigateTo({
        url: '/pages/asset/list/asset-list-page',
      })
    } else if (tabName === 'wardrobe') {
      uni.navigateTo({
        url: '/pages/wardrobe/list/wardrobe-list-page',
      })
    }
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .bottom-tab-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 365px;
    height: 80px;
    background-color: rgba($bg-secondary, $alpha-12);
    border-radius: $radius-tabbar;
    box-shadow: $shadow-tab-bar;

    .tab-item {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      &.active {
        .tab-icon {
          background-color: rgba($primary, $alpha-60);
          color: $bg-primary;
        }
      }

      &.add-btn {
        .add-icon {
          margin-top: -10px;
        }
      }
    }

    .tab-icon,
    .add-icon {
      width: 60px;
      height: 60px;
      border-radius: $radius-full;
      background-color: $border;
      color: $text-tertiary;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: $font-base;
      font-weight: bold;

      &.add-icon {
        font-size: $font-xl;
        width: 48px;
        height: 48px;
      }
    }
  }
</style>
