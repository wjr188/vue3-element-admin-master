import { simpleService } from '@/utils/request-new'
import type { AnimeTag } from '@/types/animeTag'

// 获取标签列表
export function getAnimeTags(params: object = {}) {
  return simpleService.get('/api/anime/tags/list', { params })
}

// 新增标签
export function addAnimeTag(data: Omit<AnimeTag, 'id' | 'count' | 'create_time' | 'update_time'>) {
  return simpleService.post('/api/anime/tags/add', data)
}

// 编辑标签
export function updateAnimeTag(data: AnimeTag) {
  return simpleService.post('/api/anime/tags/update', data)
}

// 删除标签
export function deleteAnimeTag(id: number) {
  return simpleService.post('/api/anime/tags/delete', { id })
}

// 批量删除
export function batchDeleteAnimeTags(ids: number[]) {
  return simpleService.post('/api/anime/tags/batch-delete', { ids })
}

// 批量禁用
export function batchDisableAnimeTags(ids: number[]) {
  return simpleService.post('/api/anime/tags/batch-disable', { ids })
}

// 切换状态
export function toggleAnimeTagStatus(id: number) {
  return simpleService.post('/api/anime/tags/toggle-status', { id })
}

// 批量更新排序
export function batchUpdateAnimeTagSort(list: Array<{ id: number; sort: number }>) {
  return simpleService.post('/api/anime/tags/batch-update-sort', { list })
}