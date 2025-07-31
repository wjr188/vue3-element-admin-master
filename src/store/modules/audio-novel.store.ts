import { defineStore } from 'pinia';
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
  batchSetAudioNovelVipAPI,         // 新
  batchCancelAudioNovelVipAPI,      // 新
  batchSetAudioNovelCoinAPI,        // 新
  batchSetAudioNovelNarratorAPI     // 新
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
        }
        return res.data;
      } catch (e) {
        return { code: 1, msg: '获取有声小说列表请求失败' };
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(id: number) {
      try {
        const res = await fetchAudioNovelDetailAPI(id);
        if (res.data.code === 0) {
          this.detail = res.data.data;
        }
        return res.data;
      } catch (e) {
        return { code: 1, msg: '获取详情请求失败' };
      }
    },
    async add(data: any) {
      try {
        const res = await addAudioNovelAPI(data);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '添加请求失败' };
      }
    },
    async update(data: any) {
      try {
        const res = await updateAudioNovelAPI(data);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '保存请求失败' };
      }
    },
    async remove(id: number) {
      try {
        const res = await deleteAudioNovelAPI(id);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '删除请求失败' };
      }
    },
    async batchDelete(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelsAPI(ids);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量删除请求失败' };
      }
    },
    async batchSetSerializationStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelSerializationStatusAPI(ids, status);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetShelfStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelShelfStatusAPI(ids, status);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    async batchSetVisibility(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelVisibilityAPI(ids, status);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置请求失败' };
      }
    },
    // 1. 批量设置VIP
    async batchSetVip(ids: number[], is_vip: number) {
      try {
        const res = await batchSetAudioNovelVipAPI(ids, is_vip);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置VIP请求失败' };
      }
    },
    // 2. 批量取消VIP
    async batchCancelVip(ids: number[]) {
      try {
        const res = await batchCancelAudioNovelVipAPI(ids);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量取消VIP请求失败' };
      }
    },
    // 3. 批量设置金币
    async batchSetCoin(ids: number[], coin: number) {
      try {
        const res = await batchSetAudioNovelCoinAPI(ids, coin);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置金币请求失败' };
      }
    },
    // 4. 批量设置演播人
    async batchSetNarrator(ids: number[], narrator: string) {
      try {
        const res = await batchSetAudioNovelNarratorAPI(ids, narrator);
        return res.data;
      } catch (e) {
        return { code: 1, msg: '批量设置演播人请求失败' };
      }
    }
  }
});
