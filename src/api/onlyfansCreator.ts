import request from '@/utils/request-new'

// 类型定义
export interface OnlyFansCreator {
  id: number
  name: string
  avatar?: string
  category_id: number
  category_name?: string
  intro?: string
  media_count: number
  fans_count: number
  sort: number
  status: number
  create_time?: string
  update_time?: string
}

export interface OnlyFansCreatorListResponse {
  code: number
  msg: string
  data: {
    list: OnlyFansCreator[]
    total: number
    page: number
    page_size: number
  }
}

export interface OnlyFansCreatorDetail {
  creator: OnlyFansCreator
  stats: {
    total_media: number
    image_count: number
    video_count: number
  }
  media_list: any[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// OnlyFans博主管理API
export const onlyfansCreatorApi = {
  // 获取博主列表
  getList(params?: Record<string, any>): Promise<{ data: OnlyFansCreatorListResponse }> {
    return request({
      url: '/api/onlyfans/creators/list',
      method: 'get',
      params
    })
  },

  // 获取博主详情及其内容
  getDetail(id: number, params?: Record<string, any>): Promise<{ data: { code: number; msg: string; data: OnlyFansCreatorDetail } }> {
    return request({
      url: `/api/onlyfans/creators/detail/${id}`,
      method: 'get',
      params
    })
  },

  // 新增博主
  add(data: Partial<OnlyFansCreator>): Promise<{ data: { code: number; msg: string; data?: { id: number } } }> {
    return request({
      url: '/api/onlyfans/creators/add',
      method: 'post',
      data
    })
  },

  // 更新博主
  update(data: Partial<OnlyFansCreator> & { id: number }): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/update',
      method: 'post',
      data
    })
  },

  // 删除博主
  delete(id: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/delete',
      method: 'post',
      data: { id }
    })
  },

  // 批量删除
  batchDelete(ids: number[]): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  // 批量更新排序
  batchUpdateSort(list: Array<{ id: number; sort: number }>): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/batch-update-sort',
      method: 'post',
      data: { list }
    })
  },

  // 批量设置状态
  batchSetStatus(ids: number[], status: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/batch-set-status',
      method: 'post',
      data: { ids, status }
    })
  },

  // 批量设置分类
  batchSetCategory(ids: number[], categoryId: number): Promise<{ data: { code: number; msg: string } }> {
    return request({
      url: '/api/onlyfans/creators/batch-set-category',
      method: 'post',
      data: { ids, category_id: categoryId }
    })
  }
}

export default onlyfansCreatorApi