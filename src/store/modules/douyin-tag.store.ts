// 文件路径: src/store/modules/douyin-tag.store.ts

import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

// 定义类型
export interface DouyinTag {
  id: number
  name: string
  group?: string
  status: number // 0禁用 1启用
  sort?: number
  count?: number
  create_time?: string
  update_time?: string
}

// 标签数据
export const douyinTags = ref<DouyinTag[]>([])
export const douyinTagTotal = ref(0)
export const douyinTagLoading = ref(false)

/**
 * 获取标签列表（支持筛选）
 * 官方接口 GET /api/douyin/tags/list
 */
export async function fetchTagList(params: any = {}) {
  douyinTagLoading.value = true
  try {
    const res = await service.get('/api/douyin/tags/list', { params })
    // request.ts 成功时会直接返回后端响应的 data 字段内容
    // 所以这里的 res 就是 { list: [...], total: ... }
    if (res) { // 只需判断 res 是否存在
      douyinTags.value = res.list || [] // 直接访问 res.list
      douyinTagTotal.value = res.total || 0 // 直接访问 res.total
    } else {
      // 理论上 request.ts 成功返回空 data 很少见，但为了健壮性可以保留
      douyinTags.value = []
      douyinTagTotal.value = 0
      console.error('获取抖音标签列表失败: 未返回有效数据')
      ElMessage.error('获取抖音标签列表失败: 未返回有效数据')
    }
    return res // 返回业务数据
  } catch (error: any) { // 捕获由 request.ts 抛出的错误
    douyinTags.value = []
    douyinTagTotal.value = 0
    console.error('请求抖音标签列表失败:', error)
    // 错误消息通常已在 request.ts 中通过 ElMessage.error 显示，这里可选择性移除
    // ElMessage.error('请求抖音标签列表失败，请检查网络或后端服务。')
    throw error // 继续抛出以便组件层捕获
  } finally {
    douyinTagLoading.value = false
  }
}

/**
 * 新增标签
 * 官方接口 POST /api/douyin/tags/add
 */
export async function addTag(data: any) {
  try {
    const res = await service.post('/api/douyin/tags/add', data)
    // request.ts 成功时会直接返回后端响应的 data 字段内容
    // 所以这里的 res 就是 [{ id: 5 }] 这样的业务数据
    if (res) { // 只需判断 res 是否存在
      await fetchTagList() // 新增成功后刷新列表
      ElMessage.success('新增标签成功')
      return res // 返回业务数据
    } else {
      // 理论上 request.ts 成功返回空 data 很少见
      ElMessage.error('新增标签失败: 未返回有效数据')
      throw new Error('新增标签失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求新增标签失败:', error)
    // ElMessage.error('请求新增标签失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 编辑标签
 * 官方接口 POST /api/douyin/tags/update
 */
export async function updateTag(data: any) {
  try {
    const res = await service.post('/api/douyin/tags/update', data)
    // 成功时直接使用 res
    if (res) {
      await fetchTagList()
      ElMessage.success('编辑标签成功')
      return res
    } else {
      ElMessage.error('编辑标签失败: 未返回有效数据')
      throw new Error('编辑标签失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求编辑标签失败:', error)
    throw error
  }
}

/**
 * 删除单个标签
 * 官方接口 POST /api/douyin/tags/delete
 */
export async function deleteTag(id: number) {
  try {
    const res = await service.post('/api/douyin/tags/delete', { id })
    // 成功时直接使用 res
    if (res) {
      await fetchTagList()
      ElMessage.success('删除标签成功')
      return res
    } else {
      ElMessage.error('删除标签失败: 未返回有效数据')
      throw new Error('删除标签失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求删除标签失败:', error)
    throw error
  }
}

/**
 * 批量删除标签
 * 官方接口 POST /api/douyin/tags/batch-delete
 */
export async function batchDeleteTags(ids: number[]) {
  try {
    const res = await service.post('/api/douyin/tags/batch-delete', { ids })
    // 成功时直接使用 res
    if (res) {
      await fetchTagList()
      ElMessage.success('批量删除标签成功')
      return res
    } else {
      ElMessage.error('批量删除标签失败: 未返回有效数据')
      throw new Error('批量删除标签失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求批量删除标签失败:', error)
    throw error
  }
}

/**
 * 批量禁用标签
 * 官方接口 POST /api/douyin/tags/batch-disable
 */
export async function batchDisableTags(ids: number[], status: number = 0) {
  try {
    const res = await service.post('/api/douyin/tags/batch-disable', { ids, status })
    // 成功时直接使用 res
    if (res) {
      await fetchTagList()
      ElMessage.success('批量禁用标签成功')
      return res
    } else {
      ElMessage.error('批量禁用标签失败: 未返回有效数据')
      throw new Error('批量禁用标签失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求批量禁用标签失败:', error)
    throw error
  }
}

/**
 * 单个标签状态切换
 * 官方接口 POST /api/douyin/tags/toggle-status
 */
export async function toggleTagStatus(id: number) {
  try {
    const res = await service.post('/api/douyin/tags/toggle-status', { id })
    // 成功时直接使用 res
    if (res) {
      await fetchTagList()
      ElMessage.success('标签状态切换成功')
      return res
    } else {
      ElMessage.error('标签状态切换失败: 未返回有效数据')
      throw new Error('标签状态切换失败: 未返回有效数据')
    }
  } catch (error: any) {
    console.error('请求标签状态切换失败:', error)
    throw error
  }
}
