import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  fetchAudioRecommendGroupsAPI,
  addAudioRecommendGroupAPI,
  updateAudioRecommendGroupAPI,
  deleteAudioRecommendGroupAPI,
  saveAudioRecommendGroupSortAPI,
  fetchAudioNovelsForGroupAPI,
  saveAudioNovelsForGroupAPI,
  fetchAllAudioCategoriesAPI,
  fetchAllAudioNovelsAPI
} from '@/api/audio-recommend.api';

export const useAudioRecommendStore = defineStore('audioRecommend', {
  state: () => ({
    recommendGroups: [] as any[],
    groupFilter: { keyword: '' },
    groupPagination: { currentPage: 1, pageSize: 10, total: 0 },
    loading: false,
    allCategories: [] as any[],
    _lastUpdate: 0,
    groupAudioNovelCounts: {} as Record<number, number>,
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
      return { list: Array.isArray(list) ? list : [], total };
    },

    setGroupFilter(filter: any) {
      this.groupFilter = { ...this.groupFilter, ...filter };
    },

    // 推荐分组管理
    async fetchRecommendGroups() {
      this.loading = true;
      try {
        const res = await fetchAudioRecommendGroupsAPI(this.groupFilter);
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
        const res = await addAudioRecommendGroupAPI(params);
        ElMessage.success(res?.msg || res?.message || '分组添加成功');
        await this.fetchRecommendGroups();
        return res;
      } catch (error: any) {
        ElMessage.error(error?.msg || error.message || '添加分组失败');
        throw error;
      }
    },
    async updateRecommendGroup(id: number, params: any) {
      try {
        const res = await updateAudioRecommendGroupAPI(id, params);
        ElMessage.success(res?.msg || '分组更新成功');
        await this.fetchRecommendGroups();
        return res;
      } catch (error: any) {
        ElMessage.error(error?.msg || '更新分组失败');
        throw error;
      }
    },
    async deleteRecommendGroup(id: number) {
      try {
        const res = await deleteAudioRecommendGroupAPI(id);
        ElMessage.success(res?.msg || '分组删除成功');
        await this.fetchRecommendGroups();
        return res;
      } catch (error: any) {
        ElMessage.error(error?.msg || '删除分组失败');
        throw error;
      }
    },
    async saveGroupSort(sortedData: any[]) {
      try {
        const res = await saveAudioRecommendGroupSortAPI(sortedData);
        ElMessage.success(res?.msg || '排序保存成功');
        return true;
      } catch (error) {
        ElMessage.error('保存排序失败');
        return false;
      }
    },

    // 分组有声小说管理
    async fetchAudioNovelsForGroup(groupId: number) {
      try {
        const res = await fetchAudioNovelsForGroupAPI(groupId);
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
        // 只统计有 title 的小说
        list = list.filter((item: any) => item.title);
        this.groupAudioNovelCounts[groupId] = list.length;
        return list;
      } catch (error: any) {
        this.groupAudioNovelCounts[groupId] = 0;
        ElMessage.error(error?.msg || '获取分组有声小说失败');
        throw error;
      }
    },
    async fetchAudioNovelsForGroupAndSave(groupId: number) {
      try {
        const audioNovels = await this.fetchAudioNovelsForGroup(groupId);
        this.recommendGroups = this.recommendGroups.map(group => {
          if (group.id === groupId) {
            return { ...group, novel_count: audioNovels.length };
          }
          return group;
        });
        return audioNovels;
      } catch (error) {
        console.error('Error fetching and saving audio novels for group:', error);
        return [];
      }
    },
    async saveAudioNovelsForGroup(groupId: number, audioNovels: any[]) {
      try {
        const res = await saveAudioNovelsForGroupAPI(groupId, audioNovels);
        ElMessage.success(res?.msg || '有声小说保存成功');
        return true;
      } catch (error: any) {
        ElMessage.error(error?.msg || '保存有声小说失败');
        return false;
      }
    },

    // 有声小说分类管理
    async fetchAllAudioCategories() {
      try {
        const res = await fetchAllAudioCategoriesAPI();
        const { list } = this.normalizeResponse(res.data);
        this.allCategories = list;
        this._lastUpdate = Date.now();
      } catch (error: any) {
        this.allCategories = [];
        ElMessage.error(error?.message || '获取有声分类失败');
      }
    },

    // 通用有声小说列表
    async fetchAllAudioNovels(params: any = {}) {
      try {
        const res = await fetchAllAudioNovelsAPI(params);
        const normalized = this.normalizeResponse(res.data);
        // id 映射
        normalized.list = normalized.list.map((item: any) => ({
          ...item,
          audio_novel_id: item.id
        }));
        return normalized;
      } catch (error: any) {
        ElMessage.error(error?.msg || '获取有声小说失败');
        return { list: [], total: 0 };
      }
    },
    async getAllSelectedAudioNovelIds() {
      // 拉取所有分组
      await this.fetchRecommendGroups();
      let allIds: number[] = [];
      for (const group of this.recommendGroups) {
        const novels = await this.fetchAudioNovelsForGroup(group.id);
        allIds = allIds.concat(novels.map(n => n.audio_novel_id));
      }
      return Array.from(new Set(allIds));
    }
  }
});