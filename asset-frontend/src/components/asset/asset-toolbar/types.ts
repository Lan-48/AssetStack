/** 资产列表工具栏：网格 / 列表视图 */
export type AssetToolbarViewMode = 'grid' | 'list'

/** 与 CommonDropdown 一致：一级含 value/label/children（二级为 { value, label }[]） */
export type AssetToolbarCategoryOption = {
  label: string
  value: number
  children?: Array<{ label: string; value: number }>
}

export type AssetToolbarProps = {
  /** 当前视图模式，用于高亮对应切换按钮 */
  viewMode?: AssetToolbarViewMode
  /** 分类下拉选项（首项一般为「全部」value=0）；来自 GET /asset-categories/tree 转换 */
  options?: AssetToolbarCategoryOption[]
  /** 当前选中的分类 id，0 表示全部；与下拉 v-model 同步 */
  categoryFilterId?: number
}

export type CategoryFilterPayload = {
  value: number
  label: string
}

export type AssetToolbarEmits = {
  /** v-model:viewMode，切换宫格 / 列表 */
  'update:viewMode': [mode: AssetToolbarViewMode]
  /** 排序相关（预留接口，与历史用法兼容） */
  'sort-change': [value: any]
  /** 与 v-model:categoryFilterId 同步 */
  'update:categoryFilterId': [id: number]
  /** 分类选中：value 为分类表 id，0 为全部；label 为展示名（与资产 category 文案或筛选用名一致） */
  'filter-category-change': [payload: CategoryFilterPayload]
}
