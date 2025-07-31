// File path: src/store/modules/onlyfans-media.store.ts
import { ref } from 'vue';
import service from '@/utils/request'; // Assume your request utility is here
import { ElMessage } from 'element-plus';

// --- State ---
// 所有媒体 (图片) 列表
export const onlyfansMedia = ref<any[]>([]);
// 媒体总数
export const onlyfansMediaTotal = ref(0);
// 媒体加载状态
export const onlyfansMediaLoading = ref(false);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取 OnlyFans 媒体 (图片) 列表
 * 对应后端 /api/onlyfans/media/list 接口
 * @param params 查询参数 (page, pageSize, keyword, creatorId, seriesId, collectionId, tag)
 */
export async function fetchOnlyFansMedia(params?: any) {
  onlyfansMediaLoading.value = true;
  try {
    const res = await service.get('/api/onlyfans/media/list', { params });
    if (res.data.code === 0) {
      onlyfansMedia.value = res.data.data.list || [];
      onlyfansMediaTotal.value = res.data.data.total || 0;
    } else {
      ElMessage.error(res.data.msg || '获取媒体列表失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to fetch OnlyFans media:', error);
    ElMessage.error('获取媒体列表请求失败');
    return { code: 1, msg: '获取媒体列表请求失败' };
  } finally {
    onlyfansMediaLoading.value = false;
  }
}

/**
 * 新增 OnlyFans 媒体专辑
 * 对应后端 /api/onlyfans/media/add 接口
 * @param mediaData 媒体专辑数据
 */
export async function addOnlyFansMedia(mediaData: any) {
  try {
    const res = await service.post('/api/onlyfans/media/add', mediaData);
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '新增媒体专辑失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to add OnlyFans media album:', error);
    ElMessage.error('新增媒体专辑请求失败');
    return { code: 1, msg: '新增媒体专辑请求失败' };
  }
}

/**
 * 更新 OnlyFans 媒体专辑
 * 对应后端 /api/onlyfans/media/update 接口
 * @param mediaData 媒体专辑数据
 */
export async function updateOnlyFansMedia(mediaData: any) {
  try {
    const res = await service.post('/api/onlyfans/media/update', mediaData);
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '更新媒体专辑失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to update OnlyFans media album:', error);
    ElMessage.error('更新媒体专辑请求失败');
    return { code: 1, msg: '更新媒体专辑请求失败' };
  }
}

/**
 * 删除 OnlyFans 媒体专辑
 * 对应后端 /api/onlyfans/media/delete 接口
 * @param id 媒体专辑ID
 */
export async function deleteOnlyFansMedia(id: number) {
  try {
    const res = await service.post('/api/onlyfans/media/delete', { id });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '删除媒体专辑失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to delete OnlyFans media album:', error);
    ElMessage.error('删除媒体专辑请求失败');
    return { code: 1, msg: '删除媒体专辑请求失败' };
  }
}

/**
 * 批量删除 OnlyFans 媒体专辑
 * 对应后端 /api/onlyfans/media/batchDelete 接口
 * @param ids 待删除的媒体专辑ID数组
 */
export async function batchDeleteOnlyFansMedia(ids: number[]) {
  try {
    const res = await service.post('/api/onlyfans/media/batchDelete', { ids });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '批量删除媒体专辑失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch delete OnlyFans media albums:', error);
    ElMessage.error('批量删除媒体专辑请求失败');
    return { code: 1, msg: '批量删除媒体专辑请求失败' };
  }
}

/**
 * 批量设置 OnlyFans 媒体专辑VIP状态
 * 对应后端 /api/onlyfans/media/batchSetVip 接口
 * @param ids 待设置的媒体专辑ID数组
 * @param isVip 是否为VIP (true/false)
 */
export async function batchSetOnlyFansMediaVip(ids: number[], isVip: boolean) {
  try {
    const res = await service.post('/api/onlyfans/media/batchSetVip', { ids, is_vip: isVip ? 1 : 0 });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '批量设置VIP失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch set OnlyFans media VIP status:', error);
    ElMessage.error('批量设置VIP请求失败');
    return { code: 1, msg: '批量设置VIP请求失败' };
  }
}

/**
 * 批量设置 OnlyFans 媒体专辑金币
 * 对应后端 /api/onlyfans/media/batchSetGold 接口
 * @param ids 待设置的媒体专辑ID数组
 * @param gold 金币数量
 */
export async function batchSetOnlyFansMediaGold(ids: number[], gold: number) {
  try {
    const res = await service.post('/api/onlyfans/media/batchSetGold', { ids, gold });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '批量设置金币失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch set OnlyFans media gold:', error);
    ElMessage.error('批量设置金币请求失败');
    return { code: 1, msg: '批量设置金币请求失败' };
  }
}

/**
 * 批量设置 OnlyFans 媒体专辑状态 (上架/下架)
 * 对应后端 /api/onlyfans/media/batchSetStatus 接口
 * @param ids 待设置的媒体专辑ID数组
 * @param status 状态 (1:上架, 0:下架)
 */
export async function batchSetOnlyFansMediaStatus(ids: number[], status: number) {
  try {
    const res = await service.post('/api/onlyfans/media/batchSetStatus', { ids, status });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '批量设置状态失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch set OnlyFans media status:', error);
    ElMessage.error('批量设置状态请求失败');
    return { code: 1, msg: '批量设置状态请求失败' };
  }
}

/**
 * 获取 OnlyFans 媒体专辑详情
 * 对应后端 /api/onlyfans/media/getById 接口
 * @param id 媒体专辑ID
 */
export async function fetchOnlyFansMediaDetail(id: number) {
  try {
    const res = await service.get(`/api/onlyfans/media/${id}`); // Assumes GET request for detail
    if (res.data.code === 0) {
      return res.data;
    } else {
      ElMessage.error(res.data.msg || '获取媒体专辑详情失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to fetch OnlyFans media detail:', error);
    ElMessage.error('获取媒体专辑详情请求失败');
    return { code: 1, msg: '获取媒体专辑详情请求失败' };
  }
}

/**
 * 批量更新媒体排序 (用于排序管理弹窗)
 * 对应后端 /api/onlyfans/media/updateSort 接口
 * @param list 包含 id 和 sort 字段的对象数组 [{ id: number, sort: number }, ...]
 */
export async function batchUpdateOnlyFansMediaSort(list: Array<{ id: number, sort: number }>) {
  try {
    const res = await service.post('/api/onlyfans/media/updateSort', { list });
    if (res.data.code === 0) {
      // 成功后由组件自行调用 fetchOnlyFansMedia 刷新
    } else {
      ElMessage.error(res.data.msg || '批量更新媒体排序失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch update OnlyFans media sort:', error);
    ElMessage.error('批量更新媒体排序请求失败');
    return { code: 1, msg: '批量更新媒体排序请求失败' };
  }
}
