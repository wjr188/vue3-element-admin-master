import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import simpleService from '@/utils/request-new';

export const useNovelRecommendStore = defineStore('novelRecommend', {
  state: () => ({
    recommendGroups: [] as any[],
    groupFilter: { keyword: '' },
    groupPagination: { currentPage: 1, pageSize: 10, total: 0 },
    loading: false,
    allCategories: [] as any[],
    _lastUpdate: 0,
    groupNovelCounts: {} as Record<number, number>,
  }),

  actions: {
    normalizeResponse(res: any) {
      let list = [];
      let total = 0;
      if (res?.data?.list) {
        list = res.data.list;
        total = res.data.total ?? list.length;
      } else if (res?.list) {
        list = res.list;
        total = res.total ?? list.length;
      } else if (Array.isArray(res)) {
        list = res;
        total = list.length;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
        total = list.length;
      } else if (res?.data && typeof res.data === 'object') {
        const arrField = Object.values(res.data).find(v => Array.isArray(v));
        if (arrField) {
          list = arrField;
          total = res.data.total ?? list.length;
        }
      }
      return {
        list: Array.isArray(list) ? list : [],
        total
      };
    },

    setGroupFilter(filter: any) {
      this.groupFilter = { ...this.groupFilter, ...filter };
    },

    // 推荐分组管理
    async fetchRecommendGroups() {
      this.loading = true;
      try {
        const res = await simpleService.get('/api/novel/recommend/groups', { params: this.groupFilter });
        const { list, total } = this.normalizeResponse(res.data);
        this.recommendGroups = list;
        this.groupPagination.total = total;
      } catch (error: any) {
        this.recommendGroups = [];
        this.groupPagination.total = 0;
        ElMessage.error(error?.message || '获取推荐分组失败');
      } finally {
        this.loading = false;
      }
    },

    async addRecommendGroup(params: any) {
  try {
    const res = await simpleService.post('/api/novel/recommend/groups', params);
    const data = res.data ?? {};
    if (data.code !== 0) throw data;
    ElMessage.success(data.msg || data.message || '分组添加成功');
    await this.fetchRecommendGroups();
    return data;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || error?.toString() || '添加分组失败');
    throw error;
  }
},
async updateRecommendGroup(id: number, params: any) {
  try {
    const res = await simpleService.put(`/api/novel/recommend/groups/${id}`, params);
    const data = res.data ?? {};
    if (data.code !== 0) throw data;
    ElMessage.success(data.msg || '分组更新成功');
    await this.fetchRecommendGroups();
    return data;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '更新分组失败');
    throw error;
  }
},
async deleteRecommendGroup(id: number) {
  try {
    const res = await simpleService.delete(`/api/novel/recommend/groups/${id}`);
    const data = res.data ?? {};
    if (data.code !== 0) throw data;
    ElMessage.success(data.msg || '分组删除成功');
    await this.fetchRecommendGroups();
    return data;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '删除分组失败');
    throw error;
  }
},
async saveGroupSort(sortedData: any[]) {
  try {
    const res = await simpleService.post('/api/novel/recommend/groups/sort', sortedData);
    const data = res.data ?? {};
    if (data.code !== 0) throw data;
    ElMessage.success(data.msg || '排序保存成功');
    return true;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '保存排序失败');
    return false;
  }
},
    // 分组小说管理
    async fetchNovelsForGroup(groupId: number) {
      try {
        const res = await simpleService.get(`/api/novel/recommend/groups/${groupId}/novels`);
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data?.data?.list)) {
          list = res.data.data.list;
        } else if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data?.list)) {
          list = res.data.list;
        }
        this.groupNovelCounts[groupId] = list.length;
        return list;
      } catch (error: any) {
        this.groupNovelCounts[groupId] = 0;
        ElMessage.error(error?.msg || '获取分组小说失败');
        throw error;
      }
    },

    async fetchNovelsForGroupAndSave(groupId: number) {
      try {
        const novels = await this.fetchNovelsForGroup(groupId);
        this.recommendGroups = this.recommendGroups.map(group => {
          if (group.id === groupId) {
            return { ...group, novel_count: novels.length };
          }
          return group;
        });
        return novels;
      } catch (error) {
        console.error('Error fetching and saving novels for group:', error);
        return [];
      }
    },
async saveNovelsForGroup(groupId: number, novels: any[]) {
  try {
    const payload = {
      novels: novels.map(v => ({
        novel_id: Number(v.novel_id),
        sort: Number(v.sort)
      }))
    };
    const res = await simpleService.post(
      `/api/novel/recommend/groups/${groupId}/novels`,
      payload
    );
    const data = res.data ?? {};
    if (data.code !== 0) throw data;
    ElMessage.success(data.msg || '小说保存成功');
    return true;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '保存小说失败');
    return false;
  }
},
    // 分类管理
    async fetchAllCategories() {
      try {
        const res = await simpleService.get('/api/novel/categories');
        const { list } = this.normalizeResponse(res.data);
        this.allCategories = list;
        this._lastUpdate = Date.now();
      } catch (error: any) {
        this.allCategories = [];
        ElMessage.error(error?.message || '获取分类失败');
      }
    },

    // 通用小说列表
    async fetchAllNovels(params: any = {}) {
      try {
        // 改为 /api/novel/list
        const res = await simpleService.get('/api/novel/list', { params });
        return this.normalizeResponse(res.data);
      } catch (error: any) {
        ElMessage.error(error?.msg || '获取小说失败');
        return { list: [], total: 0 };
      }
    }
  }
});
