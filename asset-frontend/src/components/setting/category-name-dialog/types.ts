export type CategoryNameDialogProps = {
  /** 是否展示（v-model:show） */
  show: boolean
  /** 标题，如「新增分类」「修改分类」 */
  title: string
  /** 输入框绑定（v-model） */
  modelValue: string
  /** 最大长度 */
  maxlength?: number
  /** 根节点 z-index，需高于页面其他浮层 */
  zIndex?: number
}

export type CategoryNameDialogEmits = {
  'update:show': [value: boolean]
  'update:modelValue': [value: string]
  /** 点击右侧勾选时触发，值为去首尾空白后的字符串 */
  confirm: [value: string]
}
