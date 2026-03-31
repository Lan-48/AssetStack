/** 资产列表工具栏：网格 / 列表视图 */
export type AssetToolbarViewMode = 'grid' | 'list'

export type AssetToolbarProps = {
  /** 当前视图模式，用于高亮对应切换按钮 */
  viewMode?: AssetToolbarViewMode
}

export type AssetToolbarEmits = {
  /** v-model:viewMode，切换宫格 / 列表 */
  'update:viewMode': [mode: AssetToolbarViewMode]
  /** 排序相关（预留接口，与历史用法兼容） */
  'sort-change': [value: any]
  /** 分类下拉选中项变更，payload 为选项文案；与列表 filterCategory 对齐，未选或清空时为「全部」 */
  'filter-category-change': [categoryLabel: string]
}
