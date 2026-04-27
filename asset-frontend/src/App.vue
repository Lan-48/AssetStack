<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api'
import { clearToken, isLoggedIn } from '@/utils/auth'

onLaunch(() => {
  void bootstrapAuth()
})

const ASSET_LIST_ROUTE = 'pages/asset/list/asset-list-page'

async function bootstrapAuth() {
  if (!isLoggedIn()) return

  try {
    const response = await getUserInfo()
    if (response?.data?.nickname?.trim()) {
      const pages = getCurrentPages()
      const top = pages[pages.length - 1]
      const route = top && 'route' in top ? String(top.route) : ''
      // 已在资产列表时不再 reLaunch，否则首屏 onShow 已拉列表后又会二次进入并重复请求
      if (route === ASSET_LIST_ROUTE) {
        return
      }
      uni.reLaunch({ url: '/pages/asset/list/asset-list-page' })
      return
    }
    uni.reLaunch({ url: '/pages/login/login-page' })
  } catch (error) {
    clearToken()
    console.error('启动鉴权失败:', error)
    uni.reLaunch({ url: '/pages/login/login-page' })
  }
}
</script>
