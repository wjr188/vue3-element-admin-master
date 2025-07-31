// src/store/adminPointsExchange.ts
import { defineStore } from "pinia";
import {
  getExchangeList,
  createExchangeItem,
  updateExchangeItem,
  deleteExchangeItem,
  toggleExchangeStatus,
  getExchangeRecords,
  getPointsLogs,      // ⭐ 新增
  deletePointsLog,    // ⭐ 新增
  PointsExchangeItem,
  PointsExchangeRecord,
  PointsLogItem,      // ⭐ 新增
} from "@/api/adminPointsExchange";
import { ElMessage } from "element-plus";

export const useAdminPointsExchangeStore = defineStore("adminPointsExchange", {
  state: () => ({
    list: [] as PointsExchangeItem[],
    loading: false as boolean,

    // 兑换记录
    recordList: [] as PointsExchangeRecord[],
    recordTotal: 0,
    recordLoading: false,
    recordParams: {
      page: 1,
      pageSize: 20,
      uuid: "",
      exchange_id: undefined as number | undefined,
      type: "",
    },

    // ⭐ 积分流水
    logList: [] as PointsLogItem[],
    logTotal: 0,
    logLoading: false,
    logParams: {
      page: 1,
      pageSize: 20,
      uuid: "",
      type: "",
    },
  }),
  actions: {
    // =========== 兑换商品 ============
    async fetchList() {
      this.loading = true;
      try {
        const res = await getExchangeList();
        if (res.code !== 0) {
          ElMessage.error(res.msg || "加载失败");
          this.list = [];
          return;
        }
        this.list = res.data;
      } catch (e) {
        ElMessage.error("请求失败，请稍后再试");
      } finally {
        this.loading = false;
      }
    },
    async addItem(item: Partial<PointsExchangeItem>) {
      const res = await createExchangeItem(item);
      if (res.code !== 0) {
        ElMessage.error(res.msg || "新增失败");
        return;
      }
      ElMessage.success(res.msg || "新增成功");
      await this.fetchList();
    },
    async updateItem(id: number, item: Partial<PointsExchangeItem>) {
      const res = await updateExchangeItem(id, item);
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败");
        return;
      }
      ElMessage.success(res.msg || "更新成功");
      await this.fetchList();
    },
    async removeItem(id: number) {
      const res = await deleteExchangeItem(id);
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败");
        return;
      }
      ElMessage.success(res.msg || "删除成功");
      await this.fetchList();
    },
    async toggleStatus(id: number) {
      const res = await toggleExchangeStatus(id);
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败");
        return;
      }
      ElMessage.success(res.msg || "操作成功");
      await this.fetchList();
    },

    // ============ 兑换记录 ============
    async fetchRecordList(params?: Partial<typeof this.recordParams>) {
      this.recordLoading = true;
      if (params) {
        this.recordParams = { ...this.recordParams, ...params };
      }
      try {
        const res = await getExchangeRecords(this.recordParams);
        if (res.code !== 0) {
          ElMessage.error(res.msg || "加载失败");
          this.recordList = [];
          this.recordTotal = 0;
          return;
        }
        this.recordList = res.data.list;
        this.recordTotal = res.data.total;
      } catch (e) {
        ElMessage.error("请求失败，请稍后再试");
      } finally {
        this.recordLoading = false;
      }
    },
    setRecordParams(params: Partial<typeof this.recordParams>) {
      this.recordParams = { ...this.recordParams, ...params };
    },

    // ============ 积分流水 ============
    async fetchLogList(params?: Partial<typeof this.logParams>) {
      this.logLoading = true;
      if (params) {
        this.logParams = { ...this.logParams, ...params };
      }
      try {
        const res = await getPointsLogs(this.logParams);
        if (res.code !== 0) {
          ElMessage.error(res.msg || "加载失败");
          this.logList = [];
          this.logTotal = 0;
          return;
        }
        this.logList = res.data.list;
        this.logTotal = res.data.total;
      } catch (e) {
        ElMessage.error("请求失败，请稍后再试");
      } finally {
        this.logLoading = false;
      }
    },
    async removeLog(id: number) {
      const res = await deletePointsLog(id);
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败");
        return;
      }
      ElMessage.success(res.msg || "删除成功");
      await this.fetchLogList();
    },
    setLogParams(params: Partial<typeof this.logParams>) {
      this.logParams = { ...this.logParams, ...params };
    },
  },
});
