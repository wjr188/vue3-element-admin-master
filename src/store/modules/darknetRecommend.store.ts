// stores/modules/darknet-recommend.store.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request-new';
import type { 
  DarknetRecommendGroup,
  DarknetRecommendVideo,
  DarknetVideo,
  DarknetCategory
} from '@/types/darknet-recommend.type';

export const useDarknetRecommendStore = defineStore('darknetRecommend', {
  state: () => ({
    recommendGroups: [] as DarknetRecommendGroup[],
    groupFilter: {
      keyword: '',
    },
    groupPagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
    },
    loading: false,

    allParentCategories: [] as DarknetCategory[],
    allChildCategories: [] as DarknetCategory[],
    _lastUpdate: 0, // Reactive debug helper

    groupVideoCounts: {} as Record<number, number>, // { [groupId]: number }
  }),

  getters: {
    getParentsForFilter: (state) => state.allParentCategories,
    getAllChildCategories: (state) => state.allChildCategories,
    getChildrenByParentId: (state) => (parentId: number | string) => {
      const pId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
      if (isNaN(pId)) return [];
      return state.allChildCategories.filter(cat => cat.parent_id === pId);
    },
  },

  actions: {
    // Normalize API response structure
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

    // Recommend group management
    async fetchRecommendGroups() {
      this.loading = true;
      try {
        const res = await axios.get('/api/darknet/recommend/groups', { params: this.groupFilter });
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

    async addRecommendGroup(params: Omit<DarknetRecommendGroup, 'id'>) {
      try {
        const res = await axios.post('/api/darknet/recommend/groups', params);
        ElMessage.success(res?.msg || res?.message || '分组添加成功');
        await this.fetchRecommendGroups();
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || error.message || '添加分组失败');
        throw error;
      }
    },

    async updateRecommendGroup(id: number, params: Partial<DarknetRecommendGroup>) {
      try {
        const res = await axios.put(`/api/darknet/recommend/groups/${id}`, params);
        ElMessage.success(res?.msg || '分组更新成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '更新分组失败');
        throw error;
      }
    },

    async deleteRecommendGroup(id: number) {
      try {
        const res = await axios.delete(`/api/darknet/recommend/groups/${id}`);
        ElMessage.success(res?.msg || '分组删除成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '删除分组失败');
        throw error;
      }
    },

    async saveGroupSort(sortedData: Array<{id: number, sort: number}>) {
      try {
        const res = await axios.post('/api/darknet/recommend/groups/sort', sortedData);
        ElMessage.success(res?.msg || '排序保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存排序失败');
        return false;
      }
    },

    // Group video management
    async fetchVideosForGroup(groupId: number): Promise<DarknetRecommendVideo[]> {
      try {
        const res = await axios.get(`/api/darknet/recommend/groups/${groupId}/videos`);
        let list: DarknetRecommendVideo[] = [];
        
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data?.data?.list)) {
          list = res.data.data.list;
        } else if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data?.list)) {
          list = res.data.list;
        }
        
        this.groupVideoCounts[groupId] = list.length;
        return list;
      } catch (error) {
        this.groupVideoCounts[groupId] = 0;
        ElMessage.error(error?.msg || '获取分组视频失败');
        throw error;
      }
    },

    async saveVideosForGroup(groupId: number, videos: Array<{video_id: number, sort: number}>) {
      try {
        const group = this.recommendGroups.find(g => g.id == groupId);
        if (!group) {
          ElMessage.error(`错误：找不到ID为"${groupId}"的分组`);
          return false;
        }

        const payload = videos.map(v => ({
          video_id: Number(v.video_id),
          sort: Number(v.sort),
          recommend_id: Number(groupId)
        }));

        const res = await axios.post(`/api/darknet/recommend/groups/${groupId}/videos`, { videos: payload });
        ElMessage.success(res?.msg || '视频保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存视频失败');
        return false;
      }
    },

    // Category management
    async fetchAllParentCategories() {
      try {
        const res = await axios.get('/api/darknet/categories/parents');
        const { list } = this.normalizeResponse(res.data);
        this.allParentCategories = [...list];
        this._lastUpdate = Date.now();
      } catch (error) {
        this.allParentCategories = [];
        ElMessage.error(error?.message || '获取主分类失败');
      }
    },

    async fetchAllChildCategories() {
      try {
        const res = await axios.get('/api/darknet/categories/children');
        const { list } = this.normalizeResponse(res.data);
        this.allChildCategories = [...list.map(item => ({
          ...item,
          parent_id: item.parent_id ?? item.parentId ?? null
        }))];
        this._lastUpdate = Date.now();
      } catch (error) {
        this.allChildCategories = [];
        ElMessage.error(error?.message || '获取子分类失败');
      }
    },

    // Video list
    async fetchAllVideos(params: any) {
      try {
        const res = await axios.get('/api/darknet/videos', { params });
        const normalized = this.normalizeResponse(res.data);
        
        // Add category names if not present
        if (normalized.list.length > 0 && !normalized.list[0].parent_category_name) {
          normalized.list = normalized.list.map((video: DarknetVideo) => ({
            ...video,
            parent_category_name: this.allParentCategories.find(c => c.id === video.parent_id)?.name || '',
            child_category_name: this.allChildCategories.find(c => c.id === video.category_id)?.name || ''
          }));
        }
        
        return normalized;
      } catch (error) {
        ElMessage.error(error?.msg || '获取视频失败');
        return { list: [], total: 0 };
      }
    }
  }
});