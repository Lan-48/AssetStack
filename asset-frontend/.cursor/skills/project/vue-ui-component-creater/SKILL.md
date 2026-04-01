---
name: vue-ui-component-creater
description: 指导按项目规范创建 Vue/uni-app UI 组件，包括目录放置、命名、文件头注释五模块、script 顺序与 components 层职责。Use when 用户要求新增 UI 组件、创建符合项目规范的组件、或从零编写组件时。Keywords = create component, new component, component, vue component, add component, 创建组件.
---

# 创建符合项目规范的 UI 组件

## 使用时机

- 用户要求「新增一个 UI 组件」「创建一个 xxx 组件」
- 需要从零编写符合项目规范的组件
- 需要确认新组件应放在哪个目录、如何命名、注释与代码顺序

## 快速流程

创建新组件时按以下顺序执行：

1. **确定放置目录**：`src/components/` 下，按照「通用 / 业务通用 / 页面级」等目录规范放置
2. **确定组件名**：使用 `[组件名]`，PascalCase 为 `Xxx`
3. **创建目录与文件（标准三文件）**：`xxx/index.ts`、`types.ts`、`xxx.vue`
4. **编写 .vue 文件**：文件顶部的五模块注释 → template → script setup → style scoped
5. **script 内顺序**：import → defineProps → defineEmits → 其他逻辑
6. **格式校验**：对当前组件展开一次 Code Review，确保符合规范

## 目录与放置

- **通用基础组件（general）**：`src/components/general/xxx/`，如导航栏、按钮、基础 Card 等
- **跨页面业务通用组件（common）**：`src/components/common/xxx/`，如通用业务卡片、通用弹层等
- **按页面/模块**：`src/components/<页面或模块>/xxx/`（如 `product-detail-page`、`product-catalog-page`、`my-page`）
- **平台特有**（若需要）：可按需增加 `src/components/h5/`、`src/components/weapp/` 等目录

每个组件目录默认包含（标准三文件结构）：

- `xxx.vue`：组件实现（必选）
- `types.ts`：Props、Emits 等类型定义（必选，统一管理类型）
- `index.ts`：统一导出组件与类型（必选，便于引用与重构）

## 命名规范

| 项       | 规范                     | 示例                |
|----------|--------------------------|---------------------|
| 文件夹   | `[组件名]/`          | `product-card/` |
| 单文件   | `[组件名].vue`       | `product-card.vue` |
| 组件名   | PascalCase          | `ProductCard`    |
| Props 类型 | `[组件名]Props`        | `ProductCardProps` |

## 文件头注释（五模块，顺序不可变）

`.vue` 文件**必须以一个 HTML 注释块开头**，且注释块内包含以下 5 个模块（顺序固定）：

1. **组件名称**：与文件名/组件名一致，不能为空  
2. **组件描述**：一句话说明用途，不能为空或只写「组件描述」  
3. **组件参数说明**：列表，每项为 `- 参数名: 说明`，至少 1 个参数  
4. **组件事件说明**：列表，每项为 `- 事件名: 触发时机`，至少 1 个事件（若无对外事件可写 `- 无: 暂无对外事件`）  
5. **组件使用示例**：包含完整组件标签，且至少有一个 props 或事件绑定示例  

示例：

```vue
<!--
  组件名称：ProductCard

  组件描述：产品卡片组件，用于展示相似产品的信息，包含产品图片、品牌、型号和价格等。

  组件参数说明：
  - product: 产品信息对象，包含 id、图片、品牌、型号、价格等

  组件事件说明：
  - click: 点击卡片时触发

  组件使用示例：
  <ProductCard
    :product="product"
    @click="handleClick"
  />
-->
```

## 文件结构与 script 顺序

- **标签顺序**：`<template>` → `<script setup lang="ts">` → `<style scoped lang="scss">`
- **script 内顺序**：
  1. 所有 `import` 语句（含类型 import）
  2. `defineProps`（若有）
  3. `defineEmits`（若有）
  4. 其余逻辑（computed、方法等）

示例：

```vue
<script setup lang="ts">
  import { computed } from 'vue'
  import type { ButtonProps } from './types'

  const props = withDefaults(defineProps<ButtonProps>(), { type: 'primary' })
  const emit = defineEmits<{ click: [e: any] }>()

  const handleClick = (e: any) => {
    if (props.disabled) return
    emit('click', e)
  }
</script>
```

## 示例：标准三文件组件目录

本 Skill 自带一个最小示例组件 `DemoCard`，完整三文件结构可在本 Skill 目录下的 `example/` 中查看并对照参考（路径相对于本 Skill 所在目录，便于迁移到其他项目）：

- `example/demo-card.vue`
- `example/types.ts`
- `example/index.ts`


## 组件职责（components 层）

- **只做 UI**：只负责展示与交互反馈，不包含业务逻辑  
- **数据来源**：通过 **props** 接收数据，不直接调用 api、不直接访问 store  
- **事件上报**：通过 **emit** 或 props 中的回调（如 `onClick`）向父组件传递事件  
- **禁止**：在组件内调用 api 层、使用 store、做业务判断（如权限、库存规则）；业务判断由父组件或 services 层完成，结果通过 props 传入  

## 创建后校验
- 对当前组件展开一次 Code Review，确保符合规范
