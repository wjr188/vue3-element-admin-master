// E:\vue3\vue3-element-admin-master\src\api\vipCardService.ts

import service from '@/utils/request';

export interface VipCard {
  id?: number;
  tag: string;
  name: string;
  oldPrice: number;
  price: number;
  duration: number; // 天数，-1 表示永久
  desc: string;
  status?: 'ENABLED' | 'DISABLED';
}

export interface VipCardListParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
}

const base = '/api/admin/member-card';

export const vipCardService = {
  /**
   * 获取 VIP 卡片列表（分页）
   */
  getVipCards(params: VipCardListParams): Promise<PaginationResult<VipCard>> {
    // 注意：去掉末尾斜杠，确保命中 Route::get('', …)
    return service.get<PaginationResult<VipCard>>(`${base}`, { params });
  },

  /**
   * 新增 VIP 卡片
   */
  addVipCard(data: Omit<VipCard, 'id' | 'status'>): Promise<VipCard> {
    return service.post<VipCard>(`${base}`, data);
  },

  /**
   * 编辑 VIP 卡片
   */
  updateVipCard(id: number, data: Omit<VipCard, 'id' | 'status'>): Promise<VipCard> {
    return service.put<VipCard>(`${base}/${id}`, data);
  },

  /**
   * 切换 VIP 卡片状态（启用/禁用）
   */
  toggleVipCardStatus(id: number, status: 'ENABLED' | 'DISABLED'): Promise<any> {
    return service.patch<any>(`${base}/${id}/status`, { status });
  },

  /**
   * 删除 VIP 卡片
   */
  deleteVipCard(id: number): Promise<any> {
    return service.delete<any>(`${base}/${id}`);
  },

  /**
   * 拉取所有 VIP 卡片类型（下拉用，无分页）
   */
  getAllVipCards(): Promise<any> {
    return service.get<PaginationResult<VipCard>>(`${base}/all`);
  }
};
