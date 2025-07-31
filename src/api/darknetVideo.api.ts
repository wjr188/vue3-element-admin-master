import { simpleService } from '@/utils/request-new'
import type { DarknetVideo } from '@/types/darknetVideo'

// 获取列表
export function getDarknetVideoList(params: Record<string, any> = {}) {
  return simpleService.get<{ code: number; data: { list: DarknetVideo[]; total: number } }>('/api/darknet/videos/list', { params })
}

// 新增
export function addDarknetVideo(data: Partial<DarknetVideo>) {
  return simpleService.post('/api/darknet/videos/add', data)
}

// 编辑
export function updateDarknetVideo(data: Partial<DarknetVideo>) {
  return simpleService.post('/api/darknet/videos/update', data)
}

// 删除
export function deleteDarknetVideo(id: number) {
  return simpleService.post('/api/darknet/videos/delete', { id })
}

// 批量删除
export function batchDeleteDarknetVideos(ids: number[]) {
  return simpleService.post('/api/darknet/videos/batch-delete', { ids })
}

// 批量设置VIP
export function batchSetDarknetVip(ids: number[], isVip: boolean = true) {
  return simpleService.post('/api/darknet/videos/batch-set-vip', { ids, is_vip: isVip ? 1 : 0 })
}

// 批量设置试看时长
export function batchSetDarknetPreview(ids: number[], preview: string) {
  return simpleService.post('/api/darknet/videos/batch-set-preview', { ids, preview })
}

// 批量设置金币
export function batchSetDarknetGold(ids: number[], goldValue: number) {
  return simpleService.post('/api/darknet/videos/batch-set-gold', { ids, gold: goldValue })
}

// 获取详情
export function getDarknetVideoDetail(id: number) {
  return simpleService.get<{ code: number; data: DarknetVideo }>('/api/darknet/videos/' + id)
}

// 批量设置播放数
export function batchSetDarknetPlay(ids: number[], playCount: number) {
  return simpleService.post('/api/darknet/videos/batch-set-play', { ids, play_count: playCount })
}

// 批量设置收藏数
export function batchSetDarknetCollect(ids: number[], collectCount: number) {
  return simpleService.post('/api/darknet/videos/batch-set-collect', { ids, collect_count: collectCount })
}

// 批量升序置顶
export function batchSortDarknetAsc(ids: number[]) {
  return simpleService.post('/api/darknet/videos/batch-sort-asc', { ids })
}