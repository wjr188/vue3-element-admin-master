// File path: src/store/modules/audio-novel-chapter.store.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  fetchAudioNovelChaptersAPI,
  fetchAudioNovelChapterDetailAPI,
  addAudioNovelChapterAPI,
  updateAudioNovelChapterAPI,
  deleteAudioNovelChapterAPI,
  batchDeleteAudioNovelChaptersAPI,
  batchUpdateAudioNovelChapterOrderAPI
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
        } else {
          ElMessage.error(res.data.msg || '获取章节列表失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('获取章节列表请求失败');
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
        } else {
          ElMessage.error(res.data.msg || '获取章节详情失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('获取章节详情请求失败');
        return { code: 1, msg: '获取章节详情请求失败' };
      }
    },
    async add(data: any) {
      try {
        const res = await addAudioNovelChapterAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('新增章节成功');
          // 可选：await this.fetchList({ novelId: data.novel_id });
        } else {
          ElMessage.error(res.data.msg || '新增章节失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('新增章节请求失败');
        return { code: 1, msg: '新增章节请求失败' };
      }
    },
    async update(data: any) {
      try {
        const res = await updateAudioNovelChapterAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('更新章节成功');
          // 可选：await this.fetchList({ novelId: data.novel_id });
        } else {
          ElMessage.error(res.data.msg || '更新章节失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('更新章节请求失败');
        return { code: 1, msg: '更新章节请求失败' };
      }
    },
    async remove(id: number) {
      try {
        const res = await deleteAudioNovelChapterAPI(id);
        if (res.data.code === 0) {
          ElMessage.success('删除章节成功');
        } else {
          ElMessage.error(res.data.msg || '删除章节失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('删除章节请求失败');
        return { code: 1, msg: '删除章节请求失败' };
      }
    },
    async batchDelete(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelChaptersAPI(ids);
        if (res.data.code === 0) {
          ElMessage.success('批量删除章节成功');
        } else {
          ElMessage.error(res.data.msg || '批量删除章节失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量删除章节请求失败');
        return { code: 1, msg: '批量删除章节请求失败' };
      }
    },
    async batchUpdateOrder(list: Array<{ id: number, chapter_order: number }>) {
      try {
        const res = await batchUpdateAudioNovelChapterOrderAPI(list);
        if (res.data.code === 0) {
          ElMessage.success('章节排序更新成功');
        } else {
          ElMessage.error(res.data.msg || '章节排序更新失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('章节排序更新请求失败');
        return { code: 1, msg: '章节排序更新请求失败' };
      }
    }
  }
});
