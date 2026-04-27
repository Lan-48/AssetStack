<!--
  页面名称：分类管理页

  页面描述：展示资产分类树，支持新增一级/二级、重命名与删除；名称录入使用 CategoryNameDialog。

  页面说明：
  - 顶栏为自定义导航（pages.json 中 navigationStyle 为 custom），风格贴近系统导航：白底、居中标题、左侧左箭头位图返回、右侧加号位图新增一级分类
  - 数据来自 GET /asset-categories/tree
  - 顶栏右侧加号或某一级展开后区域内「添加」分别新增一级 / 二级分类
  - 一级标题行右侧菜单图标打开气泡；二级仅点击名称区域打开气泡（无右侧图标）
  - 页面底部固定展示说明：默认分类、已有资产占用（含子分类）时不可删除

  入口示例：
  - 设置页「分类管理」；或 uni.navigateTo({ url: '/pages/setting/category-manage-page' })
-->
<template>
  <view class="category-page">
    <view class="page-nav" :style="navShellStyle">
      <view class="page-nav__row" :style="navRowStyle">
        <view class="page-nav__side page-nav__side--left" :style="navLeftStyle" @tap="onNavBack">
          <image class="page-nav__back-icon" :src="navBackIcon" mode="aspectFit" />
        </view>
        <text class="page-nav__title" :style="navTitleStyle">分类管理</text>
        <view class="page-nav__add-wrap" :style="addBtnWrapStyle" @tap.stop="openAddRoot">
          <image class="page-nav__add-icon" :src="navAddIcon" mode="aspectFit" />
        </view>
      </view>
    </view>

    <view class="category-scroll">
      <view v-if="loading" class="state-tip">
        <text class="state-text">加载中…</text>
      </view>

      <view v-else-if="loadError" class="state-tip state-tip--error">
        <text class="state-text">加载失败，请稍后重试</text>
        <view class="retry-btn" @tap="loadTree">重新加载</view>
      </view>

      <template v-else>
        <view v-if="tree.length === 0" class="empty-tip">
          <text class="empty-tip__text">暂无分类，点击右上角加号添加一级分类</text>
        </view>

        <view v-for="node in tree" :key="node.id" class="category-card">
          <view class="category-card__header">
            <image
              class="category-card__chevron"
              :class="{ 'category-card__chevron--expanded': isExpanded(node.id) }"
              :src="categoryChevronIcon"
              mode="aspectFit"
              @tap="toggleExpand(node.id)"
            />
            <text class="category-card__name">{{ node.name }}</text>
            <CommonPopover
              v-if="getMenuActions(node).length > 0"
              :actions="getMenuActions(node)"
              placement="bottom"
              reference-horizontal-align="end"
              :offset="categoryCardPopoverOffset"
              @select="(action) => handleCategoryMenuSelect(action, node)"
            >
              <template #reference>
                <view class="category-card__more">
                  <image
                    class="category-card__more-icon"
                    :src="categoryMenuIcon"
                    mode="aspectFit"
                  />
                </view>
              </template>
            </CommonPopover>
            <view v-else class="category-card__more" @tap.stop="onCategoryMenuNoAction">
              <image class="category-card__more-icon" :src="categoryMenuIcon" mode="aspectFit" />
            </view>
          </view>

          <view v-if="isExpanded(node.id)" class="category-card__body">
            <view class="sub-grid">
              <view v-for="child in node.children" :key="child.id" class="sub-item">
                <CommonPopover
                  v-if="getMenuActions(child).length > 0"
                  :actions="getMenuActions(child)"
                  placement="bottom"
                  @select="(action) => handleCategoryMenuSelect(action, child)"
                >
                  <template #reference>
                    <view class="sub-item__ref">
                      <text class="sub-item__label">{{ child.name }}</text>
                    </view>
                  </template>
                </CommonPopover>
                <view v-else class="sub-item__ref" @tap.stop="onCategoryMenuNoAction">
                  <text class="sub-item__label">{{ child.name }}</text>
                </view>
              </view>
              <view class="sub-item--add" @tap.stop="openAddChild(node)">
                <image class="sub-item__add-icon" :src="navAddIcon" mode="aspectFit" />
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view class="category-footer-tip">
      <text class="category-footer-tip__text">
        说明：默认分类无法删除； 本分类或任一子分类下已有资产占用时也无法删除。
      </text>
    </view>

    <CategoryNameDialog
      v-model:show="nameSheet.show"
      v-model="nameSheet.value"
      :title="nameSheet.title"
      @confirm="onCategoryNameConfirm"
    />
  </view>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  /** 资源为向右三角，展开时通过样式旋转为朝下 */
  import categoryChevronIcon from '@/assets/icons/arrow-right.png'
  /** 顶栏返回图标，与样式中宽高一致 */
  import navBackIcon from '@/assets/icons/arrow-left.png'
  /** 顶栏新增一级分类图标，与返回图标同档尺寸 */
  import navAddIcon from '@/assets/icons/add.png'
  /** 分类标题行右侧更多菜单，与行内其他图标同档 */
  import categoryMenuIcon from '@/assets/icons/menu.png'
  import {
    createAssetCategory,
    deleteAssetCategory,
    fetchCategoryTree,
    updateAssetCategory,
    type AssetCategoryTreeNode
  } from '@/api'
  import CategoryNameDialog from '@/components/setting/category-name-dialog/category-name-dialog.vue'
  import CommonPopover from '@/components/common/popover/popover.vue'
  import { type CommonPopoverAction } from '@/components/common/popover'

  defineOptions({ name: 'CategoryManagePage' })

  /** 与主题危险色一致，用于「删除」项 */
  const MENU_DELETE_COLOR = '#FF3B30'

  /**
   * 一级卡片「…」气泡相对锚点的 [水平像素, 垂直像素]；水平为负则整体再左移。
   * 与 CommonPopover 的 referenceHorizontalAlign="end" 配合；可按视觉改数值。
   */
  const categoryCardPopoverOffset = ref<[number, number]>([-14, 12])

  /** 联调时输出分类相关接口的完整返回体（与 request 层一致，一般为 { code, msg, data }） */
  function logCategoryApi(action: string, result: unknown) {
    console.log(`[分类管理] ${action} 接口返回`, result)
  }

  /** 自定义顶栏：状态栏占位、导航行高；标题左右对称内边距与加号、胶囊区对齐，勿把胶囊 left 当「左侧留白」 */
  const statusBarPx = ref(0)
  const navRowPx = ref(44)
  const windowWidthPx = ref(375)
  /** 胶囊左边界 x，仅用于加号 right 定位，勿用作标题单侧 padding */
  const mbLeftPx = ref(0)
  /** 标题左右同值的 px 内边距，使 text-align:center 与屏幕中心一致，且与加号、胶囊不重叠 */
  const titleSymPadPx = ref(0)

  const navShellStyle = computed(() => ({
    paddingTop: `${statusBarPx.value}px`
  }))

  const navRowStyle = computed(() => ({
    minHeight: `${navRowPx.value}px`
  }))

  const navLeftStyle = computed(() => ({
    minWidth: '96rpx',
    flex: 'none' as const,
    boxSizing: 'border-box' as const
  }))

  const navTitleStyle = computed(() => {
    const p = titleSymPadPx.value
    if (p <= 0) return {}
    return {
      paddingLeft: `${p}px`,
      paddingRight: `${p}px`
    }
  })

  const addBtnWrapStyle = computed(() => {
    const w = windowWidthPx.value
    const left = mbLeftPx.value
    const base = {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 3
    }
    if (left <= 0) {
      return { ...base, right: '16rpx' }
    }
    return { ...base, right: `${w - left + 8}px` }
  })

  function syncPageNavMetrics() {
    const sys = uni.getSystemInfoSync()
    const winW = typeof sys.windowWidth === 'number' ? sys.windowWidth : (sys.screenWidth ?? 375)
    windowWidthPx.value = winW
    const rawStatus = typeof sys.statusBarHeight === 'number' ? sys.statusBarHeight : 0
    const safeTop = typeof sys.safeAreaInsets?.top === 'number' ? sys.safeAreaInsets.top : 0
    const status = Math.max(rawStatus, safeTop)
    statusBarPx.value = status

    const minRowFallback = Math.max(uni.upx2px(96), 48)
    let row = minRowFallback
    let mbLeft = 0
    let titlePad = 16
    const backZoneMin = Math.max(uni.upx2px(12) + 24 + uni.upx2px(12), 40)

    try {
      const mb = uni.getMenuButtonBoundingClientRect()
      if (
        mb &&
        typeof mb.top === 'number' &&
        mb.top > 0 &&
        typeof mb.height === 'number' &&
        mb.height > 0
      ) {
        row = (mb.top - status) * 2 + mb.height
        if (typeof mb.left === 'number' && mb.left > 0) {
          mbLeft = mb.left
        }
        if (mbLeft > 0) {
          const addW = Math.max(uni.upx2px(72), 32)
          const addLeftX = Math.max(0, mbLeft - 8 - addW)
          const padToClearAdd = addLeftX < winW ? winW - addLeftX : backZoneMin
          titlePad = Math.max(backZoneMin, padToClearAdd)
          const minContent = 100
          if (2 * titlePad > winW - minContent) {
            titlePad = Math.max(12, (winW - minContent) / 2)
          }
        }
      }
    } catch {
      /* 非小程序或接口不可用 */
    }

    navRowPx.value = Math.max(row, minRowFallback, 44)
    mbLeftPx.value = mbLeft
    titleSymPadPx.value = titlePad
  }

  function onNavBack() {
    try {
      const stack = getCurrentPages()
      if (stack.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
    } catch {
      /* 忽略 */
    }
    uni.navigateTo({ url: '/pages/setting/setting-page' })
  }

  const loading = ref(true)
  const loadError = ref(false)
  const tree = ref<AssetCategoryTreeNode[]>([])
  const expanded = ref<Record<number, boolean>>({})

  const nameSheet = ref({
    show: false,
    title: '',
    value: '',
    mode: 'add-root' as 'add-root' | 'add-child' | 'rename',
    targetId: 0,
    parentId: null as number | null
  })

  function normalizeTree(list: AssetCategoryTreeNode[]): AssetCategoryTreeNode[] {
    return list.map((n) => ({
      ...n,
      children: Array.isArray(n.children) ? n.children : []
    }))
  }

  function isSystem(node: AssetCategoryTreeNode) {
    return Number(node.is_system) === 1
  }

  function isDefault(node: AssetCategoryTreeNode) {
    return Number(node.is_default) === 1
  }

  function hasAssets(node: AssetCategoryTreeNode) {
    if (Number(node.item_count) > 0) return true
    const kids = node.children ?? []
    return kids.some((c) => Number(c.item_count) > 0)
  }

  function canRename(node: AssetCategoryTreeNode) {
    return !isSystem(node)
  }

  function canDelete(node: AssetCategoryTreeNode) {
    return !isSystem(node) && !isDefault(node) && !hasAssets(node)
  }

  function isExpanded(id: number) {
    return expanded.value[id] !== false
  }

  function toggleExpand(id: number) {
    expanded.value = {
      ...expanded.value,
      [id]: !isExpanded(id)
    }
  }

  function ensureExpandedDefaults(list: AssetCategoryTreeNode[]) {
    const next = { ...expanded.value }
    for (const n of list) {
      if (next[n.id] === undefined) next[n.id] = true
    }
    expanded.value = next
  }

  async function loadTree() {
    loadError.value = false
    loading.value = true
    try {
      const res = await fetchCategoryTree()
      logCategoryApi('查询分类树', res)
      const raw = res?.data
      const list = normalizeTree(Array.isArray(raw) ? raw : [])
      tree.value = list
      ensureExpandedDefaults(list)
    } catch (e) {
      console.error('加载分类树失败:', e)
      loadError.value = true
    } finally {
      loading.value = false
    }
  }

  function openAddRoot() {
    nameSheet.value = {
      show: true,
      title: '新增分类',
      value: '',
      mode: 'add-root',
      targetId: 0,
      parentId: null
    }
  }

  function openAddChild(parent: AssetCategoryTreeNode) {
    nameSheet.value = {
      show: true,
      title: '新增分类',
      value: '',
      mode: 'add-child',
      targetId: 0,
      parentId: parent.id
    }
  }

  function openRename(node: AssetCategoryTreeNode) {
    nameSheet.value = {
      show: true,
      title: '修改分类',
      value: node.name,
      mode: 'rename',
      targetId: node.id,
      parentId: null
    }
  }

  async function onCategoryNameConfirm(raw: string) {
    const name = raw.trim()
    if (!name) {
      uni.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    const sheet = nameSheet.value
    try {
      if (sheet.mode === 'add-root') {
        const out = await createAssetCategory({ name, category_level: 1 })
        logCategoryApi('新增一级分类', out)
        uni.showToast({ title: '已添加', icon: 'success' })
      } else if (sheet.mode === 'add-child') {
        if (sheet.parentId == null) return
        const out = await createAssetCategory({
          name,
          category_level: 2,
          parent_id: sheet.parentId
        })
        logCategoryApi('新增二级分类', out)
        uni.showToast({ title: '已添加', icon: 'success' })
      } else if (sheet.mode === 'rename') {
        const out = await updateAssetCategory(sheet.targetId, { name })
        logCategoryApi('更新分类', out)
        uni.showToast({ title: '已更新', icon: 'success' })
      }
      nameSheet.value.show = false
      await loadTree()
    } catch (error) {
      console.error('保存分类失败:', error)
    }
  }

  function getMenuActions(node: AssetCategoryTreeNode): CommonPopoverAction[] {
    const actions: CommonPopoverAction[] = []
    if (canRename(node)) actions.push({ text: '重命名' })
    if (canDelete(node)) actions.push({ text: '删除', color: MENU_DELETE_COLOR })
    return actions
  }

  function handleCategoryMenuSelect(action: CommonPopoverAction, node: AssetCategoryTreeNode) {
    if (action.text === '重命名') openRename(node)
    if (action.text === '删除') confirmDelete(node)
  }

  function onCategoryMenuNoAction() {
    uni.showToast({ title: '该分类不可修改或删除', icon: 'none' })
  }

  function confirmDelete(node: AssetCategoryTreeNode) {
    uni.showModal({
      title: '删除分类',
      content: `确定删除「${node.name}」吗？删除后不可恢复。`,
      success: async (res) => {
        if (!res.confirm) return
        try {
          const out = await deleteAssetCategory(node.id)
          logCategoryApi('删除分类', out)
          uni.showToast({ title: '已删除', icon: 'success' })
          await loadTree()
        } catch (error) {
          console.error('删除分类失败:', error)
        }
      }
    })
  }

  onShow(() => {
    syncPageNavMetrics()
    void nextTick(() => {
      syncPageNavMetrics()
    })
    void loadTree()
  })

  onMounted(() => {
    syncPageNavMetrics()
    void nextTick(() => {
      syncPageNavMetrics()
    })
  })
</script>

<style lang="scss" scoped>
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .category-page {
    min-height: 100vh;
    box-sizing: border-box;
    background-color: $bg-secondary;
    display: flex;
    flex-direction: column;
  }

  .page-nav {
    position: relative;
    z-index: 100;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    background-color: $bg-primary;
    border-bottom: 1rpx solid $border-subtle;
  }

  .page-nav__row {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    padding: 12rpx 0;
  }

  .page-nav__side {
    position: relative;
    z-index: 2;
    min-width: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    padding: 0 12rpx;
  }

  .page-nav__side--left {
    justify-content: flex-start;
  }

  .page-nav__add-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-width: 72rpx;
    min-height: 72rpx;
  }

  .page-nav__title {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;
    text-align: center;
    font-size: $font-base;
    color: $text-primary;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
  }

  .page-nav__back-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }

  .page-nav__add-icon {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    display: block;
  }

  .category-scroll {
    flex: 1;
    min-height: 0;
    width: 100%;
    box-sizing: border-box;
    padding: $spacing-lg;
    padding-bottom: $spacing-md;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .category-footer-tip {
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    padding: $spacing-md $spacing-lg;
    padding-bottom: calc($spacing-md + constant(safe-area-inset-bottom));
    padding-bottom: calc($spacing-md + env(safe-area-inset-bottom, 0px));
    background-color: $bg-secondary;
    border-top: 1rpx solid $border-subtle;
  }

  .category-footer-tip__text {
    display: block;
    font-size: $font-xs;
    line-height: 1.55;
    color: $text-tertiary;
    text-align: center;
  }

  .state-tip {
    padding: $spacing-xl 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
  }

  .state-tip--error .state-text {
    color: $danger;
  }

  .state-text {
    font-size: $font-sm;
    color: $text-tertiary;
  }

  .retry-btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $radius-sm;
    background-color: $primary;
    color: $text-white;
    font-size: $font-sm;
  }

  .empty-tip {
    padding: $spacing-xl $spacing-md;
    text-align: center;
  }

  .empty-tip__text {
    font-size: $font-sm;
    color: $text-tertiary;
  }

  .category-card {
    margin-bottom: $spacing-base;
    background-color: $bg-primary;
    border-radius: $radius-sm;
    overflow: hidden;
    box-shadow: $shadow-sm;
  }

  .category-card__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-base $spacing-lg;
    min-height: 96rpx;
    box-sizing: border-box;
  }

  .category-card__chevron {
    flex-shrink: 0;
    width: 48rpx;
    height: 48rpx;
    display: block;
    transition: transform 0.2s ease;
  }

  .category-card__chevron--expanded {
    transform: rotate(90deg);
  }

  .category-card__name {
    flex: 1;
    min-width: 0;
    font-size: $font-base;
    color: $text-secondary;
  }

  .category-card__more {
    flex-shrink: 0;
    padding: $spacing-xs $spacing-sm;
    margin: (-$spacing-xs) (-$spacing-sm);
  }

  .category-card__more-icon {
    width: 48rpx;
    height: 48rpx;
    flex-shrink: 0;
    display: block;
  }

  .category-card__body {
    padding: 0 $spacing-lg $spacing-lg;
  }

  .sub-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $spacing-md;
    padding: $spacing-md;
    background-color: $bg-secondary;
    border-radius: $radius-sm;
    box-sizing: border-box;
  }

  .sub-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: stretch;
    max-width: 240rpx;
    min-width: 0;
    min-height: 64rpx;
    padding: $spacing-xs $spacing-sm;
    box-sizing: border-box;
    background-color: $bg-primary;
    border-radius: $radius-xs;
  }

  .sub-item__ref {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .sub-item__label {
    width: 100%;
    min-width: 0;
    font-size: $font-sm;
    color: $text-secondary;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-item--add {
    border-radius: $radius-full;
    background-color: $bg-primary;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: $spacing-xs;
    box-sizing: border-box;
  }

  .sub-item__add-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }

  .sub-item--add .sub-item__label {
    color: $text-tertiary;
  }
</style>
