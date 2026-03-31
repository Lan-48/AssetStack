/** 筛选变更事件载荷：区分是「状态」还是「排序」等，以及当前选中的值 */
export type AssetStatsCardFilterChangePayload = {
  type: string
  value: string
}

export type AssetStatsCardProps = {
  /** 卡片主标题 */
  title?: string
  /** 当前筛选条件下的资产数量 */
  count?: number
  /** 资产总数量，与 count 组成「count/totalCount」 */
  totalCount?: number
  /** 左侧指标名称（如总资产） */
  leftLabel?: string
  /** 左侧指标数值 */
  leftValue?: string | number
  /** 右侧指标名称（如总日均） */
  rightLabel?: string
  /** 右侧指标数值 */
  rightValue?: string | number
}

export type AssetStatsCardEmits = {
  /** 状态或排序下拉变更时向父组件上报 */
  'filter-change': [payload: AssetStatsCardFilterChangePayload]
}
