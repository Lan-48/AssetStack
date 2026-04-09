<!--
  组件名称：ProfileEditPopup

  组件描述：个人信息编辑弹窗组件，按模式独立展示昵称 / 手机号 / 头像编辑面板，居中弹出并带遮罩层。

  组件参数说明：
  - show: 是否显示弹窗（支持 v-model:show）
  - mode: 弹窗模式（nickname / phone / avatar）
  - nickname: 当前昵称
  - phone: 当前手机号
  - avatar: 当前头像地址
  - defaultAvatar: 默认头像地址
  - canSendCode: 是否允许发送验证码
  - countdown: 验证码倒计时（秒）

  组件事件说明：
  - update:show: 弹窗显隐变化时触发
  - save-nickname: 点击昵称确认时触发
  - send-code: 点击发送验证码时触发
  - save-phone: 点击手机号确认时触发
  - save-avatar: 点击头像确认时触发
  - clear-phone-send-error: 手机号输入变化时触发，用于清空父级的 phoneSendError

  组件使用示例：
  <ProfileEditPopup
    v-model:show="showProfilePopup"
    mode="nickname"
    :nickname="nickname"
    :phone="phone"
    :avatar="avatar"
    :default-avatar="defaultAvatar"
    :can-send-code="canSendCode"
    :countdown="countdown"
    @save-nickname="onSaveNickname"
  />
-->
<template>
  <view v-if="props.show" class="profile-edit-popup">
    <view class="profile-edit-popup__overlay" @tap="closePopup" />
    <view class="profile-edit-popup__panel">
      <view class="profile-card">
        <view
          class="profile-card__header"
          :class="{ 'profile-card__header--avatar': props.mode === 'avatar' }"
        >
          <view class="profile-card__cancel" @tap="closePopup">
            <image class="profile-card__header-icon" :src="cancelIcon" mode="aspectFit" />
          </view>
          <text class="profile-card__title">{{ titleText }}</text>
          <view class="profile-card__confirm" @tap="onConfirm">
            <image class="profile-card__header-icon" :src="checkIcon" mode="aspectFit" />
          </view>
        </view>

        <template v-if="props.mode === 'nickname'">
          <view class="profile-card__field">
            <input
              v-model="draftNickname"
              class="profile-card__input"
              maxlength="50"
              placeholder="请输入名称"
              placeholder-class="profile-card__placeholder"
            />
            <text v-if="nicknameError" class="profile-card__field-error">{{ nicknameError }}</text>
          </view>
        </template>

        <template v-else-if="props.mode === 'phone'">
          <view class="profile-card__field">
            <input
              v-model="draftPhone"
              class="profile-card__input"
              maxlength="11"
              type="number"
              placeholder="请输入手机号"
              placeholder-class="profile-card__placeholder"
            />
            <text v-if="phoneError || props.phoneSendError" class="profile-card__field-error">
              {{ phoneError || props.phoneSendError }}
            </text>
          </view>
          <view class="profile-card__field">
            <view class="profile-card__code-row">
              <input
                v-model="draftCode"
                class="profile-card__input profile-card__input--code"
                maxlength="6"
                type="number"
                placeholder="请输入验证码"
                placeholder-class="profile-card__placeholder"
              />
              <text
                class="profile-card__send"
                :class="{ 'profile-card__send--disabled': !props.canSendCode }"
                @tap="onSendCode"
              >
                {{ props.canSendCode ? '发送' : `${props.countdown}s` }}
              </text>
            </view>
            <text v-if="codeError || props.codeSendError" class="profile-card__field-error">
              {{ codeError || props.codeSendError }}
            </text>
          </view>
        </template>

        <template v-else>
          <view class="profile-card__avatar-area">
            <FileUploader
              v-model="avatarFileList"
              class="profile-card__avatar-uploader"
              :multiple="false"
              :max-count="1"
              preview-size="176rpx"
              :deletable="false"
              :preview-full-image="false"
              upload-text=""
            >
              <template #upload="{ onChoose }">
                <view
                  class="profile-card__avatar-circle"
                  @tap.stop="onChoose"
                  @click.stop="onChoose"
                >
                  <image class="profile-card__avatar-camera" :src="cameraIcon" mode="aspectFit" />
                </view>
              </template>
              <template #preview="{ file, onChoose }">
                <view
                  class="profile-card__avatar-circle"
                  @tap.stop="onChoose"
                  @click.stop="onChoose"
                >
                  <image class="profile-card__avatar-image" :src="file.url" mode="aspectFill" />
                </view>
              </template>
            </FileUploader>
            <text v-if="avatarError" class="profile-card__avatar-error">{{ avatarError }}</text>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import cancelIcon from '@/assets/icons/cancel.png'
  import cameraIcon from '@/assets/icons/camera.png'
  import checkIcon from '@/assets/icons/check.png'
  import FileUploader from '@/components/common/file-uploader/file-uploader.vue'
  import type { FileUploaderItem } from '@/components/common/file-uploader'
  import type { ProfileEditPopupEmits, ProfileEditPopupProps } from './types'

  const props = withDefaults(defineProps<ProfileEditPopupProps>(), {
    canSendCode: true,
    countdown: 0,
    phoneSendError: '',
    codeSendError: ''
  })

  const emit = defineEmits<ProfileEditPopupEmits>()

  const draftNickname = ref('')
  const draftPhone = ref('')
  const draftAvatar = ref('')
  const draftCode = ref('')
  const nicknameError = ref('')
  const phoneError = ref('')
  const codeError = ref('')
  const avatarError = ref('')
  const avatarFileList = computed<FileUploaderItem[]>({
    get() {
      return draftAvatar.value ? [{ url: draftAvatar.value }] : []
    },
    set(list) {
      draftAvatar.value = list[0]?.url || ''
    }
  })
  const titleText = computed(() => {
    if (props.mode === 'nickname') return '修改名称'
    if (props.mode === 'phone') return '修改手机号'
    return '上传头像'
  })

  watch(
    () => [props.show, props.mode],
    (visible) => {
      if (!visible[0]) return
      // 产品要求：弹窗打开时不回填原始数据，保持空态
      draftNickname.value = ''
      draftPhone.value = ''
      draftAvatar.value = ''
      draftCode.value = ''
      nicknameError.value = ''
      phoneError.value = ''
      codeError.value = ''
      avatarError.value = ''
    },
    { immediate: true }
  )

  watch(draftNickname, () => {
    nicknameError.value = ''
  })
  watch(draftPhone, () => {
    phoneError.value = ''
    emit('clear-phone-send-error')
  })
  watch(draftCode, () => {
    codeError.value = ''
    emit('clear-code-send-error')
  })
  watch(draftAvatar, () => {
    avatarError.value = ''
  })

  function closePopup() {
    emit('update:show', false)
  }

  function onSaveNickname() {
    emit('save-nickname', { nickname: draftNickname.value.trim() })
  }

  function onSendCode() {
    if (!props.canSendCode) return
    emit('clear-phone-send-error')
    const phoneStr = String(draftPhone.value ?? '')
      .trim()
      .replace(/\s/g, '')
    if (!phoneStr) {
      phoneError.value = '手机号不能为空'
      return
    }
    if (!isValidCnMobile(phoneStr)) {
      phoneError.value = '请输入正确手机号'
      return
    }
    emit('send-code', { phone: phoneStr })
  }

  function isValidCnMobile(phone: string): boolean {
    return /^1\d{10}$/.test(phone)
  }

  function onSavePhone() {
    emit('save-phone', {
      phone: String(draftPhone.value ?? '').trim(),
      code: String(draftCode.value ?? '').trim()
    })
  }

  function onSaveAvatar() {
    emit('save-avatar', { avatar: draftAvatar.value || props.defaultAvatar })
  }

  function onConfirm() {
    if (props.mode === 'nickname') {
      if (!draftNickname.value.trim()) {
        nicknameError.value = '名称不能为空'
        return
      }
      onSaveNickname()
      return
    }
    if (props.mode === 'phone') {
      emit('clear-phone-send-error')
      emit('clear-code-send-error')
      let hasError = false
      const phoneStr = String(draftPhone.value ?? '')
        .trim()
        .replace(/\s/g, '')
      if (!phoneStr) {
        phoneError.value = '手机号不能为空'
        hasError = true
      } else if (!isValidCnMobile(phoneStr)) {
        phoneError.value = '请输入正确手机号'
        hasError = true
      }
      if (!String(draftCode.value ?? '').trim()) {
        codeError.value = '验证码不能为空'
        hasError = true
      } else if (!/^\d{6}$/.test(String(draftCode.value ?? '').trim())) {
        codeError.value = '请输入6位验证码'
        hasError = true
      }
      if (hasError) return
      onSavePhone()
      return
    }
    if (!draftAvatar.value) {
      avatarError.value = '请点击上传头像'
      return
    }
    onSaveAvatar()
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .profile-edit-popup {
    position: fixed;
    inset: 0;
    z-index: 2001;
  }

  .profile-edit-popup__overlay {
    position: absolute;
    inset: 0;
    background-color: $overlay-40;
  }

  .profile-edit-popup__panel {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 640rpx;
  }

  .profile-card {
    padding: $spacing-lg;
    border-radius: $radius-md;
    background-color: $bg-secondary;
    box-shadow: $shadow-elev-2;
  }

  .profile-card__header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: $spacing-base;
  }

  .profile-card__header--avatar {
    min-height: 56rpx;
    margin-bottom: $spacing-md;
  }

  .profile-card__title {
    font-size: $font-base;
    color: $text-secondary;
  }

  .profile-card__cancel,
  .profile-card__confirm {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56rpx;
    height: 56rpx;
    border-radius: $radius-full;
    background-color: $bg-primary;
    box-shadow: $shadow-elev-1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-card__cancel {
    left: 0;
  }

  .profile-card__confirm {
    right: 0;
  }

  .profile-card__header-icon {
    width: 28rpx;
    height: 28rpx;
  }

  .profile-card__field {
    position: relative;
    padding-bottom: $spacing-lg;
  }

  .profile-card__field + .profile-card__field {
    margin-top: $spacing-sm;
  }

  .profile-card__field-error {
    position: absolute;
    left: $spacing-md;
    right: $spacing-md;
    bottom: 0;
    font-size: $font-xs;
    color: $danger;
    line-height: 34rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .profile-card__input {
    width: 100%;
    height: 72rpx;
    border-radius: $radius-sm;
    background-color: $bg-primary;
    padding: 0 $spacing-md;
    box-sizing: border-box;
    border: 1rpx solid $border-subtle;
    font-size: $font-base;
    color: $text-primary;
  }

  .profile-card__code-row {
    position: relative;
  }

  .profile-card__input--code {
    padding-right: 120rpx;
  }

  :deep(.profile-card__placeholder) {
    color: $text-tertiary;
    font-size: $font-base;
  }

  .profile-card__send {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    color: $primary;
    font-size: $font-base;
    line-height: 1;
  }

  .profile-card__send--disabled {
    color: $text-quaternary;
  }

  .profile-card__avatar-area {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-sm 0 $spacing-lg;
  }

  .profile-card__avatar-uploader {
    width: 176rpx;
    height: 176rpx;
  }

  .profile-card__avatar-uploader :deep(.file-uploader__list) {
    gap: 0;
  }

  .profile-card__avatar-uploader :deep(.file-uploader__item) {
    background-color: transparent;
    border-radius: 0;
    overflow: visible;
  }

  .profile-card__avatar-circle {
    width: 176rpx;
    height: 176rpx;
    border-radius: $radius-full;
    background-color: $bg-primary;
    border: 1rpx solid $border-subtle;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .profile-card__avatar-camera {
    width: 88rpx;
    height: 88rpx;
    opacity: 1;
  }

  .profile-card__avatar-image {
    width: 100%;
    height: 100%;
  }

  .profile-card__avatar-error {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    font-size: $font-xs;
    color: $danger;
    line-height: 34rpx;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
</style>
