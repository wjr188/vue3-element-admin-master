import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import simpleService from '@/utils/request-new';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  category_id?: number;
  [key: string]: any;
}

export const useAnimeRecommendStore = defineStore('animeRecommend', {
  state: () => ({
    recommendGroups: [] as any[],
    groupFilter: { keyword: '' },
    groupPagination: { currentPage: 1, pageSize: 10, total: 0 },
    loading: false,
    allParentCategories: [] as Category[],
    allChildCategories: [] as Category[],
    _lastUpdate: 0,
    groupAnimeCounts: {} as Record<string, number>,
  }),

  getters: {
    getParentsForFilter: (state) => state.allParentCategories,
    getAllChildCategories: (state) => state.allChildCategories,
    getChildrenByParentId: (state) => (parentId: number | string) => {
      const pId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
      if (isNaN(Number(pId))) return [];
      return state.allChildCategories.filter((cat: any) => cat.parent_id === pId);
    },
  },

  actions: {
    normalizeResponse(res: any) {
      let list: any[] = [];
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
        const arrField = Object.values(res.data).find((v: any) => Array.isArray(v));
        if (arrField) {
          list = arrField as any[];
          total = res.data.total ?? list.length;
        }
      }
      list = (list || []).map((item: any) => ({
        ...item,
        id: item.id ?? item.categoryId,
        name: item.name ?? item.categoryName,
        parent_id: item.parent_id ?? item.parentId ?? null,
        category_id: item.category_id ?? item.categoryId ?? null
      }));
      return {
        list: Array.isArray(list) ? list : [],
        total
      };
    },

    async fetchRecommendGroups() {
      this.loading = true;
      try {
        const res: any = await simpleService.get('/api/recommend/anime-groups', { params: this.groupFilter });
        const { list, total } = this.normalizeResponse(res.data);
        this.recommendGroups = list;
        this.groupPagination.total = total;
      } catch (error: any) {
        this.recommendGroups = [];
        this.groupPagination.total = 0;
        ElMessage.error(error?.msg || error?.message || '获取推荐分组失败');
      } finally {
        this.loading = false;
      }
    },

    async addRecommendGroup(params: any) {
      try {
        const res: any = await simpleService.post('/api/recommend/anime-groups', params);
        ElMessage.success(res?.data?.msg || res?.data?.message || '分组添加成功');
        await this.fetchRecommendGroups();
        return true;
      } catch (error: any) {
        ElMessage.error(error?.msg || error?.message || '添加分组失败');
        throw error;
      }
    },

    async updateRecommendGroup(id: any, params: any) {
  try {
    const res: any = await simpleService.put(`/api/recommend/anime-groups/${id}`, params);
    ElMessage.success(res?.data?.msg || res?.data?.message || '分组更新成功');
    await this.fetchRecommendGroups();
    return true;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '更新分组失败');
    return false;
  }
},
async deleteRecommendGroup(id: any) {
  try {
    const res: any = await simpleService.delete(`/api/recommend/anime-groups/${id}`);
    ElMessage.success(res?.data?.msg || res?.data?.message || '分组删除成功');
    await this.fetchRecommendGroups();
    return true;
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '删除分组失败');
    return false;
  }
},

    async saveGroupSort(sortedData: any) {
      try {
        const res: any = await simpleService.post('/api/recommend/anime-groups/sort', sortedData);
        ElMessage.success(res?.data?.msg || res?.data?.message || '排序保存成功');
        return true;
      } catch (error: any) {
        ElMessage.error(error?.msg || error?.message || '保存排序失败');
        return false;
      }
    },

    async fetchAnimesForGroup(groupId: any) {
      try {
        const res: any = await simpleService.get(`/api/recommend/anime-groups/${groupId}/animes`);
        let list: any[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data?.data?.list)) {
          list = res.data.data.list;
        } else if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data?.list)) {
          list = res.data.list;
        }
        this.groupAnimeCounts[groupId] = list.length;
        return list;
      } catch (error: any) {
        this.groupAnimeCounts[groupId] = 0;
        ElMessage.error(error?.msg || error?.message || '获取分组动漫失败');
        throw error;
      }
    },

    async saveAnimesForGroup(groupId: any, animes: any) {
      try {
        let payload: any[] = [];
        if (Array.isArray(animes)) {
          payload = animes.map((v: any) => ({
            video_id: Number(v.video_id),
            sort: Number(v.sort)
          }));
        }
        const res: any = await simpleService.post(`/api/recommend/anime-groups/${groupId}/animes`, { animes: payload });
        ElMessage.success(res?.data?.msg || res?.data?.message || '动漫保存成功');
        return true;
      } catch (error: any) {
        ElMessage.error(error?.msg || error?.message || '保存动漫失败');
        return false;
      }
    },

    async fetchAllParentCategories() {
      try {
        const res: any = await simpleService.get('/api/anime-categories/parents');
        const { list } = this.normalizeResponse(res.data);
        this.allParentCategories = Object.assign([], list);
        this._lastUpdate = Date.now();
      } catch (error: any) {
        this.allParentCategories = [];
        ElMessage.error(error?.msg || error?.message || '获取主分类失败');
      }
    },

    async fetchAllChildCategories() {
      try {
        const res: any = await simpleService.get('/api/anime-categories/children');
        const { list } = this.normalizeResponse(res.data);
        this.allChildCategories = Object.assign([], list.map((item: any) => ({
          ...item,
          parent_id: item.parent_id ?? item.parentId ?? null
        })));
        this._lastUpdate = Date.now();
      } catch (error: any) {
        this.allChildCategories = [];
        ElMessage.error(error?.msg || error?.message || '获取子分类失败');
      }
    },

    async fetchAllAnimes(params: any) {
      try {
        const res: any = await simpleService.get('/api/anime/videos', { params });
        return this.normalizeResponse(res.data);
      } catch (error: any) {
        ElMessage.error(error?.msg || error?.message || '获取动漫失败');
        return { list: [], total: 0 };
      }
    }
  }
});
