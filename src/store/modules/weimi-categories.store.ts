// 文件路径: src/store/modules/weimi-categories.store.ts

import { ref } from 'vue'
import service from '@/utils/request'

// 微密圈分类数据
export const weimiCategories = ref<any[]>([]) // 所有分类（展平）
export const weimiParentCategories = ref<any[]>([]) // 一级分类
export const weimiChildCategories = ref<any[]>([]) // 子分类

/**
 * 获取微密圈分类列表
 * 官方统一接口 GET /api/weimi/categories/list
 * 返回: { code: 0, data: { parents: [...], children: [...] } }
 */
export async function fetchWeimiCategories() {
  try {
    const res = await service.get('/api/weimi/categories/list')
    if (res.data && res.data.code === 0 && res.data.data) {
      weimiParentCategories.value = res.data.data.parents || []
      weimiChildCategories.value = res.data.data.children || []
      // 扁平化，方便管理页面使用
      weimiCategories.value = [
        ...weimiParentCategories.value.map((p: any) => ({ ...p, type: 'parent' })),
        ...weimiChildCategories.value.map((c: any) => ({ ...c, type: 'child' })),
      ]
    } else {
      weimiParentCategories.value = []
      weimiChildCategories.value = []
      weimiCategories.value = []
      console.error('获取微密圈分类列表失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    weimiParentCategories.value = []
    weimiChildCategories.value = []
    weimiCategories.value = []
    console.error('请求微密圈分类列表失败:', error)
    throw error
  }
}

/**
 * 新增微密圈分类（主/子分类通用，后端根据 parent_id 区分）
 * 官方接口 POST /api/weimi/categories/add
 */
export async function addWeimiCategory(data: any) {
  try {
    const res = await service.post('/api/weimi/categories/add', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiCategories()
    } else {
      console.error('新增分类失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求新增分类失败:', error)
    throw error
  }
}

/**
 * 编辑微密圈分类（主/子分类通用）
 * 官方接口 POST /api/weimi/categories/update
 */
export async function updateWeimiCategory(data: any) {
  try {
    const res = await service.post('/api/weimi/categories/update', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiCategories()
    } else {
      console.error('编辑分类失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求编辑分类失败:', error)
    throw error
  }
}

/**
 * 删除微密圈分类（主/子分类通用）
 * 官方接口 POST /api/weimi/categories/delete
 */
export async function deleteWeimiCategory(id: number) {
  try {
    const res = await service.post('/api/weimi/categories/delete', { id })
    if (res.data && res.data.code === 0) {
      await fetchWeimiCategories()
    } else {
      console.error('删除分类失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求删除分类失败:', error)
    throw error
  }
}

/**
 * 批量删除微密圈分类
 * 官方接口 POST /api/weimi/categories/batch-delete
 */
export async function batchDeleteWeimiCategories(ids: number[]) {
  try {
    const res = await service.post('/api/weimi/categories/batch-delete', { ids })
    if (res.data && res.data.code === 0) {
      await fetchWeimiCategories()
    } else {
      console.error('批量删除分类失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量删除分类失败:', error)
    throw error
  }
}

/**
 * 批量更新分类排序
 * 官方接口 POST /api/weimi/categories/batch-update-sort
 */
export async function batchUpdateWeimiCategorySort(list: { id: number; sort: number }[]) {
  try {
    const res = await service.post('/api/weimi/categories/batch-update-sort', { list })
    if (res.data && res.data.code === 0) {
      await fetchWeimiCategories()
    } else {
      console.error('批量更新分类排序失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量更新分类排序失败:', error)
    throw error
  }
}
