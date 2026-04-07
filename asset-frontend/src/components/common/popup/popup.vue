<!--
  组件名称：Popup

  组件描述：通用弹出层组件，支持 top/bottom/left/right 四方向弹出、遮罩、圆角与关闭事件。

  组件参数说明：
  - show: 是否显示弹层（支持 v-model:show）
  - position: 弹出方向，支持 top / bottom / left / right
  - overlay: 是否显示遮罩层
  - round / radius: 是否启用圆角及自定义圆角值
  - closeable: 是否显示右上角关闭按钮
  - closeOnClickOverlay: 点击遮罩是否关闭
  - duration: 过渡动画时长（毫秒）
  - customStyle: 自定义弹层样式（字符串或对象）

  组件事件说明：
  - update:show: 弹层开关状态变化时触发
  - open / opened: 打开开始和打开结束时触发
  - close / closed: 关闭开始和关闭结束时触发
  - click: 点击弹层内容时触发
  - click-overlay: 点击遮罩层时触发
  - click-close-icon: 点击关闭按钮时触发

  组件使用示例：
  <Popup
    v-model:show="visible"
    position="bottom"
    :round="true"
    radius="48rpx 48rpx 0 0"
    @click-overlay="handleOverlayClick"
  >
    <view>弹窗内容</view>
  </Popup>
-->
<template>
  <view v-if="rendered" class="popup-root" :style="rootStyle">
    <view
      v-if="overlay"
      class="popup-overlay"
      :class="{ 'popup-overlay--active': isActive }"
      :style="overlayStyle"
      @tap="handleOverlayClick"
    >
      <slot name="overlay-content" />
    </view>

    <view
      class="popup-panel"
      :class="[panelPositionClass, panelStateClass, panelSafeAreaClass]"
      :style="panelStyle"
      @tap.stop="handlePanelClick"
      @touchmove.stop.prevent
    >
      <view v-if="closeable" class="popup-close" @tap.stop="handleCloseIconClick">
        <text class="popup-close__text">x</text>
      </view>
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, watch } from 'vue'
import type { PopupCloseAction, PopupPosition, PopupProps } from './types'

const props = withDefaults(defineProps<PopupProps>(), {
  show: false,
  position: 'bottom',
  overlay: true,
  round: false,
  radius: '',
  closeable: false,
  closeOnClickOverlay: true,
  lockScroll: true,
  lazyRender: true,
  zIndex: 2000,
  duration: 300,
  customStyle: '',
  safeAreaInsetTop: false,
  safeAreaInsetBottom: false,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
  click: [event: unknown]
  'click-overlay': [event: unknown]
  'click-close-icon': [event: unknown]
}>()

// eslint-disable-next-line vue/multi-word-component-names -- 与目录 popup 一致
defineOptions({ name: 'Popup' })

let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null
let originalOverflow = ''

const rendered = computed(() => {
  if (props.lazyRender) {
    return props.show || isActive.value
  }
  return true
})

const isActive = computed(() => props.show)

const panelPositionClass = computed(() => `popup-panel--${props.position}`)

const panelStateClass = computed(() =>
  isActive.value ? 'popup-panel--active' : 'popup-panel--inactive',
)

const panelSafeAreaClass = computed(() => ({
  'popup-panel--safe-top': props.safeAreaInsetTop && props.position === 'top',
  'popup-panel--safe-bottom': props.safeAreaInsetBottom && props.position === 'bottom',
}))

const radiusByPosition = computed(() => {
  if (props.radius) return props.radius
  if (!props.round) return '0'

  const map: Record<PopupPosition, string> = {
    top: '0 0 48rpx 48rpx',
    bottom: '48rpx 48rpx 0 0',
    left: '0 48rpx 48rpx 0',
    right: '48rpx 0 0 48rpx',
  }
  return map[props.position]
})

const rootStyle = computed(() => ({
  zIndex: String(props.zIndex),
}))

const overlayStyle = computed(() => ({
  transitionDuration: `${props.duration}ms`,
}))

const panelStyle = computed(() => {
  const style = {
    transitionDuration: `${props.duration}ms`,
    borderRadius: radiusByPosition.value,
  } as Record<string, string | number>

  if (typeof props.customStyle === 'string') {
    return [style, props.customStyle]
  }

  return [style, props.customStyle || {}]
})

watch(
  () => props.show,
  (visible) => {
    clearTimers()

    if (visible) {
      handleOpen()
      return
    }

    handleClose()
  },
  { immediate: true },
)

watch(
  () => props.show,
  (visible) => {
    if (!props.lockScroll) return

    if (visible) {
      lockBodyScroll()
      return
    }

    unlockBodyScroll()
  },
  { immediate: true },
)

function handleOpen() {
  emit('open')
  nextTick(() => {
    openTimer = setTimeout(() => {
      emit('opened')
    }, props.duration)
  })
}

function handleClose() {
  emit('close')
  closeTimer = setTimeout(() => {
    emit('closed')
  }, props.duration)
}

function requestClose(action: PopupCloseAction) {
  emit('update:show', false)
  if (action === 'icon') {
    emit('click-close-icon', null)
  }
}

function handleOverlayClick(event: unknown) {
  emit('click-overlay', event)
  if (!props.closeOnClickOverlay) return
  requestClose('overlay')
}

function handlePanelClick(event: unknown) {
  emit('click', event)
}

function handleCloseIconClick() {
  requestClose('icon')
}

function clearTimers() {
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function lockBodyScroll() {
  // #ifdef H5
  originalOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  // #endif
}

function unlockBodyScroll() {
  // #ifdef H5
  document.body.style.overflow = originalOverflow
  // #endif
}

onUnmounted(() => {
  clearTimers()
  unlockBodyScroll()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.popup-root {
  position: fixed;
  inset: 0;
}

.popup-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: $overlay-40;
  opacity: 0;
  transition-property: opacity;
  transition-timing-function: ease;
}

.popup-overlay--active {
  opacity: 1;
}

.popup-panel {
  position: absolute;
  z-index: 2;
  background: $bg-primary;
  box-shadow: $shadow-md;
  box-sizing: border-box;
  transition-property: transform, opacity;
  transition-timing-function: ease;
  opacity: 0;
}

/* 仅控制显隐；位移必须与 position 组合，否则后面的 .popup-panel--bottom 等会覆盖 transform，导致面板永在屏外 */
.popup-panel--active {
  opacity: 1;
}

.popup-panel--inactive {
  opacity: 0;
}

.popup-panel--top {
  top: 0;
  left: 0;
  width: 100%;
}

.popup-panel--top.popup-panel--inactive {
  transform: translate3d(0, -100%, 0);
}

.popup-panel--top.popup-panel--active {
  transform: translate3d(0, 0, 0);
}

.popup-panel--bottom {
  bottom: 0;
  left: 0;
  width: 100%;
  /* 高度与滚动由插槽内容控制（如 max-height + overflow-y），此处不裁剪，避免截断内置 picker */
  overflow: visible;
}

.popup-panel--bottom.popup-panel--inactive {
  transform: translate3d(0, 100%, 0);
}

.popup-panel--bottom.popup-panel--active {
  transform: translate3d(0, 0, 0);
}

.popup-panel--left {
  top: 0;
  left: 0;
  height: 100%;
}

.popup-panel--left.popup-panel--inactive {
  transform: translate3d(-100%, 0, 0);
}

.popup-panel--left.popup-panel--active {
  transform: translate3d(0, 0, 0);
}

.popup-panel--right {
  top: 0;
  right: 0;
  height: 100%;
}

.popup-panel--right.popup-panel--inactive {
  transform: translate3d(100%, 0, 0);
}

.popup-panel--right.popup-panel--active {
  transform: translate3d(0, 0, 0);
}

.popup-panel--safe-top {
  padding-top: env(safe-area-inset-top);
}

.popup-panel--safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-close {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-close__text {
  font-size: $font-md;
  line-height: 1;
  color: $text-tertiary;
}
</style>
