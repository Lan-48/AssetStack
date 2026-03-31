"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Math) {
  (SettingsCell + SettingsSection)();
}
const SettingsCell = () => "../../components/common/settings-cell/settings-cell.js";
const SettingsSection = () => "../../components/common/settings-section/settings-section.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "setting-page",
  setup(__props) {
    function onTap(name) {
      console.log(`${name} 点击`);
      common_vendor.index.showToast({ title: `${name}（待接入）`, icon: "none" });
    }
    function onUserTap() {
      onTap("用户资料");
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(common_assets.avatarImg),
        b: common_vendor.unref(common_assets.arrowBoldIcon),
        c: common_vendor.o(onUserTap),
        d: common_vendor.o(($event) => onTap("资产管理")),
        e: common_vendor.p({
          label: "资产管理"
        }),
        f: common_vendor.o(($event) => onTap("分类管理")),
        g: common_vendor.p({
          label: "分类管理"
        }),
        h: common_vendor.o(($event) => onTap("数据导入")),
        i: common_vendor.p({
          label: "数据导入"
        }),
        j: common_vendor.o(($event) => onTap("数据导出")),
        k: common_vendor.p({
          label: "数据导出"
        }),
        l: common_vendor.o(($event) => onTap("货币单位切换")),
        m: common_vendor.p({
          label: "货币单位切换"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-36d84a6e"]]);
wx.createPage(MiniProgramPage);
