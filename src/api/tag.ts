import request from '@/utils/request-new'

// 标签列表（分页+搜索）
export function fetchTagList(params: {
  name?: string
  page?: number
  pageSize?: number
}) {
  return request.get('/api/tag/list', { params })
}

// 新增标签
export function createTag(data: { name: string }) {
  return request.post('/api/tag/add', data)
}

// 编辑标签
export function updateTag(data: { id: number, name: string }) {
  return request.post('/api/tag/update', data)
}

// 删除标签
export function deleteTag(id: number) {
  return request.post('/api/tag/delete', { id })
}

// 批量删除
export function batchDeleteTag(ids: number[]) {
  return request.post('/api/tag/batchDelete', { ids })
}
