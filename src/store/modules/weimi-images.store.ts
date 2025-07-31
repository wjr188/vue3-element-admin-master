// 文件路径: src/store/modules/weimi-images.store.ts

import { ref } from 'vue'
import service from '@/utils/request'

// 微密圈图片专辑列表
export const weimiImages = ref<any[]>([])
export const weimiImageTotal = ref(0)
export const weimiImageLoading = ref(false)

/**
 * 获取微密圈图片专辑列表
 * 官方接口 GET /api/weimi/images/list
 */
export async function fetchWeimiImages(params: any = {}) {
  weimiImageLoading.value = true
  try {
    const res = await service.get('/api/weimi/images/list', { params })
    if (res.data && res.data.code === 0 && res.data.data) {
      weimiImages.value = res.data.data.list || []
      weimiImageTotal.value = res.data.data.total || 0
    } else {
      weimiImages.value = []
      weimiImageTotal.value = 0
      console.error('获取微密圈图片列表失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    weimiImages.value = []
    weimiImageTotal.value = 0
    console.error('请求微密圈图片列表失败:', error)
    throw error
  } finally {
    weimiImageLoading.value = false
  }
}

/**
 * 新增微密圈图片专辑
 * 官方接口 POST /api/weimi/images/add
 */
export async function addWeimiImage(data: any) {
  try {
    const res = await service.post('/api/weimi/images/add', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('新增图片专辑失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求新增图片专辑失败:', error)
    throw error
  }
}

/**
 * 编辑微密圈图片专辑
 * 官方接口 POST /api/weimi/images/update
 */
export async function updateWeimiImage(data: any) {
  try {
    const res = await service.post('/api/weimi/images/update', data)
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('编辑图片专辑失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求编辑图片专辑失败:', error)
    throw error
  }
}

/**
 * 删除单个微密圈图片专辑
 * 官方接口 POST /api/weimi/images/delete
 */
export async function deleteWeimiImage(id: number) {
  try {
    const res = await service.post('/api/weimi/images/delete', { id })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('删除图片专辑失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求删除图片专辑失败:', error)
    throw error
  }
}

/**
 * 批量删除微密圈图片专辑
 * 官方接口 POST /api/weimi/images/batch-delete
 */
export async function batchDeleteWeimiImages(ids: number[]) {
  try {
    const res = await service.post('/api/weimi/images/batch-delete', { ids })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('批量删除图片专辑失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量删除图片专辑失败:', error)
    throw error
  }
}

/**
 * 更新图片排序
 * 官方接口 POST /api/weimi/images/update-sort
 */
export async function updateWeimiImageSort(list: { id: number; sort: number }[]) {
  try {
    const res = await service.post('/api/weimi/images/update-sort', { list })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('更新图片排序失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求更新图片排序失败:', error)
    throw error
  }
}

/**
 * 获取单个图片专辑详情
 * 官方接口 GET /api/weimi/images/:id
 */
export async function fetchWeimiImageDetail(id: number) {
  try {
    const res = await service.get(`/api/weimi/images/${id}`)
    if (res.data && res.data.code === 0) {
      return res.data.data
    } else {
      console.error('获取图片专辑详情失败:', res.data?.msg || '未知错误')
      return null
    }
  } catch (error) {
    console.error('请求图片专辑详情失败:', error)
    throw error
  }
}

/**
 * 批量设置VIP
 * 官方接口 POST /api/weimi/images/batch-set-vip
 */
export async function batchSetWeimiImageVip(ids: number[], isVip: boolean) {
  try {
    const res = await service.post('/api/weimi/images/batch-set-vip', { ids, is_vip: isVip ? 1 : 0 })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('批量设置VIP失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量设置VIP失败:', error)
    throw error
  }
}

/**
 * 批量设置金币
 * 官方接口 POST /api/weimi/images/batch-set-gold
 */
export async function batchSetWeimiImageGold(ids: number[], gold: number) {
  try {
    const res = await service.post('/api/weimi/images/batch-set-gold', { ids, gold })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('批量设置金币失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量设置金币失败:', error)
    throw error
  }
}

/**
 * 批量设置状态（启用/禁用等）
 * 官方接口 POST /api/weimi/images/batch-set-status
 */
export async function batchSetWeimiImageStatus(ids: number[], status: number) {
  try {
    const res = await service.post('/api/weimi/images/batch-set-status', { ids, status })
    if (res.data && res.data.code === 0) {
      await fetchWeimiImages()
    } else {
      console.error('批量设置状态失败:', res.data?.msg || '未知错误')
    }
    return res.data
  } catch (error) {
    console.error('请求批量设置状态失败:', error)
    throw error
  }
}
