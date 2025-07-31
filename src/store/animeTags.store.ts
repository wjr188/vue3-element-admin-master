import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnimeTag } from '@/types/animeTag'
import * as animeTagsApi from '@/api/animeTags.api'

export const useAnimeTagsStore = defineStore('animeTags', () => {
  const tags = ref<AnimeTag[]>([])
  const loading = ref(false)

  // 查询
  async function fetchTags(params: object = {}) {
    loading.value = true
    try {
      const res = await animeTagsApi.getAnimeTags(params)
      if (res.data?.code === 0 && Array.isArray(res.data.data)) {
        tags.value = res.data.data
      } else {
        tags.value = []
      }
    } finally {
      loading.value = false
    }
  }

  // 新增
  async function addTag(data: Omit<AnimeTag, 'id' | 'count' | 'create_time' | 'update_time'>) {
    // 确保 status 字段一定存在
    if (typeof data.status === 'undefined') {
      data.status = 1 // 或 0，按你的业务默认
    }
    const res = await animeTagsApi.addAnimeTag(data)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 编辑
  async function updateTag(data: AnimeTag) {
    // 确保 status 字段一定存在
    if (typeof data.status === 'undefined') {
      data.status = 1 // 或 0，按你的业务默认
    }
    const res = await animeTagsApi.updateAnimeTag(data)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 删除
  async function deleteTag(id: number) {
    const res = await animeTagsApi.deleteAnimeTag(id)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 批量删除
  async function batchDeleteTags(ids: number[]) {
    const res = await animeTagsApi.batchDeleteAnimeTags(ids)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 批量禁用
  async function batchDisableTags(ids: number[]) {
    const res = await animeTagsApi.batchDisableAnimeTags(ids)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 切换状态
  async function toggleTagStatus(id: number) {
    const res = await animeTagsApi.toggleAnimeTagStatus(id)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  // 批量更新排序
  async function batchUpdateTagSort(list: Array<{ id: number; sort: number }>) {
    const res = await animeTagsApi.batchUpdateAnimeTagSort(list)
    if (res.data?.code === 0) await fetchTags()
    return res.data
  }

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    updateTag,
    deleteTag,
    batchDeleteTags,
    batchDisableTags,
    toggleTagStatus,
    batchUpdateTagSort,
  }
})