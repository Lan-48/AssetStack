import { computed, ref } from 'vue'
import { getUserInfo, logout, sendLoginCode, updateUserInfo } from '@/api'
import { AUTH_ERROR_CODE } from '@/constants/auth-error-codes'
import {
  normalizeMobileDigits,
  normalizeRequestErrorCode,
  normalizeRequestErrorMessage,
} from '@/services/functions/auth-function'
import { isRemoteAvatarUrl, uploadAvatarFile } from '@/utils/upload-avatar'
import { clearToken, getToken, setToken } from '@/utils/auth'
import type {
  SaveAvatarPayload,
  SaveNicknamePayload,
  SavePhonePayload,
  SendPhoneCodePayload,
  UseSettingOptions,
} from './types'

export function useSetting(options: UseSettingOptions) {
  const userNickname = ref('')
  const userPhone = ref('')
  const userAvatar = ref('')
  const showProfilePopup = ref(false)
  const profilePopupMode = ref<'nickname' | 'phone' | 'avatar'>('nickname')
  const sendingPhoneCode = ref(false)
  const phoneCodeCountdown = ref(0)
  const profilePhoneSendError = ref('')
  const profileCodeSendError = ref('')
  const profileLastMockCode = ref('')
  const profileLastCodePhone = ref('')
  let phoneCodeTimer: ReturnType<typeof setInterval> | null = null

  const nicknameDisplay = computed(() => {
    const name = userNickname.value.trim()
    return name || '用户'
  })

  const phoneDisplay = computed(() => {
    const phone = userPhone.value.trim()
    return phone || '—'
  })

  const avatarDisplaySrc = computed(() => {
    const src = userAvatar.value.trim()
    return src ? src : options.defaultAvatar
  })

  const canSendProfileCode = computed(() => {
    return !sendingPhoneCode.value && phoneCodeCountdown.value === 0
  })

  function isValidPhone(phone: string) {
    return /^1\d{10}$/.test(phone.trim())
  }

  function isRegisteredPhoneConflictError(res: unknown, message: string): boolean {
    const code = normalizeRequestErrorCode(res)
    if (code === AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS) return true
    const status = (res as { statusCode?: number })?.statusCode
    if (status !== 400) return false
    return /已注册|已存在/u.test(message)
  }

  function clearPhoneCountdown() {
    if (!phoneCodeTimer) return
    clearInterval(phoneCodeTimer)
    phoneCodeTimer = null
  }

  function startPhoneCountdown() {
    phoneCodeCountdown.value = 60
    clearPhoneCountdown()
    phoneCodeTimer = setInterval(() => {
      phoneCodeCountdown.value -= 1
      if (phoneCodeCountdown.value <= 0) {
        phoneCodeCountdown.value = 0
        clearPhoneCountdown()
      }
    }, 1000)
  }

  async function loadUserProfile() {
    if (!getToken()) return
    try {
      const response = await getUserInfo()
      console.log('后端返回的完整数据:', response)
      const user = response?.data
      if (!user) return
      userNickname.value = user.nickname ?? ''
      userPhone.value = user.phone ?? ''
      userAvatar.value = user.avatar ?? ''
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  function openNicknamePopup() {
    profilePhoneSendError.value = ''
    profilePopupMode.value = 'nickname'
    showProfilePopup.value = true
  }

  function openPhonePopup() {
    profilePhoneSendError.value = ''
    profileCodeSendError.value = ''
    profileLastMockCode.value = ''
    profileLastCodePhone.value = ''
    profilePopupMode.value = 'phone'
    showProfilePopup.value = true
  }

  function openAvatarPopup() {
    profilePhoneSendError.value = ''
    profilePopupMode.value = 'avatar'
    showProfilePopup.value = true
  }

  function onClearProfilePhoneSendError() {
    profilePhoneSendError.value = ''
  }

  function onClearProfileCodeSendError() {
    profileCodeSendError.value = ''
  }

  async function onSaveNickname(payload: SaveNicknamePayload) {
    const nickname = payload.nickname.trim()
    if (!nickname) return
    try {
      /** 仅改昵称：不要回传头像。展示用签名 URL 常超过后端 avatar 255 字上限，会触发 400 */
      await updateUserInfo({ nickname }, { showErrorToast: false })
      userNickname.value = nickname
      uni.showToast({ title: '修改成功', icon: 'success' })
      showProfilePopup.value = false
      uni.$emit('user:profile-changed')
    } catch (error) {
      console.error('修改昵称失败:', error)
    }
  }

  async function onSendProfilePhoneCode(payload: SendPhoneCodePayload) {
    const phone = String(payload.phone ?? '')
      .trim()
      .replace(/\s/g, '')
    profilePhoneSendError.value = ''
    profileCodeSendError.value = ''

    if (!isValidPhone(phone)) {
      profilePhoneSendError.value = '请输入正确手机号'
      return
    }

    const curDigits = normalizeMobileDigits(userPhone.value)
    const inDigits = normalizeMobileDigits(phone)
    if (curDigits.length >= 11 && inDigits === curDigits) {
      profilePhoneSendError.value = '与当前绑定手机号相同'
      return
    }

    if (!canSendProfileCode.value) return

    sendingPhoneCode.value = true
    try {
      const response = await sendLoginCode(
        { phone, purpose: 'register' },
        { showErrorToast: false },
      )
      console.log('发送修改手机号验证码接口返回:', response)
      profileLastCodePhone.value = phone
      profileLastMockCode.value = response?.data?.mockCode ?? ''
      if (import.meta.env.DEV) {
        const mockCode = response?.data?.mockCode
        if (mockCode) {
          console.log('[H5 联调] 修改手机号验证码:', mockCode)
        } else {
          console.log(
            '[H5 联调] 本次响应未带 mockCode（生产可关 SMS_MOCK_MODE）',
            response?.data,
          )
        }
      }
      startPhoneCountdown()
    } catch (error) {
      const code = normalizeRequestErrorCode(error)
      const msg = normalizeRequestErrorMessage(error)
      if (code === AUTH_ERROR_CODE.SAME_BOUND_PHONE) {
        profilePhoneSendError.value = '与当前绑定手机号相同'
      } else if (
        code === AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS ||
        isRegisteredPhoneConflictError(error, msg)
      ) {
        const cur = normalizeMobileDigits(userPhone.value)
        const sent = normalizeMobileDigits(phone)
        profilePhoneSendError.value =
          cur.length >= 11 && sent === cur ? '与当前绑定手机号相同' : '手机号已存在'
      } else if (code === AUTH_ERROR_CODE.SEND_CODE_TOO_FREQUENT) {
        profilePhoneSendError.value = msg || '发送太频繁，请稍后再试'
      } else {
        console.error('发送手机号修改验证码失败:', error)
        profilePhoneSendError.value = msg || '发送失败'
      }
    } finally {
      sendingPhoneCode.value = false
    }
  }

  async function onSavePhone(payload: SavePhonePayload) {
    const phone = payload.phone.trim()
    const code = payload.code.trim()
    profileCodeSendError.value = ''
    if (!isValidPhone(phone)) {
      profilePhoneSendError.value = '请输入正确手机号'
      return
    }
    if (!/^\d{6}$/.test(code)) {
      profileCodeSendError.value = '请输入6位验证码'
      return
    }
    if (
      import.meta.env.DEV &&
      profileLastMockCode.value &&
      profileLastCodePhone.value === phone &&
      code !== profileLastMockCode.value
    ) {
      profileCodeSendError.value = '验证码错误'
      return
    }
    try {
      const response = await updateUserInfo({ phone, code }, { showErrorToast: false })
      console.log('修改手机号接口返回:', response)
      const nextToken = response?.data?.token
      if (nextToken) {
        setToken(nextToken)
      }
      userPhone.value = phone
      profilePhoneSendError.value = ''
      profileCodeSendError.value = ''
      profileLastMockCode.value = ''
      profileLastCodePhone.value = ''
      clearPhoneCountdown()
      phoneCodeCountdown.value = 0
      showProfilePopup.value = false
      uni.showToast({ title: '手机号修改成功', icon: 'success' })
      uni.$emit('user:profile-changed')
    } catch (error) {
      const errorCode = normalizeRequestErrorCode(error)
      const msg = normalizeRequestErrorMessage(error)
      if (
        errorCode === AUTH_ERROR_CODE.SAME_BOUND_PHONE ||
        /与当前绑定手机号相同/u.test(msg)
      ) {
        profilePhoneSendError.value = '与当前绑定手机号相同'
        return
      }
      if (
        errorCode === AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS ||
        /已注册|已存在/u.test(msg)
      ) {
        profilePhoneSendError.value = '手机号已存在'
        return
      }
      if (
        errorCode === AUTH_ERROR_CODE.VERIFY_CODE_REQUIRED ||
        /请先输入验证码/u.test(msg)
      ) {
        profileCodeSendError.value = '请先输入验证码'
        return
      }
      if (
        errorCode === AUTH_ERROR_CODE.VERIFY_CODE_INVALID ||
        /验证码错误/u.test(msg)
      ) {
        profileCodeSendError.value = '验证码错误'
        return
      }
      if (
        errorCode === AUTH_ERROR_CODE.VERIFY_CODE_NOT_SENT ||
        /已过期|请先发送验证码/u.test(msg)
      ) {
        profileCodeSendError.value = msg || '验证码无效'
        return
      }
      console.error('修改手机号失败:', error)
      profileCodeSendError.value = msg || '修改失败'
    }
  }

  async function onSaveAvatar(payload: SaveAvatarPayload) {
    let avatarUrl = (payload.avatar || '').trim()
    try {
      if (avatarUrl && !isRemoteAvatarUrl(avatarUrl)) {
        const up = await uploadAvatarFile(avatarUrl)
        avatarUrl = up.key
      }
      await updateUserInfo(
        {
          nickname: userNickname.value || '用户',
          avatar: avatarUrl,
        },
        { showErrorToast: false },
      )
      await loadUserProfile()
      uni.showToast({ title: '修改成功', icon: 'success' })
      showProfilePopup.value = false
      uni.$emit('user:profile-changed')
    } catch (error) {
      console.error('修改头像失败:', error)
      uni.showToast({ title: '头像上传失败，请重试', icon: 'none' })
    }
  }

  function onTap(name: string) {
    if (name === '分类管理') {
      uni.navigateTo({ url: '/pages/setting/category-manage-page' })
      return
    }
    console.log(`${name} 点击`)
  }

  function onLogoutTap() {
    uni.showModal({
      title: '退出登录',
      content: '确定退出当前账号吗？',
      success: async (res) => {
        if (!res.confirm) return

        const token = getToken()
        try {
          if (token) await logout(token)
        } catch (error) {
          console.error('退出登录接口失败:', error)
        } finally {
          clearToken()
          uni.reLaunch({ url: '/pages/login/login-page' })
        }
      },
    })
  }

  return {
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
    init: loadUserProfile,
    dispose: clearPhoneCountdown,
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
  }
}
