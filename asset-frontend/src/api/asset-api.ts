import request from './request'

export const fetchAssetList = (params?: Record<string, unknown>) => request.get('/asset/list', { params })

export const fetchAssetDetail = (id: string | number) => request.get(`/asset/detail?id=${id}`)

export const createAsset = (data: Record<string, unknown>) => request.post('/asset/add', data)

export const updateAsset = (id: string | number, data: Record<string, unknown>) =>
  request.put(`/asset/update?id=${id}`, data)

export const deleteAsset = (id: string | number) => request.delete(`/asset/delete?id=${id}`)
