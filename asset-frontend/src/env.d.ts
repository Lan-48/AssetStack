/// <reference types="vite/client" />

/** uni-app 运行时全局（最小结构，满足本项目 API） */
declare const uni: {
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, data: unknown): void;
  removeStorageSync(key: string): void;
  showToast(options: { title: string; icon?: string }): void;
  showModal(options: {
    title: string
    content: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
  }): void;
  reLaunch(options: { url: string }): void;
  request(options: Record<string, unknown>): void;
  addInterceptor(options: { returnValue: (res: unknown) => unknown }): void;
  getMenuButtonBoundingClientRect(): { bottom?: number };
  getSystemInfoSync(): {
    safeAreaInsets?: { top?: number };
    statusBarHeight?: number;
  };
  upx2px(value: number): number;
  $emit(event: string, ...args: unknown[]): void;
};

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
