/** 单行设置项：左侧文案 + 可选右侧箭头 */
export interface SettingsCellProps {
  /** 主文案 */
  label: string
  /** 是否展示右侧箭头，默认 true */
  showChevron?: boolean
}

export type SettingsCellEmits = {
  /** 点击整行时触发（uni-app 建议用 tap） */
  tap: []
}
