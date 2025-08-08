import request from '@/utils/request-new'

// 类型定义
export interface OnlyFansMedia {
  id: number
  title: string
  cover?: string
  type: 'image' | 'video'
  creator_id: number
  creator_name?: string
  creator_avatar?: string
  is_vip: number
  vip?: boolean
  coin: number
  view_count: number
  like_count: number
  sort: number
  status: number
  create_time?: string
  update_time?: string
}

export interface OnlyFansMediaListResponse {
  code: number
  msg: string
  data: {
    list: OnlyFansMedia[]
    total: number
    page: number
    page_size: number
  }
}

// OnlyFans内容管理API
export const onlyfansMediaApi = {
  // 获取内容列表
  getList(params?: Record<string, any>): Promise<{ data: OnlyFansMediaListResponse }> {
    return request({
      url: '/api/onlyfans/media/list',
      method: 'get',
      params
    })
  },

  // 获取内容详情
  getById(id: number): Promise<{ data: { code: number; msg: string; data: OnlyFansMedia } }> {
    return request({
      url: `/api/onlyfans/media/${id}`,
      method: 'get'
    })
  },

  // 新增内容
  add(data: Partial<OnlyFansMedia>): Promise<{ data: { code: number; msg: string; data?: { id: number } } }> {
    return request({
      url: '/api/onlyfans/media/add',
      method: 'post',
      data
    })
  },

  // 更新内容
  update(data: Partial<OnlyFansMedia> & { id: number }): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/update',
      method: 'post',
      data
    })
  },

  // 删除内容
  delete(id: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/delete',
      method: 'post',
      data: { id }
    })
  },

  // 批量删除
  batchDelete(ids: number[]): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  // 更新排序
  updateSort(list: Array<{ id: number; sort: number }>): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/update-sort',
      method: 'post',
      data: { list }
    })
  },

  // 批量设置VIP
  batchSetVip(ids: number[], isVip: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/batch-set-vip',
      method: 'post',
      data: { ids, is_vip: isVip }
    })
  },

  // 批量设置金币
  batchSetGold(ids: number[], coin: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/batch-set-gold',
      method: 'post',
      data: { ids, coin }
    })
  },

  // 批量设置状态
  batchSetStatus(ids: number[], status: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/media/batch-set-status',
      method: 'post',
      data: { ids, status }
    })
  }
}

export default onlyfansMediaApi