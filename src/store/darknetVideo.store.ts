import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { DarknetVideo } from '@/types/darknetVideo'
import * as darknetVideoApi from '@/api/darknetVideo.api'

export const useDarknetVideoStore = defineStore('darknetVideo', () => {
  const videos = ref<DarknetVideo[]>([])
  const total = ref(0)
  const loading = ref(false)
  const detail = ref<DarknetVideo | null>(null)

  async function fetchList(params: any = {}) {
    loading.value = true
    try {
      const res = await darknetVideoApi.getDarknetVideoList(params)
      if (res.data?.code === 0 && res.data.data) {
        videos.value = res.data.data.list || []
        total.value = res.data.data.total || 0
      } else {
        videos.value = []
        total.value = 0
        ElMessage.error('获取暗网视频列表失败: ' + (res.data?.msg || '未知错误'))
      }
      return res.data
    } catch (e) {
      videos.value = []
      total.value = 0
      ElMessage.error('请求暗网视频列表失败，请检查网络或后端服务。')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function add(data: Partial<DarknetVideo>) {
    const res = await darknetVideoApi.addDarknetVideo(data)
    if (res.data?.code === 0) {
      ElMessage.success('新增成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '新增失败')
    }
    return res.data
  }

  async function update(data: Partial<DarknetVideo>) {
    const res = await darknetVideoApi.updateDarknetVideo(data)
    if (res.data?.code === 0) {
      ElMessage.success('保存成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '保存失败')
    }
    return res.data
  }

  async function remove(id: number) {
    const res = await darknetVideoApi.deleteDarknetVideo(id)
    if (res.data?.code === 0) {
      ElMessage.success('删除成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '删除失败')
    }
    return res.data
  }

  async function batchRemove(ids: number[]) {
    const res = await darknetVideoApi.batchDeleteDarknetVideos(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量删除成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '批量删除失败')
    }
    return res.data
  }

  async function batchSetVip(ids: number[], isVip: boolean = true) {
    const res = await darknetVideoApi.batchSetDarknetVip(ids, isVip)
    if (res.data?.code === 0) {
      ElMessage.success('VIP设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || 'VIP设置失败')
    }
    return res.data
  }

  async function batchSetPreview(ids: number[], preview: string) {
    const res = await darknetVideoApi.batchSetDarknetPreview(ids, preview)
    if (res.data?.code === 0) {
      ElMessage.success('试看时长设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '试看时长设置失败')
    }
    return res.data
  }

  async function batchSetGold(ids: number[], goldValue: number) {
    const res = await darknetVideoApi.batchSetDarknetGold(ids, goldValue)
    if (res.data?.code === 0) {
      ElMessage.success('金币设置成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '金币设置失败')
    }
    return res.data
  }

  async function fetchDetail(id: number) {
    const res = await darknetVideoApi.getDarknetVideoDetail(id)
    if (res.data?.code === 0 && res.data.data) {
      detail.value = res.data.data
    } else {
      detail.value = null
      ElMessage.error('获取详情失败: ' + (res.data?.msg || '未知错误'))
    }
    return res.data
  }

  // 批量设置播放数
  async function batchSetPlay(ids: number[], playCount: number) {
    const res = await darknetVideoApi.batchSetDarknetPlay(ids, playCount)
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
    const res = await darknetVideoApi.batchSetDarknetCollect(ids, collectCount)
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
    const res = await darknetVideoApi.batchSortDarknetAsc(ids)
    if (res.data?.code === 0) {
      ElMessage.success('批量升序置顶成功')
      await fetchList()
    } else {
      ElMessage.error(res.data?.msg || '批量升序置顶失败')
    }
    return res.data
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