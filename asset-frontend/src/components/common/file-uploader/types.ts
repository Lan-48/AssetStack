export type FileUploaderStatus = 'uploading' | 'failed' | 'done'

export type FileUploaderItem = {
  url: string
  name?: string
  size?: number
  isImage?: boolean
  status?: FileUploaderStatus
  message?: string
  deletable?: boolean
}

export type FileUploaderProps = {
  modelValue?: FileUploaderItem[]
  multiple?: boolean
  maxCount?: number
  maxSize?: number
  previewSize?: string | number
  deletable?: boolean
  disabled?: boolean
  readonly?: boolean
  showUpload?: boolean
  previewImage?: boolean
  previewFullImage?: boolean
  uploadText?: string
}

export type FileUploaderEmits = {
  'update:modelValue': [value: FileUploaderItem[]]
  'after-read': [files: FileUploaderItem | FileUploaderItem[]]
  oversize: [files: FileUploaderItem[]]
  delete: [payload: { index: number; file: FileUploaderItem }]
  'click-upload': []
  'click-preview': [payload: { index: number; file: FileUploaderItem }]
}
