<!--
  组件名称：AssetToolbar

  组件描述：资产列表页工具栏，包含分类筛选下拉与网格/列表视图切换按钮组。

  组件参数说明：
  - viewMode: 当前视图模式（grid 或 list），用于高亮对应按钮

  组件事件说明：
  - update:viewMode: 点击切换视图模式时触发（触发载荷为新的 viewMode）
  - sort-change: 排序变化事件（当前排序 UI 可能已被注释，事件保持接口兼容）
  - filter-category-change: 分类下拉选中变更，载荷为选项 label 文案；与列表「全部 / 具体分类」筛选对齐

  组件使用示例：
  <AssetToolbar
    v-model:viewMode="viewMode"
    @sort-change="onSortChange"
    @filter-category-change="onCategoryFilterChange"
  />
-->
<template>
  <view class="toolbar">
    <Dropdown
      v-model="selectedValue"
      variant="toolbar"
      :options="options"
      title="分类"
      width="300rpx"
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
  import { ref, watch } from 'vue'
  import gridModeIcon from '@/assets/icons/grid-mode.svg'
  import listModeIcon from '@/assets/icons/list-mode.svg'
  import Dropdown from '@/components/common/dropdown/dropdown.vue'
  import type { CommonDropdownChangePayload } from '@/components/common/dropdown/types'
  import type { AssetToolbarEmits, AssetToolbarProps, AssetToolbarViewMode } from './types'

  const props = withDefaults(defineProps<AssetToolbarProps>(), {
    viewMode: 'grid',
  })

  const emit = defineEmits<AssetToolbarEmits>()

  defineOptions({ name: 'AssetToolbar' })

  /** 分类选中值（Dropdown v-model，勿用 null 以免与组件 modelValue 类型不一致） */
  const selectedValue = ref<number | undefined>(undefined)

  /** 符合 Dropdown 默认字段名的数据结构（label/value/children） */
  const options = [
    {
      label: '数码产品',
      value: 1,
      children: [
        { label: '手机', value: 11 },
        { label: '笔记本电脑', value: 12 },
        { label: '平板电脑', value: 13 },
      ],
    },
    {
      label: '家用电器',
      value: 2,
      children: [
        { label: '厨房电器', value: 21 },
        { label: '清洁电器', value: 22 },
        { label: '个人护理', value: 23 },
      ],
    },
    {
      label: '办公设备',
      value: 3,
      children: [],
    },
    {
      label: '其他',
      value: 4,
    },
  ]

  /** 将分类下拉的选项文案同步给列表页的 filterCategory */
  function onCategoryChange(payload: CommonDropdownChangePayload) {
    const opt = payload.option
    if (opt != null && typeof opt === 'object' && 'label' in opt) {
      emit('filter-category-change', String((opt as { label: unknown }).label))
      return
    }
    emit('filter-category-change', '全部')
  }

  watch(selectedValue, (v) => {
    if (v === undefined || v === null) {
      emit('filter-category-change', '全部')
    }
  })

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
    align-items: center;
    position: relative;
    z-index: 1;
    margin-bottom: $spacing-md;
  }

  .view-switch {
    display: flex;
    align-items: center;
    background: $bg-primary;
    border-radius: 32rpx;
    padding: 4rpx;

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
