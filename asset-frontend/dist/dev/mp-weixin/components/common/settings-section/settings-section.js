"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "SettingsSection" },
  __name: "settings-section",
  props: {
    title: { default: "" }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.title
      }, _ctx.title ? {
        b: common_vendor.t(_ctx.title)
      } : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-615d8798"]]);
wx.createComponent(Component);
