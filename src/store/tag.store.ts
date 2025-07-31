import { defineStore } from 'pinia'
import {
  fetchTagList,
  createTag,
  updateTag,
  deleteTag,
  batchDeleteTag
} from '@/api/tag'

export const useTagStore = defineStore('tag', {
  state: () => ({
    tagList: [],
    loading: false,
    pagination: { currentPage: 1, pageSize: 10, total: 0 }
  }),
  actions: {
    async getList(params = {}) {
      this.loading = true
      const res = await fetchTagList({
        page: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        ...params
      })
      this.tagList = res.data?.data?.list || []
      this.pagination.total = res.data?.data?.total || 0
      this.loading = false
    },
    async create(data) {
      await createTag(data)
      await this.getList()
    },
    async update(id, data) {
      await updateTag(id, data)
      await this.getList()
    },
    async remove(id) {
      await deleteTag(id)
      await this.getList()
    },
    async batchRemove(ids) {
      await batchDeleteTag(ids)
      await this.getList()
    }
  }
})
