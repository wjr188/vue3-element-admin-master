// File path: src/store/modules/audio-novel.store.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  fetchAudioNovelsAPI,
  fetchAudioNovelDetailAPI,
  addAudioNovelAPI,
  updateAudioNovelAPI,
  deleteAudioNovelAPI,
  batchDeleteAudioNovelsAPI,
  batchSetAudioNovelSerializationStatusAPI,
  batchSetAudioNovelShelfStatusAPI,
  batchSetAudioNovelVisibilityAPI,
  batchSetAudioNovelVipFreeAPI,
  batchSetAudioNovelCoinPerChapterAPI,
  batchSetAudioNovelNarratorAPI
} from '@/api/audio-novel.api';

export const useAudioNovelStore = defineStore('audioNovel', {
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
        const res = await fetchAudioNovelsAPI(params);
        if (res.data.code === 0) {
          this.list = res.data.data.list || [];
          this.total = res.data.data.total || 0;
        } else {
          ElMessage.error(res.data.msg || '获取有声小说列表失败');
        }
      } catch (e) {
        ElMessage.error('获取有声小说列表请求失败');
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(id: number) {
      try {
        const res = await fetchAudioNovelDetailAPI(id);
        if (res.data.code === 0) {
          this.detail = res.data.data;
        } else {
          ElMessage.error(res.data.msg || '获取详情失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('获取详情请求失败');
        return { code: 1, msg: '获取详情请求失败' };
      }
    },
    async add(data: any) {
      try {
        const res = await addAudioNovelAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('添加成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '添加失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('添加请求失败');
        return { code: 1, msg: '添加请求失败' };
      }
    },
    async update(data: any) {
      try {
        const res = await updateAudioNovelAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('保存成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '保存失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('保存请求失败');
        return { code: 1, msg: '保存请求失败' };
      }
    },
    async remove(id: number) {
      try {
        const res = await deleteAudioNovelAPI(id);
        if (res.data.code === 0) {
          ElMessage.success('删除成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '删除失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('删除请求失败');
        return { code: 1, msg: '删除请求失败' };
      }
    },
    async batchDelete(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelsAPI(ids);
        if (res.data.code === 0) {
          ElMessage.success('批量删除成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量删除失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量删除请求失败');
        return { code: 1, msg: '批量删除请求失败' };
      }
    },
    async batchSetSerializationStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelSerializationStatusAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置连载状态成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetShelfStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelShelfStatusAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置上架状态成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetVisibility(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelVisibilityAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置可见性成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetVipFree(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelVipFreeAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置VIP免费成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetCoinPerChapter(ids: number[], coin: number) {
      try {
        const res = await batchSetAudioNovelCoinPerChapterAPI(ids, coin);
        if (res.data.code === 0) {
          ElMessage.success('批量设置每集金币成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetNarrator(ids: number[], narrator: string) {
      try {
        const res = await batchSetAudioNovelNarratorAPI(ids, narrator);
        if (res.data.code === 0) {
          ElMessage.success('批量设置演播人成功');
          await this.fetchList({ page: 1, pageSize: 10 });
        } else {
          ElMessage.error(res.data.msg || '批量设置失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置请求失败');
        return { code: 1, msg: '批量设置请求失败' };
      }
    }
  }
});
