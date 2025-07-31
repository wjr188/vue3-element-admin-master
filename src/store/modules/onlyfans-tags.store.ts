// File path: src/store/modules/onlyfans-tags.store.ts
import { ref } from 'vue';
import service from '@/utils/request'; // Assume your request utility is here
import { ElMessage } from 'element-plus';

// --- State ---
// 所有标签列表
export const onlyfansTags = ref<any[]>([]);
// 标签加载状态
export const onlyfansTagLoading = ref(false);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取 OnlyFans 标签列表
 * 对应后端 /api/onlyfans/tag/list 接口
 */
export async function fetchOnlyFansTags(params?: any) {
  onlyfansTagLoading.value = true;
  try {
    const res = await service.get('/api/onlyfans/tag/list', { params });
    if (res.data.code === 0) {
      onlyfansTags.value = res.data.data.list || [];
    } else {
      ElMessage.error(res.data.msg || '获取标签列表失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to fetch OnlyFans tags:', error);
    ElMessage.error('获取标签列表请求失败');
    return { code: 1, msg: '获取标签列表请求失败' };
  } finally {
    onlyfansTagLoading.value = false;
  }
}

/**
 * 新增 OnlyFans 标签
 * 对应后端 /api/onlyfans/tag/add 接口
 * @param tagData 新增标签的数据 { name: string }
 */
export async function addOnlyFansTag(tagData: { name: string }) {
  try {
    const res = await service.post('/api/onlyfans/tag/add', tagData);
    if (res.data.code === 0) {
      await fetchOnlyFansTags(); // 成功后刷新列表以更新UI
    } else {
      ElMessage.error(res.data.msg || '新增标签失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to add OnlyFans tag:', error);
    ElMessage.error('新增标签请求失败');
    return { code: 1, msg: '新增标签请求失败' };
  }
}

/**
 * 更新 OnlyFans 标签
 * 对应后端 /api/onlyfans/tag/update 接口
 * @param tagData 更新标签的数据 { id: number, name: string }
 */
export async function updateOnlyFansTag(tagData: { id: number; name: string }) {
  try {
    const res = await service.post('/api/onlyfans/tag/update', tagData);
    if (res.data.code === 0) {
      await fetchOnlyFansTags(); // 成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '更新标签失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to update OnlyFans tag:', error);
    ElMessage.error('更新标签请求失败');
    return { code: 1, msg: '更新标签请求失败' };
  }
}

/**
 * 删除 OnlyFans 标签
 * 对应后端 /api/onlyfans/tag/delete 接口
 * @param id 标签ID
 */
export async function deleteOnlyFansTag(id: number) {
  try {
    const res = await service.post('/api/onlyfans/tag/delete', { id });
    if (res.data.code === 0) {
      await fetchOnlyFansTags(); // 成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '删除标签失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to delete OnlyFans tag:', error);
    ElMessage.error('删除标签请求失败');
    return { code: 1, msg: '删除标签请求失败' };
  }
}

/**
 * 批量删除 OnlyFans 标签
 * 对应后端 /api/onlyfans/tag/batchDelete 接口
 * @param ids 待删除的标签ID数组
 */
export async function batchDeleteOnlyFansTags(ids: number[]) {
  try {
    const res = await service.post('/api/onlyfans/tag/batchDelete', { ids });
    if (res.data.code === 0) {
      await fetchOnlyFansTags(); // 成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '批量删除标签失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch delete OnlyFans tags:', error);
    ElMessage.error('批量删除标签请求失败');
    return { code: 1, msg: '批量删除标签请求失败' };
  }
}

/**
 * 批量禁用/启用 OnlyFans 标签
 * 对应后端 /api/onlyfans/tag/batchSetStatus 接口 (假设有此接口，原weimi是batchDisable)
 * @param ids 待操作的标签ID数组
 * @param status 设置的状态 (0:禁用, 1:启用)
 */
export async function batchSetOnlyFansTagStatus(ids: number[], status: number) {
  try {
    // 假设后端批量禁用/启用接口为 batchSetStatus
    const res = await service.post('/api/onlyfans/tag/batchSetStatus', { ids, status });
    if (res.data.code === 0) {
      await fetchOnlyFansTags(); // 成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '批量设置标签状态失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch set OnlyFans tag status:', error);
    ElMessage.error('批量设置标签状态请求失败');
    return { code: 1, msg: '批量设置标签状态请求失败' };
  }
}
