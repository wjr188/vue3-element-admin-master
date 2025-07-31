// 文件路径: src/store/modules/long-tag.store.ts

import { ref } from 'vue'
import service from '@/utils/request' // 确保这里导入的是你的 axios 封装实例
import { ElMessage } from 'element-plus'

export interface Tag {
  id: number
  name: string
  status: number
  sort?: number
  count?: number
  create_time?: string
  update_time?: string
  alias?: string // 前端模型可以保留，但在发送给后端时要移除
  group?: string // 前端模型可以保留，但在发送给后端时要移除
  desc?: string // 前端模型可以保留，但在发送给后端时要移除
}

export const tags = ref<Tag[]>([])
export const tagTotal = ref(0)
export const tagLoading = ref(false)

/**
 * 获取标签列表
 * 官方接口 GET /api/longtags/list
 */
export async function fetchTagList(params: any = {}) {
  tagLoading.value = true
  try {
    const res = await service.get('/api/longtags/list', { params })
    // 因为 request.ts 成功时只返回了 response.data.data，
    // 所以这里的 `res` 就是后端返回的 `data` 业务数据，例如 { list: [...], total: ... }
    console.log('fetchTagList: 从 request.ts 返回的业务数据:', res); // 调试日志

    // 根据 request.ts 的行为，如果能走到这里，说明请求是成功的
    // `res` 已经是后端返回的 `{ list: [], total: 0 }` 这样的结构
    if (res && Array.isArray(res.list) && typeof res.total === 'number') {
      tags.value = res.list || []
      tagTotal.value = res.total || 0
      ElMessage.success('标签列表获取成功'); // 添加成功提示
    } else {
      tags.value = []
      tagTotal.value = 0
      // 这里的 ElMessage 提示通常由 request.ts 的拦截器统一处理，但可以保留作为备用
      // ElMessage.error('获取标签列表失败: ' + (res.msg || '未知错误'))
      console.error('fetchTagList: 后端返回列表数据结构异常或空:', res); // 调试日志
    }
    return res // 返回完整的响应业务数据
  } catch (error: any) {
    tags.value = []
    tagTotal.value = 0
    // 错误消息通常由 request.ts 的错误拦截器统一处理和 ElMessage 提示了。
    // 这里主要是记录错误，不重复弹窗。
    // ElMessage.error('请求标签列表失败，请检查网络或后端服务。')
    console.error('fetchTagList: 请求标签列表发生异常:', error); // 调试日志
    throw error // 重新抛出错误，以便上层调用者也能处理
  } finally {
    tagLoading.value = false
  }
}

/**
 * 新增标签
 * 官方接口 POST /api/longtags/add
 */
export async function addTag(data: Tag) {
  try {
    // 复制一份数据，避免直接修改原始 data
    let requestData: any = { ...data };

    // **关键修改：移除后端标签表不需要的字段**
    if (requestData.hasOwnProperty('alias')) { delete requestData.alias; }
    if (requestData.hasOwnProperty('group')) { delete requestData.group; } // 如果后端 tags 表也没有 group 字段，也需要移除
    if (requestData.hasOwnProperty('desc')) { delete requestData.desc; }   // 如果后端 tags 表也没有 desc 字段，也需要移除
    if (requestData.hasOwnProperty('count')) { delete requestData.count; }
    if (requestData.hasOwnProperty('create_time')) { delete requestData.create_time; }
    if (requestData.hasOwnProperty('update_time')) { delete requestData.update_time; }
    if (requestData.hasOwnProperty('id')) { delete requestData.id; } // 新增时不需要ID

    const res = await service.post('/api/longtags/add', requestData) // 发送处理后的数据

    // 因为 request.ts 成功时只返回了业务数据 (例如 { id: 5 })，
    // 如果能走到这里，说明操作是成功的。
    if (res && res.id) { // 判断是否有返回的ID，作为成功标志
      ElMessage.success('新增标签成功')
      await fetchTagList() // 成功后刷新列表
    } else {
      // 这里的 ElMessage 提示通常由 request.ts 的拦截器统一处理，但可以保留作为备用
      // ElMessage.error(res?.msg || '新增标签失败')
      console.error('addTag: 后端返回新增数据异常:', res); // 调试日志
    }
    return res // 返回业务数据
  } catch (error: any) {
    // ElMessage 已经在 request.ts 的响应拦截器中处理，这里可以省略
    // ElMessage.error('请求新增标签失败，请检查网络或后端服务。')
    console.error('addTag: 请求新增标签发生异常:', error); // 调试日志
    throw error
  }
}

/**
 * 编辑标签
 * 官方接口 POST /api/longtags/update
 */
export async function updateTag(data: Tag) {
  try {
    let requestData: any = { ...data };

    // **关键修改：移除后端标签表不需要的字段**
    if (requestData.hasOwnProperty('alias')) { delete requestData.alias; }
    if (requestData.hasOwnProperty('group')) { delete requestData.group; }
    if (requestData.hasOwnProperty('desc')) { delete requestData.desc; }
    if (requestData.hasOwnProperty('count')) { delete requestData.count; } // 计数类字段不应由前端发送
    if (requestData.hasOwnProperty('create_time')) { delete requestData.create_time; } // 创建时间不应由前端发送

    // 更新时需要ID
    const res = await service.post('/api/longtags/update', requestData)

    // 因为 request.ts 成功时只返回了业务数据，如果能走到这里，说明操作是成功的。
    // 返回值通常是一个空对象或 { affectedRows: 1 }，这里简单判断 res 存在即可。
    if (res) {
      ElMessage.success('编辑标签成功')
      await fetchTagList()
    } else {
      // ElMessage.error(res?.msg || '编辑标签失败')
      console.error('updateTag: 后端返回编辑数据异常:', res); // 调试日志
    }
    return res // 返回业务数据
  } catch (error: any) {
    // ElMessage.error('请求编辑标签失败，请检查网络或后端服务。')
    console.error('updateTag: 请求编辑标签发生异常:', error); // 调试日志
    throw error
  }
}

/**
 * 删除标签
 * 官方接口 POST /api/longtags/delete
 */
export async function deleteTag(id: number) {
  try {
    const res = await service.post('/api/longtags/delete', { id })
    if (res) { // 成功返回
      ElMessage.success('删除标签成功')
      await fetchTagList()
    } else {
      console.error('deleteTag: 后端返回删除数据异常:', res);
    }
    return res // 返回业务数据
  } catch (error: any) {
    console.error('deleteTag: 请求删除标签失败，请检查网络或后端服务。', error);
    throw error
  }
}

/**
 * 批量删除标签
 * 官方接口 POST /api/longtags/batch-delete
 */
export async function batchDeleteTags(ids: number[]) {
  try {
    const res = await service.post('/api/longtags/batch-delete', { ids })
    if (res) { // 成功返回
      ElMessage.success('批量删除成功')
      await fetchTagList()
    } else {
      console.error('batchDeleteTags: 后端返回批量删除数据异常:', res);
    }
    return res // 返回业务数据
  } catch (error: any) {
    console.error('batchDeleteTags: 请求批量删除标签失败，请检查网络或后端服务。', error);
    throw error
  }
}

/**
 * 批量禁用标签
 * 官方接口 POST /api/longtags/batch-disable
 */
export async function batchDisableTags(ids: number[], status: number = 0) {
  try {
    const res = await service.post('/api/longtags/batch-disable', { ids, status })
    if (res) { // 成功返回
      ElMessage.success('批量禁用成功')
      await fetchTagList()
    } else {
      console.error('batchDisableTags: 后端返回批量禁用数据异常:', res);
    }
    return res // 返回业务数据
  } catch (error: any) {
    console.error('batchDisableTags: 请求批量禁用标签失败，请检查网络或后端服务。', error);
    throw error
  }
}

/**
 * 启用/禁用标签（单个切换）
 * 官方接口 POST /api/longtags/toggle-status
 */
export async function toggleTagStatus(id: number, status?: number) {
  try {
    const res = await service.post('/api/longtags/toggle-status', { id, status })
    if (res) { // 成功返回
      ElMessage.success('状态切换成功')
      await fetchTagList()
    } else {
      console.error('toggleTagStatus: 后端返回状态切换数据异常:', res);
    }
    return res // 返回业务数据
  } catch (error: any) {
    console.error('toggleTagStatus: 请求状态切换失败，请检查网络或后端服务。', error);
    throw error
  }
}

/**
 * 获取单个标签详情（如果页面需要）
 * 官方接口 GET /api/longtags/info
 */
export async function fetchTagInfo(id: number) {
  try {
    const res = await service.get('/api/longtags/info', { params: { id } })
    if (res) { // 成功返回，res 就是标签详情数据
      return res // 返回业务数据
    } else {
      console.error('fetchTagInfo: 后端返回标签详情异常或空:', res);
      return null
    }
  } catch (error: any) {
    console.error('fetchTagInfo: 请求标签详情失败，请检查网络或后端服务。', error);
    throw error
  }
}
