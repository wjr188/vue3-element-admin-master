// File path: src/store/modules/audio-novel-chapter.store.ts
import { defineStore } from 'pinia';
import {
  fetchAudioNovelChaptersAPI,
  fetchAudioNovelChapterDetailAPI,
  addAudioNovelChapterAPI,
  updateAudioNovelChapterAPI,
  deleteAudioNovelChapterAPI,
  batchDeleteAudioNovelChaptersAPI,
  batchUpdateAudioNovelChapterOrderAPI,
  setAudioNovelChaptersFreeAPI // 新增
} from '@/api/audio-novel-chapter.api';

export const useAudioNovelChapterStore = defineStore('audioNovelChapter', {
  state: () => ({
    list: [] as any[],
    total: 0,
    loading: false,
    detail: null as any,
  }),
  actions: {
    async fetchList(params: any) {
      this.loading = true;
      try {
        const res = await fetchAudioNovelChaptersAPI(params);
        if (res.data.code === 0) {
          this.list = res.data.data.list || [];
          this.total = res.data.data.total || 0;
        }
        return res.data;
      } catch (e) {
        return { code: 1, msg: '获取章节列表请求失败' };
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(id: number) {
      try {
        const res = await fetchAudioNovelChapterDetailAPI(id);
        if (res.data.code === 0) {
          this.detail = res.data.data;
        }
        return res.data;
      } catch (e) {
        return { code: 1, msg: '获取章节详情请求失败' };
      }
    },
    async add(data: any) {
      try {
        const res = await addAudioNovelChapterAPI(data);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '新增章节请求失败' };
      }
    },
    async update(data: any) {
      try {
        const res = await updateAudioNovelChapterAPI(data);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '更新章节请求失败' };
      }
    },
    async remove(id: number) {
      try {
        const res = await deleteAudioNovelChapterAPI(id);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '删除章节请求失败' };
      }
    },
    async batchDelete(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelChaptersAPI(ids);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量删除章节请求失败' };
      }
    },
    async batchUpdateOrder(list: Array<{ id: number, chapter_order: number }>) {
      try {
        const res = await batchUpdateAudioNovelChapterOrderAPI(list);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '章节排序更新请求失败' };
      }
    },
    // 新增：批量章节设为免费
    async setChaptersFree(ids: number[]) {
      try {
        const res = await setAudioNovelChaptersFreeAPI(ids);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '设置免费请求失败' };
      }
    }
  }
});
