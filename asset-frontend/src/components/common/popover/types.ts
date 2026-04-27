export type CommonPopoverTheme = 'light' | 'dark'

export type CommonPopoverTrigger = 'click' | 'manual'

export type CommonPopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

/** 在 placement 为 top / bottom 时，水平锚点相对触发区域的位置；end 为触发区右缘，气泡整体更靠左 */
export type CommonPopoverReferenceHorizontalAlign = 'center' | 'start' | 'end'

export type CommonPopoverAction = {
  text: string
  icon?: string
  color?: string
  disabled?: boolean
  className?: string
}

export type CommonPopoverProps = {
  show?: boolean
  actions?: CommonPopoverAction[]
  placement?: CommonPopoverPlacement
  theme?: CommonPopoverTheme
  trigger?: CommonPopoverTrigger
  /** 相对锚点的像素偏移，[水平, 垂直]；水平为负则整体左移 */
  offset?: [number, number]
  /** 仅 top/bottom：水平锚在触发区的左缘 / 中心 / 右缘，便于靠右图标时向左展开 */
  referenceHorizontalAlign?: CommonPopoverReferenceHorizontalAlign
  overlay?: boolean
  showArrow?: boolean
  closeOnClickAction?: boolean
  closeOnClickOutside?: boolean
  zIndex?: number
}

export type CommonPopoverEmits = {
  'update:show': [value: boolean]
  select: [action: CommonPopoverAction, index: number]
  open: []
  close: []
}
