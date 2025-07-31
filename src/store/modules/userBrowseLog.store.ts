import { defineStore } from 'pinia'
import { getBrowseLogs, getContentTypeList, getCategoryList } from '@/api/userBrowseLog'

export const useBrowseHistoryStore = defineStore('browseHistory', {
  state: () => ({
    browseLogs: [] as any[],
    total: 0,
    loading: false,
    contentTypes: [] as any[],
    categories: [] as any[],
  }),
  actions: {
    async fetchBrowseLogs(params: any) {
      this.loading = true
      try {
        const res = await getBrowseLogs(params)
        console.log('API response:', res) // 添加日志确认数据

        // 确保正确处理响应
        this.browseLogs = res.data?.data?.list ?? []
        this.total = res.data?.data?.total ?? 0

        console.log('Store state after update:', {
          browseLogs: this.browseLogs,
          total: this.total
        })
      } catch (e) {
        console.error('Fetch error:', e)
        this.browseLogs = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    async fetchContentTypes() {
      try {
        const res = await getContentTypeList()
        // 保持响应式
        this.contentTypes.splice(0, this.contentTypes.length, ...(res.data || []))
      } catch (e) {
        this.contentTypes.splice(0, this.contentTypes.length)
      }
    },
    async fetchCategories(type: string) {
      if (!type) {
        this.categories.splice(0, this.categories.length)
        return
      }
      try {
        const res = await getCategoryList(type)
        this.categories.splice(0, this.categories.length, ...(res.data || []))
      } catch (e) {
        this.categories.splice(0, this.categories.length)
      }
    }
  }
})
