import request from './request'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

export type AssetCategoryTreeNode = {
  id: number
  name: string
  category_level: 1 | 2
  is_default: number
  is_system: number
  sort_order: number
  item_count: number
  parent_id: number | null
  children?: AssetCategoryTreeNode[]
}

type CreateCategoryBody = {
  name: string
  category_level: 1 | 2
  parent_id?: number
  sort_order?: number
}

type UpdateCategoryBody = {
  name?: string
  sort_order?: number
}

export const fetchCategoryTree = (requestConfig?: { showErrorToast?: boolean }) =>
  request.get<ApiEnvelope<AssetCategoryTreeNode[]>>('/asset-categories/tree', requestConfig)

export const createAssetCategory = (
  body: CreateCategoryBody,
  requestConfig?: { showErrorToast?: boolean },
) => request.post<ApiEnvelope<AssetCategoryTreeNode>>('/asset-categories', body, requestConfig)

export const updateAssetCategory = (
  id: number,
  body: UpdateCategoryBody,
  requestConfig?: { showErrorToast?: boolean },
) => request.put<ApiEnvelope<AssetCategoryTreeNode>>(`/asset-categories/${id}`, body, requestConfig)

export const deleteAssetCategory = (id: number, requestConfig?: { showErrorToast?: boolean }) =>
  request.delete<ApiEnvelope<null>>(`/asset-categories/${id}`, requestConfig)
