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
    <!-- 顶部用户信息卡片：头像 + 昵称/VIP + 手机号；右侧退出 -->
    <view class="user-card">
      <view class="user-card__main">
        <image
          class="user-card__avatar"
          :src="avatarDisplaySrc"
          mode="aspectFill"
          @tap="openAvatarPopup"
        />
        <view class="user-card__text">
          <view class="user-card__name-row">
            <text class="user-card__name" @tap="openNicknamePopup">{{ nicknameDisplay }}</text>
            <view class="user-card__badge">
              <text class="user-card__badge-text">VIP会员</text>
            </view>
          </view>
          <text class="user-card__phone" @tap="openPhonePopup">{{ phoneDisplay }}</text>
        </view>
      </view>
      <view class="user-card__logout" @tap.stop="onLogoutTap">
        <image class="user-card__logout-icon" :src="logoutIcon" mode="aspectFit" />
      </view>
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

    <ProfileEditPopup
      v-model:show="showProfilePopup"
      :mode="profilePopupMode"
      :nickname="userNickname"
      :phone="userPhone"
      :avatar="userAvatar"
      :default-avatar="defaultAvatarImg"
      :can-send-code="canSendProfileCode"
      :countdown="phoneCodeCountdown"
      :phone-send-error="profilePhoneSendError"
      :code-send-error="profileCodeSendError"
      @save-nickname="onSaveNickname"
      @send-code="onSendProfilePhoneCode"
      @save-phone="onSavePhone"
      @save-avatar="onSaveAvatar"
      @clear-phone-send-error="onClearProfilePhoneSendError"
      @clear-code-send-error="onClearProfileCodeSendError"
    />
  </view>
</template>

<script setup lang="ts">
  import { onUnmounted } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import defaultAvatarImg from '@/assets/images/avatar.jpg'
  import logoutIcon from '@/assets/icons/logout.png'
  import ProfileEditPopup from '@/components/common/profile-edit-popup/profile-edit-popup.vue'
  import SettingsCell from '@/components/common/settings-cell/settings-cell.vue'
  import SettingsSection from '@/components/common/settings-section/settings-section.vue'
  import { useSetting } from '@/services/pages/setting/use-setting'

  const {
    userNickname,
    userPhone,
    userAvatar,
    showProfilePopup,
    profilePopupMode,
    phoneCodeCountdown,
    profilePhoneSendError,
    profileCodeSendError,
    nicknameDisplay,
    phoneDisplay,
    avatarDisplaySrc,
    canSendProfileCode,
    init,
    dispose,
    openNicknamePopup,
    openPhonePopup,
    openAvatarPopup,
    onClearProfilePhoneSendError,
    onClearProfileCodeSendError,
    onSaveNickname,
    onSendProfilePhoneCode,
    onSavePhone,
    onSaveAvatar,
    onTap,
    onLogoutTap,
  } = useSetting({ defaultAvatar: defaultAvatarImg })

  onShow(() => {
    void init()
  })

  onUnmounted(() => {
    dispose()
  })
</script>

<style lang="scss" scoped>
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  /* 页面底色：与 Layout 内页一致的二级背景 */
  .settings-page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: $spacing-lg;
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

  .user-card__main {
    flex: 1;
    min-width: 0;
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
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-xs;
  }

  .user-card__name-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .user-card__name {
    font-size: $font-base;
    color: $text-primary;
  }

  .user-card__phone {
    font-size: $font-sm;
    color: $text-tertiary;
  }

  .user-card__badge {
    padding: 4rpx $spacing-sm;
    border-radius: $radius-xs;
    background-color: rgba($info, $alpha-20);
  }

  .user-card__badge-text {
    font-size: $font-xs;
    color: $warning;
  }

  .user-card__logout {
    flex-shrink: 0;
    padding: $spacing-sm;
    margin: (-$spacing-sm) (-$spacing-sm) (-$spacing-sm) $spacing-xs;
  }

  .user-card__logout-icon {
    width: 48rpx;
    height: 48rpx;
    display: block;
  }

  /* 设置分组内分割线 */
  .row-divider {
    width: 100%;
    height: 1px;
    margin: $spacing-sm 0;
    background-color: $border-subtle;
  }
</style>
