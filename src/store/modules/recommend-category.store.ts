import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import axios from 'axios';

export const useRecommendCategoryStore = defineStore('recommendCategory', {
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
    _lastUpdate: 0, // 响应式调试辅助

    groupVideoCounts: {}, // { [groupId]: number }
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
    // 标准化接口响应结构，兼容你的后端结构
    normalizeResponse(res) {
      let list = [];
      let total = 0;
      // 兼容 { code, data: { list, total }, msg }
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
        // 兼容 { code, data: { ... } }
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
        // 关键修改：确保 category_id 字段被正确保留
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
        const res = await axios.get('/api/api/recommend/groups', { params: this.groupFilter });
        console.log('接口原始返回：', res);
        // 关键：用 res.data 传给 normalizeResponse
        const { list, total } = this.normalizeResponse(res.data);
        this.recommendGroups = list;
        this.groupPagination.total = total;
        console.log('store.recommendGroups', this.recommendGroups);
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
        const res = await axios.post('/api/api/recommend/groups', params);
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
        const res = await axios.put(`/api/api/recommend/groups/${id}`, params);
        ElMessage.success(res?.msg || '分组更新成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '更新分组失败');
        throw error;
      }
    },

    async deleteRecommendGroup(id) {
      try {
        const res = await axios.delete(`/api/api/recommend/groups/${id}`);
        ElMessage.success(res?.msg || '分组删除成功');
        await this.fetchRecommendGroups();
      } catch (error) {
        ElMessage.error(error?.msg || '删除分组失败');
        throw error;
      }
    },

    async saveGroupSort(sortedData) {
      try {
        const res = await axios.post('/api/api/recommend/groups/sort', sortedData);
        ElMessage.success(res?.msg || '排序保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存排序失败');
        return false;
      }
    },

    // 分组视频管理
    async fetchVideosForGroup(groupId) {
      try {
        const res = await axios.get(`/api/api/recommend/groups/${groupId}/videos`);
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
        // 关键：更新 groupVideoCounts
        this.groupVideoCounts[groupId] = list.length;
        return list;
      } catch (error) {
        this.groupVideoCounts[groupId] = 0;
        ElMessage.error(error?.msg || '获取分组视频失败');
        throw error;
      }
    },

    async saveVideosForGroup(groupId, videos) {
      try {
        // 【DEBUG】在这里打印接收到的原始 videos 参数
        console.log('【DEBUG】saveVideosForGroup 接收到的 videos:', JSON.parse(JSON.stringify(videos)));

        // 1. 从 state 中找到当前分组 (修正了类型匹配问题，并增加了更明确的错误提示)
        // 使用 == 而不是 === 来避免字符串和数字的类型问题
        const group = this.recommendGroups.find(g => g.id == groupId); 

        if (!group) {
            ElMessage.error(`错误：在当前分组列表里找不到 ID 为 "${groupId}" 的分组。`);
            return false;
        }
        if (!group.category_id) {
            ElMessage.error(`错误：分组 "${group.name}" 自身缺少 category_id 属性，无法保存。`);
            return false;
        }
        const categoryId = group.category_id;

        // 2. 构造一个包含 video_id, sort, 和 category_id 的对象数组
        let payload = [];
        if (Array.isArray(videos)) {
          payload = videos.map(v => ({
            video_id: Number(v.video_id), // 确保是数字
            sort: Number(v.sort),         // 确保是数字
            category_id: Number(categoryId) // 添加 category_id 并确保是数字
          }));
        }

        // 3. 将数组包装在一个名为 "videos" 的对象中发送
        const res = await axios.post(`/api/api/recommend/groups/${groupId}/videos`, { videos: payload });
        ElMessage.success(res?.msg || '视频保存成功');
        return true;
      } catch (error) {
        ElMessage.error(error?.msg || '保存视频失败');
        return false;
      }
    },

    // 分类管理
    // 主分类
    async fetchAllParentCategories() {
      try {
        const res = await axios.get('/api/api/categories/parents');
        const { list } = this.normalizeResponse(res.data); // 这里要用 res.data
        this.allParentCategories = Object.assign([], list);
        this._lastUpdate = Date.now();
      } catch (error) {
        this.allParentCategories = [];
        ElMessage.error(error?.message || '获取主分类失败');
      }
    },

    // 子分类
    async fetchAllChildCategories() {
      try {
        const res = await axios.get('/api/api/categories/children');
        const { list } = this.normalizeResponse(res.data); // 这里要用 res.data
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

    // 通用视频列表
    async fetchAllVideos(params) {
      try {
        const res = await axios.get('/api/api/long/videos', { params });
        // 关键：用 res.data 传给 normalizeResponse
        return this.normalizeResponse(res.data);
      } catch (error) {
        ElMessage.error(error?.msg || '获取视频失败');
        return { list: [], total: 0 };
      }
    }
  }
});




