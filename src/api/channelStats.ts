// src/api/channel.js
import request from '@/utils/request-new'; // 假设你的项目有封装好的axios请求工具

/**
 * 获取渠道列表
 * @param {object} params - 查询参数 (page, page_size, channel_name等)
 * @returns {Promise}
 */
export function getChannelList(params) {
  return request({
    url: '/api/channel/list',
    method: 'get',
    params
  });
}

/**
 * 添加新渠道
 * @param {object} data - 渠道数据 (channel_name, channel_domain, etc.)
 * @returns {Promise}
 */
export function addChannel(data) {
  return request({
    url: '/api/channel/add',
    method: 'post',
    data
  });
}

/**
 * 更新渠道信息
 * @param {object} data - 更新数据 (包含渠道ID: channel_id, 以及其他更新字段)
 * @returns {Promise}
 */
export function updateChannel(data) {
  return request({
    url: '/api/channel/update', // 假设更新接口也使用POST，并传入整个data对象
    method: 'post',
    data
  });
}

/**
 * 删除渠道
 * @param {string} channel_id - 渠道ID
 * @returns {Promise}
 */
export function deleteChannel(channel_id) {
  return request({
    url: '/api/channel/delete', // 假设删除接口也使用POST，并传入ID
    method: 'post',
    data: { channel_id }
  });
}

/**
 * 获取渠道统计信息
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getChannelStatsList(params) {
  return request({
    url: '/api/channel/stats',
    method: 'get',
    params
  });
}

/**
 * 获取用户充值详情
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getUserRechargeDetail(params) {
  return request({
    url: '/api/channel/user-recharge-detail',
    method: 'get',
    params
  });
}

/**
 * 获取用户充值订单
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getUserRechargeOrders(params) {
  return request({
    url: '/api/channel/user-recharge-orders',
    method: 'get',
    params
  });
}