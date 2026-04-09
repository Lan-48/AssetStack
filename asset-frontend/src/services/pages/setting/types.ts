export type ProfilePopupMode = 'nickname' | 'phone' | 'avatar'

export type SaveNicknamePayload = { nickname: string }
export type SendPhoneCodePayload = { phone: string }
export type SavePhonePayload = { phone: string; code: string }
export type SaveAvatarPayload = { avatar: string }

export type UseSettingOptions = {
  defaultAvatar: string
}
