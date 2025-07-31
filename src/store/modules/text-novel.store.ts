// File path: src/store/modules/text-novel.store.ts
import { ref } from 'vue';
import simpleService from '@/utils/request-new';
import { ElMessage } from 'element-plus';

// --- State ---
// 小说列表数据
export const novelList = ref<any[]>([]);
// 小说总数
export const novelTotal = ref(0);
// 小说列表加载状态
export const novelLoading = ref(false);

// --- 内存缓存（根据参数） ---
// key: JSON.stringify(params), value: { list, total }
const novelListCache = ref<{ [k: string]: { list: any[], total: number } }>({});

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取小说列表
 * 对应后端 /api/text_novel/list 接口
 * @param params 搜索和分页参数
 */
export async function fetchNovelList(params: any) {
  const cacheKey = JSON.stringify(params);
  // 命中缓存直接返回
  if (novelListCache.value[cacheKey]) {
    const cache = novelListCache.value[cacheKey];
    novelList.value = cache.list;
    novelTotal.value = cache.total;
    novelLoading.value = false;
    return { code: 0, data: { list: cache.list, total: cache.total } };
  }

  novelLoading.value = true;
  try {
    const res = await simpleService.get('/api/text_novel/list', { params });
    if (res && res.data && res.data.code === 0) {
      const list = res.data.data.list || [];
      const total = res.data.data.total || 0;
      novelList.value = list;
      novelTotal.value = total;
      // 写入缓存
      novelListCache.value[cacheKey] = { list, total };
    } else {
      ElMessage.error(res?.data?.msg || '获取小说列表失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to fetch novel list:', error);
    ElMessage.error('获取小说列表请求失败');
    return { code: 1, msg: '获取小说列表请求失败' };
  } finally {
    novelLoading.value = false;
  }
}

/**
 * 获取小说详情
 * 对应后端 /api/text_novel/{id} 接口
 * @param id 小说ID
 */
export async function fetchNovelDetail(id: number) {
  try {
    const res = await simpleService.get('/api/text_novel/read', { params: { id } });

    if (res && res.data && res.data.code === 0) {
      return res.data;
    } else {
      ElMessage.error(res?.data?.msg || '获取小说详情失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to fetch novel detail:', error);
    ElMessage.error('获取小说详情请求失败');
    return { code: 1, msg: '获取小说详情请求失败' };
  }
}

/**
 * 新增小说
 * 对应后端 /api/text_novel/add 接口
 * @param novelData 小说数据
 */
export async function addNovel(novelData: any) {
  try {
    const res = await simpleService.post('/api/text_novel/add', novelData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('新增小说成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '新增小说失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to add novel:', error);
    ElMessage.error('新增小说请求失败');
    return { code: 1, msg: '新增小说请求失败' };
  }
}

/**
 * 更新小说
 * 对应后端 /api/text_novel/update 接口
 * @param novelData 小说数据
 */
export async function updateNovel(novelData: any) {
  try {
    const res = await simpleService.post('/api/text_novel/update', novelData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('更新小说成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '更新小说失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to update novel:', error);
    ElMessage.error('更新小说请求失败');
    return { code: 1, msg: '更新小说请求失败' };
  }
}

/**
 * 删除小说
 * 对应后端 /api/text_novel/delete 接口
 * @param id 小说ID
 */
export async function deleteNovel(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel/delete', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('删除小说成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '删除小说失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to delete novel:', error);
    ElMessage.error('删除小说请求失败');
    return { code: 1, msg: '删除小说请求失败' };
  }
}

/**
 * 批量删除小说
 * 对应后端 /api/text_novel/batchDelete 接口
 * @param ids 小说ID数组
 */
export async function batchDeleteNovels(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel/batchDelete', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量删除小说成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量删除小说失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch delete novels:', error);
    ElMessage.error('批量删除小说请求失败');
    return { code: 1, msg: '批量删除小说请求失败' };
  }
}

/**
 * 批量设置小说连载状态
 * 对应后端 /api/text_novel/batchSetSerializationStatus 接口
 * @param ids 小说ID数组
 * @param status 状态 (1:连载中, 0:已完结, 2:暂停)
 */
export async function batchSetNovelSerializationStatus(ids: number[], status: number) {
  try {
    const res = await simpleService.post('/api/text_novel/batchSetSerializationStatus', { ids, status });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置连载状态成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量设置连载状态失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel serialization status:', error);
    ElMessage.error('批量设置连载状态请求失败');
    return { code: 1, msg: '批量设置连载状态请求失败' };
  }
}

/**
 * 批量设置小说上架状态
 * 对应后端 /api/text_novel/batchSetShelfStatus 接口
 * @param ids 小说ID数组
 * @param status 状态 (1:上架, 0:下架)
 */
export async function batchSetNovelShelfStatus(ids: number[], status: number) {
  try {
    const res = await simpleService.post('/api/text_novel/batchSetShelfStatus', { ids, status });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置上架状态成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量设置上架状态失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel shelf status:', error);
    ElMessage.error('批量设置上架状态请求失败');
    return { code: 1, msg: '批量设置上架状态请求失败' };
  }
}

/**
 * 批量设置小说可见性
 * 对应后端 /api/text_novel/batchSetVisibility 接口
 * @param ids 小说ID数组
 * @param visibility 可见性 (1:公开, 0:私密, 2:VIP专属)
 */
export async function batchSetNovelVisibility(ids: number[], visibility: number) {
  try {
    const res = await simpleService.post('/api/text_novel/batchSetVisibility', { ids, visibility });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置可见性成功！');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量设置可见性失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel visibility:', error);
    ElMessage.error('批量设置可见性请求失败');
    return { code: 1, msg: '批量设置可见性请求失败' };
  }
}

/**
 * 批量设置小说VIP（开启章节VIP付费）
 * 对应后端 /api/text_novel/batchSetVip 接口
 * @param ids 小说ID数组
 */
export async function batchSetVip(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel/batchSetVip', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置章节为VIP成功');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量设置章节为VIP失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel VIP:', error);
    ElMessage.error('批量设置章节为VIP请求失败');
    return { code: 1, msg: '批量设置章节为VIP请求失败' };
  }
}

/**
 * 批量取消小说VIP（所有章节都免费）
 * 对应后端 /api/text_novel/batchCancelVip 接口
 * @param ids 小说ID数组
 */
export async function batchCancelVip(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel/batchCancelVip', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量取消章节VIP成功');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量取消章节VIP失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch cancel novel VIP:', error);
    ElMessage.error('批量取消章节VIP请求失败');
    return { code: 1, msg: '批量取消章节VIP请求失败' };
  }
}

/**
 * 批量设置小说金币数
 * 对应后端 /api/text_novel/batchSetCoin 接口
 * @param ids 小说ID数组
 * @param coin 金币数量
 */
export async function batchSetCoin(ids: number[], coin: number) {
  try {
    const res = await simpleService.post('/api/text_novel/batchSetCoin', { ids, coin });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置章节金币成功');
      novelListCache.value = {}; // 写操作清空缓存
    } else {
      ElMessage.error(res?.data?.msg || '批量设置章节金币失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel coin:', error);
    ElMessage.error('批量设置章节金币请求失败');
    return { code: 1, msg: '批量设置章节金币请求失败' };
  }
}
