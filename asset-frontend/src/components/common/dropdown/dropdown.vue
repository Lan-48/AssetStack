<!--
  组件名称：CommonDropdown

  组件描述：通用下拉选择组件，支持单级与二级分类、展开状态管理、选中回显与遮罩关闭。

  组件参数说明：
  - modelValue: 当前选中值（支持 string / number / object）
  - options: 下拉选项数组，支持 children 形成二级结构
  - supportSubmenu: 是否启用二级分类展开
  - hideArrow: 是否隐藏右侧箭头
  - disabled: 是否禁用点击展开
  - width / maxHeight: 容器宽度与菜单最大高度
  - variant: 外观变体，默认 default；toolbar 用于资产列表工具栏（与 H5/小程序样式一致，勿依赖父级 :deep）

  组件事件说明：
  - update:modelValue: 选择一级或二级项时触发，返回选中值
  - change: 选择项变化时触发，返回 { value, option, parentOption?, isChild }

  组件使用示例：
  <CommonDropdown
    v-model="selectedValue"
    :options="options"
    @change="handleChange"
  />
-->
<template>
  <view
    class="dropdown-container"
    :class="{ 'dropdown-container--toolbar': variant === 'toolbar' }"
    :style="{ width: width }"
    ref="dropdownRef"
  >
    <view
      class="dropdown-toggle"
      :class="{ 'dropdown-disabled': disabled }"
      @tap.stop="toggleDropdown"
    >
      <text class="selected-text">
        {{ displayText || title }}
      </text>
      <image
        v-if="!hideArrow"
        class="arrow-icon"
        :class="{ 'arrow-icon--open': isOpen }"
        :src="arrowBoldIcon"
        mode="aspectFit"
      />
    </view>

    <view v-if="isOpen" class="dropdown-menu" :style="{ maxHeight: maxHeight }">
      <scroll-view scroll-y="true" class="dropdown-scroll">
        <!-- 遍历所有分类（包括一级和其展开的二级分类） -->
        <template v-for="(option, index) in options" :key="`parent-${index}`">
          <!-- 一级分类 -->
          <view 
            class="dropdown-item parent-item"
            :class="{ 
              'selected': isSelected(option),
              'has-children': hasChildren(option) && supportSubmenu,
              'single-level': !supportSubmenu
            }"
          >
            <!-- 左侧展开图标（有子分类时显示） -->
            <view 
              v-if="hasChildren(option) && supportSubmenu" 
              class="expand-icon"
              @tap.stop="toggleExpand(option)"
            >
              <!-- 展开/收起图标占位 -->
              <image
                class="expand-icon-img"
                :class="{ 'expand-icon-img--expanded': isExpanded(option) }"
                :src="arrowRightIcon"
                mode="aspectFit"
              />
            </view>
            <view v-else-if="supportSubmenu" class="expand-placeholder"></view>
            
            <!-- 一级分类内容区域 -->
            <view 
              class="item-content" 
              @tap.stop="selectParentOption(option)"
            >
              <text class="item-text">{{ getOptionLabel(option) }}</text>
            </view>
          </view>

          <!-- 二级分类列表（当一级分类展开时显示） -->
          <view 
            v-if="hasChildren(option) && isExpanded(option) && supportSubmenu"
            class="children-container"
          >
            <!-- 遍历当前一级分类下的二级分类 -->
            <view 
              v-for="(child, childIndex) in getChildren(option)" 
              :key="`child-${index}-${childIndex}`"
              class="dropdown-item child-item"
              :class="{ 'selected': isSelected(child) }"
              @tap.stop="selectChildOption(option, child)"
            >
              <!-- 二级分类缩进占位 -->
              <view v-if="supportSubmenu" class="child-indent-placeholder"></view>
              <text class="item-text">{{ getChildLabel(child) }}</text>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>

    <view 
      v-if="isOpen" 
      class="dropdown-overlay" 
      @tap.stop="closeDropdown"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
/** 资源为向左的粗箭头，样式中通过 rotate 得到朝下/朝上 */
import arrowBoldIcon from '@/assets/icons/arrow-bold.png'
import arrowRightIcon from '@/assets/icons/arrow-right.png'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  title: {
    type: String,
    default: '选择项'
  },
  options: {
    type: Array,
    required: true
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  hideArrow: {
    type: Boolean,
    default: false
  },
  // 是否支持二级下拉菜单
  supportSubmenu: {
    type: Boolean,
    default: true
  },
  // 子分类字段名配置
  childrenField: {
    type: String,
    default: 'children'
  },
  childLabelField: {
    type: String,
    default: 'label'
  },
  childValueField: {
    type: String,
    default: 'value'
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '200px'
  },
  maxHeight: {
    type: String,
    default: '300px'
  },
  autoExpandSelected: {
    type: Boolean,
    default: true
  },
  /** default | toolbar：toolbar 在组件内写样式，避免小程序端父级 :deep 不生效 */
  variant: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

defineOptions({ name: 'CommonDropdown' })

// 状态管理
const isOpen = ref(false)
const dropdownRef = ref(null)

// 展开状态管理：存储被展开的一级分类的value
const expandedValues = ref(new Set<any>())

// 监听modelValue变化，如果自动展开选中项，则展开对应的父级
watch(() => props.modelValue, (newVal) => {
  if (props.autoExpandSelected && newVal && props.supportSubmenu) {
    nextTick(() => {
      autoExpandForSelectedValue(newVal)
    })
  }
}, { immediate: true })

// 显示文本计算
const displayText = computed(() => {
  if (!props.modelValue) return null
  
  // 先在一级分类中查找
  const parentOption = props.options.find(opt => 
    getOptionValue(opt) === props.modelValue
  )
  if (parentOption) {
    return getOptionLabel(parentOption)
  }
  
  // 在二级分类中查找（仅当支持二级分类时）
  if (props.supportSubmenu) {
    for (const option of props.options) {
      if (hasChildren(option)) {
        const child = getChildren(option).find((child: any) =>
          getChildValue(child) === props.modelValue
        )
        if (child) {
          return getChildLabel(child)
        }
      }
    }
  }
  
  return props.placeholder
})

// 工具函数：获取选项标签
function getOptionLabel(option: any) {
  return typeof option === 'object' ? option[props.optionLabel] : option
}

// 工具函数：获取选项值
function getOptionValue(option: any) {
  return typeof option === 'object' ? option[props.optionValue] : option
}

// 工具函数：获取子分类标签
function getChildLabel(child: any) {
  return typeof child === 'object' ? child[props.childLabelField] : child
}

// 工具函数：获取子分类值
function getChildValue(child: any) {
  return typeof child === 'object' ? child[props.childValueField] : child
}

// 检查是否有子分类
function hasChildren(option: any) {
  if (typeof option !== 'object') return false
  const children = option[props.childrenField]
  return Array.isArray(children) && children.length > 0
}

// 获取子分类数组
function getChildren(option: any) {
  return option[props.childrenField] || []
}

// 检查是否选中
function isSelected(option: any) {
  const optionValue = getOptionValue(option)
  return optionValue === props.modelValue
}

// 检查是否展开
function isExpanded(option: any) {
  return expandedValues.value.has(getOptionValue(option))
}

// 切换展开状态
function toggleExpand(option: any) {
  const value = getOptionValue(option)
  if (expandedValues.value.has(value)) {
    expandedValues.value.delete(value)
  } else {
    expandedValues.value.add(value)
  }
}

// 自动展开选中值对应的父级
function autoExpandForSelectedValue(selectedValue: any) {
  // 先清空所有展开状态
  expandedValues.value.clear()
  
  // 如果选中的是二级分类，找到对应的父级并展开
  for (const option of props.options) {
    if (hasChildren(option)) {
      const child = getChildren(option).find((child: any) => 
        getChildValue(child) === selectedValue
      )
      if (child) {
        expandedValues.value.add(getOptionValue(option))
        break
      }
    }
  }
}

// 选择一级分类
function selectParentOption(option: any) {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', { 
    value,
    option,
    isChild: false
  })
  closeDropdown()
}

// 选择二级分类
function selectChildOption(parentOption: any, child: any) {
  const value = getChildValue(child)
  emit('update:modelValue', value)
  emit('change', { 
    value,
    option: child,
    parentOption,
    isChild: true
  })
  closeDropdown()
}

// 切换下拉框显示
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value ? closeDropdown() : openDropdown()
}

function openDropdown() {
  isOpen.value = true
  // 打开时自动展开选中项对应的父级
  if (props.autoExpandSelected && props.modelValue && props.supportSubmenu) {
    autoExpandForSelectedValue(props.modelValue)
  }
  uni.onWindowResize?.(handleResize)
  uni.onKeyboardHeightChange?.(handleResize)
}

function closeDropdown() {
  isOpen.value = false
  uni.offWindowResize?.(handleResize)
  uni.offKeyboardHeightChange?.(handleResize)
}

function handleResize() {
  closeDropdown()
}

onUnmounted(() => {
  uni.offWindowResize?.(handleResize)
  uni.offKeyboardHeightChange?.(handleResize)
})
</script>

<style scoped lang="scss">
@use '@/styles/theme/base/base.scss' as *;
@use '@/styles/theme/themes/default.scss' as *;

.dropdown-container {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-sm;
  height: $size-control-height-sm;
  border-radius: $radius-xs;
  box-sizing: border-box;
}

.dropdown-disabled {
  background-color: $bg-secondary;
  color: $text-quaternary;
}

.selected-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $font-sm;
  color: $text-secondary;
  text-align: center;
}

.arrow-icon {
  width: $size-icon-inline;
  height: $size-icon-inline;
  margin-left: $spacing-xs;
  transition: transform 0.3s;
  /* 图稿朝左，顺时针 90° → 收起态朝下 */
  transform: rotate(90deg);
}

.arrow-icon--open {
  /* 再转 180° → 展开态朝上 */
  transform: rotate(-90deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: $spacing-xs;
  background: $bg-primary;
  border-radius: $radius-xs;
  box-shadow: $shadow-dropdown-panel;
  z-index: $z-dropdown-panel;
  overflow: hidden;
}

.dropdown-scroll {
  max-height: v-bind('maxHeight');
  padding: $spacing-xs;
  box-sizing: border-box;
}

/* 一级分类项样式 */
.dropdown-item {
  display: flex;
  align-items: center;
  min-height: $size-list-row-min;
  margin-bottom: $spacing-xs;
}

.parent-item.selected {
  background-color: rgba($info, $alpha-15);
  border-radius: $radius-sm;
}

/* 展开图标样式 */
.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $size-icon-cell;
  min-width: $size-icon-cell;
  height: $size-icon-cell;
  margin-left: $spacing-sm;
  margin-right: $spacing-xs;
  border-radius: $radius-xs;
}

.expand-placeholder {
  width: $size-icon-cell;
  min-width: $size-icon-cell;
  height: $size-icon-cell;
  margin-left: $spacing-sm;
  margin-right: $spacing-xs;
}

.expand-icon-img {
  width: $size-icon-cell;
  height: $size-icon-cell;
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}

.expand-icon-img--expanded {
  transform: rotate(90deg);
}

/* 一级分类内容区域 */
.item-content {
  padding: $spacing-xs 0;
}

.item-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
}

/* 二级分类容器 */
.children-container {
  background-color: rgba($bg-secondary, $alpha-80);
}

/* 二级分类项样式 */
.child-item {
  padding-left: $spacing-xs; /* 一级分类图标宽度 + 左边距 + 缩进 */
}

.child-item.selected {
  background-color: rgba($info, $alpha-15);
  border-radius: $radius-sm;
}

/* 二级分类缩进占位 */
.child-indent-placeholder {
  width: $size-icon-inline;
  min-width: $size-icon-inline;
  height: $size-icon-cell;
  margin-left: $spacing-sm;
  margin-right: $spacing-xs;
}

/* 一级下拉菜单样式 */
.parent-item.single-level {
  justify-content: center;
}

.parent-item.single-level .item-content {
  width: 100%;
  text-align: center;
}

.parent-item.single-level .item-text {
  text-align: center;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-dropdown-overlay;
  background-color: transparent;
}

/* 资产工具栏变体：写在子组件内，小程序端父级 scoped :deep 无法穿透自定义组件 */
.dropdown-container--toolbar {
  .dropdown-toggle {
    background: $bg-primary !important;
    border-radius: $radius-sm !important;
    /* 12rpx ≈ $spacing-sm - $spacing-xs/2，24rpx = $spacing-md */
    padding: calc(#{$spacing-sm} - #{$spacing-xs} / 2) $spacing-md !important;
    color: $text-primary !important;
    height: $spacing-base * 2;
    box-sizing: border-box;
    border: none !important;

    .selected-text {
      font-size: $font-sm !important;
      color: $text-primary !important;
    }
  }

  .dropdown-menu {
    border-radius: $radius-xs !important;
    overflow: hidden;
  }

  .dropdown-item.selected {
    border-radius: $radius-xs !important;
    min-height: $font-md + $spacing-xs !important;
    color: $primary !important;
    background-color: rgba($primary, $alpha-10) !important;
  }
}
</style>