<!--
  组件名称：CommonPopover

  组件描述：通用气泡弹出框组件，支持 reference 插槽触发、动作列表选择与外部点击关闭。

  组件参数说明：
  - show: 是否显示气泡（支持 v-model:show）
  - actions: 菜单项数组，含 text/icon/color/disabled/className
  - placement: 弹出方向，支持 top / bottom / left / right
  - theme: 主题风格，支持 light / dark
  - trigger: 触发方式，支持 click / manual
  - offset: 位置偏移 [水平像素, 垂直像素]；水平为负则整体左移
  - referenceHorizontalAlign: 仅 top/bottom 时有效，水平锚在触发区 start(左缘)/center(中心)/end(右缘)，默认 center；靠右的「…」常用 end 再配负的 offset[0] 微调
  - overlay: 是否显示遮罩层
  - showArrow: 是否显示小箭头
  - closeOnClickAction: 点击菜单项后是否自动关闭
  - closeOnClickOutside: 点击外部是否关闭
  - zIndex: 组件层级

  组件事件说明：
  - update:show: 显隐状态变化时触发
  - select: 点击菜单项时触发
  - open: 打开时触发
  - close: 关闭时触发

  组件使用示例：
  <CommonPopover
    v-model:show="showPopover"
    :actions="actions"
    placement="bottom"
    @select="handleSelect"
  >
    <template #reference>
      <view>点击我</view>
    </template>
  </CommonPopover>

  定位说明：top/bottom 时锚点水平取 reference 中心，面板用 translate(-50%,…) 居中；若整屏较窄导致右侧溢出，会在布局后按面板实际宽度将水平锚点夹紧到视口内（左右留边距）。
-->
<template>
  <view class="common-popover">
    <view class="common-popover__reference" @tap.stop="handleReferenceTap">
      <slot name="reference" />
    </view>

    <view
      v-if="visible && props.closeOnClickOutside"
      class="common-popover__backdrop"
      :class="{ 'common-popover__backdrop--overlay': props.overlay }"
      :style="backdropStyle"
      @tap="handleOutsideTap"
    />

    <view
      v-if="visible"
      class="common-popover__panel"
      :class="[panelThemeClass, panelPlacementClass]"
      :style="panelStyle"
      @tap.stop
    >
      <view v-if="props.showArrow" class="common-popover__arrow" :class="arrowPlacementClass" />
      <view class="common-popover__actions">
        <view
          v-for="(action, index) in props.actions"
          :key="`${index}-${action.text}`"
          class="common-popover__action"
          :class="[action.className, { 'common-popover__action--disabled': action.disabled }]"
          :style="{ color: action.color || undefined }"
          @tap.stop="handleSelect(action, index)"
        >
          <image
            v-if="action.icon"
            class="common-popover__action-icon"
            :src="action.icon"
            mode="aspectFit"
          />
          <text class="common-popover__action-text">{{ action.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
  import type {
    CommonPopoverAction,
    CommonPopoverPlacement,
    CommonPopoverProps,
    CommonPopoverReferenceHorizontalAlign
  } from './types'

  const props = withDefaults(defineProps<CommonPopoverProps>(), {
    show: false,
    actions: () => [],
    placement: 'bottom',
    theme: 'light',
    trigger: 'click',
    offset: () => [0, 12] as [number, number],
    referenceHorizontalAlign: 'center' as CommonPopoverReferenceHorizontalAlign,
    overlay: false,
    showArrow: true,
    closeOnClickAction: true,
    closeOnClickOutside: true,
    zIndex: 10050
  })

  const emit = defineEmits<{
    'update:show': [value: boolean]
    select: [action: CommonPopoverAction, index: number]
    open: []
    close: []
  }>()

  defineOptions({ name: 'CommonPopover' })

  const visible = ref(false)
  const anchor = ref({ x: 0, y: 0 })

  const panelThemeClass = computed(() => `common-popover__panel--${props.theme}`)
  const panelPlacementClass = computed(() => `common-popover__panel--${props.placement}`)
  const arrowPlacementClass = computed(() => `common-popover__arrow--${props.placement}`)

  const panelStyle = computed(() => {
    const [offsetX, offsetY] = props.offset
    const style: Record<string, string> = {
      left: `${anchor.value.x + offsetX}px`,
      top: `${anchor.value.y + offsetY}px`,
      zIndex: String(props.zIndex)
    }

    const transformMap: Record<CommonPopoverPlacement, string> = {
      top: 'translate(-50%, -100%)',
      bottom: 'translate(-50%, 0)',
      left: 'translate(-100%, -50%)',
      right: 'translate(0, -50%)'
    }
    style.transform = transformMap[props.placement]
    return style
  })

  const backdropStyle = computed(() => ({
    zIndex: String(props.zIndex - 1)
  }))

  watch(
    () => props.show,
    (next) => {
      visible.value = next
      if (next) {
        void nextTick(() => {
          refreshAnchorFromReferenceRect()
        })
      }
    },
    { immediate: true }
  )

  function handleReferenceTap(event: unknown) {
    if (props.trigger !== 'click') return
    updateAnchor(event)
    setVisible(!visible.value)
  }

  function handleOutsideTap() {
    if (!props.closeOnClickOutside) return
    setVisible(false)
  }

  function handleSelect(action: CommonPopoverAction, index: number) {
    if (action.disabled) return
    emit('select', action, index)
    if (props.closeOnClickAction) {
      setVisible(false)
    }
  }

  function setVisible(next: boolean) {
    if (visible.value === next) return
    visible.value = next
    emit('update:show', next)
    if (next) {
      emit('open')
      void nextTick(() => {
        refreshAnchorFromReferenceRect()
      })
    } else {
      emit('close')
    }
  }

  function updateAnchor(event: unknown) {
    const e = event as {
      detail?: { x?: number; y?: number }
      changedTouches?: Array<{ pageX?: number; pageY?: number; clientX?: number; clientY?: number }>
    }
    const touch = Array.isArray(e.changedTouches) ? e.changedTouches[0] : null
    const x = e.detail?.x ?? touch?.pageX ?? touch?.clientX
    const y = e.detail?.y ?? touch?.pageY ?? touch?.clientY

    if (typeof x === 'number' && typeof y === 'number') {
      anchor.value = { x, y }
      return
    }

    const sys = uni.getSystemInfoSync()
    anchor.value = {
      x: 187,
      y: (sys.statusBarHeight ?? 0) + 88
    }
  }

  /** 根据参考节点在视口中的矩形计算锚点（相对视口，与 fixed 一致）；避免依赖 tap 的 detail 坐标在各端不一致 */
  /** 将水平锚点中心限制在视口内，避免 translate(-50%) 下右侧或左侧被裁切 */
  function clampHorizontalCenter(
    centerX: number,
    panelW: number,
    windowW: number,
    margin: number
  ): number {
    const half = panelW / 2
    const minC = margin + half
    const maxC = windowW - margin - half
    if (minC > maxC) {
      return windowW / 2
    }
    return Math.min(Math.max(centerX, minC), maxC)
  }

  function clampAnchorToViewportHorizontal(attempt = 0) {
    const inst = getCurrentInstance()?.proxy
    if (!inst) return
    const p = props.placement
    if (p !== 'top' && p !== 'bottom') return

    const [offsetX] = props.offset
    const sys = uni.getSystemInfoSync()
    const windowW = sys.windowWidth ?? sys.screenWidth ?? 375
    const margin = uni.upx2px(24)

    uni
      .createSelectorQuery()
      .in(inst)
      .select('.common-popover__panel')
      .boundingClientRect((rect) => {
        if (!rect || typeof rect.width !== 'number' || rect.width <= 0) {
          if (attempt < 3) {
            setTimeout(() => clampAnchorToViewportHorizontal(attempt + 1), 32)
          }
          return
        }
        const panelW = rect.width
        const centerX = anchor.value.x + offsetX
        const nextCenter = clampHorizontalCenter(centerX, panelW, windowW, margin)
        if (Math.abs(nextCenter - centerX) > 0.5) {
          anchor.value = { x: nextCenter - offsetX, y: anchor.value.y }
        }
      })
      .exec()
  }

  /** 面板渲染后再量宽，双帧等待布局稳定 */
  function scheduleClampAnchorToViewportHorizontal() {
    void nextTick(() => {
      void nextTick(() => {
        clampAnchorToViewportHorizontal()
      })
    })
  }

  function refreshAnchorFromReferenceRect() {
    const inst = getCurrentInstance()?.proxy
    if (!inst) return
    uni
      .createSelectorQuery()
      .in(inst)
      .select('.common-popover__reference')
      .boundingClientRect((rect) => {
        if (
          !rect ||
          typeof rect.left !== 'number' ||
          typeof rect.top !== 'number' ||
          typeof rect.width !== 'number' ||
          typeof rect.height !== 'number'
        ) {
          return
        }
        const { left, top, width, height } = rect
        const p = props.placement
        const align = props.referenceHorizontalAlign ?? 'center'
        let alignX = left + width / 2
        if (align === 'start') alignX = left
        else if (align === 'end') alignX = left + width

        if (p === 'bottom') {
          anchor.value = { x: alignX, y: top + height }
        } else if (p === 'top') {
          anchor.value = { x: alignX, y: top }
        } else if (p === 'left') {
          anchor.value = { x: left, y: top + height / 2 }
        } else {
          anchor.value = { x: left + width, y: top + height / 2 }
        }
        scheduleClampAnchorToViewportHorizontal()
      })
      .exec()
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .common-popover {
    display: inline-flex;
  }

  .common-popover__reference {
    display: inline-flex;
  }

  .common-popover__backdrop {
    position: fixed;
    inset: 0;
    background: transparent;
  }

  .common-popover__backdrop--overlay {
    background: $overlay-10;
  }

  .common-popover__panel {
    position: fixed;
    min-width: 240rpx;
    max-width: 400rpx;
    box-sizing: border-box;
    border-radius: $radius-lg;
    overflow: visible;
    box-shadow: $shadow-md;
  }

  .common-popover__panel--light {
    background-color: $bg-secondary;
  }

  .common-popover__panel--dark {
    background-color: rgba(74, 74, 74, $alpha-80);
    box-shadow: $shadow-lg;
  }

  .common-popover__actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm;
    box-sizing: border-box;
  }

  .common-popover__panel--light .common-popover__action {
    background-color: $bg-primary;
    color: $text-primary;
  }

  .common-popover__panel--dark .common-popover__action {
    background-color: rgba(255, 255, 255, $alpha-12);
    color: $text-white;
  }

  .common-popover__action {
    min-height: $size-control-height-sm;
    padding: $spacing-sm $spacing-lg;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    font-size: $font-md;
    border-radius: $radius-full;
    box-sizing: border-box;
    text-align: center;
  }

  .common-popover__action--disabled {
    opacity: $opacity-inactive;
  }

  .common-popover__action-icon {
    width: $size-icon-inline;
    height: $size-icon-inline;
    flex-shrink: 0;
  }

  .common-popover__action-text {
    font-size: $font-base;
    color: inherit;
    line-height: 1.2;
  }

  .common-popover__arrow {
    position: absolute;
    width: 16rpx;
    height: 16rpx;
    background: inherit;
    transform: rotate(45deg);
  }

  .common-popover__arrow--top {
    left: 50%;
    bottom: -8rpx;
    margin-left: -8rpx;
  }

  .common-popover__arrow--bottom {
    left: 50%;
    top: -8rpx;
    margin-left: -8rpx;
  }

  .common-popover__arrow--left {
    right: -8rpx;
    top: 50%;
    margin-top: -8rpx;
  }

  .common-popover__arrow--right {
    left: -8rpx;
    top: 50%;
    margin-top: -8rpx;
  }
</style>
