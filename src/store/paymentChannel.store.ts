// src/store/paymentChannel.store.ts
import { defineStore } from 'pinia';
import {
  getPaymentChannelList,
  createPaymentChannel,
  updatePaymentChannel,
  deletePaymentChannel,
  togglePaymentChannelStatus,
  PaymentChannel,
} from '@/api/paymentChannel.api';

interface PaymentChannelState {
  list: PaymentChannel[];
  total: number;
  loading: boolean;
  searchParams: {
    page: number;
    pageSize: number;
    name?: string;
    type?: string; // 扩展用
    status?: 0 | 1; // 扩展用
    start_time?: string; // 统计开始时间
    end_time?: string;   // 统计结束时间
  };
}

export const usePaymentChannelStore = defineStore('paymentChannel', {
  state: (): PaymentChannelState => ({
    list: [],
    total: 0,
    loading: false,
    searchParams: {
      page: 1,
      pageSize: 10,
      name: '',
      type: undefined,
      status: undefined,
      start_time: undefined,
      end_time: undefined,
    },
  }),
  actions: {
    async fetchList() {
      this.loading = true;
      try {
        const res = await getPaymentChannelList(this.searchParams);
        if (res.data && res.data.code === 0) {
          this.list = res.data.data.list;
          this.total = res.data.data.total;
        } else {
          console.error('获取支付通道列表失败:', res.data?.msg);
          this.list = [];
          this.total = 0;
        }
      } catch (error) {
        console.error('请求支付通道列表出错:', error);
        this.list = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    async create(data: Omit<PaymentChannel, 'id' | 'create_time' | 'update_time' | 'total_amount' | 'today_amount'>) {
      const res = await createPaymentChannel(data);
      if (res.data && res.data.code === 0) {
        await this.fetchList();
      }
      return res.data;
    },
    async update(id: number, data: Partial<Omit<PaymentChannel, 'id' | 'create_time' | 'update_time' | 'total_amount' | 'today_amount'>>) {
      const res = await updatePaymentChannel(id, data);
      if (res.data && res.data.code === 0) {
        await this.fetchList();
      }
      return res.data;
    },
    async remove(id: number) {
      const res = await deletePaymentChannel(id);
      if (res.data && res.data.code === 0) {
        await this.fetchList();
      }
      return res.data;
    },
    async toggleStatus(id: number, status: 0 | 1) {
      const res = await togglePaymentChannelStatus(id, status);
      if (res.data && res.data.code === 0) {
        const index = this.list.findIndex(item => item.id === id);
        if (index !== -1) {
          this.list[index].status = status;
        }
      }
      return res.data;
    },
    setPage(page: number) {
      this.searchParams.page = page;
    },
    setPageSize(pageSize: number) {
      this.searchParams.pageSize = pageSize;
      this.searchParams.page = 1;
    },
    setSearchName(name: string) {
      this.searchParams.name = name;
    },
    setSearchType(type?: string) { // 扩展用
      this.searchParams.type = type;
    },
    setSearchStatus(status?: 0 | 1) { // 扩展用
      this.searchParams.status = status;
    },
    setDateRange(startDate?: string, endDate?: string) {
      this.searchParams.start_time = startDate;
      this.searchParams.end_time = endDate;
    },
    resetSearchParams() {
      this.searchParams = {
        page: 1,
        pageSize: 10,
        name: '',
        type: undefined,
        status: undefined,
        start_time: undefined,
        end_time: undefined,
      };
    }
  },
});