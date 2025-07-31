import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { AnimeCategory } from '@/types/animeCategory'
import * as animeCategoriesApi from '@/api/animeCategories.api'

export const useAnimeCategoriesStore = defineStore('animeCategories', () => {
  const parentCategories = ref<AnimeCategory[]>([])
  const childCategories = ref<AnimeCategory[]>([])
  const loading = ref(false)

  // 获取分类列表
  async function fetchCategories() {
    loading.value = true
    try {
      const res = await animeCategoriesApi.getAnimeCategories()
      if (res.data?.code === 0 && res.data.data) {
        parentCategories.value = Array.isArray(res.data.data.parents) ? res.data.data.parents : []
        childCategories.value = Array.isArray(res.data.data.children) ? res.data.data.children : []
      } else {
        parentCategories.value = []
        childCategories.value = []
        ElMessage.error(res.data?.msg || '获取动漫分类列表失败')
      }
      return res.data
    } catch (e) {
      parentCategories.value = []
      childCategories.value = []
      ElMessage.error('请求动漫分类列表失败，请检查网络或后端服务。')
      throw e
    } finally {
      loading.value = false
    }
  }

  // 新增主分类
  async function addParentCategory(name: string) {
    const res = await animeCategoriesApi.addAnimeParentCategory(name)
    if (res.data?.code === 0) {
      ElMessage.success('新增主分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '新增主分类失败')
    }
    return res.data
  }

  // 新增子分类
  async function addChildCategory(data: Omit<AnimeCategory, 'id' | 'videoCount'>) {
    const res = await animeCategoriesApi.addAnimeChildCategory(data)
    if (res.data?.code === 0) {
      ElMessage.success('新增子分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '新增子分类失败')
    }
    return res.data
  }

  // 更新分类
  async function updateCategory(data: Partial<AnimeCategory> & { id: number }) {
    const res = await animeCategoriesApi.updateAnimeCategory(data)
    if (res.data?.code === 0) {
      ElMessage.success('更新分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '更新分类失败')
    }
    return res.data
  }

  // 删除分类
  async function removeCategory(id: number) {
    const res = await animeCategoriesApi.deleteAnimeCategory(id)
    if (res.data?.code === 0) {
      ElMessage.success('删除分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '删除分类失败')
    }
    return res.data
  }

  // 批量删除
  async function batchRemoveCategories(ids: number[]) {
    const res = await animeCategoriesApi.batchDeleteAnimeCategories(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量删除成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '批量删除失败')
    }
    return res.data
  }

  // 批量更新排序
  async function batchUpdateCategorySort(list: Array<{ id: number; sort: number }>) {
    const res = await animeCategoriesApi.batchUpdateAnimeCategorySort(list)
    if (res.data?.code === 0) {
      ElMessage.success('排序已更新')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '排序更新失败')
    }
    return res.data
  }

  return {
    parentCategories,
    childCategories,
    loading,
    fetchCategories,
    addParentCategory,
    addChildCategory,
    updateCategory,
    removeCategory,
    batchRemoveCategories,
    batchUpdateCategorySort,
  }
})