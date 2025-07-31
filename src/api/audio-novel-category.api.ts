import request from '@/utils/request-new';

// 获取分类列表
export function fetchAudioNovelCategoriesAPI() {
  return request.get('/api/audio_novel_category/list');
}

// 新增分类
export function addAudioNovelCategoryAPI(data: any) {
  return request.post('/api/audio_novel_category/add', data);
}

// 更新分类
export function updateAudioNovelCategoryAPI(data: any) {
  return request.post('/api/audio_novel_category/update', data);
}

// 删除分类
export function deleteAudioNovelCategoryAPI(id: number) {
  return request.post('/api/audio_novel_category/delete', { id });
}

// 批量删除
export function batchDeleteAudioNovelCategoriesAPI(ids: number[]) {
  return request.post('/api/audio_novel_category/batchDelete', { ids });
}

// 批量设置状态
export function batchSetAudioNovelCategoryStatusAPI(ids: number[], status: number) {
  return request.post('/api/audio_novel_category/batchSetStatus', { ids, status });
}