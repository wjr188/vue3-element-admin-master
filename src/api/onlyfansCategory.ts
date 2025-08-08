import request from '@/utils/request-new'

// 类型定义
export interface OnlyFansCategory {
  id: number
  name: string
  intro?: string
  icon?: string
  sort: number
  status: number
  creator_count?: number
  create_time?: string
  update_time?: string
}

export interface OnlyFansCategoryListResponse {
  code: number
  msg: string
  data: {
    categories: OnlyFansCategory[]
    creators?: any[]
    total: number
    page: number
    page_size: number
  }
}

export interface OnlyFansCategoryStatistics {
  category_count: number
  creator_count: number
  media_count: number
  category_stats: Array<{
    category_id: number
    category_name: string
    creator_count: number
    media_count: number
  }>
}

// OnlyFans分类管理API
export const onlyfansCategoryApi = {
  // 获取分类列表和博主列表
  getList(params?: Record<string, any>): Promise<{ data: OnlyFansCategoryListResponse }> {
    return request({
      url: '/api/onlyfans/categories/list',
      method: 'get',
      params
    })
  },

  // 获取分类详情
  getDetail(id: number): Promise<{ data: { code: number; msg: string; data: OnlyFansCategory } }> {
    return request({
      url: `/api/onlyfans/categories/detail/${id}`,
      method: 'get'
    })
  },

  // 获取统计信息
  getStatistics(): Promise<{ data: { code: number; msg: string; data: OnlyFansCategoryStatistics } }> {
    return request({
      url: '/api/onlyfans/categories/statistics',
      method: 'get'
    })
  },

  // 新增分类
  add(data: Partial<OnlyFansCategory>): Promise<{ data: { code: number; msg: string; data?: { id: number } } }> {
    return request({
      url: '/api/onlyfans/categories/add',
      method: 'post',
      data
    })
  },

  // 更新分类
  update(data: Partial<OnlyFansCategory> & { id: number }): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/categories/update',
      method: 'post',
      data
    })
  },

  // 删除分类
  delete(id: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/categories/delete',
      method: 'post',
      data: { id }
    })
  },

  // 批量删除
  batchDelete(ids: number[]): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/categories/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  // 批量更新排序
  batchUpdateSort(list: Array<{ id: number; sort: number }>): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/categories/batch-update-sort',
      method: 'post',
      data: { list }
    })
  }
}

export default onlyfansCategoryApi