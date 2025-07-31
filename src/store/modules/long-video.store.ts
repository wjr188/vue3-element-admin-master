import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

// 响应式变量
export const videos = ref<VideoRow[]>([])
export const videoTotal = ref(0)
export const videoLoading = ref(false)

/**
 * 获取长视频列表
 * 官方接口 GET /api/long/videos/list
 */
export async function fetchVideoList(params: any = {}) {
  videoLoading.value = true
  try {
    const res = await service.get('/api/long/videos/list', { params })
    // 因为 request.ts 成功时只返回了 response.data.data，
    // 所以这里的 `res` 就是后端返回的 `data` 业务数据，例如 { list: [...], total: ... }
    console.log('fetchVideoList: 从 request.ts 返回的业务数据:', res)

    if (res && Array.isArray(res.list) && typeof res.total === 'number') {
      videos.value = res.list || []
      videoTotal.value = res.total || 0
      ElMessage.success('长视频列表获取成功')
    } else {
      videos.value = []
      videoTotal.value = 0
      console.error('fetchVideoList: 后端返回列表数据结构异常或空:', res)
    }
    return res
  } catch (error: any) {
    videos.value = []
    videoTotal.value = 0
    console.error('fetchVideoList: 请求长视频列表发生异常:', error)
    throw error
  } finally {
    videoLoading.value = false
  }
}

/**
 * 新增长视频
 * 官方接口 POST /api/long/videos/add
 */
export async function addVideo(data: any) {
  try {
    let requestData: any = { ...data }

    // ========== 确保 cover_url 和 preview_duration 字段存在，即使为空 ==========
    // 优先使用 cover_url/preview_duration，如果不存在，则使用 cover/preview，再不然就是空字符串
    requestData.cover_url = requestData.cover_url || requestData.cover || ''
    if (requestData.hasOwnProperty('cover')) delete requestData.cover // 始终移除 'cover' 字段

    requestData.preview_duration = requestData.preview_duration || requestData.preview || ''
    if (requestData.hasOwnProperty('preview')) delete requestData.preview // 始终移除 'preview' 字段
    // ==================================================================

    // 移除后端不需前端发送的字段
    if (requestData.hasOwnProperty('id')) delete requestData.id
    if (requestData.hasOwnProperty('create_time')) delete requestData.create_time
    if (requestData.hasOwnProperty('update_time')) delete requestData.update_time

    const res = await service.post('/api/long/videos/add', requestData)
    if (res && res.id) {
      ElMessage.success('新增成功')
      await fetchVideoList()
    } else {
      console.error('addVideo: 后端返回新增数据异常:', res)
    }
    return res
  } catch (error: any) {
    console.error('addVideo: 请求新增长视频发生异常:', error)
    throw error
  }
}

/**
 * 编辑长视频
 * 官方接口 POST /api/long/videos/update
 */
export async function updateVideo(data: any) {
  try {
    let requestData: any = { ...data }

    // ========== 确保 cover_url 和 preview_duration 字段存在，即使为空 ==========
    // 优先使用 cover_url/preview_duration，如果不存在，则使用 cover/preview，再不然就是空字符串
    requestData.cover_url = requestData.cover_url || requestData.cover || ''
    if (requestData.hasOwnProperty('cover')) delete requestData.cover // 始终移除 'cover' 字段

    requestData.preview_duration = requestData.preview_duration || requestData.preview || ''
    if (requestData.hasOwnProperty('preview')) delete requestData.preview // 始终移除 'preview' 字段
    // ==================================================================

    // 移除后端不需前端发送的字段
    if (requestData.hasOwnProperty('create_time')) delete requestData.create_time
    if (requestData.hasOwnProperty('update_time')) delete requestData.update_time

    const res = await service.post('/api/long/videos/update', requestData)
    if (res) {
      ElMessage.success('保存成功')
      await fetchVideoList()
    } else {
      console.error('updateVideo: 后端返回编辑数据异常:', res)
    }
  } catch (error: any) {
    console.error('updateVideo: Request to update long video failed, please check network or backend service.', error)
    throw error
  }
}

/**
 * 批量删除长视频
 * 官方接口 POST /api/long/videos/batch-delete
 */
export async function batchDeleteVideos(ids: number[]) {
  try {
    const res = await service.post('/api/long/videos/batch-delete', { ids })
    if (res) {
      ElMessage.success('删除成功')
      await fetchVideoList()
    } else {
      console.error('batchDeleteVideos: 后端返回删除数据异常:', res)
    }
    return res
  } catch (error: any) {
    console.error('batchDeleteVideos: 请求批量删除长视频失败，请检查网络或后端服务。', error)
    throw error
  }
}

/**
 * 批量设置VIP
 * 官方接口 POST /api/long/videos/batch-set-vip
 */
export async function batchSetVip(ids: number[], isVip: boolean = true) {
  try {
    const res = await service.post('/api/long/videos/batch-set-vip', { ids, is_vip: isVip ? 1 : 0 })
    if (res) {
      ElMessage.success('VIP设置成功！')
      await fetchVideoList()
    } else {
      console.error('batchSetVip: 后端返回VIP设置数据异常:', res)
    }
    return res
  } catch (error: any) {
    console.error('batchSetVip: 请求批量设置VIP失败，请检查网络或后端服务。', error)
    throw error
  }
}

/**
 * 批量设置试看时长
 * 官方接口 POST /api/long/videos/batch-set-duration
 */
export async function batchSetDuration(ids: number[], duration: string) {
  try {
    const res = await service.post('/api/long/videos/batch-set-duration', { ids, duration })
    if (res) {
      ElMessage.success('试看时长设置成功！')
      await fetchVideoList()
    } else {
      console.error('batchSetDuration: 后端返回试看时长设置数据异常:', res)
    }
    return res
  } catch (error: any) {
    console.error('batchSetDuration: 请求批量设置试看时长失败，请检查网络或后端服务。', error)
    throw error
  }
}

/**
 * 批量设置金币
 * 官方接口 POST /api/long/videos/batch-set-gold
 */
export async function batchSetGold(ids: number[], gold: number) {
  try {
    const res = await service.post('/api/long/videos/batch-set-gold', { ids, gold })
    if (res) {
      ElMessage.success('金币设置成功！')
      await fetchVideoList()
    } else {
      console.error('batchSetGold: 后端返回金币设置数据异常:', res)
    }
    return res
  } catch (error: any) {
    console.error('batchSetGold: 请求批量设置金币失败，请检查网络或后端服务。', error)
    throw error
  }
}

/**
 * 获取单个视频详情
 * 官方接口 GET /api/long/videos/:id
 */
export async function fetchVideoDetail(id: number) {
  try {
    const res = await service.get(`/api/long/videos/${id}`)
    if (res) {
      return res
    } else {
      console.error('fetchVideoDetail: 后端返回长视频详情异常或空:', res)
      return null
    }
  } catch (error: any) {
    console.error('fetchVideoDetail: 请求长视频详情失败，请检查网络或后端服务。', error)
    throw error
  }
}

// src/store/modules/long-video.store.ts
export async function batchSortAsc(ids: number[]) {
  try {
    const res = await service.post('/api/long/videos/batch-sort-asc', { ids });
    if (res && res.code === 0) {
      ElMessage.success('批量升序置顶成功！');
    } else {
      ElMessage.error(res?.msg || '批量升序置顶失败');
    }
    await fetchVideoList(); // 无论成功失败都刷新
    return res;
  } catch (error: any) {
    ElMessage.error('批量升序置顶失败');
    await fetchVideoList();
    throw error;
  }
}

// 批量设置播放数 - 兜底版
export async function batchSetPlay(ids: number[], playCount: number) {
  try {
    const res = await service.post('/api/long/videos/batch-set-play', { ids, play_count: playCount })
      .catch(err => {
        return err && err.message ? { code: -1, msg: err.message } : { code: -1, msg: '请求失败' };
      });
    
    console.log('批量设置播放数返回:', res)
    
    if (res && res.code === 0) {
      ElMessage.success(res.msg || '批量设置播放数成功');
      await fetchVideoList()
    } else {
      ElMessage.error(res.msg || '批量设置播放数失败');
    }
    return res;
  } catch (error) {
    console.error('batchSetPlay: 请求失败', error)
    ElMessage.error('网络异常');
    return null;
  }
}

// 批量设置收藏数 - 兜底版
export async function batchSetCollect(ids: number[], collectCount: number) {
  try {
    const res = await service.post('/api/long/videos/batch-set-collect', { ids, collect_count: collectCount })
      .catch(err => {
        return err && err.message ? { code: -1, msg: err.message } : { code: -1, msg: '请求失败' };
      });
    
    console.log('批量设置收藏数返回:', res)
    
    if (res && res.code === 0) {
      ElMessage.success(res.msg || '批量设置收藏数成功');
      await fetchVideoList()
    } else {
      ElMessage.error(res.msg || '批量设置收藏数失败');
    }
    return res;
  } catch (error) {
    console.error('batchSetCollect: 请求失败', error)
    ElMessage.error('网络异常');
    return null;
  }
}

