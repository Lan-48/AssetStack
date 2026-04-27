/** 右侧头像展示地址；为空串时组件内回退为默认占位图 */
export type CustomNavBarProps = {
  avatarSrc?: string
}

export type CustomNavBarEmits = {
  /** 点击左侧菜单区域 */
  'menu-click': []
  /** 点击中部搜索区域 */
  'search-click': []
  /** 点击右侧头像区域（组件内仍会 navigateTo 设置页） */
  'setting-click': []
}
