import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { AnimeVideo } from '@/types/animeVideo'
import * as animeVideosApi from '@/api/animeVideos.api'

export const useAnimeVideosStore = defineStore('animeVideos', () => {
  const videos = ref<AnimeVideo[]>([])
  const total = ref(0)
  const loading = ref(false)
  const detail = ref<AnimeVideo | null>(null)

  // 获取列表
  async function fetchList(params: any = {}) {
    loading.value = true
    try {
      const res = await animeVideosApi.getAnimeVideoList(params)
      if (res.data?.code === 0 && res.data.data) {
        videos.value = res.data.data.list || []
        total.value = res.data.data.total || 0
      } else {
        videos.value = []
        total.value = 0
        ElMessage.error('获取动漫视频列表失败: ' + (res.data?.msg || '未知错误'))
      }
      return res.data
    } catch (e) {
      videos.value = []
      total.value = 0
      ElMessage.error('请求动漫视频列表失败，请检查网络或后端服务。')
      throw e
    } finally {
      loading.value = false
    }
  }

  // 新增
  async function add(data: any) {
    const submitData = {
      ...data,
      is_vip: data.vip ? 1 : 0,
      gold: data.coin,
    }
    delete submitData.vip
    delete submitData.coin
    const res = await animeVideosApi.addAnimeVideo(submitData)
    if (res.data?.code === 0) {
      ElMessage.success('新增成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '新增失败')
    }
    return res.data
  }

  // 编辑
  async function update(data: any) {
    const submitData = {
      ...data,
      is_vip: data.vip ? 1 : 0,
      gold: data.coin,
    }
    delete submitData.vip
    delete submitData.coin
    const res = await animeVideosApi.updateAnimeVideo(submitData)
    if (res.data?.code === 0) {
      ElMessage.success('保存成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '保存失败')
    }
    return res.data
  }

  // 删除
  async function remove(id: number) {
    const res = await animeVideosApi.deleteAnimeVideo(id)
    if (res.data?.code === 0) {
      ElMessage.success('删除成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '删除失败')
    }
    return res.data
  }

  // 批量删除
  async function batchRemove(ids: number[]) {
    const res = await animeVideosApi.batchDeleteAnimeVideos(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量删除成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '批量删除失败')
    }
    return res.data
  }

  // 批量设置VIP
  async function batchSetVip(ids: number[], isVip: boolean = true) {
    const res = await animeVideosApi.batchSetAnimeVip(ids, isVip)
    if (res.data?.code === 0) {
      ElMessage.success('VIP设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || 'VIP设置失败')
    }
    return res.data
  }

  // 批量设置试看时长
  async function batchSetPreview(ids: number[], preview: string) {
    const res = await animeVideosApi.batchSetAnimePreview(ids, preview)
    if (res.data?.code === 0) {
      ElMessage.success('试看时长设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '试看时长设置失败')
    }
    return res.data
  }

  // 批量设置金币
  async function batchSetGold(ids: number[], goldValue: number) {
    const res = await animeVideosApi.batchSetAnimeGold(ids, goldValue)
    if (res.data?.code === 0) {
      ElMessage.success('金币设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '金币设置失败')
    }
    return res.data
  }

  // 批量设置播放数
  async function batchSetPlay(ids: number[], playCount: number) {
    const res = await animeVideosApi.batchSetAnimePlay(ids, playCount)
    if (res.data?.code === 0) {
      ElMessage.success('播放数设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '播放数设置失败')
    }
    return res.data
  }

  // 批量设置收藏数
  async function batchSetCollect(ids: number[], collectCount: number) {
    const res = await animeVideosApi.batchSetAnimeCollect(ids, collectCount)
    if (res.data?.code === 0) {
      ElMessage.success('收藏数设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '收藏数设置失败')
    }
    return res.data
  }

  // 批量升序置顶
  async function batchSortAsc(ids: number[]) {
    const res = await animeVideosApi.batchSortAnimeAsc(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量升序置顶成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '批量升序置顶失败')
    }
    return res.data
  }

  // 获取详情
  async function fetchDetail(id: number) {
    try {
      const res = await animeVideosApi.getAnimeVideoDetail(id)
      if (res.data?.code === 0 && res.data.data) {
        detail.value = res.data.data
        return res.data.data
      } else {
        ElMessage.error('获取动漫视频详情失败: ' + (res.data?.msg || '未知错误'))
        detail.value = null
        return null
      }
    } catch (error) {
      ElMessage.error('请求动漫视频详情失败，请检查网络或后端服务。')
      detail.value = null
      throw error
    }
  }

  return {
    videos,
    total,
    loading,
    detail,
    fetchList,
    add,
    update,
    remove,
    batchRemove,
    batchSetVip,
    batchSetPreview,
    batchSetGold,
    batchSetPlay,     // 新增
    batchSetCollect,  // 新增
    batchSortAsc,     // 新增
    fetchDetail,
  }
})