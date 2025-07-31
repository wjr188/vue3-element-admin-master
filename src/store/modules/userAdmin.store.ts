// src/store/modules/userAdmin.store.ts
import { defineStore } from 'pinia'
import {
  fetchUserList,
  fetchUserStats,
  addUser,
  updateUser,
  deleteUser,
  fetchUserDetail,
  batchUpdateUser,
  fetchCoinStats,
  fetchOrderStats,
  fetchCardList,
  fetchUserWatchCount,
  fetchPointsStats // ⭐ 新增
} from '@/api/user'

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}
interface SearchParams {
  keyword: string
  vip_card_id: number | null
  memberStatus: string
  expirationTimeRange: string[]
  goldCoinStatus: string
}
interface StatisticData {
  totalMembers: number
  normalMembers: number
  totalGoldCoins: number
  expiredMembers: number
  paidOrders: number
  pendingOrders: number
}

// CardOption 结构
interface CardOption {
  id: number;      // 卡主键
  name: string;    // 卡名称
  desc?: string;
  duration?: number;
  durationUnit?: 'DAY' | 'MONTH' | 'YEAR';
}

export const useMemberAdminStore = defineStore('memberAdmin', {
  state: () => ({
    loading: false as boolean,
    memberList: [] as any[],
    pagination: { currentPage: 1, pageSize: 10, total: 0 } as Pagination,
    searchParams: {
      keyword: '',
      vip_card_id: null, // 只认这个
      memberStatus: '',
      expirationTimeRange: [],
      goldCoinStatus: '',
    } as SearchParams,
    statistics: {
      totalMembers: 0,
      normalMembers: 0,
      totalGoldCoins: 0,
      expiredMembers: 0,
      paidOrders: 0,
      pendingOrders: 0,
    } as StatisticData,

    cardOptions: [] as CardOption[],
    statusOptions: [] as { label: string; value: string }[],
    memberDetail: null as any,
    coinStats: null as any,
    orderStats: null as any,
    errorMsg: '' as string,
    cardOptionsLastUpdated: 0 as number,
    pointsStats: null as { points_sum: string } | null, // 🟢 新增
  }),

  actions: {
    async fetchCardOptions(forceRefresh = false) {
      const now = Date.now();
      const cacheValid = (now - this.cardOptionsLastUpdated) < 3600000;
      if (this.cardOptions.length > 0 && cacheValid && !forceRefresh) {
        return;
      }
      this.loading = true;
      try {
        const res = await fetchCardList();
        let arr: any[] = [];
        if (res.data && Array.isArray(res.data)) arr = res.data;
        else if (Array.isArray(res)) arr = res;

        const options: CardOption[] = arr.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          desc: item.desc || '',
          duration: item.duration,
          durationUnit: (item.duration_unit || item.durationUnit || '').toLowerCase() === 'year' ? 'year'
            : (item.duration_unit || item.durationUnit || '').toLowerCase() === 'month' ? 'month'
            : (item.duration_unit || item.durationUnit || '').toLowerCase() === 'day' ? 'day'
            : '', // 只允许 year/month/day
        }));
        this.cardOptions = options;
      } catch (e) {
        console.error('获取会员卡下拉失败:', e);
        this.cardOptions = [{ id: 0, name: '普通用户（未购卡）', desc: '', duration: 0, durationUnit: 'DAY' }]
        this.errorMsg = '获取会员卡选项失败';
      } finally {
        this.loading = false;
      }
    },
async fetchUserWatch(uuid: string) {
  try {
    const res = await fetchUserWatchCount(uuid);
    return res.data; // 返回观看次数数据
  } catch (e) {
    console.error('获取用户观看次数失败:', e);
    this.errorMsg = '获取用户观看次数失败';
    return null;
  }
},

    fetchStatusOptions() {
      this.statusOptions = [
        { label: '正常', value: 'NORMAL' },
        { label: '禁用', value: 'DISABLED' },
        { label: '已过期', value: 'EXPIRED' },
      ]
    },

    async fetchStatistics() {
      this.loading = true
      try {
        const res = await fetchUserStats()
        console.log('【fetchUserList 完整返回】', JSON.stringify(res, null, 2));

        // 兼容 AxiosResponse 和直接返回对象
        const defaultStats: StatisticData = {
          totalMembers: 0,
          normalMembers: 0,
          totalGoldCoins: 0,
          expiredMembers: 0,
          paidOrders: 0,
          pendingOrders: 0,
        };
        const stats = (res && res.data && typeof res.data === 'object' && 'totalMembers' in res.data)
          ? res.data
          : (res && typeof res === 'object' && 'totalMembers' in res)
            ? res
            : defaultStats;

        // 类型保护，确保 stats 拥有 StatisticData 的所有属性
        const getStatValue = <K extends keyof StatisticData>(key: K): number => {
          const s = stats as StatisticData;
          return typeof s[key] === 'number' ? s[key] : 0;
        };

        this.statistics = {
          totalMembers: getStatValue('totalMembers'),
          normalMembers: getStatValue('normalMembers'),
          totalGoldCoins: getStatValue('totalGoldCoins'),
          expiredMembers: getStatValue('expiredMembers'),
          paidOrders: getStatValue('paidOrders'),
          pendingOrders: getStatValue('pendingOrders'),
        }
      } catch (e) {
        console.error('fetchStatistics 出错:', e)
        this.statistics = {
          totalMembers: 0,
          normalMembers: 0,
          totalGoldCoins: 0,
          expiredMembers: 0,
          paidOrders: 0,
          pendingOrders: 0,
        }
        this.errorMsg = '获取统计数据失败';
      } finally {
        this.loading = false
      }
    },

    async fetchCoinStats() {
      try {
        const res = await fetchCoinStats()
        this.coinStats = {
          coin_sum: res.data && (res.data as any).coin_sum ? parseFloat((res.data as any).coin_sum).toFixed(2) : '0.00'
        }
      } catch (e) {
        console.error('fetchCoinStats 出错:', e)
        this.coinStats = { coin_sum: '0.00' }
        this.errorMsg = '获取金币统计失败';
      }
    },

    async fetchOrderStats() {
      try {
        const res = await fetchOrderStats()
        this.orderStats = {
          paid: res.data && typeof res.data === 'object' && 'paid' in res.data ? res.data.paid ?? 0 : 0,
          pending: res.data && typeof res.data === 'object' && 'pending' in res.data ? res.data.pending ?? 0 : 0
        }
      } catch (e) {
        console.error('fetchOrderStats 出错:', e)
        this.orderStats = { paid: 0, pending: 0 }
        this.errorMsg = '获取订单统计失败';
      }
    },

    async fetchPointsStats() {
      try {
        const res = await fetchPointsStats();
        this.pointsStats = {
          points_sum: res.data && (res.data as any).points_sum
            ? parseFloat((res.data as any).points_sum).toFixed(2)
            : '0.00'
        };
      } catch (e) {
        console.error('fetchPointsStats 出错:', e);
        this.pointsStats = { points_sum: '0.00' };
        this.errorMsg = '获取积分统计失败';
      }
    },

    async fetchMemberList(customParams?: Partial<SearchParams>) {
  this.loading = true;
  try {
    const params: any = {
      page: Math.max(1, this.pagination.currentPage),
      pageSize: Math.min(100, this.pagination.pageSize),
      keyword: customParams?.keyword ?? '',
    };

    if (customParams?.vip_card_id === 'NO_CARD') {
      params.no_card = 1;
    } else if (customParams?.vip_card_id) {
      params.vip_card_id = customParams.vip_card_id;
    }
    if (customParams?.memberStatus) {
      params.memberStatus = customParams.memberStatus;
    }
    if (customParams?.expirationTimeRange?.length === 2) {
      params.expire_start = customParams.expirationTimeRange[0];
      params.expire_end = customParams.expirationTimeRange[1];
    }
    if (customParams?.coin_status) {
      params.coin_status = customParams.coin_status;
    }

    const res = await fetchUserList(params);

    // ✅ 这里统一处理
    let dataBlock: any = null;
    if (res && res.data && res.data.list) {
      // 正确情况
      dataBlock = res.data;
    } else if (res && res.list) {
      // 如果接口直接返回list
      dataBlock = res;
    } else {
      console.error('接口返回格式不对:', res);
    }

    if (dataBlock && Array.isArray(dataBlock.list)) {
      this.memberList = dataBlock.list.map((item: any) => ({
        ...item,
        memberStatus: item.user_status === 1 ? 'NORMAL' : 'DISABLED', // 只认这个
      }));
      this.pagination.total = dataBlock.total || 0;
    } else {
      console.warn('❌ 没获取到list数组，赋空');
      this.memberList = [];
      this.pagination.total = 0;
    }
  } catch (e) {
    console.error('获取会员列表失败:', e);
    this.memberList = [];
    this.pagination.total = 0;
    this.errorMsg = '获取会员列表失败';
  } finally {
    this.loading = false;
  }
},

    // fetchMemberDetail 参数 uuid: string => id: number
    async fetchMemberDetail(id: number) {
  try {
    const res = await fetchUserDetail({ id });
    // 兼容 AxiosResponse 和直接返回对象
    const user = res && res.data ? res.data : (res && typeof res === 'object' && 'id' in res ? res : null);
    if (user) {
      const userData = user.data ? user.data : user;
      console.log('💡 userData内容:', userData);
      this.memberDetail = {
        id: Number(userData.id),
        vip_card_id: userData.vip_card_id ? Number(userData.vip_card_id) : null,
        vip_card_name: userData && userData.vip_card_name ? userData.vip_card_name : '普通用户（未购卡）',
        // 映射 coin -> goldCoins
        goldCoins: userData && userData.coin ? userData.coin : 0,
        // 其他字段...
        ...userData,
        // 强制映射 memberStatus，保证和列表一致
        memberStatus: userData.user_status === 1 ? 'NORMAL' : 'DISABLED',
      };
      delete this.memberDetail.coin; // 删除 coin，避免重复
    } else {
      this.memberDetail = null;
    }
  } catch (e) {
    console.error('fetchMemberDetail 出错:', e);
    this.memberDetail = null;
    this.errorMsg = '获取会员详情失败';
  }
  return this.memberDetail;
},

    async addMember(data: any) {
      this.loading = true
      let success = false
      try {
        if (data.mobile && data.mobile !== '' && !/^1[3-9]\d{9}$/.test(data.mobile)) {
          throw new Error('请输入有效的手机号码')
        }
        
        if (data.email && data.email !== '' && !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(data.email)) {
          throw new Error('邮箱格式不正确')
        }
        
        const payload: any = { ...data }; 
        // 会员卡字段只认 vip_card_id
        payload.vip_card_id = payload.vip_card_id ?? null;
        delete payload.memberLevel;
        delete payload.vip_card;
        delete payload.vip_card_name;

        payload.mobile = payload.mobile || '';
        payload.email = payload.email || '';
        payload.nickname = payload.nickname || '未命名用户';
        payload.remark = payload.remark || '';
        payload.avatar = payload.avatar || '';
        payload.expirationTime = payload.expirationTime || null; 
        
        payload.coin = payload.goldCoins ?? 0;
        delete payload.goldCoins; 

        payload.vip_expire_time = payload.expirationTime; 
        delete payload.expirationTime;

        // 如果没有提供 memberStatus，默认设置为 NORMAL
        if (!payload.memberStatus) {
          payload.memberStatus = 'NORMAL';
        }
        payload.vip_status = 1; // 新增时强制正常
        payload.vip_expired = 0;
        delete payload.memberStatus;

        // 兼容 password 字段
        payload.password = payload.password || payload.initialPassword;
        delete payload.initialPassword;
    
        const res = await addUser(payload) 
        if (res.data && res.data.code === 0) { 
          success = true;
          this.errorMsg = '';
          await this.fetchMemberList()
          await this.fetchStatistics()
        } else {
          this.errorMsg = (res.data && res.data.msg) ? res.data.msg : '新增会员失败';
        }
      } catch (e: any) {
        console.error('addMember 出错:', e)
        this.errorMsg = e.message || '新增会员失败'
      } finally {
        this.loading = false
        return success
      }
    },

    // updateMember 参数和校验 id
async updateMember(data: any) {
  this.loading = true;
  let success = false;
  try {
    const payload: any = { ...data };

    if (!payload.id || typeof payload.id !== 'number') {
      throw new Error('ID 为空或格式不正确');
    }

    // 统一只用 vip_status/vip_expired
    payload.vip_status = payload.memberStatus === 'NORMAL' ? 1 : 0;
    payload.vip_expired = payload.memberStatus === 'EXPIRED' ? 1 : 0;
    delete payload.memberStatus;

    // ⭐⭐⭐ 日志：avatar处理前
    console.log('💡处理前 avatar:', payload.avatar);

    if (payload.avatar === undefined || payload.avatar === null || payload.avatar === '') {
      delete payload.avatar;
    }

    // ⭐⭐⭐ 日志：avatar处理后
    console.log('💡处理后 avatar:', payload.avatar);

    payload.expirationTime = payload.expirationTime || null;

    payload.coin = payload.goldCoins ?? 0;
    delete payload.goldCoins;

    payload.vip_expire_time = payload.expirationTime;
    delete payload.expirationTime;

    if (payload.newPassword) {
      payload.password = payload.newPassword;
    }
    delete payload.newPassword;

    // ⭐⭐⭐ 日志：最终 payload
    console.log('✅最终提交 payload:', JSON.stringify(payload, null, 2));

    const res = await updateUser(payload);
    if (res.data && res.data.code === 0) {
      success = true;
      this.errorMsg = '';
      await this.fetchMemberList();
      await this.fetchStatistics();
    } else {
      this.errorMsg = (res.data && res.data.msg) ? res.data.msg : '更新会员失败';
    }
  } catch (e: any) {
    console.error('updateMember 出错:', e);
    this.errorMsg = e.message || '更新会员失败';
  } finally {
    this.loading = false;
    return success;
  }
},

    // deleteMember 参数 id: number
    async deleteMember(id: number) {
      this.loading = true
      let success = false
      try {
        await deleteUser({ id });
        success = true;
        this.errorMsg = '';
        await this.fetchMemberList();
        await this.fetchStatistics();
      } catch (e: any) {
        console.error('deleteMember 出错:', e)
        this.errorMsg = e.message || '删除会员失败'
        success = false;
      } finally {
        this.loading = false
        return success
      }
    },

    // updateMemberStatus 参数 id: number
    async updateMemberStatus(id: number, status: number) {
      this.loading = true;
      let success = false;
      try {
        await updateUser({
          id,
          user_status: status, // 操作 user_status 字段
        });
        success = true;
        await this.fetchMemberList();
        await this.fetchStatistics();
      } catch (e: any) {
        console.error('updateMemberStatus 出错:', e);
        this.errorMsg = e.message || '更新用户状态失败';
        success = false;
      } finally {
        this.loading = false;
        return success;
      }
    },

    // batchUpdateMembers 参数 ids: number[]
    async batchUpdateMembers(action: string, ids: number[]) {
      this.loading = true
      let success = false
      try {
        const validIds = ids.filter(id => !!id);
        await batchUpdateUser({
          ids: validIds,
          action: action
        });
        success = true;
        this.errorMsg = '';
        await this.fetchMemberList();
        await this.fetchStatistics();
      } catch (e: any) {
        console.error('batchUpdateMembers 出错:', e)
        this.errorMsg = e.message || '批量操作失败'
        success = false;
      } finally {
        this.loading = false
        return success
      }
    }
  }
})