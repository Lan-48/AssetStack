import request from './request';

// 获取资产列表
export const fetchAssetList = (params) => {
  return request.get('/asset/list', { params });
};

// 获取资产详情
export const fetchAssetDetail = (id) => {
  return request.get(`/asset/detail?id=${id}`);
};

// 新增资产
export const createAsset = (data) => {
  return request.post('/asset/add', data);
};

// 更新资产
export const updateAsset = (id, data) => {
  return request.put(`/asset/update?id=${id}`, data);
};

// 删除资产
export const deleteAsset = (id) => {
  return request.delete(`/asset/delete?id=${id}`);
};