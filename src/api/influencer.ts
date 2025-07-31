import request from '@/utils/request-new';
import qs from 'qs';

// 查询博主列表（分页 + 筛选）
export function fetchInfluencerList(params) {
  return request.get('/api/influencer/list', { params });
}

// 新增博主
export function createInfluencer(data) {
  return request.post('/api/influencer/add', data);
}

// 编辑博主
export function updateInfluencer(data) {
  return request.post('/api/influencer/update', qs.stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

// 删除博主
export function deleteInfluencer(data) {
  return request.post('/api/influencer/delete', qs.stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

// 批量删除
export function batchDeleteInfluencers(data) {
  return request.post('/api/influencer/batchDelete', qs.stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

// 查询所有国家
export function fetchCountryOptions() {
  return request.get('/api/influencer/countryOptions');
}

// 查询所有标签
export function fetchTagOptions() {
  return request.get('/api/influencer/tagOptions');
}

// 查询所有分组
export function fetchGroupOptions() {
  return request.get('/api/influencer/group/list');
}
