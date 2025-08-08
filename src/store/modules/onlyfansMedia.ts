import { defineStore } from 'pinia'
import { onlyfansMediaApi, type OnlyFansMedia } from '@/api/onlyfansMedia'

interface MediaState {
  mediaList: OnlyFansMedia[]
  currentMedia: OnlyFansMedia | null
  loading: boolean
  pagination: {
    total: number
    page: number
    page_size: number
  }
}

export const useOnlyfansMediaStore = defineStore('onlyfansMedia', {
  state: (): MediaState => ({
    // 媒体内容列表
    mediaList: [],
    // 当前媒体内容
    currentMedia: null,
    // 加载状态
    loading: false,
    // 分页信息
    pagination: {
      total: 0,
      page: 1,
      page_size: 15
    }
  }),

  getters: {
    // 是否有更多数据
    hasMore: (state): boolean => {
      return (state.pagination.page * state.pagination.page_size) < state.pagination.total
    },

    // VIP内容数量
    vipMediaCount: (state): number => {
      return state.mediaList.filter(item => item.is_vip === 1).length
    },

    // 普通内容数量
    normalMediaCount: (state): number => {
      return state.mediaList.filter(item => item.is_vip === 0).length
    }
  },

  actions: {
    // 获取媒体内容列表
    async fetchMediaList(params: Record<string, any> = {}) {
      this.loading = true
      try {
        const requestParams = {
          page: this.pagination.page,
          pageSize: this.pagination.page_size,
          ...params
        }
        
        const response = await onlyfansMediaApi.getList(requestParams)
        
        if (response.data && response.data.code === 0) {
          const { list = [], total = 0, page = 1, page_size = 15 } = response.data.data
          
          this.mediaList = list
          this.pagination.total = total
          this.pagination.page = page
          this.pagination.page_size = page_size
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取媒体列表失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      } finally {
        this.loading = false
      }
    },

    // 获取媒体内容详情
    async fetchMediaById(id: number) {
      if (!id) return { code: 1, msg: '内容ID不能为空' }
      
      this.loading = true
      try {
        const response = await onlyfansMediaApi.getById(id)
        
        if (response.data && response.data.code === 0) {
          this.currentMedia = response.data.data
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取媒体详情失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      } finally {
        this.loading = false
      }
    },

    // 新增媒体内容
    async addMedia(data: Partial<OnlyFansMedia>) {
      try {
        const response = await onlyfansMediaApi.add(data)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('新增媒体内容失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 更新媒体内容
    async updateMedia(data: Partial<OnlyFansMedia> & { id: number }) {
      try {
        const response = await onlyfansMediaApi.update(data)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('更新媒体内容失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 删除媒体内容
    async deleteMedia(id: number) {
      try {
        const response = await onlyfansMediaApi.delete(id)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('删除媒体内容失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量删除媒体内容
    async batchDeleteMedia(ids: number[]) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要删除的内容' }
      }
      
      try {
        const response = await onlyfansMediaApi.batchDelete(ids)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量删除媒体内容失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量设置VIP
    async batchSetVip(ids: number[], isVip: number) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要设置的内容' }
      }
      
      try {
        const response = await onlyfansMediaApi.batchSetVip(ids, isVip)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量设置VIP失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量设置金币
    async batchSetGold(ids: number[], coin: number) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要设置的内容' }
      }
      
      try {
        const response = await onlyfansMediaApi.batchSetGold(ids, coin)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量设置金币失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量设置状态
    async batchSetStatus(ids: number[], status: number) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要设置的内容' }
      }
      
      try {
        const response = await onlyfansMediaApi.batchSetStatus(ids, status)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量设置状态失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 更新排序
    async updateSort(list: Array<{ id: number; sort: number }>) {
      if (!Array.isArray(list) || list.length === 0) {
        return { code: 1, msg: '排序数据不能为空' }
      }
      
      try {
        const response = await onlyfansMediaApi.updateSort(list)
        
        if (response.data && response.data.code === 0) {
          await this.fetchMediaList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('更新排序失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 设置分页
    setPagination(page?: number, pageSize?: number) {
      this.pagination.page = page || 1
      this.pagination.page_size = pageSize || 15
    },

    // 清空数据
    clearData() {
      this.mediaList = []
      this.currentMedia = null
      this.pagination.total = 0
    },

    // 重置分页
    resetPagination() {
      this.pagination.page = 1
      this.pagination.total = 0
    }
  }
})