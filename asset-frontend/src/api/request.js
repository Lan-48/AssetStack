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
        // NestJS POST 默认返回 201 Created，仅判断 200 会导致新增等接口被误判失败
        const status = res.statusCode
        if (status >= 200 && status < 300) {
          resolve(res.data);
        } else if (status === 401) {
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