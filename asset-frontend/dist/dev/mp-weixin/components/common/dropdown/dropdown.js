"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "CommonDropdown" },
  __name: "dropdown",
  props: {
    modelValue: {
      type: [String, Number, Object],
      default: null
    },
    title: {
      type: String,
      default: "选择项"
    },
    options: {
      type: Array,
      required: true
    },
    optionLabel: {
      type: String,
      default: "label"
    },
    optionValue: {
      type: String,
      default: "value"
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
      default: "children"
    },
    childLabelField: {
      type: String,
      default: "label"
    },
    childValueField: {
      type: String,
      default: "value"
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: "200px"
    },
    maxHeight: {
      type: String,
      default: "300px"
    },
    autoExpandSelected: {
      type: Boolean,
      default: true
    },
    /** default | toolbar：toolbar 在组件内写样式，避免小程序端父级 :deep 不生效 */
    variant: {
      type: String,
      default: "default"
    }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "4af27b2c": __props.maxHeight
    }));
    const props = __props;
    const emit = __emit;
    const isOpen = common_vendor.ref(false);
    common_vendor.ref(null);
    const expandedValues = common_vendor.ref(/* @__PURE__ */ new Set());
    common_vendor.watch(() => props.modelValue, (newVal) => {
      if (props.autoExpandSelected && newVal && props.supportSubmenu) {
        common_vendor.nextTick$1(() => {
          autoExpandForSelectedValue(newVal);
        });
      }
    }, { immediate: true });
    const displayText = common_vendor.computed(() => {
      if (!props.modelValue) return null;
      const parentOption = props.options.find(
        (opt) => getOptionValue(opt) === props.modelValue
      );
      if (parentOption) {
        return getOptionLabel(parentOption);
      }
      if (props.supportSubmenu) {
        for (const option of props.options) {
          if (hasChildren(option)) {
            const child = getChildren(option).find(
              (child2) => getChildValue(child2) === props.modelValue
            );
            if (child) {
              return getChildLabel(child);
            }
          }
        }
      }
      return props.placeholder;
    });
    function getOptionLabel(option) {
      return typeof option === "object" ? option[props.optionLabel] : option;
    }
    function getOptionValue(option) {
      return typeof option === "object" ? option[props.optionValue] : option;
    }
    function getChildLabel(child) {
      return typeof child === "object" ? child[props.childLabelField] : child;
    }
    function getChildValue(child) {
      return typeof child === "object" ? child[props.childValueField] : child;
    }
    function hasChildren(option) {
      if (typeof option !== "object") return false;
      const children = option[props.childrenField];
      return Array.isArray(children) && children.length > 0;
    }
    function getChildren(option) {
      return option[props.childrenField] || [];
    }
    function isSelected(option) {
      const optionValue = getOptionValue(option);
      return optionValue === props.modelValue;
    }
    function isExpanded(option) {
      return expandedValues.value.has(getOptionValue(option));
    }
    function toggleExpand(option) {
      const value = getOptionValue(option);
      if (expandedValues.value.has(value)) {
        expandedValues.value.delete(value);
      } else {
        expandedValues.value.add(value);
      }
    }
    function autoExpandForSelectedValue(selectedValue) {
      expandedValues.value.clear();
      for (const option of props.options) {
        if (hasChildren(option)) {
          const child = getChildren(option).find(
            (child2) => getChildValue(child2) === selectedValue
          );
          if (child) {
            expandedValues.value.add(getOptionValue(option));
            break;
          }
        }
      }
    }
    function selectParentOption(option) {
      const value = getOptionValue(option);
      emit("update:modelValue", value);
      emit("change", {
        value,
        option,
        isChild: false
      });
      closeDropdown();
    }
    function selectChildOption(parentOption, child) {
      const value = getChildValue(child);
      emit("update:modelValue", value);
      emit("change", {
        value,
        option: child,
        parentOption,
        isChild: true
      });
      closeDropdown();
    }
    function toggleDropdown() {
      if (props.disabled) return;
      isOpen.value ? closeDropdown() : openDropdown();
    }
    function openDropdown() {
      var _a, _b, _c, _d;
      isOpen.value = true;
      if (props.autoExpandSelected && props.modelValue && props.supportSubmenu) {
        autoExpandForSelectedValue(props.modelValue);
      }
      (_b = (_a = common_vendor.index).onWindowResize) == null ? void 0 : _b.call(_a, handleResize);
      (_d = (_c = common_vendor.index).onKeyboardHeightChange) == null ? void 0 : _d.call(_c, handleResize);
    }
    function closeDropdown() {
      var _a, _b, _c, _d;
      isOpen.value = false;
      (_b = (_a = common_vendor.index).offWindowResize) == null ? void 0 : _b.call(_a, handleResize);
      (_d = (_c = common_vendor.index).offKeyboardHeightChange) == null ? void 0 : _d.call(_c, handleResize);
    }
    function handleResize() {
      closeDropdown();
    }
    common_vendor.onUnmounted(() => {
      var _a, _b, _c, _d;
      (_b = (_a = common_vendor.index).offWindowResize) == null ? void 0 : _b.call(_a, handleResize);
      (_d = (_c = common_vendor.index).offKeyboardHeightChange) == null ? void 0 : _d.call(_c, handleResize);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(displayText.value || __props.title),
        b: !__props.hideArrow
      }, !__props.hideArrow ? {
        c: isOpen.value ? 1 : "",
        d: common_vendor.unref(common_assets.arrowBoldIcon)
      } : {}, {
        e: __props.disabled ? 1 : "",
        f: common_vendor.o(toggleDropdown),
        g: isOpen.value
      }, isOpen.value ? {
        h: common_vendor.f(__props.options, (option, index, i0) => {
          return common_vendor.e({
            a: hasChildren(option) && __props.supportSubmenu
          }, hasChildren(option) && __props.supportSubmenu ? {
            b: isExpanded(option) ? 1 : "",
            c: common_vendor.unref(common_assets.arrowRightIcon),
            d: common_vendor.o(($event) => toggleExpand(option), `parent-${index}`)
          } : __props.supportSubmenu ? {} : {}, {
            e: common_vendor.t(getOptionLabel(option)),
            f: common_vendor.o(($event) => selectParentOption(option), `parent-${index}`),
            g: isSelected(option) ? 1 : "",
            h: hasChildren(option) && __props.supportSubmenu ? 1 : "",
            i: hasChildren(option) && isExpanded(option) && __props.supportSubmenu
          }, hasChildren(option) && isExpanded(option) && __props.supportSubmenu ? {
            j: common_vendor.f(getChildren(option), (child, childIndex, i1) => {
              return common_vendor.e(__props.supportSubmenu ? {} : {}, {
                a: common_vendor.t(getChildLabel(child)),
                b: `child-${index}-${childIndex}`,
                c: isSelected(child) ? 1 : "",
                d: common_vendor.o(($event) => selectChildOption(option, child), `child-${index}-${childIndex}`)
              });
            }),
            k: __props.supportSubmenu
          } : {}, {
            l: `parent-${index}`
          });
        }),
        i: __props.supportSubmenu,
        j: !__props.supportSubmenu ? 1 : "",
        k: __props.maxHeight
      } : {}, {
        l: isOpen.value
      }, isOpen.value ? {
        m: common_vendor.o(closeDropdown)
      } : {}, {
        n: __props.variant === "toolbar" ? 1 : "",
        o: common_vendor.s({
          width: __props.width
        }),
        p: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a841882"]]);
wx.createComponent(Component);
