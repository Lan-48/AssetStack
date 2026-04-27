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
      :avatar-src="navAvatarUrl"
      @menu-click="onMenuClick"
      @search-click="onSearchClick"
      @setting-click="onSettingClick"
    />

    <!-- 主内容区域 -->
    <view class="main-content">
      <slot />
    </view>

    <!-- 底部自定义 Tab（含加号） -->
    <BottomTab @add-click="openAddPopup" />

    <AssetFormPopup
      v-model:show="showAddAssetPopup"
      mode="create"
      :submitting="submittingAsset"
      @submit="onAddAsset"
    />
  </view>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { createAsset } from '@/api/asset-api'
  import { getUserInfo } from '@/api'
  import CustomNavBar from '@/components/common/custom-nav-bar/custom-nav-bar.vue'
  import BottomTab from '@/components/common/bottom-tab/bottom-tab.vue'
  import AssetFormPopup from '@/components/asset/asset-form-popup/asset-form-popup.vue'
  import type { AssetFormSubmitPayload } from '@/components/asset/asset-form-popup/types'
  import { getToken } from '@/utils/auth'

  defineOptions({ name: 'AppLayout' })

  /** 用户头像 URL（空则 CustomNavBar 使用默认占位图） */
  const navAvatarUrl = ref('')

  async function loadNavUserAvatar() {
    if (!getToken()) {
      navAvatarUrl.value = ''
      return
    }
    try {
      const res = await getUserInfo({ showErrorToast: false })
      const user = res?.data
      const avatar = user?.avatar?.trim()
      navAvatarUrl.value = avatar ?? ''
    } catch {
      /* 未登录或网络失败时保留占位图，不打断页面 */
    }
  }

  /** 小程序胶囊以下起始位置 + 与 $spacing-md(24rpx) 一致的额外顶距 */
  const containerStyle = ref({})
  const showAddAssetPopup = ref(false)
  const submittingAsset = ref(false)

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
      paddingTop: `${insetPx + spacingMdPx}px`
    }
  }

  syncTopSafeArea()
  onMounted(() => {
    nextTick(syncTopSafeArea)
    loadNavUserAvatar()
    uni.$on('user:profile-changed', loadNavUserAvatar)
  })

  onUnmounted(() => {
    uni.$off('user:profile-changed', loadNavUserAvatar)
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

  function openAddPopup() {
    showAddAssetPopup.value = true
  }

  async function onAddAsset(payload: AssetFormSubmitPayload) {
    if (submittingAsset.value) return
    submittingAsset.value = true

    // 与后端 CreateAssetDto 对齐：字段名保持一致，便于接口直传与后续排查。
    const warranty = (payload.warrantyDate ?? '').trim()
    const requestPayload = {
      name: payload.name,
      category: payload.category,
      categoryId: payload.categoryId ?? undefined,
      price: payload.price,
      purchaseDate: payload.purchaseDate,
      warrantyDate: warranty === '' ? undefined : warranty,
      status: payload.status,
      description: payload.description,
      imageUrl: payload.imageUrl || undefined
    }

    try {
      await createAsset(requestPayload)
      showAddAssetPopup.value = false
      uni.showToast({
        title: '新增成功',
        icon: 'success'
      })
      // 通知列表页刷新，避免用户返回时看到旧数据。
      uni.$emit('asset:changed')
    } catch (error) {
      console.error('新增资产失败:', error)
      uni.showToast({
        title: '新增失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      submittingAsset.value = false
    }
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
