// src/api/user.ts
import service from '@/utils/request'
import type { ApiResponse, ApiListResponse } from '@/utils/request' // 类型声明

// 定义会员卡类型接口，包含 duration 和 durationUnit
interface CardType {
  id: number;
  name: string;
  desc?: string;
  duration?: number;
  duration_unit?: 'DAY' | 'MONTH' | 'YEAR'; // 匹配后端可能的字段名
  status?: number; // 添加 status 字段，如果后端返回的话
}

// 1. 老的会员列表接口（只查users表，已不推荐）
export function fetchUserList(params: {
  page: number
  pageSize: number
  keyword?: string
  vip_card_id?: number // 只认 vip_card_id
  vip_status?: string
  dateStart?: string // 添加日期筛选参数
  dateEnd?: string // 添加日期筛选参数
  goldCoinStatus?: string; // 添加金币筛选状态
}) {
  return service.get<ApiListResponse<any>>('/api/admin/user/list', { params })
}

// 2. 新的——跨表会员列表（users+vip_users联合）
export function fetchUnifiedUserList(params: {
  page: number
  pageSize: number
  keyword?: string
  vip_card_id?: number // 只认 vip_card_id
  vip_status?: string
  dateStart?: string
  dateEnd?: string
}) {
  return service.get<ApiListResponse<any>>('/api/admin/users/unified', { params })
}

// 3. 统计卡片
export function fetchUserStats() {
  return service.get<ApiResponse<any>>('/api/admin/user/stats')
}

// 4. 新增会员
export function addUser(data: any) {
  return service.post<ApiResponse<any>>('/api/admin/user/add', data)
}

// 5. 编辑会员
// 修改data里唯一标识字段改为id
export function updateUser(data: { id: number; [key: string]: any }) {
  return service.post<ApiResponse<any>>('/api/admin/user/update', data)
}

// 6. 删除会员
// data需要传 id 字段
export function deleteUser(data: { id: number }) {
  return service.post<ApiResponse<any>>('/api/admin/user/delete', data)
}

// 7. 获取会员详情
// 参数改成 id 字段
export function fetchUserDetail(params: { id: number }) {
  return service.get<ApiResponse<any>>('/api/admin/user/detail', { params })
}

// 8. 批量操作
// 参数改为 ids
export function batchUpdateUser(data: { ids: number[] } & any) {
  return service.post<ApiResponse<any>>('/api/admin/user/batch-update', data)
}

// 9. 金币统计
export function fetchCoinStats() {
  return service.get<ApiResponse<any>>('/api/admin/user/coin-stats')
}

// 10. 订单统计
export function fetchOrderStats() {
  return service.get<ApiResponse<any>>('/api/admin/user/order-stats')
}

// 11. 会员卡列表 - 修改返回类型，以包含 duration 和 duration_unit
export function fetchCardList(): Promise<ApiResponse<CardType[]>> {
  return service.get<ApiResponse<CardType[]>>('/api/admin/member-card/all')
}
/**
 * 获取用户的观看次数（长视频/抖音）
 * @param uuid string
 */
export function fetchUserWatchCount(uuid: string) {
  return service.get<ApiResponse<{
    long_video_used: number;
    long_video_max: number;
    dy_video_used: number;
    dy_video_max: number;
  }>>('/api/admin/user/watch-count', { params: { uuid } });
}
// 12. 积分统计
export function fetchPointsStats() {
  return service.get<ApiResponse<{ points_sum: number }>>('/api/admin/user/points-stats')
}
