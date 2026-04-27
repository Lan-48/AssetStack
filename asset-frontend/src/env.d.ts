/// <reference types="vite/client" />

/** 节点布局查询结果（createSelectorQuery → boundingClientRect） */
interface UniBoundingClientRectResult {
  id?: string
  left?: number
  top?: number
  right?: number
  bottom?: number
  width?: number
  height?: number
}

interface UniSelectorQueryExec {
  exec(): void
}

interface UniSelectorQuerySelect {
  boundingClientRect(
    callback: (rect: UniBoundingClientRectResult | null) => void
  ): UniSelectorQueryExec
}

interface UniSelectorQueryIn {
  select(selector: string): UniSelectorQuerySelect
}

interface UniSelectorQuery {
  in(component: unknown): UniSelectorQueryIn
}

/** uni-app 运行时全局（最小结构，满足本项目 API） */
declare const uni: {
  getStorageSync(key: string): unknown
  setStorageSync(key: string, data: unknown): void
  removeStorageSync(key: string): void
  showToast(options: { title: string; icon?: string }): void
  showActionSheet(options: {
    itemList: string[]
    success?: (res: { tapIndex: number }) => void
    fail?: (err: unknown) => void
    complete?: (res: unknown) => void
  }): void
  showModal(options: {
    title: string
    content: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
  }): void
  reLaunch(options: { url: string }): void
  request(options: Record<string, unknown>): void
  addInterceptor(options: { returnValue: (res: unknown) => unknown }): void
  getMenuButtonBoundingClientRect(): {
    width?: number
    height?: number
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  getSystemInfoSync(): {
    safeAreaInsets?: { top?: number; bottom?: number; left?: number; right?: number }
    statusBarHeight?: number
    windowWidth?: number
    screenWidth?: number
  }
  upx2px(value: number): number
  navigateTo(options: {
    url: string
    success?: (res: unknown) => void
    fail?: (err: unknown) => void
    complete?: (res: unknown) => void
  }): void
  navigateBack(options?: {
    delta?: number
    success?: (res: unknown) => void
    fail?: (err: unknown) => void
    complete?: (res: unknown) => void
  }): void
  redirectTo(options: {
    url: string
    success?: (res: unknown) => void
    fail?: (err: unknown) => void
    complete?: (res: unknown) => void
  }): void
  uploadFile(options: {
    url: string
    filePath: string
    name: string
    header?: Record<string, string>
    success?: (res: { statusCode?: number; data: string }) => void
    fail?: (err: unknown) => void
  }): void
  $emit(event: string, ...args: unknown[]): void
  $on(event: string, callback: (...args: unknown[]) => void): void
  $off(event: string, callback?: (...args: unknown[]) => void): void
  /** 窗口尺寸变化（下拉等浮层关闭时用） */
  onWindowResize(callback: () => void): void
  offWindowResize(callback: () => void): void
  /** 键盘高度变化 */
  onKeyboardHeightChange(callback: () => void): void
  offKeyboardHeightChange(callback: () => void): void
  createSelectorQuery(): UniSelectorQuery
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WX_APPID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
