"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Math) {
  (AssetStatsCard + AssetToolbar + AssetList + Layout)();
}
const Layout = () => "../../../components/layout/layout.js";
const AssetStatsCard = () => "../../../components/asset/asset-stats-card/asset-stats-card.js";
const AssetToolbar = () => "../../../components/asset/asset-toolbar/asset-toolbar.js";
const AssetList = () => "../../../components/asset/asset-list/asset-list.js";
const _sfc_main = {
  __name: "asset-list-page",
  setup(__props) {
    const assets = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const loadError = common_vendor.ref(false);
    const loadAssets = async () => {
      var _a;
      loadError.value = false;
      loading.value = true;
      try {
        const response = await common_vendor.fetchAssetList();
        console.log("后端返回的完整数据:", response);
        const list = (_a = response == null ? void 0 : response.data) == null ? void 0 : _a.list;
        assets.value = Array.isArray(list) ? list : [];
      } catch (error) {
        console.error("获取资产失败:", error);
        loadError.value = true;
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    common_vendor.onShow(() => {
      loadAssets();
    });
    const computedAssets = common_vendor.computed(() => {
      return assets.value.map((asset) => ({
        ...asset,
        days: common_vendor.calculateDaysToNow(asset.purchaseDate)
      }));
    });
    const filterStatus = common_vendor.ref("全部");
    const filterCategory = common_vendor.ref("全部");
    const viewMode = common_vendor.ref("list");
    const sortType = common_vendor.ref("name");
    const filteredAssets = common_vendor.computed(() => {
      return computedAssets.value.filter((asset) => {
        const statusMatch = filterStatus.value === "全部" || asset.status === filterStatus.value;
        const categoryMatch = filterCategory.value === "全部" || asset.category === filterCategory.value;
        return statusMatch && categoryMatch;
      });
    });
    const sortedAndFilteredAssets = common_vendor.computed(() => {
      const list = [...filteredAssets.value];
      list.sort((a, b) => {
        if (sortType.value === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortType.value === "amount") {
          return parseFloat(b.price) - parseFloat(a.price);
        }
        if (sortType.value === "days") {
          return b.days - a.days;
        }
        if (sortType.value === "dailyAvg") {
          const da = (x) => x.days > 0 ? parseFloat(x.price) / x.days : 0;
          return da(b) - da(a);
        }
        return 0;
      });
      return list;
    });
    const totalAmount = common_vendor.computed(() => {
      return filteredAssets.value.reduce((sum, item) => {
        return sum + (Number.parseFloat(String(item.price)) || 0);
      }, 0);
    });
    const dailyAvg = common_vendor.computed(() => {
      return filteredAssets.value.reduce((sum, item) => {
        const itemDailyAvg = item.days > 0 ? (Number.parseFloat(String(item.price)) || 0) / item.days : 0;
        return sum + itemDailyAvg;
      }, 0).toFixed(2);
    });
    const onFilterChange = ({ type, value }) => {
      if (type === "状态") {
        filterStatus.value = value || "全部";
        return;
      }
      if (type === "排序") {
        const sortMap = {
          天数: "days",
          金额: "amount",
          日均: "dailyAvg"
        };
        sortType.value = sortMap[value] ?? "name";
      }
    };
    const onSortChange = (type) => {
      if (type) sortType.value = type;
    };
    const onCategoryFilterChange = (label) => {
      filterCategory.value = label || "全部";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loadError.value
      }, loadError.value ? {
        b: common_vendor.o(loadAssets)
      } : common_vendor.e({
        c: sortedAndFilteredAssets.value
      }, sortedAndFilteredAssets.value ? {
        d: common_vendor.o(onFilterChange),
        e: common_vendor.p({
          count: filteredAssets.value.length,
          ["total-count"]: assets.value.length,
          ["left-value"]: totalAmount.value,
          ["right-value"]: dailyAvg.value
        })
      } : {}, {
        f: viewMode.value
      }, viewMode.value ? {
        g: common_vendor.o(onSortChange),
        h: common_vendor.o(onCategoryFilterChange),
        i: common_vendor.o(($event) => viewMode.value = $event),
        j: common_vendor.p({
          viewMode: viewMode.value
        })
      } : {}, {
        k: loading.value
      }, loading.value ? {} : common_vendor.e({
        l: common_vendor.p({
          assets: sortedAndFilteredAssets.value,
          ["view-mode"]: viewMode.value,
          ["filter-status"]: filterStatus.value,
          ["filter-category"]: filterCategory.value
        }),
        m: sortedAndFilteredAssets.value.length === 0
      }, sortedAndFilteredAssets.value.length === 0 ? {
        n: common_vendor.t(assets.value.length === 0 ? "暂无资产数据" : "当前筛选下暂无资产")
      } : {})));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8dd472b6"]]);
wx.createPage(MiniProgramPage);
