import { defineStore } from 'pinia'
import { onlyfansCategoryApi, type OnlyFansCategory, type OnlyFansCategoryStatistics } from '@/api/onlyfansCategory'

interface CategoryState {
  categoryList: OnlyFansCategory[]
  creatorsList: any[]
  currentCategory: OnlyFansCategory | null
  statistics: OnlyFansCategoryStatistics
  loading: boolean
  pagination: {
    total: number
    page: number
    page_size: number
  }
}

interface CategoryOption {
  label: string
  value: number
  disabled?: boolean
}

export const useOnlyfansCategoryStore = defineStore('onlyfansCategory', {
  state: (): CategoryState => ({
    // 分类列表
    categoryList: [],
    // 博主列表（从分类接口获取）
    creatorsList: [],
    // 当前选中的分类
    currentCategory: null,
    // 统计数据
    statistics: {
      category_count: 0,
      creator_count: 0,
      media_count: 0,
      category_stats: []
    },
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
    // 分类选项（用于下拉选择器）
    categoryOptions: (state): CategoryOption[] => {
      return state.categoryList.map(item => ({
        label: item.name,
        value: item.id,
        disabled: item.status === 0
      }))
    },

    // 启用的分类列表
    enabledCategories: (state): OnlyFansCategory[] => {
      return state.categoryList.filter(item => item.status === 1)
    },

    // 是否有更多数据
    hasMore: (state): boolean => {
      return (state.pagination.page * state.pagination.page_size) < state.pagination.total
    }
  },

  actions: {
    // 获取分类和博主列表
    async fetchCategoryList(params: Record<string, any> = {}) {
      this.loading = true
      try {
        const response = await onlyfansCategoryApi.getList(params)
        
        if (response.data && response.data.code === 0) {
          const { categories = [], creators = [], total = 0, page = 1, page_size = 15 } = response.data.data
          
          this.categoryList = categories
          this.creatorsList = creators
          this.pagination.total = total
          this.pagination.page = page
          this.pagination.page_size = page_size
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取分类列表失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      } finally {
        this.loading = false
      }
    },

    // 获取分类详情
    async fetchCategoryDetail(id: number) {
      if (!id) return { code: 1, msg: '分类ID不能为空' }
      
      try {
        const response = await onlyfansCategoryApi.getDetail(id)
        
        if (response.data && response.data.code === 0) {
          this.currentCategory = response.data.data
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取分类详情失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 获取统计信息
    async fetchStatistics() {
      try {
        const response = await onlyfansCategoryApi.getStatistics()
        
        if (response.data && response.data.code === 0) {
          this.statistics = response.data.data
        }
        
        return response.data
      } catch (error: any) {
        console.error('获取统计信息失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 新增分类
    async addCategory(data: Partial<OnlyFansCategory>) {
      try {
        const response = await onlyfansCategoryApi.add(data)
        
        if (response.data && response.data.code === 0) {
          // 重新获取列表
          await this.fetchCategoryList()
          // 重新获取统计
          await this.fetchStatistics()
        }
        
        return response.data
      } catch (error: any) {
        console.error('新增分类失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 更新分类
    async updateCategory(data: Partial<OnlyFansCategory> & { id: number }) {
      try {
        const response = await onlyfansCategoryApi.update(data)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCategoryList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('更新分类失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 删除分类
    async deleteCategory(id: number) {
      try {
        const response = await onlyfansCategoryApi.delete(id)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCategoryList()
          await this.fetchStatistics()
        }
        
        return response.data
      } catch (error: any) {
        console.error('删除分类失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量删除分类
    async batchDeleteCategory(ids: number[]) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { code: 1, msg: '请选择要删除的分类' }
      }
      
      try {
        const response = await onlyfansCategoryApi.batchDelete(ids)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCategoryList()
          await this.fetchStatistics()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量删除分类失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 批量更新排序
    async batchUpdateSort(list: Array<{ id: number; sort: number }>) {
      if (!Array.isArray(list) || list.length === 0) {
        return { code: 1, msg: '排序数据不能为空' }
      }
      
      try {
        const response = await onlyfansCategoryApi.batchUpdateSort(list)
        
        if (response.data && response.data.code === 0) {
          await this.fetchCategoryList()
        }
        
        return response.data
      } catch (error: any) {
        console.error('批量更新排序失败:', error)
        return { code: 1, msg: error.message || '请求失败' }
      }
    },

    // 设置当前分类
    setCurrentCategory(category: OnlyFansCategory | null) {
      this.currentCategory = category
    },

    // 清空数据
    clearData() {
      this.categoryList = []
      this.creatorsList = []
      this.currentCategory = null
      this.statistics = {
        category_count: 0,
        creator_count: 0,
        media_count: 0,
        category_stats: []
      }
      this.pagination.total = 0
    },

    // 重置分页
    resetPagination() {
      this.pagination.page = 1
      this.pagination.total = 0
    }
  }
})