"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
if (!Math) {
  Dropdown();
}
const Dropdown = () => "../../common/dropdown/dropdown.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "AssetToolbar" },
  __name: "asset-toolbar",
  props: {
    viewMode: { default: "grid" }
  },
  emits: ["update:viewMode", "sort-change", "filter-category-change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const selectedValue = common_vendor.ref(void 0);
    const options = [
      {
        label: "数码产品",
        value: 1,
        children: [
          { label: "手机", value: 11 },
          { label: "笔记本电脑", value: 12 },
          { label: "平板电脑", value: 13 }
        ]
      },
      {
        label: "家用电器",
        value: 2,
        children: [
          { label: "厨房电器", value: 21 },
          { label: "清洁电器", value: 22 },
          { label: "个人护理", value: 23 }
        ]
      },
      {
        label: "办公设备",
        value: 3,
        children: []
      },
      {
        label: "其他",
        value: 4
      }
    ];
    function onCategoryChange(payload) {
      const opt = payload.option;
      if (opt != null && typeof opt === "object" && "label" in opt) {
        emit("filter-category-change", String(opt.label));
        return;
      }
      emit("filter-category-change", "全部");
    }
    common_vendor.watch(selectedValue, (v) => {
      if (v === void 0 || v === null) {
        emit("filter-category-change", "全部");
      }
    });
    function switchView(mode) {
      if (mode === props.viewMode) return;
      emit("update:viewMode", mode);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onCategoryChange),
        b: common_vendor.o(($event) => selectedValue.value = $event),
        c: common_vendor.p({
          variant: "toolbar",
          options,
          title: "分类",
          width: "300rpx",
          modelValue: selectedValue.value
        }),
        d: common_vendor.unref(common_assets.gridModeIcon),
        e: props.viewMode === "grid" ? 1 : "",
        f: common_vendor.o(($event) => switchView("grid")),
        g: common_vendor.unref(common_assets.listModeIcon),
        h: props.viewMode === "list" ? 1 : "",
        i: common_vendor.o(($event) => switchView("list"))
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3ea8e0e1"]]);
wx.createComponent(Component);
