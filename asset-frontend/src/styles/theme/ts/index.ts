// ==============================
// 🎯 主题系统 TS 入口
// 统一导出所有主题 + 工具函数
// ==============================
import { DEFAULT_THEME, THEME_ALPHA, THEME_OPACITY } from './default';
import { DARK_THEME } from './dark';

export { DEFAULT_THEME, DARK_THEME, THEME_ALPHA, THEME_OPACITY };

// 所有主题集合
export const THEMES = {
  default: DEFAULT_THEME,
  dark: DARK_THEME,
  // 新增主题直接在这里添加，例如：
  // red: RED_THEME,
  // blue: BLUE_THEME,
};

// 主题类型（自动推导，避免魔法字符串）
export type ThemeType = keyof typeof THEMES;

/**
 * 获取指定主题的配置
 * @param theme 主题名称
 * @returns 主题颜色配置
 */
export function getTheme(theme: ThemeType) {
  return THEMES[theme];
}

/**
 * 切换页面主题（通过给 html 标签加类名）
 * @param theme 目标主题
 */
export function setTheme(theme: ThemeType) {
  const root = document.documentElement;
  // 先移除所有主题类
  root.classList.remove(...Object.keys(THEMES).map(t => `theme-${t}`));
  // 再添加目标主题类
  if (theme !== 'default') {
    root.classList.add(`theme-${theme}`);
  }
}

/**
 * 获取当前页面激活的主题
 * @returns 当前主题名称
 */
export function getCurrentTheme(): ThemeType {
  const root = document.documentElement;
  for (const theme of Object.keys(THEMES) as ThemeType[]) {
    if (root.classList.contains(`theme-${theme}`)) {
      return theme;
    }
  }
  return 'default';
}