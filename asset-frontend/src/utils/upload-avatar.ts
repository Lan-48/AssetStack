import { BASE_URL } from '@/api/config'
import { clearToken, getToken } from '@/utils/auth'

/** 上传接口返回：key 写入库，url 为短时读签名仅用于界面回显 */
export type UploadAvatarResult = {
  key: string
  url: string
}

/**
 * 是否视为「已持久化」的图片引用：OSS 对象键、或可读 http(s) 直链（含服务端下发的读签名 URL）。
 * 排除小程序临时路径 `http://tmp/...`。
 */
export function isRemoteAvatarUrl(url: string): boolean {
  const u = url.trim()
  if (!u) return false
  if (/^https?:\/\/tmp(?:\/|$)/i.test(u)) return false
  if (/^avatars\//i.test(u)) return true
  if (/^https?:\/\//i.test(u)) return true
  return false
}

/**
 * 将本地临时路径（小程序/H5 选图）上传到服务端 OSS。
 * 返回 object key 与短时读签名 URL；持久化字段请使用 `key`。
 */
export function uploadAvatarFile(localPath: string): Promise<UploadAvatarResult> {
  const token = getToken()
  if (!token) {
    return Promise.reject(new Error('未登录'))
  }
  const path = localPath.trim()
  if (!path) {
    return Promise.reject(new Error('未选择文件'))
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/user/upload-avatar`,
      filePath: path,
      name: 'file',
      header: { token },
      success: (res) => {
        const status = res.statusCode ?? 0
        if (status === 401 || status === 403) {
          clearToken()
          uni.showToast({ title: '登录已过期', icon: 'none' })
          uni.reLaunch({ url: '/pages/login/login-page' })
          reject(new Error('Unauthorized'))
          return
        }
        if (status < 200 || status >= 300) {
          reject(new Error(`上传失败 HTTP ${status}`))
          return
        }
        try {
          const raw = res.data
          const body =
            typeof raw === 'string'
              ? (JSON.parse(raw) as {
                  data?: { url?: string; key?: string }
                  msg?: string
                })
              : (raw as { data?: { url?: string; key?: string }; msg?: string })
          const key = body?.data?.key
          const url = body?.data?.url
          if (typeof key === 'string' && key.trim()) {
            resolve({
              key: key.trim(),
              url: typeof url === 'string' && url.trim() ? url.trim() : key.trim()
            })
            return
          }
          reject(new Error(body?.msg || '上传失败'))
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
