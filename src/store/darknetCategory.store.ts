import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { DarknetCategory } from '@/types/darknetCategory'
import * as darknetCategoryApi from '@/api/darknetCategory.api'

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
        ElMessage.error('获取暗网分类列表失败: ' + (res.data?.msg || '未知错误'))
      }
      return res.data
    } catch (error) {
      parentCategories.value = []
      childCategories.value = []
      ElMessage.error('请求暗网分类列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addCategory(name: string) {
    const res = await darknetCategoryApi.addDarknetCategory(name)
    if (res.data?.code === 0) {
      ElMessage.success('新增主分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '新增主分类失败')
    }
    return res.data
  }

  async function addChildCategory(data: Omit<DarknetCategory, 'id' | 'videoCount' | 'create_time' | 'update_time'>) {
    const res = await darknetCategoryApi.addDarknetChildCategory(data)
    if (res.data?.code === 0) {
      ElMessage.success('新增子分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '新增子分类失败')
    }
    return res.data
  }

  async function updateCategory(data: Partial<DarknetCategory> & { id: number }) {
    const res = await darknetCategoryApi.updateDarknetCategory(data)
    if (res.data?.code === 0) {
      ElMessage.success('编辑分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '编辑分类失败')
    }
    return res.data
  }

  async function removeCategory(id: number) {
    const res = await darknetCategoryApi.deleteDarknetCategory(id)
    if (res.data?.code === 0) {
      ElMessage.success('删除分类成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '删除分类失败')
    }
    return res.data
  }

  async function batchRemoveCategories(ids: number[]) {
    const res = await darknetCategoryApi.batchDeleteDarknetCategories(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量删除成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '批量删除失败')
    }
    return res.data
  }

  async function batchUpdateSort(list: { id: number; sort: number }[]) {
    const res = await darknetCategoryApi.batchUpdateDarknetCategorySort(list)
    if (res.data?.code === 0) {
      ElMessage.success('批量排序成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '批量排序失败')
    }
    return res.data
  }

  async function updateCategoryTags(id: number, tags: string[]) {
    const res = await darknetCategoryApi.updateDarknetCategoryTags(id, tags)
    if (res.data?.code === 0) {
      ElMessage.success('标签更新成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '标签更新失败')
    }
    return res.data
  }

  async function updateCategorySort(id: number, sort: number) {
    const res = await darknetCategoryApi.updateDarknetCategorySort(id, sort)
    if (res.data?.code === 0) {
      ElMessage.success('排序保存成功')
      await fetchCategories()
    } else {
      ElMessage.error(res.data?.msg || '排序保存失败')
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