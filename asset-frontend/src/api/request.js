import { BASE_URL } from './config';

const baseURL = BASE_URL;

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.contentType || 'application/json',
        ...options.header,
      },
      success: (res) => {
        // 响应拦截器逻辑
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          uni.showToast({ title: '登录已过期', icon: 'none' });
          // 跳转登录页
          uni.redirectTo({ url: '/pages/login/login' });
          reject(res);
        } else {
          uni.showToast({ title: res.data?.message || '请求失败', icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 封装 GET/POST/PUT/DELETE
request.get = (url, config = {}) => {
  return request({
    url,
    method: 'GET',
    ...config,
    data: config.params || {}
  });
};

request.post = (url, data, config = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...config
  });
};

request.put = (url, data, config = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...config
  });
};

request.delete = (url, config = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...config
  });
};

export default request;