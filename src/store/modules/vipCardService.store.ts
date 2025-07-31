// E:\vue3\vue3-element-admin-master\src\store\modules\vipCardService.store.ts

import { defineStore } from 'pinia';
// !!! 关键：正确导入 vipCardService，现在路径是 '@/api/vipCardService'
import { vipCardService, VipCard, PaginationResult } from '@/api/vipCardService';

// 定义 Store 状态的接口
interface VipCardState {
  vipCards: VipCard[];
  total: number;
  currentPage: number;
  pageSize: number;
  loading: boolean; // 用于列表的加载状态
  cardForm: {
    id: number | null;
    name: string;
    days: number;
    can_watch_coin: number; // 能看金币内容
    can_view_vip_video: number;
    benefitKeys: string[];
    // ...其他字段
  };
  cardList: VipCard[];
}

// 定义 Pinia Store
export const useVipCardStore = defineStore('vipCard', {
  // 定义状态
  state: (): VipCardState => ({
    vipCards: [],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    loading: false,
    cardForm: {
      id: null,
      name: '',
      days: 30,
      can_view_vip_video: 0, // 新增权限开关字段，默认0不可看
      can_watch_coin: 0,
      benefitKeys: [],
      // ...其他字段
    },
    cardList: []
  }),

  // 定义 actions (异步操作和状态修改)
  actions: {
    /**
     * 获取 VIP 卡片列表数据
     * 此 action 调用 vipCardService，并处理加载状态和数据更新。
     */
    async fetchVipCards() {
      this.loading = true; // 设置加载状态为 true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
        };
        // 调用 vipCardService，它会返回 PaginationResult<VipCard> 类型的数据
        const data: PaginationResult<VipCard> = await vipCardService.getVipCards(params);
        
        this.vipCards = data.list; // 更新 VIP 卡片列表
        this.total = data.total;   // 更新总条数
        
      } catch (error: any) {
        // request.ts 的响应拦截器已经处理了错误消息（ElMessage.error），
        // 所以这里我们只需要处理 Store 内部的状态，例如清空数据，避免重复提示。
        console.error('Store: 获取VIP卡片列表操作失败:', error);
        this.vipCards = []; // 清空数据
        this.total = 0;     // 重置总数
      } finally {
        this.loading = false; // 无论成功或失败，都设置加载状态为 false
      }
    },

    /**
     * 设置当前页码，并刷新列表
     * @param page 新的页码
     */
    setCurrentPage(page: number) {
      this.currentPage = page;
      this.fetchVipCards(); // 重新获取数据
    },

    /**
     * 设置每页显示的数量，并刷新列表（回到第一页）
     * @param size 新的每页数量
     */
    setPageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1; // 当改变每页大小后，通常将页码重置为第一页
      this.fetchVipCards(); // 重新获取数据
    },

    setCardForm(data: Partial<VipCard>) {
      this.cardForm = { ...this.cardForm, ...data }
    },
    resetCardForm() {
      this.cardForm = {
        id: null,
        name: '',
        days: 30,
        can_watch_coin: 0,
        can_view_vip_video: 0,
        benefitKeys: [],
        // ...其他字段
      }
    }
  },
});