import { defineStore } from 'pinia'
import { onlyfansCreatorApi, type OnlyFansCreator, type OnlyFansCreatorDetail } from '@/api/onlyfansCreator'

interface CreatorState {
  creatorList: OnlyFansCreator[]
  currentCreator: OnlyFansCreator | null
  creatorDetail: OnlyFansCreatorDetail | null
  loading: boolean
  pagination: {
    total: number
    page: number
    page_size: number
  }
}

interface CreatorOption {
  label: string
  value: number
  disabled?: boolean
}

export const useOnlyfansCreatorStore = defineStore('onlyfansCreator', {
  state: (): CreatorState => ({
    // 博主列表
    creatorList: [],
    // 当前博主
    currentCreator: null,
    // 博主详情（包含内容）
    creatorDetail: null,
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
    // 博主选项
    creatorOptions: (state): CreatorOption[] => {
      return state.creatorList.map(item => ({
        label: item.name,
        value: item.id,
        disabled: item.status === 0
      }))
    },

    // 启用的博主列表
    enabledCreators: (state): OnlyFansCreator[] => {
      return state.creatorList.filter(item => item.status === 1)
    },

    // 是否有更多数据
    hasMore: (state): boolean => {
      return (state.pagination.page * state.pagination.page_size) < state.pagination.total
    }
  },

  actions: {
    // 获取博主列表
    async fetchCreatorList(params: Record<string, any> = {}) {
      this.loading = true
      try {
        const requestParams = {
          page: this.pagination.page,
          pageSize: this.pagination.page_size,
          ...params
        }
        
        const response = await onlyfansCreatorApi.getList(requestParams)
        
        if (response.data && response.data.code === 0) {
          const { list = [], total = 0, page = 1, page_size = 15 } = response.data.data
          
          this.creatorList = list
          this.pagination.total = total
          this.pagination.page = page
          this.pagination.page_size = page_size
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取博主列表失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      } finally {
        this.loading = false
      }
    },

    // 获取博主详情及其内容
    async fetchCreatorDetail(id: number, params: Record<string, any> = {}) {
      if (!id) return { code: 1, msg: '博主ID不能为空' }
      
      this.loading = true
      try {
        const response = await onlyfansCreatorApi.getDetail(id, params)
        
        if (response.data && response.data.code === 0) {
          this.creatorDetail = response.data.data
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取博主详情失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      } finally {
        this.loading = false
      }
    },

    // 新增博主
    async addCreator(data: Partial<OnlyFansCreator>) {
      try {
        const response = await onlyfansCreatorApi.add(data)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('新增博主失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 更新博主
    async updateCreator(data: Partial<OnlyFansCreator> & { id: number }) {
      try {
        const response = await onlyfansCreatorApi.update(data)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('更新博主失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 删除博主
    async deleteCreator(id: number) {
      try {
        const response = await onlyfansCreatorApi.delete(id)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('删除博主失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量删除博主
    async batchDeleteCreator(ids: number[]) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要删除的博主' }
      }
      
      try {
        const response = await onlyfansCreatorApi.batchDelete(ids)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量删除博主失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量设置状态
    async batchSetStatus(ids: number[], status: number) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要设置的博主' }
      }
      
      try {
        const response = await onlyfansCreatorApi.batchSetStatus(ids, status)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量设置状态失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量设置分类
    async batchSetCategory(ids: number[], categoryId: number) {
      if (!Array.isArray(ids) || ids.length === 0 || !categoryId) {
        return { code: 1, msg: '参数错误' }
      }
      
      try {
        const response = await onlyfansCreatorApi.batchSetCategory(ids, categoryId)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCreatorList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量设置分类失败:', error)
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
      this.creatorList = []
      this.currentCreator = null
      this.creatorDetail = null
      this.pagination.total = 0
    },

    // 重置分页
    resetPagination() {
      this.pagination.page = 1
      this.pagination.total = 0
    }
  }
})