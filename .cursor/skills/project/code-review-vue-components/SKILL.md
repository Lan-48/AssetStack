---
name: code-review-vue-components
description: Vue/uni-app 组件规范校验技能，用于 Code Review 时检验组件是否符合团队规范。Use when reviewing Vue/uni-app component files, checking component compliance with team standards, or validating component structure and documentation. Keywords = vue component, component validation, code review, component standards, vue/uni-app.
---

# 使用时机

- Code Review 时需要检验 Vue/uni-app 组件是否符合团队规范
- 需要验证组件文件结构和注释格式是否符合标准
- 检查组件代码顺序和结构是否符合规范要求
- 在编写或修改组件时需要确保符合团队规范

# 快速决策树

**第一步：识别组件文件**

- 检查是否为 `.vue` 文件
- 确认是否为 Vue/uni-app 组件
- 确实是否是UI 组件（UI Components）

**第二步：执行规范校验**

- 使用 `scripts/validate_component.py` 脚本进行自动校验
- 根据校验结果给出具体的修改建议

**第三步：输出审查意见**

- 列出所有不符合规范的问题
- 提供具体的修改建议和示例

# 组件规范检查项

## 1. 文件开头注释规范

- ✅ 文件开头必须是 HTML 注释块（`<!-- -->`）
- ✅ 注释块必须位于文件最顶部（不能有空行、import、template 在前）
- ✅ 注释块中必须包含以下 5 个模块，顺序不可变：
  - 组件名称
  - 组件描述
  - 组件参数说明
  - 组件事件说明
  - 组件使用示例

## 2. 注释内容格式规范

### 组件名称
- 必须存在且不能为空
- 必须与组件文件名或组件名高度相关

### 组件描述
- 必须存在且不能为空
- 不能只写"组件描述"四个字

### 组件参数说明
- 必须是列表结构
- 每个参数必须包含参数名
- 至少包含 1 个参数

### 组件事件说明
- 必须是列表结构
- 每个事件至少包含事件名和触发时机说明
- 至少包含 1 个事件

### 组件使用示例
- 必须存在
- 必须包含完整组件标签（例如 `<SearchInput ... />`）
- 必须包含至少一个 props 或事件绑定示例

## 3. 文件结构规范

- ✅ 必须包含 `<template>` 标签
- ✅ 必须包含 `<script setup lang="ts">` 标签（必须是 TypeScript）
- ✅ 必须包含 `<style scoped lang="scss">` 标签（必须是 scoped 和 SCSS）
- ✅ 标签顺序：template → script → style

## 4. 代码顺序规范

### script setup 中的代码顺序

1. **import 语句**：必须在最前面
2. **defineProps**：如果有，必须放在仅次于 import 的下面
3. **defineEmits**：如果有，必须放在仅次于 defineProps 的下面
4. **其他代码**：放在最后

### 示例

```typescript
<script setup lang="ts">
  // 1. import 必须在最前面
  import { ref } from 'vue'
  import type { ComponentProps } from './types'

  // 2. defineProps 必须在 import 之后
  const props = withDefaults(
    defineProps<ComponentProps>(),
    { ... }
  )

  // 3. defineEmits 必须在 defineProps 之后
  const emit = defineEmits<{
    click: []
  }>()

  // 4. 其他代码
  const handleClick = () => {
    emit('click')
  }
</script>
```

# 校验脚本使用

## 使用方法

```bash
python3 scripts/validate_component.py <vue_file_path>
```

## 输出说明

- **PASS**：组件符合所有规范
- **FAIL**：列出所有不符合规范的问题

## 示例输出

```
FAIL
  - 组件注释未位于文件顶部（文件开头必须是 <!--）
  - 缺少必须的模块: 组件事件说明
  - <script setup> 必须包含 lang="ts"
  - defineProps 必须放在仅次于 import 的下面
```

# 审查输出建议

- **优先级**：先标出高风险问题（缺少必需模块、文件结构错误、代码顺序错误）
- **引用方式**：在评论中引用技能名称和具体规范项
- **示例**："组件缺少【组件事件说明】模块，详见 `code-review-vue-components` 中的注释内容格式规范"
