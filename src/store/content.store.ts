import { defineStore } from 'pinia'
import {
  fetchAlbumList,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  batchDeleteAlbum,
  fetchVideoList,
  createVideo,
  updateVideo,
  deleteVideo,
  batchDeleteVideo,
  fetchInfluencerOptions,
  fetchAlbumOptions,
  fetchTagOptions,
  batchSetVideoVIP,
  batchSetVideoCoin,
  batchSetAlbumVIP,
  batchSetAlbumCoin
} from '@/api/content'

export const useContentStore = defineStore('content', {
  state: () => ({
    // 专辑
    albumList: [],
    albumLoading: false,
    albumPagination: { currentPage: 1, pageSize: 10, total: 0 },

    // 视频/图片
    videoList: [],
    videoLoading: false,
    videoPagination: { currentPage: 1, pageSize: 10, total: 0 },

    // 选项
    influencerOptions: [],
    albumOptions: [],
    tagOptions: [], // ← 一定要初始化为空数组
  }),
  actions: {
    // -------- 专辑操作 --------
    async getAlbumList(params = {}) {
      this.albumLoading = true
      let list = []
      let total = 1
      try {
        const res = await fetchAlbumList({
          page: this.albumPagination.currentPage,
          pageSize: this.albumPagination.pageSize,
          ...params
        })
        // 关键：这里要多一层 data
        if (res && res.data && res.data.data && Array.isArray(res.data.data.list)) {
          list = res.data.data.list
          total = res.data.data.total || 1
        }
      } catch (e) {
        // 可以在这里打印错误日志
      }
      this.albumList = list
      this.albumPagination.total = total
      this.albumLoading = false
      // 返回给页面用
      return { list, total }
    },
    async createAlbum(data) {
      await createAlbum(data)
      await this.getAlbumList()
    },
    async updateAlbum(id, data) {
      await updateAlbum(id, data)
      await this.getAlbumList()
    },
    async removeAlbum(id) {
      await deleteAlbum(id)
      await this.getAlbumList()
    },
    async batchRemoveAlbum(ids) {
      await batchDeleteAlbum(ids)
      await this.getAlbumList()
    },

    // -------- 视频/图片操作 --------
    async getVideoList(params = {}) {
      this.videoLoading = true
      let list = []
      let total = 0
      try {
        const res = await fetchVideoList({
          page: this.videoPagination.currentPage,
          pageSize: this.videoPagination.pageSize,
          ...params
        })
        // 关键：要多一层 data
        if (res && res.data && res.data.data && Array.isArray(res.data.data.list)) {
          list = res.data.data.list
          total = res.data.data.total || 0
        }
      } catch (e) {
        // 可以在这里打印错误日志
      }
      this.videoList = list
      this.videoPagination.total = total
      this.videoLoading = false
      // 关键：一定要return
      return { list, total }
    },
    async createVideo(data) {
      await createVideo(data)
      await this.getVideoList()
    },
    async updateVideo(data) {
      await updateVideo(data) // 只传一个对象，包含 id
      await this.getVideoList()
    },
    async removeVideo(id) {
      await deleteVideo({ id }) // 传对象
      await this.getVideoList()
    },
    async batchRemoveVideo(ids) {
      await batchDeleteVideo({ ids }) // 传对象
      await this.getVideoList()
    },
    async batchSetVideoVIPAction({ ids, is_vip }) {
      await batchSetVideoVIP({ ids, is_vip })
      await this.getVideoList()
    },
    async batchSetVideoCoinAction({ ids, coin }) {
      await batchSetVideoCoin({ ids, coin })
      await this.getVideoList()
    },
    async batchSetAlbumVIPAction({ album_id, is_vip }) {
      await batchSetAlbumVIP({ album_id, is_vip })
      await this.getAlbumList()
    },
    async batchSetAlbumCoinAction({ album_id, coin }) {
      await batchSetAlbumCoin({ album_id, coin })
      await this.getAlbumList()
    },

    // -------- 选项 --------
    async getInfluencerOptions() {
      const res = await fetchInfluencerOptions();
      // 直接取 data
      this.influencerOptions = Array.isArray(res.data.data) ? res.data.data : [];
      return this.influencerOptions;
    },
    async getAlbumOptions() {
      const res = await fetchAlbumOptions();
      // 关键：要取 res.data.data
      this.albumOptions = Array.isArray(res.data.data) ? res.data.data : [];
      return this.albumOptions;
    },
    async getTagOptions() {
      const res = await fetchTagOptions();
      // 这里要多一层 data
      this.tagOptions = res.data.data?.list || [];
      return res;
    }
  }
})
