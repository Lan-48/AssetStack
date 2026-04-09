import App from './App.vue'

import '@/styles/theme/index.scss'
// #ifndef VUE3
// @ts-expect-error uni-app Vue2 分支在当前类型环境下无默认导出声明
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
;(App as any).mpType = 'app'
const app = new (Vue as any)({
  ...(App as any),
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
// #endif
