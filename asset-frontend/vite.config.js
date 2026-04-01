import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uniPlugin = typeof uni === 'function' ? uni : uni.default

function injectManifestAppId(env) {
  const appId = env.VITE_WX_APPID
  if (!appId) return

  const manifestPath = path.resolve(__dirname, 'src/manifest.json')
  const content = fs.readFileSync(manifestPath, 'utf-8')

  // manifest.json 包含 JSONC 注释，不能用 JSON.parse，使用正则保留原始格式
  const updated = content.replace(
    /("mp-weixin"\s*:\s*\{[\s\S]*?"appid"\s*:\s*)"[^"]*"/,
    `$1"${appId}"`
  )

  if (updated !== content) {
    fs.writeFileSync(manifestPath, updated, 'utf-8')
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  injectManifestAppId(env)

  return {
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
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  }
})
