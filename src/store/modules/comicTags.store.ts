import { defineStore } from 'pinia'
import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useComicTagsStore = defineStore('comicTags', () => {
  // State
  const tags = ref<any[]>([])
  const loading = ref(false)

  // 获取标签列表
  async function fetchTags(params?: any) {
    loading.value = true
    try {
      const res = await service.get('/api/comic/tag/list', { params })
      console.log('1. 原始接口返回:', res)
      
      // 直接处理数据，不判断 code
      const data = res?.data ? res.data : res
      console.log('2. 处理后的data:', data)
      
      if (data && data.list) {
        tags.value = Array.isArray(data.list) ? data.list : []
        console.log('3. 最终设置的tags.value:', tags.value)
      } else {
        tags.value = []
        ElMessage.error('获取漫画标签列表失败')
      }
      return res
    } catch (error) {
      console.error('获取标签出错:', error)
      tags.value = []
      ElMessage.error('获取漫画标签列表请求失败')
      return { code: 1, msg: '获取漫画标签列表请求失败' }
    } finally {
      loading.value = false
    }
  }

  // 新增
  async function addTag(data: any) {
    const res = await service.post('/api/comic/tag/add', data)
    if (res.code === 0) {
      ElMessage.success(res.msg || '新增标签成功！')
      await fetchTags()
    } else {
      ElMessage.error(res.msg || '新增标签失败')
    }
    return res
  }

  // 更新
  async function updateTag(data: any) {
    const res = await service.post('/api/comic/tag/update', data)
    if (res.code === 0) {
      ElMessage.success(res.msg || '更新标签成功！')
      await fetchTags()
    } else {
      ElMessage.error(res.msg || '更新标签失败')
    }
    return res
  }

  // 删除
  async function deleteTag(id: number) {
    const res = await service.post('/api/comic/tag/delete', { id })
    if (res.code === 0) {
      ElMessage.success(res.msg || '删除标签成功！')
      await fetchTags()
    } else {
      ElMessage.error(res.msg || '删除标签失败')
    }
    return res
  }

  // 批量删除
  async function batchDeleteTags(ids: number[]) {
    const res = await service.post('/api/comic/tag/batchDelete', { ids })
    if (res.code === 0) {
      ElMessage.success(res.msg || '批量删除成功！')
      await fetchTags()
    } else {
      ElMessage.error(res.msg || '批量删除标签失败')
    }
    return res
  }

  // 批量设置状态
  async function batchSetTagStatus(ids: number[], status: number) {
    const res = await service.post('/api/comic/tag/batchSetStatus', { ids, status })
    if (res.code === 0) {
      ElMessage.success(res.msg || '批量设置标签状态成功！')
      await fetchTags()
    } else {
      ElMessage.error(res.msg || '批量设置标签状态失败')
    }
    return res
  }

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    updateTag,
    deleteTag,
    batchDeleteTags,
    batchSetTagStatus,
  }
})