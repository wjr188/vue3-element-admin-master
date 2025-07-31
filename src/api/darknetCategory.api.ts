import { simpleService } from '@/utils/request-new'
import type { DarknetCategory } from '@/types/darknetCategory'

/**
 * 获取分类列表
 */
export function getDarknetCategories() {
  return simpleService.get<{ code: number; data: { parents: DarknetCategory[]; children: DarknetCategory[] } }>(
    '/api/darknet/categories/list'
  )
}

/**
 * 新增主分类
 * data 需扁平，如 { name: 'xxx', sort: 1, status: 1, tags: ['a','b'] }
 */
export function addDarknetCategory(data: { name: string; sort?: number; status?: number; tags?: string[] }) {
  // 后端自动补默认值，可选项不传也OK
  return simpleService.post('/api/darknet/categories/add-parent', data)
}

/**
 * 新增子分类
 * data 需扁平，如 { name: 'xxx', parent_id: 1, sort: 1, status: 1, tags: ['a','b'] }
 */
export function addDarknetChildCategory(data: {
  name: string
  parent_id: number
  sort?: number
  status?: number
  tags?: string[]
}) {
  return simpleService.post('/api/darknet/categories/add-child', data)
}

/**
 * 编辑分类（主/子分类通用）
 * data: { id: 1, name: 'xxx', sort?: 1, status?: 1, tags?: string[] }
 */
export function updateDarknetCategory(data: Partial<DarknetCategory> & { id: number }) {
  return simpleService.post('/api/darknet/categories/update', data)
}

/**
 * 删除分类
 */
export function deleteDarknetCategory(id: number) {
  return simpleService.post('/api/darknet/categories/delete', { id })
}

/**
 * 批量删除分类
 */
export function batchDeleteDarknetCategories(ids: number[]) {
  return simpleService.post('/api/darknet/categories/batch-delete', { ids })
}

/**
 * 批量更新排序
 * list: [{ id: 1, sort: 99 }, ...]
 */
export function batchUpdateDarknetCategorySort(list: { id: number; sort: number }[]) {
  return simpleService.post('/api/darknet/categories/batch-update-sort', { list })
}

/**
 * 更新子分类标签
 */
export function updateDarknetCategoryTags(id: number, tags: string[]) {
  return simpleService.post('/api/darknet/categories/update-child-tags', { id, tags })
}

/**
 * 单个保存排序
 */
export function updateDarknetCategorySort(id: number, sort: number) {
  return simpleService.post('/api/darknet/categories/update-child-sort', { id, sort })
}
