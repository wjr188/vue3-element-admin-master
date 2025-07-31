import request from '@/utils/request-new';

// 获取章节列表
export function fetchAudioNovelChaptersAPI(params: any) {
  return request.get('/api/audio_novel_chapter/list', { params });
}

// 获取章节详情
export function fetchAudioNovelChapterDetailAPI(id: number) {
  return request.get(`/api/audio_novel_chapter/${id}`);
}

// 新增章节
export function addAudioNovelChapterAPI(data: any) {
  return request.post('/api/audio_novel_chapter/add', data);
}

// 更新章节
export function updateAudioNovelChapterAPI(data: any) {
  return request.post('/api/audio_novel_chapter/update', data);
}

// 删除章节
export function deleteAudioNovelChapterAPI(id: number) {
  return request.post('/api/audio_novel_chapter/delete', { id });
}

// 批量删除章节
export function batchDeleteAudioNovelChaptersAPI(ids: number[]) {
  return request.post('/api/audio_novel_chapter/batchDelete', { ids });
}

// 批量更新章节排序
export function batchUpdateAudioNovelChapterOrderAPI(list: Array<{ id: number, chapter_order: number }>) {
  return request.post('/api/audio_novel_chapter/batchUpdateOrder', { list });
}

// 批量设为免费章节
export function setAudioNovelChaptersFreeAPI(ids: number[]) {
  return request.post('/api/audio_novel_chapter/setFree', { ids });
}
