// File path: src/store/modules/audio-novel-tag.store.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  fetchAudioNovelTagsAPI,
  addAudioNovelTagAPI,
  updateAudioNovelTagAPI,
  deleteAudioNovelTagAPI,
  batchDeleteAudioNovelTagsAPI,
  batchSetAudioNovelTagStatusAPI
} from '@/api/audio-novel-tag.api';

export const useAudioNovelTagStore = defineStore('audioNovelTag', {
  state: () => ({
    list: [] as any[],
    loading: false,
    total: 0,
  }),
  actions: {
    async fetchList(params: any = {}) {
      this.loading = true;
      try {
        const res = await fetchAudioNovelTagsAPI(params);
        if (res.data.code === 0) {
          this.list = res.data.data.list || [];
          this.total = res.data.data.total || this.list.length;
        } else {
          ElMessage.error(res.data.msg || '获取标签列表失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('获取标签列表请求失败');
        return { code: 1, msg: '获取标签列表请求失败' };
      } finally {
        this.loading = false;
      }
    },
    async add(data: any) {
      try {
        const res = await addAudioNovelTagAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('新增标签成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '新增标签失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('新增标签请求失败');
        return { code: 1, msg: '新增标签请求失败' };
      }
    },
    async update(data: any) {
      try {
        const res = await updateAudioNovelTagAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('更新标签成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '更新标签失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('更新标签请求失败');
        return { code: 1, msg: '更新标签请求失败' };
      }
    },
    async remove(id: number) {
      try {
        const res = await deleteAudioNovelTagAPI(id);
        if (res.data.code === 0) {
          ElMessage.success('删除标签成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '删除标签失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('删除标签请求失败');
        return { code: 1, msg: '删除标签请求失败' };
      }
    },
    async batchDelete(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelTagsAPI(ids);
        if (res.data.code === 0) {
          ElMessage.success('批量删除标签成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '批量删除标签失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量删除标签请求失败');
        return { code: 1, msg: '批量删除标签请求失败' };
      }
    },
    async batchSetStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelTagStatusAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置标签状态成功');
          await this.fetchList();
        } else {
          ElMessage.error(res.data.msg || '批量设置标签状态失败');
        }
        return res.data;
      } catch (e) {
        ElMessage.error('批量设置标签状态请求失败');
        return { code: 1, msg: '批量设置标签状态请求失败' };
      }
    }
  }
});
