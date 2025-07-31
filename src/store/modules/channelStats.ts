// src/store/channelStats.js
import { defineStore } from 'pinia';
import {
  getChannelStatsList,
  getUserRechargeDetail,
  getUserRechargeOrders
} from '@/api/channelStats';
import { ElMessage } from 'element-plus';

export const useChannelStatsStore = defineStore('channelStats', {
  state: () => ({
    // ChannelRechargeStats 页面状态
    channelStatsList: [],
    channelStatsTotal: 0,
    channelStatsLoading: false,
    channelStatsSummary: {
      total_registered_users: 0,
      total_first_recharge_amount: 0,
      total_repeat_recharge_amount: 0,
      total_recharge: 0,
      total_roi: 0,
    },
    channelStatsFilter: {
      channel_id: '',
      channel_name: '',
      channel_domain: '',
      statistic_date_range: [],
      investment_amount: '',
      page: 1,
      page_size: 10,
    },

    // ChannelUserRechargeDetail 页面状态
    userRechargeDetailList: [],
    userRechargeDetailTotal: 0,
    userRechargeDetailLoading: false,
    userRechargeDetailFilter: {
      channel_domain: '', // 必须是 channel_domain
      statistic_date: '',
      uuid: '',           // 改成 uuid
      nickname: '',
      recharge_type: '',
      page: 1,
      page_size: 10,
    },

    // UserRechargeOrderDialog 弹窗状态
    userOrderList: [],
    userOrderTotal: 0,
    userOrderLoading: false,
    userOrderDialogFilter: {
      user_id: null,
      statistic_date: '',
      page: 1,
      page_size: 10,
    },
  }),

  // Pinia 中通常不直接定义 mutations，而是直接在 actions 中修改 state
  // actions 包含了异步操作和直接修改 state 的逻辑
  actions: {
    // 设置 ChannelRechargeStats 筛选条件
    setChannelStatsFilter(filter) {
      Object.assign(this.channelStatsFilter, filter);
    },
    // 获取渠道每日效果统计数据
    async fetchChannelStatsList() {
      this.channelStatsLoading = true;
      const requestParams = { ...this.channelStatsFilter };

      if (requestParams.statistic_date_range && requestParams.statistic_date_range.length === 2) {
        requestParams.statistic_date_start = requestParams.statistic_date_range[0];
        requestParams.statistic_date_end = requestParams.statistic_date_range[1];
      } else {
        requestParams.statistic_date_start = '';
        requestParams.statistic_date_end = '';
      }
      delete requestParams.statistic_date_range;

      try {
        const response = await getChannelStatsList(requestParams);
        const resData = response.data?.data || {};
        console.log('接口原始返回:', response);
        console.log('赋值前 list:', resData.list);
        if (response.data?.code === 200) {
          this.channelStatsList = resData.list || [];
          this.channelStatsTotal = resData.total || 0;
          Object.assign(
            this.channelStatsSummary,
            resData.summary || {
              total_registered_users: 0,
              total_first_recharge_amount: 0,
              total_repeat_recharge_amount: 0,
              total_recharge: 0,
              total_roi: 0,
            }
          );
        } else {
          ElMessage.error(response.message || '获取渠道统计数据失败');
          this.channelStatsList = [];
          this.channelStatsTotal = 0;
          this.channelStatsSummary = {
            total_registered_users: 0,
            total_first_recharge_amount: 0,
            total_repeat_recharge_amount: 0,
            total_recharge: 0,
            total_roi: 0,
          };
        }
      } catch (error) {
        console.error('API请求失败 (getChannelStatsList):', error);
        ElMessage.error('网络请求失败，请稍后再试');
        this.channelStatsList = [];
        this.channelStatsTotal = 0;
        this.channelStatsSummary = {
          total_registered_users: 0,
          total_first_recharge_amount: 0,
          total_repeat_recharge_amount: 0,
          total_recharge: 0,
          total_roi: 0,
        };
      } finally {
        this.channelStatsLoading = false;
      }
    },
    // 重置渠道统计筛选和分页
    resetChannelStatsFilter() {
      // Pinia 的 $reset 方法可以重置 state 到其初始值
      this.setChannelStatsFilter(this.$reset().channelStatsFilter);
    },


    // 设置 ChannelUserRechargeDetail 筛选条件
    setUserRechargeDetailFilter(filter) {
      // 彻底替换，防止残留旧字段
      this.userRechargeDetailFilter = { ...filter };
    },
    // 获取用户充值明细数据
    async fetchUserRechargeDetail() {
      this.userRechargeDetailLoading = true;
      try {
        const response = await getUserRechargeDetail({ ...this.userRechargeDetailFilter });
        console.log('接口返回:', response);

        // 统一使用 response.data.code 检查
        if (response.data?.code === 200) {
          // 使用 response.data.data 获取实际数据
          this.userRechargeDetailList = response.data.data.list || [];
          this.userRechargeDetailTotal = response.data.data.total || 0;
        } else {
          this.userRechargeDetailList = [];
          this.userRechargeDetailTotal = 0;
          ElMessage.error(response.data?.message || '加载用户明细失败');
        }
      } catch (error) {
        console.error('请求失败:', error);
        ElMessage.error('网络错误');
        this.userRechargeDetailList = [];
        this.userRechargeDetailTotal = 0;
      } finally {
        this.userRechargeDetailLoading = false;
      }
    },
    // 重置用户明细筛选和分页
    resetUserRechargeDetailFilter() {
      this.userRechargeDetailFilter = {
        ...this.userRechargeDetailFilter, // 保留现有参数
        uuid: '',
        nickname: '',
        recharge_type: '',
        page: 1,
        page_size: 10,
      };
    },


    // 设置 UserRechargeOrderDialog 筛选条件
    setUserOrderDialogFilter(filter) {
      Object.assign(this.userOrderDialogFilter, filter);
    },
    // 获取用户充值订单数据
    async fetchUserRechargeOrders() {
      this.userOrderLoading = true;
      try {
        const response = await getUserRechargeOrders({ ...this.userOrderDialogFilter });
        console.log('接口返回:', response);

        // 统一使用 response.data.code 检查
        if (response.data?.code === 200) {
          this.userOrderList = response.data.data.list || [];
          this.userOrderTotal = response.data.data.total || 0;
        } else {
          this.userOrderList = [];
          this.userOrderTotal = 0;
          ElMessage.error(response.data?.message || '获取订单失败');
        }
      } catch (error) {
        console.error('请求失败:', error);
        ElMessage.error('网络错误');
        this.userOrderList = [];
        this.userOrderTotal = 0;
      } finally {
        this.userOrderLoading = false;
      }
    },
    // 重置订单弹窗筛选和分页
    resetUserOrderDialogFilter() {
      this.userOrderDialogFilter = {
        user_id: null,
        statistic_date: '',
        page: 1,
        page_size: 10,
      };
    },
  },
});