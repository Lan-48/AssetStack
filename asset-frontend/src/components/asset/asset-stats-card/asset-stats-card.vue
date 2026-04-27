<!--
  组件名称：AssetStatsCard

  组件描述：资产统计卡片，展示标题与数量、状态/排序下拉筛选，以及左右两列金额类指标；状态筛选默认「在用」。

  组件参数说明：
  - title: 卡片主标题，默认「我的资产」
  - count: 当前筛选下的数量
  - totalCount: 总数量，与 count 组成「count/totalCount」展示
  - leftLabel / leftValue: 左侧指标名称与数值（如总资产）
  - rightLabel / rightValue: 右侧指标名称与数值（如总日均）

  组件事件说明：
  - filter-change: 状态或排序下拉变更时触发，载荷为 { type, value }（type 为「状态」或「排序」等）

  组件使用示例：
  <AssetStatsCard
    :count="5"
    :total-count="10"
    :left-value="totalAmount"
    :right-value="dailyAvg"
    @filter-change="onFilterChange"
  />
-->
<template>
  <view class="stats-card">
    <view class="header">
      <text class="title">{{ title }} {{ countText }}</text>
      <view class="filters">
        <view class="filter-btn">
          <Dropdown
            v-model="statusValue"
            :options="statusOptions"
            :support-submenu="false"
            title="状态"
            width="130rpx"
            :hide-arrow="true"
            @change="handleFilterChange('状态', statusValue)"
          />
        </view>
        <view class="filter-btn">
          <Dropdown
            v-model="sortValue"
            :options="sortOptions"
            :support-submenu="false"
            title="排序"
            width="116rpx"
            :hide-arrow="true"
            @change="handleFilterChange('排序', sortValue)"
          />
        </view>
      </view>
    </view>

    <view class="stats-row">
      <view class="col">
        <text class="label">{{ leftLabel }}</text>
        <text class="value">{{ formatAmount(props.leftValue) }}</text>
      </view>
      <view class="divider" />
      <view class="col">
        <text class="label">{{ rightLabel }}</text>
        <text class="value">{{ formatAmount(props.rightValue) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { formatAmount } from '@/utils/currency'
  import Dropdown from '@/components/common/dropdown/dropdown.vue'
  import type { AssetStatsCardEmits, AssetStatsCardProps } from './types'

  const props = withDefaults(defineProps<AssetStatsCardProps>(), {
    title: '我的资产',
    count: 0,
    totalCount: 0,
    leftLabel: '总资产',
    leftValue: 0,
    rightLabel: '总日均',
    rightValue: 0
  })

  const emit = defineEmits<AssetStatsCardEmits>()

  defineOptions({ name: 'AssetStatsCard' })

  /** 状态下拉选项：首项「全部」展示全部状态；其余与资产状态字段文案一致 */
  const statusOptions = ['全部', '在用', '退役', '预购入', '闲置'].map((label) => ({
    label,
    value: label
  }))

  /** 排序下拉选项 */
  const sortOptions = ['天数', '日均', '金额'].map((label) => ({
    label,
    value: label
  }))

  /** 当前选中的状态筛选值（由 Dropdown v-model 双向绑定），默认「在用」与列表页一致 */
  const statusValue = ref('在用')
  /** 当前选中的排序方式（由 Dropdown v-model 双向绑定） */
  const sortValue = ref('')

  /** 标题旁展示的「当前数/总数」文案 */
  const countText = computed(() => `${props.count}/${props.totalCount}`)

  /** 下拉变更时向父组件抛出 filter-change，便于列表页同步筛选与排序 */
  function handleFilterChange(type: string, value: string) {
    emit('filter-change', {
      type,
      value
    })
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .stats-card {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    box-sizing: border-box;
    margin: $spacing-md 0;
    height: 260rpx;
    box-shadow: $shadow-elev-1;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;

    .title {
      font-size: $font-md;
      color: $text-secondary;
      font-weight: 500;
    }

    .filters {
      display: flex;
      flex-direction: row;
      gap: $spacing-xs;
      align-items: center;

      .filter-btn {
        background-color: $bg-secondary;
        border-radius: $radius-md;
      }
    }
  }

  .stats-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .label {
      font-size: $font-sm;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }

    .value {
      font-size: $font-xl;
      font-weight: bold;
      color: $danger;
    }
  }

  .divider {
    width: 1px;
    height: 116rpx;
    background-color: $border;
    margin: 0 $spacing-sm;
    flex-shrink: 0;
  }
</style>
