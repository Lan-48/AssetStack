export type AssetFormPopupMode = 'create' | 'edit'

export type AssetFormSubmitPayload = {
  name: string
  /** 分类展示名；与分类表一致，优先由 categoryId 对应节点解析 */
  category: string
  /** 关联 `asset_categories.id`；为 null 表示未选或未绑定（与接口约定一致时由父层直传） */
  categoryId: number | null
  price: string
  purchaseDate: string
  warrantyDate: string
  status: string
  description: string
  /** 封面图公网地址，选图后经上传接口写入 */
  imageUrl: string
}

export type AssetFormPopupProps = {
  show: boolean
  mode?: AssetFormPopupMode
  modelValue?: Partial<AssetFormSubmitPayload>
  submitting?: boolean
}

export type AssetFormPopupEmits = {
  'update:show': [value: boolean]
  submit: [payload: AssetFormSubmitPayload]
  cancel: []
}
