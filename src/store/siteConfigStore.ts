import { defineStore } from "pinia";
import { fetchSiteConfigs, updateSiteConfigs } from "@/api/siteConfig";

export const useSiteConfigStore = defineStore("siteConfig", {
  state: () => ({
    configs: {} as Record<string, string>,
    loading: false,
  }),

  actions: {
    async loadConfigs() {
      this.loading = true;
      try {
        const res = await fetchSiteConfigs();
        console.log("后端原始响应：", res);

        // 重点：这里要改成res.data
        const raw = res.data?.data || {};

        // 解析
        const parsed: Record<string, any> = {};
        Object.entries(raw).forEach(([key, val]) => {
          if (val !== null && val !== undefined && /^\d+$/.test(String(val))) {
            parsed[key] = parseInt(val, 10);
          } else {
            parsed[key] = val;
          }
        });
        console.log("配置解析后：", parsed);

        this.configs = parsed;
      } finally {
        this.loading = false;
      }
    },

    async saveConfigs(newConfigs: Record<string, any>) {
      this.loading = true;
      try {
        console.log("🔵 提交纯对象：", newConfigs);
        const res = await updateSiteConfigs(newConfigs);
        console.log("🔵 后端返回：", res);
        await this.loadConfigs();
      } catch (err) {
        console.error("❌ 保存配置出错：", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
