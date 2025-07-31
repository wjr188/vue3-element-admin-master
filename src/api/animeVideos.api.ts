import { simpleService } from '@/utils/request-new'
import type { AnimeVideo } from '@/types/animeVideo'

// 获取动漫视频列表
export function getAnimeVideoList(params: Record<string, any> = {}) {
  return simpleService.get<{ code: number; data: { list: AnimeVideo[]; total: number } }>('/api/anime/videos/list', { params })
}

// 新增动漫视频
export function addAnimeVideo(data: Partial<AnimeVideo>) {
  return simpleService.post('/api/anime/videos/add', data)
}

// 编辑动漫视频
export function updateAnimeVideo(data: Partial<AnimeVideo>) {
  return simpleService.post('/api/anime/videos/update', data)
}

// 删除动漫视频
export function deleteAnimeVideo(id: number) {
  return simpleService.post('/api/anime/videos/delete', { id })
}

// 批量删除
export function batchDeleteAnimeVideos(ids: number[]) {
  return simpleService.post('/api/anime/videos/batch-delete', { ids })
}

// 批量设置VIP
export function batchSetAnimeVip(ids: number[], isVip: boolean = true) {
  return simpleService.post('/api/anime/videos/batch-set-vip', { ids, is_vip: isVip ? 1 : 0 })
}

// 批量设置试看时长
export function batchSetAnimePreview(ids: number[], preview: string) {
  return simpleService.post('/api/anime/videos/batch-set-preview', { ids, preview })
}

// 批量设置金币
export function batchSetAnimeGold(ids: number[], goldValue: number) {
  return simpleService.post('/api/anime/videos/batch-set-gold', { ids, gold: goldValue })
}

// 获取单个动漫视频详情
export function getAnimeVideoDetail(id: number) {
  return simpleService.get<{ code: number; data: AnimeVideo }>('/api/anime/videos/' + id)
}

// 批量设置播放数
export function batchSetAnimePlay(ids: number[], playCount: number) {
  return simpleService.post('/api/anime/videos/batch-set-play', { ids, play_count: playCount })
}

// 批量设置收藏数
export function batchSetAnimeCollect(ids: number[], collectCount: number) {
  return simpleService.post('/api/anime/videos/batch-set-collect', { ids, collect_count: collectCount })
}

// 批量升序置顶
export function batchSortAnimeAsc(ids: number[]) {
  return simpleService.post('/api/anime/videos/batch-sort-asc', { ids })
}