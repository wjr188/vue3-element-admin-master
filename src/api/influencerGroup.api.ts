import request from '@/utils/request-new'

// 获取分组列表
export function getInfluencerGroups() {
  return request.get('/api/influencer/group/list')
}

// 获取博主列表，支持分组和关键字
export function getInfluencerList(params: {
  group_id?: number | string
  keyword?: string
  page?: number
  pageSize?: number
}) {
  return request.get('/api/influencer/list', { params })
}

// 新增分组
export function createInfluencerGroup(data: { name: string }) {
  return request.post('/api/influencer/group/add', data)
}

// 新增博主（选填分组）
export function createInfluencer(data: {
  nickname: string
  avatar?: string
  group_id?: number
  fans_count?: number
  desc?: string
}) {
  return request.post('/api/influencer/add', data)
}

// 更新分组
export function updateInfluencerGroup(id: number, data: { name: string }) {
  return request.post(`/api/influencer/group/update/${id}`, data)
}

// 删除分组
export function deleteInfluencerGroup(id: number) {
  return request.post(`/api/influencer/group/delete/${id}`)
}
