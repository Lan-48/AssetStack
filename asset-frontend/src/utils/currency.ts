const CURRENCY_SYMBOLS: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥'
}

export function getCurrency(): string {
  const saved = uni.getStorageSync('currency') || 'CNY'
  return saved as string
}

export function setCurrency(currency: string): void {
  if (CURRENCY_SYMBOLS[currency]) {
    uni.setStorageSync('currency', currency)
  }
}

export function formatCurrency(
  amount: number | string,
  currency: string | null = null
): string {
  const sym = CURRENCY_SYMBOLS[currency || getCurrency()]
  return `${sym}${amount.toLocaleString()}`
}

export function formatAmount(amount: number | string): string {
  return formatCurrency(amount)
}
