// ==============================
// 🍎 默认浅色主题 TS 配置
// 与 default.scss / base.scss 对齐，供 JS/TS 使用
// ==============================

/** 与 base.scss $alpha-* 数值一致 */
export const THEME_ALPHA = {
  a80: 0.8,
  a60: 0.6,
  a50: 0.5,
  a48: 0.48,
  a40: 0.4,
  a30: 0.3,
  a20: 0.2,
  a16: 0.16,
  a15: 0.15,
  a12: 0.12,
  a10: 0.1,
  a08: 0.08,
  a05: 0.05,
} as const;

export const THEME_OPACITY = {
  disabled: 0.3,
  inactive: 0.6,
} as const;

export const DEFAULT_THEME = {
  primary: '#007AFF',
  success: '#34C759',
  caution: '#FFCC00',
  warning: '#FF9500',
  danger: '#FF3B30',
  purple: '#AF52DE',
  info: '#5AC8FA',

  text: {
    primary: '#000000',
    secondary: '#3C3C3C',
    tertiary: '#8A8A8E',
    quaternary: '#BBBBBC',
  },

  bg: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
  },

  border: '#E5E5E7',
  borderSubtle: '#F0F0F0',

  /** 与 $fill-* 一致，供内联 style / 组件 prop */
  fill: {
    placeholderNeutral: 'rgba(217,217,217,0.48)',
    tagActiveSoft: 'rgba(139,214,252,0.6)',
  },

  overlay: {
    o80: 'rgba(0,0,0,0.8)',
    o50: 'rgba(0,0,0,0.5)',
    o40: 'rgba(0,0,0,0.4)',
    o20: 'rgba(0,0,0,0.2)',
    o10: 'rgba(0,0,0,0.1)',
    o05: 'rgba(0,0,0,0.05)',
  },

  shadowElev: {
    level1: '0 1px 2px rgba(0,0,0,0.08)',
    level2: '0 2px 8px rgba(0,0,0,0.12)',
    level3: '0 4px 16px rgba(0,0,0,0.16)',
  },
};
