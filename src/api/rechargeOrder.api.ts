// src/api/rechargeOrder.api.ts
import simpleService from '@/utils/request-new';

// 定义请求参数类型
export interface RechargeListParams {
  start_time?: string;
  end_time?: string;
  domain?: string | string[];
  channel?: string | string[];
  type?: '首充' | '复充' | '全部' | '';
  status?: '未支付' | '已支付' | '已确认' | '已删除' | '';
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 定义后端返回的单个充值订单数据结构
export interface RechargeOrderItem {
  order_no: string;
  user_uuid: string;
  username: string;
  amount: string;
  pay_time: string;
  domain: string;
  channel: string;
  type: string;
  status: string;
  product_type: string; // 'vip' | 'coin'
  // 建议新增如下字段，便于前端直接展示
  vip_card_name?: string;      // VIP卡名称，如“至尊卡”
  vip_card_duration?: number;  // VIP卡时长，如30
  vip_card_unit?: 'DAY' | 'MONTH' | 'YEAR'; // VIP卡单位
  coin_package_name?: string;  // 金币套餐名
  coin_amount?: number;        // 金币数量
  gift_coins?: number;         // 赠送金币
  // ...其他字段
}

// 定义后端分页列表的返回结构
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: {
    list: T[];
    total: number;
  };
}

// 定义域名/渠道接口返回类型
export interface DomainsChannelsResponse {
  code: number;
  msg: string;
  data: {
    domains: string[];
    channels: string[];
  };
}

/**
 * 获取充值订单列表
 * GET /api/recharge/order/list
 * @param params 查询参数
 */
export async function fetchRechargeOrderList(params: RechargeListParams) {
  const response = await simpleService.get('/api/recharge/order/list', { params });
  return response.data;
}

/**
 * 确认充值订单到账
 * POST /api/recharge/order/confirm
 * @param orderId 订单号
 */
export function confirmRechargeOrder(orderId: string): Promise<any> {
  return simpleService.post('/api/recharge/order/confirm', { order_id: orderId });
}

/**
 * 删除充值订单
 * POST /api/recharge/order/delete
 * @param orderId 订单号
 */
export function deleteRechargeOrder(orderId: string): Promise<any> {
  return simpleService.post('/api/recharge/order/delete', { order_id: orderId });
}

/**
 * 获取域名/渠道列表
 * GET /api/recharge/domains_channels
 */
export async function fetchDomainsAndChannels() {
  const response = await simpleService.get('/api/recharge/domains_channels');
  return response.data; // 只返回 data
}

/**
 * 创建充值订单
 * POST /api/recharge/order/create
 * @param data 订单数据
 */
export function createRechargeOrder(data: {
  order_id: string;
  user_uuid: string;
  amount: number;
  product_type: 'vip' | 'coin';
  product_id: number;
  status?: number;
}) {
  return simpleService.post('/api/recharge/order/create', data);
}

// 创建充值订单接口参数类型
export type CreateRechargeOrderParams = {
  order_id: string;
  user_uuid: string;
  amount: number;
  product_type: 'vip' | 'coin';
  product_id: number;
  status?: number;
};