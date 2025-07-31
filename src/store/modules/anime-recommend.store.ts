import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import simpleService from '@/utils/request-new';

export const useAnimeRecommendStore = defineStore('animeRecommend', {
  state: () => ({
    recommendGroups: [],
    groupFilter: {
      keyword: '',
    },
    groupPagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
    },
    loading: false,

    allParentCategories: [],
    allChildCategories: [],
    _lastUpdate: 0,

    groupAnimeCounts: {}, // { [groupId]: number }
  }),

  getters: {
    getParentsForFilter: (state) => state.allParentCategories,
    getAllChildCategories: (state) => state.allChildCategories,
    getChildrenByParentId: (state) => (parentId) => {
      const pId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
      if (isNaN(pId)) return [];
      return state.allChildCategories.filter(cat => cat.parent_id === pId);
    },
  },

  actions: {
    normalizeResponse(res) {
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
      list = (list || []).map(item => ({
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

    // 推荐分组管理
    async fetchRecommendGroups() {
      this.loading = true;
      try {
        const res = await simpleService.get('/api/recommend/anime-groups', { params: this.groupFilter });
        const { list, total } = this.normalizeResponse(res.data);
        this.recommendGroups = list;
        this.groupPagination.total = total;
      } catch (error) {
        this.recommendGroups = [];
        this.groupPagination.total = 0;
        ElMessage.error(error?.message || '获取推荐分组失败');
      } finally {
        this.loading = false;
      }
    },

    async addRecommendGroup(params) {
      try {
        const res = await simpleService.post('/api/recommend/anime-groups', params);
        ElMessage.success(res?.msg || res?.message || '分组添加成功');
        await this.fetchRecommendGroups();
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || error.message || '添加分组失败');
        throw error;
      }
    },

    async updateRecommendGroup(id, params) {
      try {
        const res = await simpleService.put(`/api/recommend/anime-groups/${id}`, params);
        ElMessage.success(res?.msg || '分组更新成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '更新分组失败');
        throw error;
      }
    },

    async deleteRecommendGroup(id) {
      try {
        const res = await simpleService.delete(`/api/recommend/anime-groups/${id}`);
        ElMessage.success(res?.msg || '分组删除成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '删除分组失败');
        throw error;
      }
    },

    async saveGroupSort(sortedData) {
      try {
        const res = await simpleService.post('/api/recommend/anime-groups/sort', sortedData);
        ElMessage.success(res?.msg || '排序保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存排序失败');
        return false;
      }
    },

    // 分组动漫管理
    async fetchAnimesForGroup(groupId) {
      try {
        const res = await simpleService.get(`/api/recommend/anime-groups/${groupId}/animes`);
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
        this.groupAnimeCounts[groupId] = list.length;
        return list;
      } catch (error) {
        this.groupAnimeCounts[groupId] = 0;
        ElMessage.error(error?.msg || '获取分组动漫失败');
        throw error;
      }
    },

    async saveAnimesForGroup(groupId, animes) {
      try {
        console.log('【DEBUG】saveAnimesForGroup 接收到的 animes:', JSON.parse(JSON.stringify(animes)));

        const group = this.recommendGroups.find(g => g.id == groupId); 
        if (!group) {
            ElMessage.error(`错误：在当前分组列表里找不到 ID 为 "${groupId}" 的分组。`);
            return false;
        }

        let payload = [];
        if (Array.isArray(animes)) {
          payload = animes.map(v => ({
            video_id: Number(v.video_id),
            sort: Number(v.sort)
          }));
        }

        const res = await simpleService.post(`/api/recommend/anime-groups/${groupId}/animes`, { animes: payload });
        ElMessage.success(res?.msg || '动漫保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存动漫失败');
        return false;
      }
    },

    // 分类管理
    async fetchAllParentCategories() {
      try {
        const res = await simpleService.get('/api/anime-categories/parents');
        const { list } = this.normalizeResponse(res.data);
        this.allParentCategories = Object.assign([], list);
        this._lastUpdate = Date.now();
      } catch (error) {
        this.allParentCategories = [];
        ElMessage.error(error?.message || '获取主分类失败');
      }
    },

    async fetchAllChildCategories() {
      try {
        const res = await simpleService.get('/api/anime-categories/children');
        const { list } = this.normalizeResponse(res.data);
        this.allChildCategories = Object.assign([], list.map(item => ({
          ...item,
          parent_id: item.parent_id ?? item.parentId ?? null
        })));
        this._lastUpdate = Date.now();
      } catch (error) {
        this.allChildCategories = [];
        ElMessage.error(error?.message || '获取子分类失败');
      }
    },

    // 通用动漫列表
    async fetchAllAnimes(params) {
      try {
        const res = await simpleService.get('/api/anime/videos', { params });
        return this.normalizeResponse(res.data);
      } catch (error) {
        ElMessage.error(error?.msg || '获取动漫失败');
        return { list: [], total: 0 };
      }
    }
  }
});