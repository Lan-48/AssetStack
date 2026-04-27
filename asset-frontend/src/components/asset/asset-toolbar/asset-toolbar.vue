<!--
  组件名称：AssetToolbar

  组件描述：资产列表页工具栏，包含分类筛选下拉与网格/列表视图切换按钮组；分类首项为「全部」（在当前状态下不按分类过滤），触发器圆角与视图切换按钮一致。

  组件参数说明：
  - viewMode: 当前视图模式（grid 或 list），用于高亮对应按钮

  组件事件说明：
  - update:viewMode: 点击切换视图模式时触发（触发载荷为新的 viewMode）
  - sort-change: 排序变化事件（当前排序 UI 可能已被注释，事件保持接口兼容）
  - filter-category-change: 分类下拉选中变更，载荷为选项 label 文案；与列表「全部 / 具体分类」筛选对齐

  组件使用示例：
  <AssetToolbar
    v-model:viewMode="viewMode"
    v-model:category-filter-id="filterCategoryId"
    :options="categoryDropdownOptions"
    @filter-category-change="onCategoryFilterChange"
  />
-->
<template>
  <view class="toolbar">
    <Dropdown
      :model-value="categoryFilterId"
      variant="toolbar"
      :options="resolvedOptions"
      title="分类"
      width="300rpx"
      @update:model-value="onDropdownModelValue"
      @change="onCategoryChange"
    />

    <view class="view-switch">
      <image
        :src="gridModeIcon"
        class="view-icon grid-icon"
        :class="{ active: props.viewMode === 'grid' }"
        @tap="switchView('grid')"
      />
      <view class="divider" />
      <image
        :src="listModeIcon"
        class="view-icon list-icon"
        :class="{ active: props.viewMode === 'list' }"
        @tap="switchView('list')"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import gridModeIcon from '@/assets/icons/grid-mode.svg'
  import listModeIcon from '@/assets/icons/list-mode.svg'
  import Dropdown from '@/components/common/dropdown/dropdown.vue'
  import type { CommonDropdownChangePayload } from '@/components/common/dropdown/types'
  import type { AssetToolbarEmits, AssetToolbarProps, AssetToolbarViewMode } from './types'

  const props = withDefaults(defineProps<AssetToolbarProps>(), {
    viewMode: 'grid',
    categoryFilterId: 0,
    options: () => []
  })

  const emit = defineEmits<AssetToolbarEmits>()

  defineOptions({ name: 'AssetToolbar' })

  const categoryFilterId = computed(() => props.categoryFilterId ?? 0)

  const resolvedOptions = computed(() => {
    const o = props.options
    if (Array.isArray(o) && o.length > 0) return o
    return [{ label: '全部', value: 0, children: [] as { label: string; value: number }[] }]
  })

  function onDropdownModelValue(v: unknown) {
    const n = Number(v)
    emit('update:categoryFilterId', Number.isFinite(n) ? n : 0)
  }

  /** 将分类下拉的选中 id 与展示名同步给列表（供按 categoryId / 子树筛选） */
  function onCategoryChange(payload: CommonDropdownChangePayload) {
    const opt = payload.option
    if (opt != null && typeof opt === 'object' && 'value' in opt && 'label' in opt) {
      const value = Number((opt as { value: number }).value)
      const label = String((opt as { label: unknown }).label)
      emit('filter-category-change', {
        value: Number.isFinite(value) ? value : 0,
        label
      })
      return
    }
    emit('filter-category-change', { value: 0, label: '全部' })
  }

  function switchView(mode: AssetToolbarViewMode) {
    if (mode === props.viewMode) return
    emit('update:viewMode', mode)
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .toolbar {
    display: flex;
    justify-content: space-between;
    /* 与右侧视图切换同高：由较高一侧决定行高，两侧均纵向撑满 */
    align-items: stretch;
    position: relative;
    z-index: 1;
    margin-bottom: $spacing-md;
  }

  .view-switch {
    display: flex;
    align-items: center;
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-xs;

    .view-icon {
      width: 40rpx;
      height: 40rpx;
      padding: 12rpx 20rpx;
      opacity: $opacity-inactive;
      transition: opacity 0.3s;

      &.active {
        opacity: 1;
      }
    }

    .divider {
      width: 1px;
      height: 48rpx;
      background-color: $border;
    }
  }
</style>
