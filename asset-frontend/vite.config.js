import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uniPlugin = typeof uni === 'function' ? uni : uni.default

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [uniPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // 部分依赖链仍走旧 API 时会重复告警；编译结果一致
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
})
