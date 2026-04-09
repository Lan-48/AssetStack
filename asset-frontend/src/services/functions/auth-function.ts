type RejectResponseData = {
  code?: unknown
  message?: unknown
  msg?: unknown
}

function parseRejectResponseData(data: unknown): RejectResponseData | null {
  if (data == null) return null
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as RejectResponseData
      }
    } catch {
      return { message: data }
    }
    return null
  }
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as RejectResponseData
  }
  return null
}

export function normalizeRequestErrorMessage(res: unknown): string {
  if (!res || typeof res !== 'object') return ''
  const r = res as { data?: unknown }
  const parsed = parseRejectResponseData(r.data)
  if (!parsed) return ''
  const raw = parsed.message ?? parsed.msg
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const nested = raw as { msg?: unknown; message?: unknown }
    if (typeof nested.msg === 'string') return nested.msg
    if (typeof nested.message === 'string') return nested.message
  }
  return ''
}

export function normalizeRequestErrorCode(res: unknown): number {
  if (!res || typeof res !== 'object') return 0
  const r = res as { data?: unknown }
  const parsed = parseRejectResponseData(r.data)
  if (!parsed) return 0
  if (typeof parsed.code === 'number') return parsed.code
  const nested = parsed.message
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const nestedObj = nested as { code?: unknown }
    if (typeof nestedObj.code === 'number') return nestedObj.code
  }
  return 0
}

export function normalizeMobileDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('86')) return digits.slice(2)
  return digits
}
