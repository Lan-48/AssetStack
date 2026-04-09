import { BASE_URL } from './config'
import { clearToken, getToken } from '@/utils/auth'

const LOGIN_PAGE = '/pages/login/login-page'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RequestConfig = {
  url: string
  method?: RequestMethod
  data?: unknown
  params?: Record<string, unknown>
  header?: Record<string, string>
  contentType?: string
  /** 为 false 时不弹出通用错误 toast（由调用方自行提示） */
  showErrorToast?: boolean
}

type UniResponse<T = unknown> = {
  statusCode: number
  data: T
}

type RequestExtraConfig = Omit<RequestConfig, 'url' | 'method' | 'data'>
type RequestGetConfig = RequestExtraConfig & { params?: Record<string, unknown> }

const parseErrorPayload = (data: unknown): { msg?: unknown; message?: unknown; code?: unknown } => {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as { msg?: unknown; message?: unknown; code?: unknown }
      }
      return { message: data }
    } catch {
      return { message: data }
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as { msg?: unknown; message?: unknown; code?: unknown }
  }
  return {}
}

const extractErrorMessage = (data: unknown): string => {
  const payload = parseErrorPayload(data)
  const message = payload.message
  if (typeof payload.msg === 'string' && payload.msg.trim()) return payload.msg
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    const nested = message as { msg?: unknown; message?: unknown }
    if (typeof nested.msg === 'string' && nested.msg.trim()) return nested.msg
    if (typeof nested.message === 'string' && nested.message.trim()) return nested.message
  }
  return ''
}

const coreRequest = <T = unknown>(options: RequestConfig): Promise<T> => {
  const token = getToken()
  const authHeader = token ? { token: String(token) } : {}

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.contentType || 'application/json',
        ...authHeader,
        ...(options.header || {}),
      },
      success: (res: UniResponse<T>) => {
        // NestJS POST 默认返回 201 Created，仅判断 200 会导致新增等接口被误判失败
        const status = res.statusCode
        if (status >= 200 && status < 300) {
          resolve(res.data)
        } else if (status === 401 || status === 403) {
          clearToken()
          uni.showToast({ title: '登录已过期', icon: 'none' })
          // H5 与小程序栈场景下 reLaunch 更稳，并避免残留无效 token 触发登录页又被拉回业务页
          uni.reLaunch({ url: LOGIN_PAGE })
          reject(res)
        } else {
          const message = extractErrorMessage(res.data)
          if (options.showErrorToast !== false) {
            uni.showToast({ title: message || '请求失败', icon: 'none' })
          }
          reject(res)
        }
      },
      fail: (err: unknown) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
    })
  })
}

const get = <T = unknown>(url: string, config: RequestGetConfig = {}) =>
  coreRequest<T>({
    url,
    method: 'GET',
    ...config,
    data: config.params || {},
  })

const post = <T = unknown>(url: string, data?: unknown, config: RequestExtraConfig = {}) =>
  coreRequest<T>({
    url,
    method: 'POST',
    data,
    ...config,
  })

const put = <T = unknown>(url: string, data?: unknown, config: RequestExtraConfig = {}) =>
  coreRequest<T>({
    url,
    method: 'PUT',
    data,
    ...config,
  })

const remove = <T = unknown>(url: string, config: RequestExtraConfig = {}) =>
  coreRequest<T>({
    url,
    method: 'DELETE',
    ...config,
  })

type HttpClient = typeof coreRequest & {
  get: typeof get
  post: typeof post
  put: typeof put
  delete: typeof remove
}

const request = Object.assign(coreRequest, {
  get,
  post,
  put,
  delete: remove,
}) as HttpClient

export default request
