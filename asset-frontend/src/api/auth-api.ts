import request from './request'

type LoginByCodePayload = {
  phone: string
  code: string
}

type UpdateUserInfoPayload = {
  nickname?: string
  avatar?: string
  phone?: string
  code?: string
}

/** 与后端 LoginController 返回的 JSON 结构一致（resolve 后的 HTTP body） */
type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type SendCodeData = {
  expiresIn?: number
  mockCode?: string
} | null

type UserInfo = {
  id: number
  phone: string
  nickname: string
  avatar: string
  createTime: string
}

type LoginSuccessData = {
  token: string
  isNewUser: boolean
  userInfo: UserInfo
}

type UpdateUserInfoData = {
  token?: string
} | null

export const sendLoginCode = (
  params: { phone: string; purpose?: 'login' | 'register' },
  requestConfig?: { showErrorToast?: boolean },
) => request.post<ApiEnvelope<SendCodeData>>('/user/send-code', params, requestConfig)

export const loginByPhoneCode = (
  { phone, code }: LoginByCodePayload,
  requestConfig?: { showErrorToast?: boolean },
) => request.post<ApiEnvelope<LoginSuccessData>>('/user/login', { phone, code }, requestConfig)

export const logout = (token: string) => request.post('/user/logout', {}, { header: { token } })

export const getUserInfo = (requestConfig?: { showErrorToast?: boolean }) =>
  request.get<ApiEnvelope<UserInfo>>('/user/info', requestConfig)

export const updateUserInfo = (
  payload: UpdateUserInfoPayload,
  requestConfig?: { showErrorToast?: boolean },
) => request.put<ApiEnvelope<UpdateUserInfoData>>('/user/update', payload, requestConfig)

/** 私有 Bucket：根据已入库的 object key 换取短时读签名 URL */
export const getOssReadUrl = (
  key: string,
  requestConfig?: { showErrorToast?: boolean },
) =>
  request.get<ApiEnvelope<{ url: string }>>('/user/oss-read-url', {
    ...requestConfig,
    params: { key },
  })
