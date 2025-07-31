import request from '@/utils/request-new';

// 获取有声小说列表
export function fetchAudioNovelsAPI(params: any) {
  return request.get('/api/audio_novel/list', { params });
}

// 获取有声小说详情
export function fetchAudioNovelDetailAPI(id: number) {
  return request.get('/api/audio_novel/detail', { params: { id } });
}

// 新增有声小说
export function addAudioNovelAPI(data: any) {
  return request.post('/api/audio_novel/add', data);
}

// 更新有声小说
export function updateAudioNovelAPI(data: any) {
  return request.post('/api/audio_novel/update', data);
}

// 删除有声小说
export function deleteAudioNovelAPI(id: number) {
  return request.post('/api/audio_novel/delete', { id });
}

// 批量删除
export function batchDeleteAudioNovelsAPI(ids: number[]) {
  return request.post('/api/audio_novel/batchDelete', { ids });
}

// 批量设置连载状态
export function batchSetAudioNovelSerializationStatusAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel/batchSetSerializationStatus', { ids, status });
}

// 批量设置上架状态
export function batchSetAudioNovelShelfStatusAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel/batchSetShelfStatus', { ids, status });
}

// 批量设置可见性
export function batchSetAudioNovelVisibilityAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel/batchSetVisibility', { ids, status });
}

// 批量设置VIP免费
export function batchSetAudioNovelVipFreeAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel/batchSetVipFree', { ids, status });
}

// 批量设置每集金币
export function batchSetAudioNovelCoinPerChapterAPI(ids: number[], coin: number) {
  return request.post('/api/audio_novel/batchSetCoinPerChapter', { ids, coin });
}

// 批量设置演播人
export function batchSetAudioNovelNarratorAPI(ids: number[], narrator: string) {
  return request.post('/api/audio_novel/batchSetNarrator', { ids, narrator });
}