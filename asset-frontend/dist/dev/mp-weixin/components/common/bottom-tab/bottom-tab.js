"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "BottomTab" },
  __name: "bottom-tab",
  setup(__props) {
    const activeTab = common_vendor.ref("asset");
    function addItem() {
      common_vendor.index.showToast({
        title: "新增功能开发中",
        icon: "none"
      });
    }
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage) {
        const route = currentPage.route || "";
        activeTab.value = route.includes("wardrobe") ? "wardrobe" : "asset";
      }
    });
    function switchTab(tabName) {
      activeTab.value = tabName;
      if (tabName === "asset") {
        common_vendor.index.navigateTo({
          url: "/pages/asset/list/asset-list-page"
        });
      } else if (tabName === "wardrobe") {
        common_vendor.index.navigateTo({
          url: "/pages/wardrobe/list/wardrobe-list-page"
        });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: activeTab.value === "asset" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("asset")),
        c: common_vendor.o(addItem),
        d: activeTab.value === "wardrobe" ? 1 : "",
        e: common_vendor.o(($event) => switchTab("wardrobe"))
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8799a46"]]);
wx.createComponent(Component);
