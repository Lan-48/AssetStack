"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Math) {
  Dropdown();
}
const Dropdown = () => "../../common/dropdown/dropdown.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "AssetStatsCard" },
  __name: "asset-stats-card",
  props: {
    title: { default: "我的资产" },
    count: { default: 0 },
    totalCount: { default: 0 },
    leftLabel: { default: "总资产" },
    leftValue: { default: 0 },
    rightLabel: { default: "总日均" },
    rightValue: { default: 0 }
  },
  emits: ["filter-change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const statusOptions = ["在用", "退役", "预购入", "闲置"].map((label) => ({
      label,
      value: label
    }));
    const sortOptions = ["天数", "日均", "金额"].map((label) => ({
      label,
      value: label
    }));
    const statusValue = common_vendor.ref("");
    const sortValue = common_vendor.ref("");
    const countText = common_vendor.computed(() => `${props.count}/${props.totalCount}`);
    function handleFilterChange(type, value) {
      emit("filter-change", {
        type,
        value
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(_ctx.title),
        b: common_vendor.t(countText.value),
        c: common_vendor.o(($event) => handleFilterChange("状态", statusValue.value)),
        d: common_vendor.o(($event) => statusValue.value = $event),
        e: common_vendor.p({
          options: common_vendor.unref(statusOptions),
          ["support-submenu"]: false,
          title: "状态",
          width: "130rpx",
          ["hide-arrow"]: true,
          modelValue: statusValue.value
        }),
        f: common_vendor.o(($event) => handleFilterChange("排序", sortValue.value)),
        g: common_vendor.o(($event) => sortValue.value = $event),
        h: common_vendor.p({
          options: common_vendor.unref(sortOptions),
          ["support-submenu"]: false,
          title: "排序",
          width: "116rpx",
          ["hide-arrow"]: true,
          modelValue: sortValue.value
        }),
        i: common_vendor.t(_ctx.leftLabel),
        j: common_vendor.t(common_vendor.unref(common_vendor.formatAmount)(props.leftValue)),
        k: common_vendor.t(_ctx.rightLabel),
        l: common_vendor.t(common_vendor.unref(common_vendor.formatAmount)(props.rightValue))
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e066afa1"]]);
wx.createComponent(Component);
