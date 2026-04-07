export type AssetFormPopupMode = 'create' | 'edit'

export type AssetFormSubmitPayload = {
  name: string
  category: string
  price: string
  purchaseDate: string
  warrantyDate: string
  status: string
  description: string
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
