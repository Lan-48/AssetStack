/** 当前无对外 props（头像等资源在组件内 import） */
export type CustomNavBarProps = Record<string, never>

export type CustomNavBarEmits = {
  /** 点击左侧菜单区域 */
  'menu-click': []
  /** 点击中部搜索区域 */
  'search-click': []
  /** 点击右侧头像区域（组件内仍会 navigateTo 设置页） */
  'setting-click': []
}
