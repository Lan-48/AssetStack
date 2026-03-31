"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  (CustomNavBar + BottomTab)();
}
const CustomNavBar = () => "../common/custom-nav-bar/custom-nav-bar.js";
const BottomTab = () => "../common/bottom-tab/bottom-tab.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "AppLayout" },
  __name: "layout",
  setup(__props) {
    const containerStyle = common_vendor.ref({});
    function syncTopSafeArea() {
      var _a;
      let insetPx = 0;
      try {
        const mb = common_vendor.index.getMenuButtonBoundingClientRect();
        if (mb && typeof mb.bottom === "number" && mb.bottom > 0) {
          insetPx = mb.bottom;
        }
      } catch {
      }
      if (!insetPx) {
        const sys = common_vendor.index.getSystemInfoSync();
        insetPx = ((_a = sys.safeAreaInsets) == null ? void 0 : _a.top) ?? sys.statusBarHeight ?? 0;
      }
      const spacingMdPx = common_vendor.index.upx2px(24);
      containerStyle.value = {
        paddingTop: `${insetPx + spacingMdPx}px`
      };
    }
    syncTopSafeArea();
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(syncTopSafeArea);
    });
    const onMenuClick = () => {
      console.log("点击菜单");
    };
    const onSearchClick = () => {
      console.log("点击搜索");
    };
    const onSettingClick = () => {
      console.log("点击设置");
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onMenuClick),
        b: common_vendor.o(onSearchClick),
        c: common_vendor.o(onSettingClick),
        d: common_vendor.s(containerStyle.value)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f657646e"]]);
wx.createComponent(Component);
