// src/store/rechargeOrder.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchRechargeOrderList,
  confirmRechargeOrder,
  deleteRechargeOrder,
  createRechargeOrder,
  RechargeOrderItem,
  fetchDomainsAndChannels,
} from '@/api/rechargeOrder.api'; // 引入接口定义和api方法
import { ElMessage } from 'element-plus'; // 引入Element Plus消息提示
import type { RechargeListParams, CreateRechargeOrderParams } from '@/api/rechargeOrder.api'

export const useRechargeOrderStore = defineStore('rechargeOrder', {
  state: () => ({
    orderList: [] as RechargeOrderItem[],
    loading: false,
    filter: {
      start_time: '',
      end_time: '',
      domain: [] as string[],   // 多选
      channel: [] as string[],  // 多选
      type: '' as '' | '首充' | '复充' | '全部',
      status: '',
      keyword: '',
      page: 1,
      pageSize: 10,
    } as Omit<RechargeListParams, 'domain' | 'channel' | 'type'> & {
      domain: string[];
      channel: string[];
      type: '' | '首充' | '复充' | '全部';
    },
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    domainOptions: [] as string[],
    channelOptions: [] as string[],
  }),
  actions: {
    /**
     * 获取充值订单列表
     */
    async fetchList() {
      this.loading = true;
      const { current, pageSize } = this.pagination;

      try {
        const res = await fetchRechargeOrderList({
          ...this.filter,
          domain: Array.isArray(this.filter.domain) ? this.filter.domain.join(',') : this.filter.domain,
          channel: Array.isArray(this.filter.channel) ? this.filter.channel.join(',') : this.filter.channel,
          page: current,
          pageSize,
        });

        if (res.code === 0) {
          this.orderList = res.data?.list || [];
          this.pagination.total = res.data?.total || 0;
        } else {
          const msg = res.msg || res.message || '获取充值订单失败';
          ElMessage.error(msg);
          console.error('获取充值订单失败:', msg, res);
        }
      } catch (error) {
        console.error('获取充值订单异常:', error);
        ElMessage.error('获取充值订单异常');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 确认订单到账
     * @param orderId 订单号
     */
    async confirmOrder(orderId: string) {
      try {
        const res = await confirmRechargeOrder(orderId);
        if (res.data.code === 0) {
          ElMessage.success('订单确认成功');
          this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '订单确认失败');
        }
      } catch (error) {
        ElMessage.error('确认订单异常');
      }
    },

    /**
     * 删除订单
     * @param orderId 订单号
     */
    async deleteOrder(orderId: string) {
      this.loading = true;
      try {
        const res = await deleteRechargeOrder(orderId);
        if (res.data.code === 0) {
          ElMessage.success('订单删除成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '订单删除失败');
        }
      } catch (e) {
        ElMessage.error('请求失败');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建订单
     * @param data 订单数据
     */
    async createOrder(data: CreateRechargeOrderParams) {
      const res = await createRechargeOrder(data);
      if (res.data.code === 0) {
        ElMessage.success('订单创建成功');
        this.fetchList();
      } else {
        ElMessage.error(res.data.msg || '订单创建失败');
      }
      return res.data;
    },

    /**
     * 设置筛选条件，并重置页码
     * @param newFilter 新的筛选条件部分
     */
    setFilter(newFilter: Partial<typeof this.filter>) {
      this.filter = { ...this.filter, ...newFilter };
      this.pagination.current = 1; // 筛选条件变化时，回到第一页
      this.fetchList(); // 立即重新获取数据
    },

    /**
     * 设置当前页码
     * @param page 页码
     */
    setPage(page: number) {
      this.pagination.current = page;
      this.fetchList();
    },

    /**
     * 设置每页显示数量
     * @param size 每页数量
     */
    setPageSize(size: number) {
      this.pagination.pageSize = size;
      this.pagination.current = 1; // 改变每页数量时回到第一页
      this.fetchList();
    },

    /**
     * 重置所有筛选条件和分页
     */
    resetAllFilters() {
      this.filter = {
        start_time: '',
        end_time: '',
        domain: [],      // 正确，数组
        channel: [],     // 正确，数组
        type: '',
        status: '',
        keyword: '',
      };
      this.pagination.current = 1;
      this.pagination.pageSize = 10;
      this.fetchList();
    },

    /**
     * 获取域名和渠道的选项
     */
    async fetchDomainsAndChannelsOptions() {
      console.log('fetchDomainsAndChannelsOptions 被调用');
      try {
        const res = await fetchDomainsAndChannels();
        console.log('接口原始返回：', res);
        if (res.code === 0) {
          this.domainOptions.splice(0, this.domainOptions.length, ...(res.data?.domains || []));
          this.channelOptions.splice(0, this.channelOptions.length, ...(res.data?.channels || []));
          console.log('赋值后 domainOptions:', this.domainOptions);
        }
      } catch (error) {
        console.error('获取域名/渠道列表异常:', error);
      }
    },
  },
});