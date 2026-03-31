"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...{ name: "AssetList" },
  __name: "asset-list",
  props: {
    assets: { default: () => [] },
    viewMode: { default: "grid" },
    filterStatus: { default: "全部" },
    filterCategory: { default: "全部" }
  },
  setup(__props) {
    const props = __props;
    const filteredAssets = common_vendor.computed(() => {
      return props.assets.filter((item) => {
        return (props.filterStatus === "全部" || item.status === props.filterStatus) && (props.filterCategory === "全部" || item.category === props.filterCategory);
      });
    });
    function dailyAvgPerDay(item) {
      const price = parseFloat(String(item.price));
      const days = item.days;
      if (!Number.isFinite(price) || !days) {
        return "0.00";
      }
      return (price / days).toFixed(2);
    }
    function goToDetail(item) {
      if (!item || !item.id) {
        common_vendor.index.showToast({ title: "资产信息无效", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/asset/detail/asset-detail-page?id=${item.id}`,
        fail: () => {
          common_vendor.index.showToast({ title: "跳转失败", icon: "none" });
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.viewMode === "grid"
      }, _ctx.viewMode === "grid" ? {
        b: common_vendor.f(filteredAssets.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.days),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.price),
            d: common_vendor.t(dailyAvgPerDay(item)),
            e: item.id,
            f: common_vendor.o(($event) => goToDetail(item), item.id)
          };
        })
      } : {
        c: common_vendor.f(filteredAssets.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: common_vendor.t(item.price),
            c: common_vendor.t(dailyAvgPerDay(item)),
            d: common_vendor.t(item.days),
            e: item.id,
            f: common_vendor.o(($event) => goToDetail(item), item.id)
          };
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c544397a"]]);
wx.createComponent(Component);
