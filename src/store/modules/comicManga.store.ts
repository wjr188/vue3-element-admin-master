import { defineStore } from 'pinia'
import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useComicMangaStore = defineStore('comicManga', () => {
  // State
  const mangaList = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)
  const detail = ref<any>(null)

  // 章节相关 state
  const chapterList = ref<any[]>([])
  const chapterTotal = ref(0) // 支持分页
  const chapterLoading = ref(false)

  // 获取漫画列表
  async function fetchMangaList(params: any) {
    loading.value = true
    try {
      const res = await service.get('/api/comic/manga/list', { params })
      // 兼容两种返回结构
      const data = res?.data ? res.data : res
      mangaList.value = Array.isArray(data.list) ? data.list : []
      total.value = typeof data.total === 'number' ? data.total : 0
      return res
    } catch (error) {
      mangaList.value = []
      total.value = 0
      ElMessage.error('获取漫画列表请求失败')
      return { code: 1, msg: '获取漫画列表请求失败' }
    } finally {
      loading.value = false
    }
  }

  // 获取漫画详情
  async function fetchMangaDetail(id: number) {
    try {
      const res = await service.get(`/api/comic/manga/${id}`)
      const data = res?.data ? res.data : res
      if ((res.code === 0 || data.id) && data) {
        detail.value = data
        return data
      } else {
        ElMessage.error(res?.msg || '获取漫画详情失败')
      }
      return null
    } catch (error) {
      ElMessage.error('获取漫画详情请求失败')
      return null
    }
  }

  // 新增漫画
  async function addManga(mangaData: any) {
    try {
      const res = await service.post('/api/comic/manga/add', mangaData)
return res
    } catch (error) {
      ElMessage.error('新增漫画请求失败')
      return { code: 1, msg: '新增漫画请求失败' }
    }
  }

  // 更新漫画
  async function updateManga(mangaData: any) {
    try {
      const res = await service.post('/api/comic/manga/update', mangaData)
return res
    } catch (error) {
      ElMessage.error('更新漫画请求失败')
      return { code: 1, msg: '更新漫画请求失败' }
    }
  }

  // 删除漫画
  async function deleteManga(id: number) {
    try {
      const res = await service.post('/api/comic/manga/delete', { id })
return res
    } catch (error) {
      ElMessage.error('删除漫画请求失败')
      return { code: 1, msg: '删除漫画请求失败' }
    }
  }

  // 批量删除漫画
  async function batchDeleteManga(ids: number[]) {
    try {
      const res = await service.post('/api/comic/manga/batchDelete', { ids })
return res

    } catch (error) {
      ElMessage.error('批量删除漫画请求失败')
      return { code: 1, msg: '批量删除漫画请求失败' }
    }
  }

  // 批量设置连载状态
  async function batchSetSerializationStatus(ids: number[], status: number) {
    try {
      const res = await service.post('/api/comic/manga/batchSetSerializationStatus', { ids, status })
return res

    } catch (error) {
      ElMessage.error('批量设置连载状态请求失败')
      return { code: 1, msg: '批量设置连载状态请求失败' }
    }
  }

  // 批量设置上架状态
  async function batchSetShelfStatus(ids: number[], status: number) {
    try {
      const res = await service.post('/api/comic/manga/batchSetShelfStatus', { ids, status })
return res

    } catch (error) {
      ElMessage.error('批量设置上架状态请求失败')
      return { code: 1, msg: '批量设置上架状态请求失败' }
    }
  }

  // 批量设置VIP
  async function batchSetVip(ids: number[], isVip: number) {
    try {
      const res = await service.post('/api/comic/manga/batchSetVip', { ids, is_vip: isVip })
return res

    } catch (error) {
      ElMessage.error('批量设置VIP状态请求失败')
      return { code: 1, msg: '批量设置VIP状态请求失败' }
    }
  }

  // 批量设置金币
  async function batchSetCoin(ids: number[], coin: number) {
    try {
      const res = await service.post('/api/comic/manga/batchSetCoin', { ids, coin })
return res

    } catch (error) {
      ElMessage.error('批量设置金币请求失败')
      return { code: 1, msg: '批量设置金币请求失败' }
    }
  }

  // 获取章节列表
  async function fetchChapters(mangaId: number, params: any = {}) {
    chapterLoading.value = true
    try {
      // 如果需要分页，params 里传 page/pageSize
      const res = await service.get('/api/comic/chapter/list', { params: { manga_id: mangaId, ...params } })
      const data = res?.data ? res.data : res
      chapterList.value = Array.isArray(data.list) ? data.list : []
      // 让方法返回 total
      return { list: chapterList.value, total: data.total ?? chapterList.value.length }
    } catch (error) {
      chapterList.value = []
      ElMessage.error('获取章节请求失败')
      return { list: [], total: 0 }
    } finally {
      chapterLoading.value = false
    }
  }

  // 获取章节详情
  async function fetchChapterDetail(id: number) {
    try {
      const res = await service.get(`/api/comic/chapter/${id}`)
      if (res) {
        return res
      } else {
        ElMessage.error('获取章节详情失败')
        return null
      }
    } catch (error) {
      ElMessage.error('获取章节详情请求失败')
      return null
    }
  }

  // 新增章节
  async function addChapter(payload: any) {
    try {
      const res = await service.post('/api/comic/chapter/add', payload)
return res

    } catch (error: any) {
      ElMessage.error(error?.message || '新增章节请求失败')
      return { code: 1, msg: error?.message || '新增章节请求失败' }
    }
  }

  // 编辑章节
  async function updateChapter(payload: any) {
    try {
      const res = await service.post('/api/comic/chapter/update', payload)
return res

    } catch (error: any) {
      ElMessage.error(error?.message || '编辑章节请求失败')
      return { code: 1, msg: error?.message || '编辑章节请求失败' }
    }
  }

  // 删除章节
  async function deleteChapter(id: number) {
    try {
      const res = await service.post('/api/comic/chapter/delete', { id })
return res

    } catch (error: any) {
      ElMessage.error(error?.message || '删除章节请求失败')
      return { code: 1, msg: error?.message || '删除章节请求失败' }
    }
  }

  // 批量删除章节
  async function batchDeleteChapter(ids: number[]) {
    try {
      const res = await service.post('/api/comic/chapter/batchDelete', { ids })
return res

    } catch (error: any) {
      ElMessage.error(error?.message || '批量删除章节请求失败')
      return { code: 1, msg: error?.message || '批量删除章节请求失败' }
    }
  }

  // 排序接口
  async function batchUpdateSort(list: any[]) {
    try {
      const res = await service.post('/api/comic/chapter/batchUpdateSort', { list })
return res

    } catch (error: any) {
      ElMessage.error(error?.message || '章节排序请求失败')
      return { code: 1, msg: error?.message || '章节排序请求失败' }
    }
  }

  // 获取章节图片
  async function fetchChapterImages(mangaId: number, orderNum: number) {
    try {
      const res = await service.get('/api/comic/manga/chapter/images', {
        params: { manga_id: mangaId, order_num: orderNum }
      })
      if (Array.isArray(res)) {
        return res // 直接是数组
      } else {
        ElMessage.error('获取章节图片失败')
        return []
      }
    } catch (error) {
      ElMessage.error('获取章节图片请求失败')
      return []
    }
  }

  // 设置某漫画下所有章节VIP
  async function setAllChaptersVipByMangaId(mangaId: number, isVip: number) {
    try {
      const res = await service.post('/api/comic/chapter/setAllVip', { manga_id: mangaId, is_vip: isVip })
return res

    } catch (error) {
      console.error('同步章节VIP失败:', error)
      return { code: 1, msg: '同步章节VIP失败' }
    }
  }

  // 设置某漫画下所有章节金币
  async function setAllChaptersCoinByMangaId(mangaId: number, coin: number) {
    try {
      const res = await service.post('/api/comic/chapter/setAllCoin', { manga_id: mangaId, coin })
return res

    } catch (error) {
      console.error('同步章节金币失败:', error)
      return { code: 1, msg: '同步章节金币失败' }
    }
  }

  // 批量设置章节免费
  async function batchSetChapterFree(ids: number[]) {
    try {
      const res = await service.post('/api/comic/chapter/batchSetFree', { ids })
return res

    } catch (error) {
      ElMessage.error('批量设置章节免费失败')
      return { code: 1, msg: '批量设置章节免费失败' }
    }
  }

  return {
    mangaList,
    total,
    loading,
    detail,
    chapterList,
    chapterTotal,
    chapterLoading,
    fetchMangaList,
    fetchMangaDetail,
    addManga,
    updateManga,
    deleteManga,
    batchDeleteManga,
    batchSetSerializationStatus,
    batchSetShelfStatus,
    batchSetVip,
    batchSetCoin,
    fetchChapters,
    fetchChapterDetail,
    addChapter,
    updateChapter,
    deleteChapter,
    batchDeleteChapter,
    batchUpdateSort,
    fetchChapterImages,
    setAllChaptersVipByMangaId,
    setAllChaptersCoinByMangaId,
    batchSetChapterFree,
  }
})