"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "SettingsCell" },
  __name: "settings-cell",
  props: {
    label: {},
    showChevron: { type: Boolean, default: true }
  },
  emits: ["tap"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function onTap() {
      emit("tap");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(_ctx.label),
        b: _ctx.showChevron
      }, _ctx.showChevron ? {
        c: common_vendor.unref(common_assets.arrowBoldIcon)
      } : {}, {
        d: common_vendor.o(onTap)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-45a3846a"]]);
wx.createComponent(Component);
