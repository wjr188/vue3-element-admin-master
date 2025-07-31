// src/api/paymentChannel.api.ts
import request from '@/utils/request-new'; // 假设您有这样一个封装好的 request

// 支付通道接口类型定义
export interface PaymentChannel {
  id?: number;
  code: string; // 英文支付标识/支付方式码
  name: string; // 通道名称
  type: string; // 通道类型（支付宝/微信/其他）
  api_url: string; // 支付接口请求地址
  link_url?: string; // 跳转地址/备用地址
  appid?: string; // 第三方appid
  mchid?: string; // 商户号
  api_key?: string; // API密钥
  pay_notify_url?: string; // 异步通知回调地址
  pay_method?: 'POST' | 'GET'; // POST/GET
  status: 0 | 1; // 启用状态 1=启用 0=禁用
  sort: number; // 排序，数字越小越前
  remark?: string; // 备注
  create_time?: string;
  update_time?: string;
  // 以下是后端JOIN或子查询返回的统计字段
  total_amount?: string; // 累计收款
  today_amount?: string; // 今日收款
}

// 获取支付通道列表（带统计数据和时间筛选）
export function getPaymentChannelList(params: {
  page: number;
  pageSize: number;
  name?: string;
  type?: string;
  status?: 0 | 1;
  start_time?: string;
  end_time?: string;
}) {
  return request({
    url: '/api/payment_channel/list',
    method: 'GET',
    params,
  });
}

// 创建支付通道
export function createPaymentChannel(data: Omit<PaymentChannel, 'id' | 'create_time' | 'update_time' | 'total_amount' | 'today_amount'>) {
  return request({
    url: '/api/payment_channel/create',
    method: 'POST',
    data,
  });
}

// 更新支付通道
export function updatePaymentChannel(id: number, data: Partial<Omit<PaymentChannel, 'id' | 'create_time' | 'update_time' | 'total_amount' | 'today_amount'>>) {
  return request({
    url: `/api/payment_channel/update/${id}`,
    method: 'PUT',
    data,
  });
}

// 删除支付通道
export function deletePaymentChannel(id: number) {
  return request({
    url: `/api/payment_channel/delete/${id}`,
    method: 'DELETE',
  });
}

// 切换支付通道状态
export function togglePaymentChannelStatus(id: number, status: 0 | 1) {
  return request({
    url: `/api/payment_channel/status/${id}`, // 假设有专门的状态切换接口
    method: 'PUT',
    data: { status },
  });
}