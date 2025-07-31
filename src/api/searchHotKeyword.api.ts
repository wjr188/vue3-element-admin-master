import simpleService from "@/utils/request-new";

// 类型定义（根据你的表结构）
export interface SearchHotKeyword {
  id: number;
  keyword: string;
  type: string;   // 'comic' | 'novel' | 'video' | 'audio' | 'all'
  status: number; // 0:禁用 1:启用
  sort: number;
}
// 获取列表（可带 type 参数，type: comic/novel/video/audio）
export function fetchSearchHotKeywords(params?: { type?: string }) {
  return simpleService.get("/api/search/hot_keyword/list", { params });
}

// 新增
export function addSearchHotKeyword(data: Omit<SearchHotKeyword, "id">) {
  return simpleService.post("/api/search/hot_keyword/add", data);
}

// 更新
export function updateSearchHotKeyword(data: SearchHotKeyword) {
  return simpleService.post("/api/search/hot_keyword/update", data);
}

// 删除
export function deleteSearchHotKeyword(id: number) {
  return simpleService.post("/api/search/hot_keyword/delete", { id });
}

// 批量排序
export function sortSearchHotKeywords(data: Array<{ id: number; sort: number }>) {
  return simpleService.post("/api/search/hot_keyword/sort", { list: data });
}
