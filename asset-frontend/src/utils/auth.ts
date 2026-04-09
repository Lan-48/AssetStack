const TOKEN_KEY = 'token';

export const getToken = (): string => {
  const v = uni.getStorageSync(TOKEN_KEY);
  return typeof v === 'string' ? v : '';
};

export const setToken = (token: string): void => {
  uni.setStorageSync(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  uni.removeStorageSync(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return Boolean(getToken());
};
