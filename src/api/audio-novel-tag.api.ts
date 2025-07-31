import request from '@/utils/request-new';

// 获取标签列表
export function fetchAudioNovelTagsAPI(params: any) {
  return request.get('/api/audio_novel_tag/list', { params });
}

// 新增标签
export function addAudioNovelTagAPI(data: any) {
  return request.post('/api/audio_novel_tag/add', data);
}

// 更新标签
export function updateAudioNovelTagAPI(data: any) {
  return request.post('/api/audio_novel_tag/update', data);
}

// 删除标签
export function deleteAudioNovelTagAPI(id: number) {
  return request.post('/api/audio_novel_tag/delete', { id });
}

// 批量删除标签
export function batchDeleteAudioNovelTagsAPI(ids: number[]) {
  return request.post('/api/audio_novel_tag/batchDelete', { ids });
}

// 批量设置标签状态
export function batchSetAudioNovelTagStatusAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel_tag/batchSetStatus', { ids, status });
}