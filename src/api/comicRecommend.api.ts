import { simpleService } from '@/utils/request-new'

// 推荐分组类型
export interface ComicRecommendGroup {
  id?: number
  name: string
  sort: number
  layout_type?: string
  icon?: string
  [key: string]: any
}

// 推荐分组排序
export interface GroupSort {
  id: number
  sort: number
}

// 推荐分组下漫画
export interface GroupComic {
  comic_id: number
  sort: number
}

// 获取分组参数
export function getComicRecommendGroups(params: Record<string, any>) {
  return simpleService.get('/comic/recommend/groups', { params })
}

export function addComicRecommendGroup(data: ComicRecommendGroup) {
  return simpleService.post('/comic/recommend/groups', data)
}

export function updateComicRecommendGroup(id: number, data: Partial<ComicRecommendGroup>) {
  return simpleService.put(`/comic/recommend/groups/${id}`, data)
}

export function deleteComicRecommendGroup(id: number) {
  return simpleService.delete(`/comic/recommend/groups/${id}`)
}

export function sortComicRecommendGroups(data: GroupSort[]) {
  return simpleService.post('/comic/recommend/groups/sort', data)
}

// 分组下漫画管理
export function getComicGroupComics(groupId: number) {
  return simpleService.get(`/comic/recommend/groups/${groupId}/comics`)
}

export function saveComicGroupComics(groupId: number, comics: GroupComic[]) {
  return simpleService.post(`/comic/recommend/groups/${groupId}/comics`, { comics })
}

// 分类
export function getComicParentCategories() {
  return simpleService.get('/comic/categories/parents')
}

export function getComicChildCategories() {
  return simpleService.get('/comic/categories/children')
}

// 漫画列表
export function getAllComics(params: Record<string, any>) {
  return simpleService.get('/comic/list', { params })
}
