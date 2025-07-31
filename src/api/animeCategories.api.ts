import { simpleService } from '@/utils/request-new'
import type { AnimeCategory } from '@/types/animeCategory'

// 获取分类列表
export function getAnimeCategories() {
  return simpleService.get('/api/anime/categories/list')
}

// 新增主分类
export function addAnimeParentCategory(name: string) {
  return simpleService.post('/api/anime/categories/add-parent', { name })
}

// 新增子分类
export function addAnimeChildCategory(data: Omit<AnimeCategory, 'id' | 'videoCount'>) {
  return simpleService.post('/api/anime/categories/add-child', data)
}

// 更新分类
export function updateAnimeCategory(data: Partial<AnimeCategory> & { id: number }) {
  return simpleService.post('/api/anime/categories/update', data)
}

// 删除分类
export function deleteAnimeCategory(id: number) {
  return simpleService.post('/api/anime/categories/delete', { id })
}

// 批量删除
export function batchDeleteAnimeCategories(ids: number[]) {
  return simpleService.post('/api/anime/categories/batch-delete', { ids })
}

// 批量更新排序
export function batchUpdateAnimeCategorySort(list: Array<{ id: number; sort: number }>) {
  return simpleService.post('/api/anime/categories/batch-update-sort', { list })
}