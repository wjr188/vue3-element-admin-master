import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { DarknetTag } from '@/types/darknetTag'
import * as darknetTagApi from '@/api/darknetTag.api'

export const useDarknetTagStore = defineStore('darknetTag', () => {
  const tags = ref<DarknetTag[]>([])
  const loading = ref(false)

  async function fetchTags(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const res = await darknetTagApi.getDarknetTags(params)
      if (res.data?.code === 0 && Array.isArray(res.data.data)) {
        tags.value = res.data.data
      } else {
        tags.value = []
        ElMessage.error('获取暗网标签失败: ' + (res.data?.msg || '未知错误'))
      }
      return res.data
    } catch (e) {
      tags.value = []
      ElMessage.error('请求暗网标签列表异常')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addTag(data: Omit<DarknetTag, 'id' | 'videoCount' | 'create_time' | 'update_time'>) {
    const res = await darknetTagApi.addDarknetTag(data)
    if (res.data?.code === 0) {
      ElMessage.success('新增成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '新增失败')
    }
    return res.data
  }

  async function updateTag(data: DarknetTag) {
    const res = await darknetTagApi.updateDarknetTag(data)
    if (res.data?.code === 0) {
      ElMessage.success('保存成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '保存失败')
    }
    return res.data
  }

  async function removeTag(id: number) {
    const res = await darknetTagApi.deleteDarknetTag(id)
    if (res.data?.code === 0) {
      ElMessage.success('删除成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '删除失败')
    }
    return res.data
  }

  async function batchRemoveTags(ids: number[]) {
    const res = await darknetTagApi.batchDeleteDarknetTags(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量删除成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '批量删除失败')
    }
    return res.data
  }

  async function batchDisableTags(ids: number[]) {
    const res = await darknetTagApi.batchDisableDarknetTags(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量禁用成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '批量禁用失败')
    }
    return res.data
  }

  async function toggleTagStatus(id: number) {
    const res = await darknetTagApi.toggleDarknetTagStatus(id)
    if (res.data?.code === 0) {
      ElMessage.success('状态切换成功')
      await fetchTags()
    } else {
      ElMessage.error(res.data?.msg || '状态切换失败')
    }
    return res.data
  }

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    updateTag,
    removeTag,
    batchRemoveTags,
    batchDisableTags,
    toggleTagStatus,
  }
})