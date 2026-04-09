export type FormMode = 'login' | 'register'

export type LoginFormPayload = {
  phone: string
  code: string
}

export type RegisterFormPayload = {
  nickname: string
  avatar: string
}
