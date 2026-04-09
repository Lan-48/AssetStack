<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api'
import { clearToken, isLoggedIn } from '@/utils/auth'

onLaunch(() => {
  void bootstrapAuth()
})

async function bootstrapAuth() {
  if (!isLoggedIn()) return

  try {
    const response = await getUserInfo()
    if (response?.data?.nickname?.trim()) {
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
