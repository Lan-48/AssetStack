import { computed, ref, watch } from 'vue'
import { getUserInfo, loginByPhoneCode, sendLoginCode, updateUserInfo } from '@/api'
import { AUTH_ERROR_CODE } from '@/constants/auth-error-codes'
import { normalizeRequestErrorMessage } from '@/services/functions/auth-function'
import { isRemoteAvatarUrl, uploadAvatarFile } from '@/utils/upload-avatar'
import { clearToken, isLoggedIn, setToken } from '@/utils/auth'
import type { FormMode } from './types'

export function useLogin() {
  const formMode = ref<FormMode>('login')
  const phone = ref('')
  const code = ref('')
  const sendingCode = ref(false)
  const loggingIn = ref(false)
  const registerNickname = ref('')
  const registerAvatar = ref('')
  const registering = ref(false)
  const checkingSession = ref(false)
  const countdown = ref(0)
  const sessionFromPage = ref(isLoggedIn())
  const nicknameError = ref('')
  const phoneError = ref('')
  const codeError = ref('')
  const formError = ref('')

  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const isRegisterMode = computed(() => formMode.value === 'register')

  const canSendCode = computed(() => {
    return !sendingCode.value && countdown.value === 0
  })

  const canLogin = computed(() => {
    return isValidPhone(phone.value) && isValidCode(code.value) && !loggingIn.value
  })

  const canRegister = computed(() => {
    if (registering.value || !registerNickname.value.trim()) return false
    if (!sessionFromPage.value) {
      return isValidPhone(phone.value) && isValidCode(code.value)
    }
    return true
  })

  const canSubmit = computed(() => {
    return isRegisterMode.value ? canRegister.value : canLogin.value
  })

  const submitText = computed(() => {
    if (isRegisterMode.value) return registering.value ? '注册中…' : '注册'
    return loggingIn.value ? '登陆中…' : '登陆'
  })

  function isValidPhone(value: string) {
    return /^1\d{10}$/.test(value.trim())
  }

  function isValidCode(value: string) {
    return /^\d{6}$/.test(value.trim())
  }

  function clearAllFieldErrors() {
    nicknameError.value = ''
    phoneError.value = ''
    codeError.value = ''
    formError.value = ''
  }

  function clearAllInputs() {
    phone.value = ''
    code.value = ''
    registerNickname.value = ''
    registerAvatar.value = ''
  }

  watch(phone, () => {
    phoneError.value = ''
    formError.value = ''
  })
  watch(code, () => {
    codeError.value = ''
    formError.value = ''
  })
  watch(registerNickname, () => {
    nicknameError.value = ''
    formError.value = ''
  })

  function clearCountdownTimer() {
    if (!countdownTimer) return
    clearInterval(countdownTimer)
    countdownTimer = null
  }

  function startCountdown() {
    countdown.value = 60
    clearCountdownTimer()

    countdownTimer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        countdown.value = 0
        clearCountdownTimer()
      }
    }, 1000)
  }

  function toggleMode() {
    clearAllInputs()
    clearAllFieldErrors()
    clearCountdownTimer()
    countdown.value = 0
    formMode.value = isRegisterMode.value ? 'login' : 'register'
  }

  function goToLoginForm() {
    clearToken()
    sessionFromPage.value = false
    formMode.value = 'login'
    clearAllInputs()
    clearAllFieldErrors()
    clearCountdownTimer()
    countdown.value = 0
  }

  async function checkSession() {
    if (!isLoggedIn() || checkingSession.value) return

    checkingSession.value = true
    try {
      const response = await getUserInfo()
      const user = response?.data
      if (user?.nickname?.trim()) {
        uni.reLaunch({ url: '/pages/asset/list/asset-list-page' })
        return
      }
      formMode.value = 'register'
      clearAllInputs()
      clearAllFieldErrors()
      clearCountdownTimer()
      countdown.value = 0
    } catch (error) {
      clearToken()
      sessionFromPage.value = false
      console.error('校验登录态失败:', normalizeRequestErrorMessage(error) || error)
    } finally {
      checkingSession.value = false
    }
  }

  async function onSendCode() {
    clearAllFieldErrors()
    if (sendingCode.value || countdown.value > 0) return
    if (!isValidPhone(phone.value)) {
      phoneError.value = '请输入正确手机号'
      return
    }

    sendingCode.value = true
    try {
      const response = await sendLoginCode(
        {
          phone: phone.value.trim(),
          purpose: isRegisterMode.value ? 'register' : 'login'
        },
        { showErrorToast: false }
      )
      if (import.meta.env.DEV) {
        const mockCode = response?.data?.mockCode
        if (mockCode) {
          console.log('验证码:', mockCode)
        } else {
          console.log('[H5 联调] 本次响应未带 mockCode（生产可关 SMS_MOCK_MODE）', response?.data)
        }
      }
      startCountdown()
    } catch (error) {
      const message = normalizeRequestErrorMessage(error)
      if (/手机号/u.test(message)) {
        phoneError.value = message
      } else {
        codeError.value = message || '发送验证码失败'
      }
      console.error('发送验证码失败:', message || error)
    } finally {
      sendingCode.value = false
    }
  }

  function validateLoginInput(): boolean {
    let hasError = false
    if (!isValidPhone(phone.value)) {
      phoneError.value = '请输入正确手机号'
      hasError = true
    }
    if (!isValidCode(code.value)) {
      codeError.value = '请输入6位验证码'
      hasError = true
    }
    return !hasError
  }

  async function onLogin() {
    clearAllFieldErrors()
    if (!validateLoginInput()) return
    if (loggingIn.value) return

    loggingIn.value = true
    try {
      const response = await loginByPhoneCode(
        {
          phone: phone.value.trim(),
          code: code.value.trim()
        },
        { showErrorToast: false }
      )

      const token = response?.data?.token
      if (!token) {
        formError.value = '登录失败，请稍后重试'
        return
      }

      setToken(token)
      sessionFromPage.value = true

      const shouldRegister =
        Boolean(response?.data?.isNewUser) || !response?.data?.userInfo?.nickname?.trim()
      if (shouldRegister) {
        formMode.value = 'register'
        clearAllInputs()
        clearAllFieldErrors()
        clearCountdownTimer()
        countdown.value = 0
        return
      }

      uni.showToast({ title: '登录成功', icon: 'success' })
      uni.reLaunch({ url: '/pages/asset/list/asset-list-page' })
    } catch (error) {
      const message = normalizeRequestErrorMessage(error)
      if (/验证码/u.test(message)) {
        codeError.value = '验证码错误'
      } else if (/手机号/u.test(message)) {
        phoneError.value = message
      } else {
        formError.value = message || '登录失败'
      }
      console.error('登录失败:', message || error)
    } finally {
      loggingIn.value = false
    }
  }

  function validateRegisterInput(): boolean {
    let hasError = false
    if (!registerNickname.value.trim()) {
      nicknameError.value = '请输入用户名'
      hasError = true
    }
    if (!sessionFromPage.value) {
      if (!isValidPhone(phone.value)) {
        phoneError.value = '请输入正确手机号'
        hasError = true
      }
      if (!isValidCode(code.value)) {
        codeError.value = '请输入6位验证码'
        hasError = true
      }
    }
    return !hasError
  }

  async function onRegister() {
    clearAllFieldErrors()
    if (!validateRegisterInput()) return
    if (registering.value) return

    registering.value = true
    try {
      if (!sessionFromPage.value) {
        const response = await loginByPhoneCode(
          {
            phone: phone.value.trim(),
            code: code.value.trim()
          },
          { showErrorToast: false }
        )
        const token = response?.data?.token
        if (!token) {
          codeError.value = '验证失败，请检查验证码'
          return
        }
        setToken(token)
        sessionFromPage.value = true
      }

      let avatarUrl = (registerAvatar.value || '').trim()
      if (avatarUrl && !isRemoteAvatarUrl(avatarUrl)) {
        try {
          avatarUrl = (await uploadAvatarFile(avatarUrl)).key
        } catch (uploadErr) {
          formError.value = '头像上传失败，请重试'
          console.error(uploadErr)
          return
        }
      }

      await updateUserInfo(
        {
          nickname: registerNickname.value.trim(),
          avatar: avatarUrl,
        },
        { showErrorToast: false },
      )
      uni.reLaunch({ url: '/pages/asset/list/asset-list-page' })
    } catch (error) {
      const message = normalizeRequestErrorMessage(error)
      if (/验证码/u.test(message)) {
        codeError.value = '验证码错误'
      } else if (
        message.includes(String(AUTH_ERROR_CODE.PHONE_ALREADY_EXISTS)) ||
        /已注册|已存在/u.test(message)
      ) {
        phoneError.value = '手机号已存在'
      } else if (/手机号/u.test(message)) {
        phoneError.value = message
      } else if (/昵称|用户名/u.test(message)) {
        nicknameError.value = message
      } else {
        formError.value = message || '注册失败'
      }
      console.error('注册失败:', message || error)
    } finally {
      registering.value = false
    }
  }

  function onSubmit() {
    if (isRegisterMode.value) {
      void onRegister()
      return
    }
    void onLogin()
  }

  async function init() {
    sessionFromPage.value = isLoggedIn()
    clearAllFieldErrors()
    await checkSession()
  }

  function dispose() {
    clearCountdownTimer()
  }

  return {
    formMode,
    phone,
    code,
    sendingCode,
    loggingIn,
    registerNickname,
    registerAvatar,
    registering,
    checkingSession,
    countdown,
    sessionFromPage,
    nicknameError,
    phoneError,
    codeError,
    formError,
    isRegisterMode,
    canSendCode,
    canLogin,
    canRegister,
    canSubmit,
    submitText,
    toggleMode,
    goToLoginForm,
    onSendCode,
    onSubmit,
    init,
    dispose
  }
}
