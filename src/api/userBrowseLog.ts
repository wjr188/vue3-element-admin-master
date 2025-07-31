import request from '@/utils/request-new';

export function getBrowseLogs(params: any) {
  return request.get('/api/user/browse/logs', { params });
}

export function getContentTypeList() {
  return request.get('/api/content/type-list');
}

export function getCategoryList(type: string) {
  return request.get('/api/content/category-list', { params: { type } });
}
