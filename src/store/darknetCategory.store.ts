import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as darknetCategoryApi from '@/api/darknetCategory.api'
import type { DarknetCategory } from '@/types/darknetCategory'

export const useDarknetCategoryStore = defineStore('darknetCategory', () => {
  const parentCategories = ref<DarknetCategory[]>([])
  const childCategories = ref<DarknetCategory[]>([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      const res = await darknetCategoryApi.getDarknetCategories()
      if (res.data?.code === 0 && res.data.data) {
        parentCategories.value = Array.isArray(res.data.data.parents) ? res.data.data.parents : []
        childCategories.value = Array.isArray(res.data.data.children) ? res.data.data.children : []
      } else {
        parentCategories.value = []
        childCategories.value = []
        throw new Error(res.data?.msg || '获取暗网分类列表失败')
      }
      return res.data
    } catch (error: any) {
      parentCategories.value = []
      childCategories.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addCategory(data: any) {
    const res = await darknetCategoryApi.addDarknetCategory(data)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function addChildCategory(data: any) {
    const res = await darknetCategoryApi.addDarknetChildCategory(data)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function updateCategory(data: any) {
    const res = await darknetCategoryApi.updateDarknetCategory(data)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function removeCategory(id: number) {
    const res = await darknetCategoryApi.deleteDarknetCategory(id)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function batchRemoveCategories(ids: number[]) {
    const res = await darknetCategoryApi.batchDeleteDarknetCategories(ids)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function batchUpdateSort(list: { id: number; sort: number }[]) {
    const res = await darknetCategoryApi.batchUpdateDarknetCategorySort(list)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function updateCategoryTags(id: number, tags: string[]) {
    const res = await darknetCategoryApi.updateDarknetCategoryTags(id, tags)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  async function updateCategorySort(id: number, sort: number) {
    const res = await darknetCategoryApi.updateDarknetCategorySort(id, sort)
    if (res.data?.code === 0) {
      await fetchCategories()
    }
    return res.data
  }

  return {
    parentCategories,
    childCategories,
    loading,
    fetchCategories,
    addCategory,
    addChildCategory,
    updateCategory,
    removeCategory,
    batchRemoveCategories,
    batchUpdateSort,
    updateCategoryTags,
    updateCategorySort,
  }
})