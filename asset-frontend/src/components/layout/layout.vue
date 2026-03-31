<!--
  组件名称：AppLayout

  组件描述：应用壳层布局，包含顶部自定义导航、主内容区与底部 Tab，并按安全区与主题间距设置顶部内边距。

  组件参数说明：
  - default: 默认插槽，页面主体内容渲染于导航栏与底部 Tab 之间

  组件事件说明：
  - 无: 暂无对外事件（导航栏点击仅在内部占位日志，后续可接业务）

  组件使用示例：
  <AppLayout>
    <view class="page">页面内容</view>
  </AppLayout>
-->
<template>
  <view class="layout-container" :style="containerStyle">
    <!-- 顶部自定义导航栏 -->
    <CustomNavBar
      @menu-click="onMenuClick"
      @search-click="onSearchClick"
      @setting-click="onSettingClick"
    />

    <!-- 主内容区域 -->
    <view class="main-content">
      <slot />
    </view>

    <!-- 底部自定义 Tab（含加号） -->
    <BottomTab />
  </view>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import CustomNavBar from '@/components/common/custom-nav-bar/custom-nav-bar.vue'
  import BottomTab from '@/components/common/bottom-tab/bottom-tab.vue'

  defineOptions({ name: 'AppLayout' })

  /** 小程序胶囊以下起始位置 + 与 $spacing-md(24rpx) 一致的额外顶距 */
  const containerStyle = ref({})

  function syncTopSafeArea() {
    let insetPx = 0
    // #ifdef MP-WEIXIN
    try {
      const mb = uni.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.bottom === 'number' && mb.bottom > 0) {
        insetPx = mb.bottom
      }
    } catch {
      /* 胶囊信息不可用时走 statusBar / safeArea 回退 */
    }
    // #endif

    if (!insetPx) {
      const sys = uni.getSystemInfoSync()
      insetPx = sys.safeAreaInsets?.top ?? sys.statusBarHeight ?? 0
    }

    const spacingMdPx = uni.upx2px(24)
    containerStyle.value = {
      paddingTop: `${insetPx + spacingMdPx}px`,
    }
  }

  syncTopSafeArea()
  onMounted(() => {
    nextTick(syncTopSafeArea)
  })

  const onMenuClick = () => {
    console.log('点击菜单')
    // 可以打开侧边栏、抽屉等
  }

  const onSearchClick = () => {
    console.log('点击搜索')
  }

  const onSettingClick = () => {
    console.log('点击设置')
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .layout-container {
    background-color: $bg-secondary;
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: $spacing-md;
    box-sizing: border-box;
  }

  .main-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
