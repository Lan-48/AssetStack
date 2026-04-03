export type PopupPosition = 'top' | 'bottom' | 'left' | 'right'

export type PopupCloseAction = 'overlay' | 'icon'

export type PopupProps = {
  show: boolean
  position?: PopupPosition
  overlay?: boolean
  round?: boolean
  radius?: string
  closeable?: boolean
  closeOnClickOverlay?: boolean
  lockScroll?: boolean
  lazyRender?: boolean
  zIndex?: number
  duration?: number
  customStyle?: string | Record<string, string | number>
  safeAreaInsetTop?: boolean
  safeAreaInsetBottom?: boolean
}

export type PopupEmits = {
  'update:show': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
  click: [event: unknown]
  'click-overlay': [event: unknown]
  'click-close-icon': [event: unknown]
}
