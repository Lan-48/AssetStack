<template>
  <view class="login-page">
    <image class="login-page__bg" :src="backgroundImageSrc" mode="aspectFill" aria-hidden="true" />
    <view class="login-page__content">
      <view class="login-card" :class="{ 'login-card--register': isRegisterMode }">
        <view v-if="isRegisterMode" class="register-top-bar">
          <view class="register-avatar-slot">
            <FileUploader
              v-model="registerAvatarFileList"
              class="register-avatar-uploader"
              :multiple="false"
              :max-count="1"
              preview-size="88px"
              :deletable="false"
              :preview-full-image="false"
              upload-text=""
            >
              <template #upload="{ onChoose }">
                <view class="register-avatar-btn" @tap.stop="onChoose" @click.stop="onChoose">
                  <image class="register-avatar-icon" :src="cameraIcon" mode="aspectFit" />
                </view>
              </template>
              <template #preview="{ file, onChoose }">
                <view class="register-avatar-btn" @tap.stop="onChoose" @click.stop="onChoose">
                  <image class="register-avatar-image" :src="file.url" mode="aspectFill" />
                </view>
              </template>
            </FileUploader>
          </view>
          <text class="register-login-link" @tap="goToLoginForm">登录</text>
        </view>

        <view v-if="!isRegisterMode" class="card-header">
          <text class="card-title">欢迎登陆</text>
          <text class="card-link" @tap="toggleMode">注册</text>
        </view>

        <view class="form-panel">
          <template v-if="!isRegisterMode">
            <view class="field-row">
              <text class="field-label">手机号</text>
              <input
                v-model="phone"
                class="field-input"
                type="number"
                maxlength="11"
                placeholder="请输入手机号"
                placeholder-class="field-placeholder"
              />
              <text v-if="phoneError" class="field-error">{{ phoneError }}</text>
            </view>

            <view class="field-row">
              <text class="field-label">验证码</text>
              <view class="code-line">
                <input
                  v-model="code"
                  class="field-input field-input--code"
                  type="number"
                  maxlength="6"
                  placeholder="请输入验证码"
                  placeholder-class="field-placeholder"
                />
                <text v-if="canSendCode" class="code-action code-action--send" @tap="onSendCode">
                  发送
                </text>
                <text v-else class="code-action code-action--countdown">{{ countdown }}s</text>
              </view>
              <text v-if="codeError" class="field-error">{{ codeError }}</text>
            </view>
          </template>

          <template v-else>
            <view class="field-row">
              <text class="field-label">用户名</text>
              <input
                v-model="registerNickname"
                class="field-input"
                maxlength="50"
                placeholder="请输入用户名"
                placeholder-class="field-placeholder"
              />
              <text v-if="nicknameError" class="field-error">{{ nicknameError }}</text>
            </view>

            <view class="field-row">
              <text class="field-label">手机号</text>
              <input
                v-model="phone"
                class="field-input"
                type="number"
                maxlength="11"
                placeholder="请输入手机号"
                placeholder-class="field-placeholder"
              />
              <text v-if="phoneError" class="field-error">{{ phoneError }}</text>
            </view>

            <view class="field-row">
              <text class="field-label">验证码</text>
              <view class="code-line">
                <input
                  v-model="code"
                  class="field-input field-input--code"
                  type="number"
                  maxlength="6"
                  placeholder="请输入验证码"
                  placeholder-class="field-placeholder"
                />
                <text v-if="canSendCode" class="code-action code-action--send" @tap="onSendCode">
                  发送
                </text>
                <text v-else class="code-action code-action--countdown">{{ countdown }}s</text>
              </view>
              <text v-if="codeError" class="field-error">{{ codeError }}</text>
            </view>
          </template>

          <text v-if="formError" class="form-error">{{ formError }}</text>
        </view>

        <button class="login-btn" :class="{ 'login-btn--disabled': !canSubmit }" @tap="onSubmit">
          {{ submitText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, onUnmounted } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import backgroundImageSrc from '@/assets/images/background-image.png'
  import cameraIcon from '@/assets/icons/camera.png'
  import FileUploader from '@/components/common/file-uploader/file-uploader.vue'
  import type { FileUploaderItem } from '@/components/common/file-uploader'
  import { useLogin } from '@/services/pages/login/use-login'

  const {
    phone,
    code,
    registerNickname,
    registerAvatar,
    nicknameError,
    phoneError,
    codeError,
    formError,
    isRegisterMode,
    canSendCode,
    canSubmit,
    countdown,
    submitText,
    toggleMode,
    goToLoginForm,
    onSendCode,
    onSubmit,
    init,
    dispose
  } = useLogin()

  const registerAvatarFileList = computed<FileUploaderItem[]>({
    get() {
      return registerAvatar.value ? [{ url: registerAvatar.value }] : []
    },
    set(list) {
      registerAvatar.value = list[0]?.url || ''
    }
  })

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

  .login-page {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
  }

  .login-page__bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .login-page__content {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    min-height: 100vh;
    padding: $spacing-xl $spacing-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .login-card {
    background-color: $bg-primary;
    border-radius: $radius-sm;
    box-shadow: $shadow-elev-2;
    padding: $spacing-lg;
    width: 640rpx;
    box-sizing: border-box;
  }

  .login-card--register {
    padding-top: $spacing-lg;
    position: relative;
    overflow: visible;
  }

  .register-top-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 88px;
    margin-top: -66px;
    margin-bottom: $spacing-md;
    padding: 0 $spacing-sm;
    box-sizing: border-box;
  }

  .register-avatar-slot {
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .register-avatar-uploader {
    width: 88px;
    height: 88px;
  }

  .register-avatar-uploader :deep(.file-uploader__list) {
    gap: 0;
  }

  .register-avatar-uploader :deep(.file-uploader__item) {
    background-color: transparent;
    border-radius: 0;
    overflow: visible;
  }

  .register-login-link {
    position: absolute;
    right: $spacing-sm;
    top: 82%;
    transform: translateY(-50%);
    z-index: 3;
    color: $primary;
    font-size: $font-sm;
    line-height: $font-sm;
  }

  .register-avatar-btn {
    width: 88px;
    height: 88px;
    border-radius: $radius-full;
    background-color: #b6845c;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: $shadow-elev-2;
  }

  .register-avatar-image {
    width: 100%;
    height: 100%;
  }

  .register-avatar-icon {
    width: 56rpx;
    height: 56rpx;
  }

  .card-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56rpx;
    margin-bottom: $spacing-md;
    padding: 0 96rpx;
    box-sizing: border-box;
  }

  .card-title {
    width: 100%;
    text-align: center;
    font-size: $font-lg;
    line-height: $font-lg;
    color: $text-primary;
  }

  .card-link {
    position: absolute;
    right: $spacing-sm;
    top: 50%;
    transform: translateY(-50%);
    color: $primary;
    font-size: $font-sm;
    line-height: $font-sm;
  }

  .form-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    background-color: $bg-secondary;
    border-radius: $radius-sm;
    padding: $spacing-lg $spacing-md;
  }

  .field-row {
    display: flex;
    align-items: center;
    position: relative;
    min-height: 56rpx;
  }

  .field-error {
    position: absolute;
    left: 130rpx;
    top: calc(100% + 4rpx);
    max-width: calc(100% - 130rpx);
    font-size: $font-xs;
    color: $danger;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .form-error {
    position: absolute;
    left: 130rpx;
    bottom: $spacing-xs;
    max-width: calc(100% - 130rpx);
    font-size: $font-xs;
    color: $danger;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .field-label {
    flex-shrink: 0;
    width: 116rpx;
    font-size: $font-sm;
    color: $text-primary;
    line-height: 56rpx;
    display: flex;
    align-items: center;
    align-self: stretch;
  }

  .field-input {
    flex: 1;
    height: 76rpx;
    padding: 0 $spacing-sm;
    border: none;
    border-radius: $radius-full;
    font-size: $font-sm;
    line-height: 56rpx;
    color: $text-secondary;
    background-color: $bg-primary;
    box-sizing: border-box;
  }

  .field-input--code {
    flex: 1;
    min-width: 0;
    padding-right: 112rpx;
  }

  :deep(.field-placeholder) {
    color: $text-tertiary;
    font-size: $font-xs;
  }

  .code-line {
    flex: 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    position: relative;
    min-height: 56rpx;
  }

  .code-line .field-input {
    align-self: center;
  }

  .code-action {
    position: absolute;
    right: $spacing-sm;
    top: 50%;
    transform: translateY(-50%);
    flex-shrink: 0;
    font-size: $font-sm;
    line-height: $font-sm;
    display: flex;
    align-items: center;
    height: 56rpx;
    z-index: 1;
  }

  .code-action--send {
    color: $primary;
  }

  .code-action--countdown {
    color: $text-quaternary;
    min-width: 72rpx;
    text-align: right;
  }

  .login-btn {
    width: 100%;
    margin-top: $spacing-lg;
    padding: 0;
    border: none;
    border-radius: $radius-lg;
    font-size: $font-sm;
    color: $text-white;
    background-color: rgba($primary, $alpha-80);
  }

  .login-btn::after {
    border: none;
    background-color: transparent;
  }

  .login-btn--disabled {
    background-color: rgba($primary, $alpha-40);
    color: $text-white;
  }
</style>
