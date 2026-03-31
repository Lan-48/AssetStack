/** 设置页分组卡片：可选顶部分组标题 */
export interface SettingsSectionProps {
  /** 显示在白色卡片上方的分组标题，留空则不展示标题行 */
  title?: string
}

/** 无对外事件，仅通过默认插槽承载子项 */
export type SettingsSectionEmits = Record<string, never>
