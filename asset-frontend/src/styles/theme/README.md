# 主题系统使用说明

本文档说明 `src/styles/theme` 目录下的结构、运行逻辑，以及日常开发中的推荐用法。

## 目录结构

| 路径 | 作用 |
|------|------|
| `index.scss` | **样式总入口**：引入基础变量、默认主题、把颜色映射为全局 CSS 变量，并定义 `.theme-dark` 与全局基础样式 |
| `base/base.scss` | **与主题无关的尺寸变量**：圆角、字号、间距、阴影（全主题共用） |
| `themes/default.scss` | 浅色主题：仅 Sass 颜色变量（`$primary`、`$text-primary` 等） |
| `themes/dark.scss` | 暗黑主题：同上，在 `.theme-dark` 下被 `@import` 后覆盖同名 `$*` |
| `ts/default.ts`、`ts/dark.ts` | 与对应 `.scss` **颜色值保持一致** 的 TS 对象，供逻辑层使用 |
| `ts/index.ts` | 导出 `THEMES`、`getTheme`、`setTheme`、`getCurrentTheme` |

应用在 `main.js` 中已全局引入：

```js
import '@/styles/theme/index.scss'
```

因此全局可用的包括：`body` 背景与文字色、`.btn` / `.card` / `.title` / `.desc` 等工具类，以及 `:root` 上的 CSS 变量。

## 核心逻辑（简述）

1. **基础层** `base.scss` 只提供 `$radius-*`、`$font-*`、`$spacing-*`、`$shadow-*`，不随主题切换。
2. **默认主题** `default.scss` 定义 `$primary`、`$text-primary`、`$bg-primary` 等 Sass 变量。
3. **入口** `index.scss` 在 `:root` 里把这些 Sass 变量写成 **CSS 自定义属性**，例如 `--primary: #{$primary}`，供 **H5 全局**（如 `body`、工具类）配合 `var(--*)` 做运行时换肤。
4. **暗黑模式**：给根节点（通常是 `html`）加上类名 `.theme-dark` 时，内部再次 `@import dark.scss`，用深色主题的 `$*` 覆盖同一批 `--*` 变量。
5. **uni-app 业务组件/页面（`*.vue` 的 scoped 样式）**：主题色请使用 **`themes/default.scss` 中的 `$*`**（如 `$bg-secondary`、`$text-primary`），编译为实色以兼容 **微信小程序 WXSS**（组件内 `var(--*)` 常不生效）。若还要暗黑模式，需另行处理（如根节点 class + 非 scoped 样式、条件编译、`getTheme` 绑定等）。
6. **TS 侧**：`DEFAULT_THEME` / `DARK_THEME` 与 SCSS 颜色对齐，用于图表、Canvas、原生组件属性等 **无法写 CSS 变量** 的场景；`setTheme` 通过操作 `document.documentElement.classList` 切换 `theme-dark` 等类名。

## 日后如何使用

### 原则

- **颜色、背景、边框（业务 `.vue` scoped）**：`@import '@/styles/theme/themes/default.scss'` 后使用 **`$primary`、`$text-primary`、`$bg-secondary`、`$border`** 等 Sass 变量，以兼容小程序；**不要用** `var(--*)` 写组件内主题色（小程序常无效）。
- **H5 全局 / 工具类**：仍可通过 `index.scss` 中的 **`var(--*)`** 与 `.theme-dark` 做运行时换肤（见下方「CSS 变量一览」）。
- **尺寸（字号、间距、圆角、阴影）**：`@import '@/styles/theme/base/base.scss'` 后使用 **`$font-*`、`$spacing-*`** 等。
- **JS/TS 里需要颜色字符串**：从 `@/styles/theme/ts/index` 使用 **`getTheme('default' | 'dark')`** 或读 `THEMES`，并保持与 SCSS 修改同步。
- **新增主题**：新增 `themes/xxx.scss` + `ts/xxx.ts`，在 `index.scss` 的 `.theme-xxx` 块中 mirror `:root` 的 `--*` 赋值，并在 `ts/index.ts` 的 `THEMES` 中注册；`setTheme` 会为非 `default` 主题添加 `theme-xxx` 类名。

### CSS 变量一览（主要给 H5 全局与 `var(--*)` 场景；业务组件请优先用上方 `$*`）

| 分类 | 变量名 |
|------|--------|
| 功能色 | `--primary`、`--success`、`--warning`、`--danger`、`--info` |
| 文字 | `--text-primary`、`--text-secondary`、`--text-tertiary`、`--text-quaternary` |
| 背景 | `--bg-primary`、`--bg-secondary`、`--bg-tertiary` |
| 边框 | `--border` |

---

## 常用场景与示例

### 1. 页面/卡片使用主题色与背景

```vue
<template>
  <view class="page">
    <view class="panel">内容</view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/theme/base/base.scss';
@import '@/styles/theme/themes/default.scss';

.page {
  min-height: 100vh;
  background-color: $bg-secondary;
  color: $text-primary;
}

.panel {
  background-color: $bg-primary;
  border: 1rpx solid $border;
  border-radius: $radius-lg;
}
</style>
```

### 2. 组件内使用基础尺寸变量（与主题无关）

```vue
<style scoped lang="scss">
@import '@/styles/theme/base/base.scss';

.item {
  padding: $spacing-md $spacing-base;
  font-size: $font-base;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}
</style>
```

### 3. 强调色按钮或链接（跟随主题）

```vue
<template>
  <button class="action">确认</button>
</template>

<style scoped lang="scss">
@import '@/styles/theme/themes/default.scss';

.action {
  background-color: $primary;
  color: #fff;
}
</style>
```

也可直接使用入口已提供的工具类：`<button class="btn btn-primary">`。

### 4. 次要说明文字

```vue
<style scoped lang="scss">
@import '@/styles/theme/themes/default.scss';

.hint {
  font-size: $font-sm;
  color: $text-tertiary;
}
</style>
```

### 5. 运行时切换主题（H5 等具备 `document.documentElement` 的环境）

```ts
import { setTheme, getCurrentTheme, getTheme } from '@/styles/theme/ts/index'

// 切换到暗黑
setTheme('dark')

// 恢复默认浅色（会移除 theme-* 类）
setTheme('default')

const current = getCurrentTheme() // 'default' | 'dark'

// 给 ECharts 等需要十六进制颜色的场景
const colors = getTheme(current)
// colors.primary, colors.text.primary, colors.bg.secondary ...
```

### 6. 条件编译：仅 H5 切换主题（小程序无 `document` 时需另行方案）

```ts
// #ifdef H5
import { setTheme } from '@/styles/theme/ts/index'

function applyDark(enabled: boolean) {
  setTheme(enabled ? 'dark' : 'default')
}
// #endif
```

在非 H5 端若要暗黑模式，可考虑：在页面根 `view` 上动态绑定 `class="theme-dark"`（需保证该页或全局样式中 `.theme-dark` 对子节点生效），或结合 `uni.setStorageSync` 持久化用户选择后在 `App.vue` 根节点设置类名（视各端 DOM 结构而定）。

---

## 与演示页面对齐

可参考 `src/pages/demo-page/theme-demo-page.vue`：脚本中 `setTheme`（H5 等），样式中 `@import` `base.scss` 与 `themes/default.scss`，主题色用 **`$*`**。

## 维护注意

- 修改 `themes/default.scss` 或 `themes/dark.scss` 时，务必同步更新 `ts/default.ts`、`ts/dark.ts` 中对应字段，避免「界面跟图表颜色不一致」。
- 新增颜色时：先在主题 SCSS 增加 `$xxx`，再在 `index.scss` 的 `:root` 与 `.theme-dark` 中各增加一行 `--xxx: #{$xxx};`（供 H5 `var(--*)`）；**业务 `.vue` scoped 中请使用 `$xxx`**，与小程序对齐。
