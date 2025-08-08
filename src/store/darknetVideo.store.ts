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
      }
      return res.data
    } catch (e) {
      videos.value = []
      total.value = 0
      throw e
    } finally {
      loading.value = false
    }
  }

  async function add(data: Partial<DarknetVideo>) {
    const res = await darknetVideoApi.addDarknetVideo(data)
    return res.data
  }

  async function update(data: Partial<DarknetVideo>) {
    const res = await darknetVideoApi.updateDarknetVideo(data)
    return res.data
  }

  async function remove(id: number) {
    const res = await darknetVideoApi.deleteDarknetVideo(id)
    return res.data
  }

  async function batchRemove(ids: number[]) {
    const res = await darknetVideoApi.batchDeleteDarknetVideos(ids)
    return res.data
  }

  async function batchSetVip(ids: number[], isVip: boolean = true) {
    const res = await darknetVideoApi.batchSetDarknetVip(ids, isVip)
    return res.data
  }

  async function batchSetGold(ids: number[], goldValue: number) {
    const res = await darknetVideoApi.batchSetDarknetGold(ids, goldValue)
    return res.data
  }

  async function fetchDetail(id: number) {
    const res = await darknetVideoApi.getDarknetVideoDetail(id)
    if (res.data?.code === 0 && res.data.data) {
      detail.value = res.data.data
    } else {
      detail.value = null
    }
    return res.data
  }

  async function batchSetPlay(ids: number[], playCount: number) {
    const res = await darknetVideoApi.batchSetDarknetPlay(ids, playCount)
    return res.data
  }

  async function batchSetCollect(ids: number[], collectCount: number) {
    const res = await darknetVideoApi.batchSetDarknetCollect(ids, collectCount)
    return res.data
  }

  async function batchSortAsc(ids: number[]) {
    const res = await darknetVideoApi.batchSortDarknetAsc(ids)
    return res.data
  }

  async function batchSetLike(ids: number[], likeCount: number) {
    const res = await darknetVideoApi.batchSetDarknetLike(ids, likeCount)
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
    batchSetGold,
    batchSetPlay,
    batchSetCollect,
    batchSortAsc,
    fetchDetail,
    batchSetLike,
  }
})