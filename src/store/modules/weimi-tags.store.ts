// 文件路径: src/store/modules/weimi-tags.store.ts

import { ref } from 'vue'
import service from '@/utils/request'

// 微密圈标签数据列表
export const weimiTags = ref<any[]>([])

/**
 * 获取微密圈标签列表
 * 官方接口 GET /api/weimi/tags/list
 */
export async function fetchWeimiTags(params: any = {}) {
  try {
    const res = await service.get('/api/weimi/tags/list', { params })
    if (res.data && res.data.code === 0 && res.data.data) {
      weimiTags.value = res.data.data.list || []
    } else {
      weimiTags.value = []
      console.error('获取微密圈标签列表失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    weimiTags.value = []
    console.error('请求微密圈标签列表失败:', error)
    throw error
  }
}

/**
 * 新增微密圈标签
 * 官方接口 POST /api/weimi/tags/add
 */
export async function addWeimiTag(data: any) {
  try {
    const res = await service.post('/api/weimi/tags/add', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('新增标签失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求新增标签失败:', error)
    throw error
  }
}

/**
 * 编辑微密圈标签
 * 官方接口 POST /api/weimi/tags/update
 */
export async function updateWeimiTag(data: any) {
  try {
    const res = await service.post('/api/weimi/tags/update', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('编辑标签失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求编辑标签失败:', error)
    throw error
  }
}

/**
 * 删除微密圈标签
 * 官方接口 POST /api/weimi/tags/delete
 */
export async function deleteWeimiTag(id: number) {
  try {
    const res = await service.post('/api/weimi/tags/delete', { id })
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('删除标签失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求删除标签失败:', error)
    throw error
  }
}

/**
 * 批量删除微密圈标签
 * 官方接口 POST /api/weimi/tags/batch-delete
 */
export async function batchDeleteWeimiTags(ids: number[]) {
  try {
    const res = await service.post('/api/weimi/tags/batch-delete', { ids })
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('批量删除标签失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量删除标签失败:', error)
    throw error
  }
}

/**
 * 批量禁用微密圈标签
 * 官方接口 POST /api/weimi/tags/batch-disable
 */
export async function batchDisableWeimiTags(ids: number[]) {
  try {
    const res = await service.post('/api/weimi/tags/batch-disable', { ids })
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('批量禁用标签失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量禁用标签失败:', error)
    throw error
  }
}

/**
 * 切换标签状态 (单个启用/禁用)
 * 官方接口 POST /api/weimi/tags/toggle-status
 */
export async function toggleWeimiTagStatus(id: number) {
  try {
    const res = await service.post('/api/weimi/tags/toggle-status', { id })
    if (res.data && res.data.code === 0) {
      await fetchWeimiTags()
    } else {
      console.error('切换标签状态失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求切换标签状态失败:', error)
    throw error
  }
}
