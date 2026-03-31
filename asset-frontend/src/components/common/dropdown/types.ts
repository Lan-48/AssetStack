/** v-model 绑定值，与运行时 props 中 [String, Number, Object] 一致 */
export type CommonDropdownModelValue = string | number | Record<string, unknown> | null

/** 选项项：对象由 optionLabel / optionValue / childrenField 等字段解析 */
export type CommonDropdownOption = unknown

/** change 事件载荷 */
export type CommonDropdownChangePayload = {
  value: unknown
  option: unknown
  parentOption?: unknown
  isChild: boolean
}

/**
 * 与组件运行时 defineProps 对齐，供外部类型引用。
 * options 为必填；其余与默认值见组件实现。
 */
export type CommonDropdownProps = {
  modelValue?: CommonDropdownModelValue
  title?: string
  options: CommonDropdownOption[]
  optionLabel?: string
  optionValue?: string
  hideArrow?: boolean
  supportSubmenu?: boolean
  childrenField?: string
  childLabelField?: string
  childValueField?: string
  placeholder?: string
  disabled?: boolean
  width?: string
  maxHeight?: string
  autoExpandSelected?: boolean
  /** default | toolbar */
  variant?: string
}

export type CommonDropdownEmits = {
  'update:modelValue': [value: unknown]
  change: [payload: CommonDropdownChangePayload]
}
