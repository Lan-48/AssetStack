export type ProfileEditPopupProps = {
  show: boolean
  mode: 'nickname' | 'phone' | 'avatar'
  nickname: string
  phone: string
  avatar: string
  defaultAvatar: string
  canSendCode?: boolean
  countdown?: number
  /** 发送验证码接口返回「手机号已注册」等业务错误时的行内文案（如：手机号已存在） */
  phoneSendError?: string
  /** 校验验证码接口返回的业务错误文案（如：验证码错误） */
  codeSendError?: string
}

export type ProfileEditPopupEmits = {
  'update:show': [value: boolean]
  'save-nickname': [payload: { nickname: string }]
  'send-code': [payload: { phone: string }]
  'save-phone': [payload: { phone: string; code: string }]
  'save-avatar': [payload: { avatar: string }]
  /** 手机号输入变化时通知父级清空发送验证码相关的服务端错误文案 */
  'clear-phone-send-error': []
  /** 验证码输入变化时通知父级清空验证码相关的服务端错误文案 */
  'clear-code-send-error': []
}
