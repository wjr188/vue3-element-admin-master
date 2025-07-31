import { simpleService } from '@/utils/request-new'
// 你如果有类型定义可以加，没有可以不加
// import type { DarknetVideo, DarknetCategory, DarknetGroup } from '@/types/darknet' 

// 获取推荐分组列表
export function getDarknetRecommendGroups(params?: any) {
  return simpleService.get('/darknet/recommend/groups', { params })
}

// 新增分组
export function addDarknetRecommendGroup(data: any) {
  return simpleService.post('/darknet/recommend/groups', data)
}

// 更新分组
export function updateDarknetRecommendGroup(id: number, data: any) {
  return simpleService.put(`/darknet/recommend/groups/${id}`, data)
}

// 删除分组
export function deleteDarknetRecommendGroup(id: number) {
  return simpleService.delete(`/darknet/recommend/groups/${id}`)
}

// 分组排序
export function sortDarknetRecommendGroups(data: any) {
  return simpleService.post('/darknet/recommend/groups/sort', data)
}

// 获取分组下视频
export function getDarknetGroupVideos(groupId: number) {
  return simpleService.get(`/darknet/recommend/groups/${groupId}/videos`)
}

// 保存分组下视频
export function saveDarknetGroupVideos(groupId: number, videos: any[]) {
  return simpleService.post(`/darknet/recommend/groups/${groupId}/videos`, { videos })
}

// 获取所有主分类
export function getDarknetParentCategories() {
  return simpleService.get('/darknet/categories/parents')
}

// 获取所有子分类
export function getDarknetChildCategories() {
  return simpleService.get('/darknet/categories/children')
}

// 获取所有长视频
export function getAllDarknetVideos(params?: any) {
  return simpleService.get('/darknet/long/videos', { params })
}
