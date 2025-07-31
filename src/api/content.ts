import request from '@/utils/request-new'

// -------- 专辑 Album --------

// 查询专辑列表
export function fetchAlbumList(params) {
  return request.get('/api/content/album/list', { params })
}

// 新增专辑
export function createAlbum(data) {
  return request.post('/api/content/album/add', data)
}

// 编辑专辑
export function updateAlbum(data) {
  return request.post('/api/content/album/update', data)
}

// 删除专辑
export function deleteAlbum(data) {
  return request.post('/api/content/album/delete', data)
}

// 批量删除专辑
export function batchDeleteAlbum(data) {
  return request.post('/api/content/album/batchDelete', data)
}

// -------- 视频/图片 Video --------

// 查询内容列表
export function fetchVideoList(params) {
  return request.get('/api/content/video/list', { params })
}

// 新增内容
export function createVideo(data) {
  return request.post('/api/content/video/add', data)
}

// 编辑内容
export function updateVideo(data) {
  return request.post('/api/content/video/update', data)
}

// 删除内容
export function deleteVideo(data) {
  return request.post('/api/content/video/delete', data)
}

// 批量删除内容
export function batchDeleteVideo(data) {
  return request.post('/api/content/video/batchDelete', data)
}

// 批量设置VIP
export function batchSetVideoVIP(data) {
  return request.post('/api/content/video/batchSetVIP', data)
}

// 批量设置金币
export function batchSetVideoCoin(data) {
  return request.post('/api/content/video/batchSetCoin', data)
}

// 专辑批量设置VIP
export function batchSetAlbumVIP(data) {
  return request.post('/api/content/album/batchSetVIP', data)
}

// 专辑批量设置金币
export function batchSetAlbumCoin(data) {
  return request.post('/api/content/album/batchSetCoin', data)
}

// -------- 选项辅助 --------

// 获取所有博主
export function fetchInfluencerOptions() {
  return request.get('/api/content/option/influencer')
}

// 获取所有专辑
export function fetchAlbumOptions() {
  return request.get('/api/content/option/album')
}

// 获取所有标签
export function fetchTagOptions() {
  return request.get('/api/content/option/tag')
}
