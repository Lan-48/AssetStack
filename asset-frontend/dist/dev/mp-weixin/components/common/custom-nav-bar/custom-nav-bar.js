"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "CustomNavBar" },
  __name: "custom-nav-bar",
  emits: ["menu-click", "search-click", "setting-click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function onMenuClick() {
      emit("menu-click");
    }
    function onSearchClick() {
      emit("search-click");
    }
    function onSettingClick() {
      emit("setting-click");
      common_vendor.index.navigateTo({
        url: "/pages/setting/setting-page"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onMenuClick),
        b: common_vendor.o(onSearchClick),
        c: common_vendor.unref(common_assets.avatarImg),
        d: common_vendor.o(onSettingClick)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-08d8e284"]]);
wx.createComponent(Component);
