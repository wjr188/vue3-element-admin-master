import request from '@/utils/request-new';

// 推荐分组管理
export function fetchAudioRecommendGroupsAPI(params: any) {
  return request.get('/api/audio/recommend/groups', { params });
}
export function addAudioRecommendGroupAPI(data: any) {
  return request.post('/api/audio/recommend/groups', data);
}
export function updateAudioRecommendGroupAPI(id: number, data: any) {
  return request.put(`/api/audio/recommend/groups/${id}`, data);
}
export function deleteAudioRecommendGroupAPI(id: number) {
  return request.delete(`/api/audio/recommend/groups/${id}`);
}
export function saveAudioRecommendGroupSortAPI(sortedData: any[]) {
  return request.post('/api/audio/recommend/groups/sort', sortedData);
}

// 分组有声小说管理
export function fetchAudioNovelsForGroupAPI(groupId: number) {
  return request.get(`/api/audio/recommend/groups/${groupId}/novels`);
}
export function saveAudioNovelsForGroupAPI(groupId: number, audioNovels: any[]) {
  return request.post(`/api/audio/recommend/groups/${groupId}/novels`, {
    audio_novels: audioNovels.map(v => ({
      audio_novel_id: Number(v.audio_novel_id),
      sort: Number(v.sort)
    }))
  });
}

// 分类管理
export function fetchAllAudioCategoriesAPI() {
  return request.get('/api/audio_novel_category/list');
}

// 通用有声小说列表
export function fetchAllAudioNovelsAPI(params: any = {}) {
  return request.get('/api/audio_novel/list', { params });
}