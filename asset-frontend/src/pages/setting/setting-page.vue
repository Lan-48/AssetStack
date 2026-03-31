<!--
  页面名称：设置页

  页面描述：展示用户信息入口、资产与数据相关设置项；使用原生导航栏（pages.json），与带 Layout 的 Tab 页区分。

  页面说明：
  - 依赖 pages.json 中 navigationStyle: default 与标题「设置」

  交互说明：
  - 各入口点击后目前为轻提示占位，后续可接具体路由或业务弹窗

  入口示例：
  - 底部 Tab 切换至设置，或 uni.navigateTo({ url: '/pages/setting/setting-page' })
-->
<template>
  <view class="settings-page">
    <!-- 顶部用户信息卡片：头像 + 昵称 + 会员标识 -->
    <view class="user-card" @tap="onUserTap">
      <view class="user-card__left">
        <!-- 圆形头像：aspectFill 保证铺满圆内，多余部分裁剪 -->
        <image class="user-card__avatar" :src="avatarImg" mode="aspectFill" />
        <view class="user-card__text">
          <text class="user-card__name">Lan</text>
          <view class="user-card__badge">
            <text class="user-card__badge-text">VIP 会员</text>
          </view>
        </view>
      </view>
      <image class="user-card__arrow" :src="arrowBoldIcon" mode="aspectFit" />
    </view>

    <!-- 资产相关 -->
    <SettingsSection>
      <SettingsCell label="资产管理" @tap="onTap('资产管理')" />
      <view class="row-divider" />
      <SettingsCell label="分类管理" @tap="onTap('分类管理')" />
    </SettingsSection>

    <!-- 数据相关 -->
    <SettingsSection>
      <SettingsCell label="数据导入" @tap="onTap('数据导入')" />
      <view class="row-divider" />
      <SettingsCell label="数据导出" @tap="onTap('数据导出')" />
    </SettingsSection>

    <!-- 偏好 -->
    <SettingsSection>
      <SettingsCell label="货币单位切换" @tap="onTap('货币单位切换')" />
    </SettingsSection>
  </view>
</template>

<script setup lang="ts">
  /** 与 arrow-bold 一致为朝左资源，样式中 scaleX(-1) 作为向右箭头 */
  import arrowBoldIcon from '@/assets/icons/arrow-bold.png'
  import avatarImg from '@/assets/images/avatar.jpg'
  import SettingsCell from '@/components/common/settings-cell/settings-cell.vue'
  import SettingsSection from '@/components/common/settings-section/settings-section.vue'

  /** 列表项点击：占位逻辑，后续替换为跳转或弹窗 */
  function onTap(name: string) {
    console.log(`${name} 点击`)
    uni.showToast({ title: `${name}（待接入）`, icon: 'none' })
  }

  /** 用户信息区点击 */
  function onUserTap() {
    onTap('用户资料')
  }
</script>

<style lang="scss" scoped>
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  /* 页面底色：与 Layout 内页一致的二级背景 */
  .settings-page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: $spacing-md $spacing-lg;
    padding-bottom: calc($spacing-xl + env(safe-area-inset-bottom));
    background-color: $bg-secondary;
  }

  /* 用户信息卡片：与设置分组卡片视觉层级一致，略增高以容纳头像 */
  .user-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 164rpx;
    margin-bottom: $spacing-lg;
    padding: $spacing-base $spacing-lg;
    background-color: $bg-primary;
    border-radius: $radius-md;
    box-sizing: border-box;
  }

  .user-card__left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $spacing-md;
  }

  .user-card__avatar {
    flex-shrink: 0;
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-full;
    overflow: hidden;
    background-color: $bg-tertiary;
  }

  .user-card__text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-xs;
  }

  .user-card__name {
    font-size: $font-md;
    font-weight: 600;
    color: $text-primary;
  }

  /* 会员角标：使用主题语义色，避免硬编码 */
  .user-card__badge {
    align-self: flex-start;
    padding: 4rpx $spacing-sm;
    border-radius: $radius-xs;
    background-color: $fill-tag-active-soft;
  }

  .user-card__badge-text {
    font-size: $font-xs;
    color: $caution;
  }

  .user-card__arrow {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.45;
    /* 资源朝左，水平翻转后指向右侧 */
    transform: scaleX(-1);
  }

  /* 设置分组内分割线 */
  .row-divider {
    width: 100%;
    height: 1px;
    margin: $spacing-sm 0;
    background-color: $border-subtle;
  }
</style>
