import { simpleService as request } from '@/utils/request-new'

// 推荐分组
export function getAnimeRecommendGroups(params) {
  return request.get('/api/anime/recommend/group/list', { params })
}
export function addAnimeRecommendGroup(data) {
  return request.post('/api/anime/recommend/group/add', data)
}
export function updateAnimeRecommendGroup(data) {
  return request.post('/api/anime/recommend/group/update', data)
}
export function deleteAnimeRecommendGroup(data) {
  return request.post('/api/anime/recommend/group/delete', data)
}
export function saveAnimeGroupSort(data) {
  return request.post('/api/anime/recommend/group/sort', data)
}

// 推荐分组下的视频
export function getAnimeRecommendVideos(params) {
  return request.get('/api/anime/recommend/video/list', { params })
}
export function saveAnimeRecommendVideos(data) {
  return request.post('/api/anime/recommend/video/save', data)
}

// 分页获取动漫视频
export function getAnimeVideos(params) {
  return request.get('/api/anime/video/list', { params })
}

// 分类与标签
export function getAnimeCategories(params) {
  return request.get('/api/anime/category/list', { params })
}
export function getAnimeTags(params) {
  return request.get('/api/anime/tag/list', { params })
}
