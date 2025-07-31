import simpleService from "@/utils/request-new";

export interface PointsExchangeItem {
  id: number;
  name: string;
  icon: string;
  cost: number;
  sort: number;
  status: number;
  create_time: string;
}

export interface PointsExchangeRecord {
  id: number;
  uuid: string;
  exchange_id: number;
  exchange_name: string;
  cost: number;
  status: number;
  remark: string;
  create_time: string;
}

export interface PointsLogItem {
  id: number;
  uuid: string;
  type: string;
  points: number;
  remark: string;
  create_time: string;
}

// ======================== 积分兑换管理 ========================

// 获取兑换商品列表
export function getExchangeList() {
  return simpleService.get<PointsExchangeItem[]>("/api/admin/points-exchange/list")
    .then(res => res.data);
}

// 新增兑换商品
export function createExchangeItem(data: Partial<PointsExchangeItem>) {
  return simpleService.post("/api/admin/points-exchange/add", data)
    .then(res => res.data);
}

// 更新兑换商品
export function updateExchangeItem(id: number, data: Partial<PointsExchangeItem>) {
  return simpleService.put(`/api/admin/points-exchange/update/${id}`, data)
    .then(res => res.data);
}

// 删除兑换商品
export function deleteExchangeItem(id: number) {
  return simpleService.delete(`/api/admin/points-exchange/delete/${id}`)
    .then(res => res.data);
}

// 切换启用状态
export function toggleExchangeStatus(id: number) {
  return simpleService.patch(`/api/admin/points-exchange/toggle-status/${id}`)
    .then(res => res.data);
}

// 获取兑换记录（分页/筛选）
export function getExchangeRecords(params: {
  page?: number;
  pageSize?: number;
  uuid?: string;
  exchange_id?: number;
  type?: string;
} = {}) {
  return simpleService.get<{ list: PointsExchangeRecord[]; total: number; }>(
    "/api/admin/points-exchange/records",
    { params }
  ).then(res => res.data);
}

// ======================== 积分流水管理 ========================

// 获取积分流水列表（分页/筛选）
export function getPointsLogs(params: {
  page?: number;
  pageSize?: number;
  uuid?: string;
  type?: string;
} = {}) {
  return simpleService.get<{ list: PointsLogItem[]; total: number }>(
    "/api/admin/points-log/list",
    { params }
  ).then(res => res.data);
}

// 删除积分流水
export function deletePointsLog(id: number) {
  return simpleService.delete(`/api/admin/points-log/delete/${id}`)
    .then(res => res.data);
}
