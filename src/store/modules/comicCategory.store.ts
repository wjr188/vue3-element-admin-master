import { defineStore } from 'pinia'
import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useComicCategoryStore = defineStore('comicCategory', () => {
  // State
  const mainCategories = ref<any[]>([])
  const subCategories = ref<any[]>([])
  const loading = ref(false)

  // 获取分类列表
  async function fetchCategories() {
    loading.value = true
    try {
      const res = await service.get('/api/comic/category/list')
      // 兼容两种返回结构
      const data = res.data ? res.data : res
      // 主分类（parent_id === 0），子分类（parent_id !== 0）
      mainCategories.value = (data.mainCategories || []).map(item => ({
        ...item,
        layout_type: undefined // 主分类无 layout_type
      }))
      subCategories.value = (data.subCategories || []).map(item => ({
        ...item,
        // 子分类可选 layout_type，若后端没传默认为 'type1'
        layout_type: item.layout_type || 'type1'
      }))
      return res
    } catch (error) {
      mainCategories.value = []
      subCategories.value = []
      ElMessage.error('获取漫画分类列表请求失败')
      return { code: 1, msg: '获取漫画分类列表请求失败' }
    } finally {
      loading.value = false
    }
  }

  // 新增
  // 新增分类
async function addCategory(data: any) {
  // 新增时，只有 parent_id !== 0 的才带 layout_type
  const req = { ...data }
  if (req.parent_id && !req.layout_type) req.layout_type = 'type1'
  // ---- icon 字段由前端传，不需特殊处理
  const res = await service.post('/api/comic/category/add', req)
  if (res.code === 0) {
    ElMessage.success('新增分类成功！')
    await fetchCategories()
  } else {
    ElMessage.error(res.msg || '新增分类失败')
  }
  return res
}

// 编辑分类
async function updateCategory(data: any) {
  const req = { ...data }
  if (req.parent_id && !req.layout_type) req.layout_type = 'type1'
  // ---- icon 字段由前端传，不需特殊处理
  const res = await service.post('/api/comic/category/update', req)
  if (res.code === 0) {
    ElMessage.success('更新分类成功！')
    await fetchCategories()
  } else {
    ElMessage.error(res.msg || '更新分类失败')
  }
  return res
}

  // 删除
  async function deleteCategory(id: number) {
    const res = await service.post('/api/comic/category/delete', { id })
    if (res.code === 0) {
      ElMessage.success('删除分类成功！')
      await fetchCategories()
    } else {
      ElMessage.error(res.msg || '删除分类失败')
    }
    return res
  }

  // 批量删除
  async function batchDeleteCategories(ids: number[]) {
    const res = await service.post('/api/comic/category/batchDelete', { ids })
    if (res.code === 0) {
      ElMessage.success('批量删除成功！')
      await fetchCategories()
    } else {
      ElMessage.error(res.msg || '批量删除分类失败')
    }
    return res
  }

  // 批量设置状态
  async function batchSetCategoryStatus(ids: number[], status: number) {
    const res = await service.post('/api/comic/category/batchSetStatus', { ids, status })
    if (res.code === 0) {
      ElMessage.success('批量设置分类状态成功！')
      await fetchCategories()
    } else {
      ElMessage.error(res.msg || '批量设置分类状态失败')
    }
    return res
  }

  // 切换分类状态
  async function toggleCategoryStatus(id: number) {
    const res = await service.post('/api/comic/category/toggleStatus', { id })
    if (res.code === 0) {
      ElMessage.success('分类状态切换成功！')
      await fetchCategories()
    } else {
      ElMessage.error(res.msg || '切换分类状态失败')
    }
    return res
  }

  // ====== 新增：辅助获取某主分类的所有子分类及布局 ======
  function getSubCategoriesByParentId(parentId: number) {
    // 返回某个主分类下的所有子分类（每个都带 layout_type）
    return subCategories.value.filter(sub => sub.parent_id === parentId)
  }

  return {
    mainCategories,
    subCategories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    batchDeleteCategories,
    batchSetCategoryStatus,
    toggleCategoryStatus,
    getSubCategoriesByParentId, // 导出辅助方法
  }
})
