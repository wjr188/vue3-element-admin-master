// File path: src/store/modules/text-novel-tag.store.ts
import { ref } from 'vue';
import simpleService from '@/utils/request-new';
import { ElMessage } from 'element-plus';

// --- State ---
// 小说标签列表
export const novelTagList = ref<any[]>([]);
// 标签加载状态
export const novelTagLoading = ref(false);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取小说标签列表
 * 对应后端 /api/text_novel_tag/list 接口
 * @param params 搜索参数 (keyword, status)
 */
export async function fetchNovelTags(params?: any) {
  novelTagLoading.value = true;
  try {
    const res = await simpleService.get('/api/text_novel_tag/list', { params });
    if (res && res.data && res.data.code === 0) {
      novelTagList.value = res.data.data.list || [];
    } else {
      ElMessage.error(res?.data?.msg || '获取小说标签失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to fetch novel tags:', error);
    ElMessage.error('获取小说标签请求失败');
    return { code: 1, msg: '获取小说标签请求失败' };
  } finally {
    novelTagLoading.value = false;
  }
}

/**
 * 新增小说标签
 * 对应后端 /api/text_novel_tag/add 接口
 * @param tagData 标签数据 { name: string, sort?: number, status?: number }
 */
export async function addNovelTag(tagData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/add', tagData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('新增标签成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '新增标签失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to add novel tag:', error);
    ElMessage.error('新增标签请求失败');
    return { code: 1, msg: '新增标签请求失败' };
  }
}

/**
 * 更新小说标签
 * 对应后端 /api/text_novel_tag/update 接口
 * @param tagData 标签数据 { id: number, name: string, sort?: number, status?: number }
 */
export async function updateNovelTag(tagData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/update', tagData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('更新标签成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '更新标签失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to update novel tag:', error);
    ElMessage.error('更新标签请求失败');
    return { code: 1, msg: '更新标签请求失败' };
  }
}

/**
 * 删除小说标签
 * 对应后端 /api/text_novel_tag/delete 接口
 * @param id 标签ID
 */
export async function deleteNovelTag(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/delete', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('删除标签成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '删除标签失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to delete novel tag:', error);
    ElMessage.error('删除标签请求失败');
    return { code: 1, msg: '删除标签请求失败' };
  }
}

/**
 * 批量删除小说标签
 * 对应后端 /api/text_novel_tag/batchDelete 接口
 * @param ids 标签ID数组
 */
export async function batchDeleteNovelTags(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/batchDelete', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量删除标签成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '批量删除标签失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch delete novel tags:', error);
    ElMessage.error('批量删除标签请求失败');
    return { code: 1, msg: '批量删除标签请求失败' };
  }
}

/**
 * 切换小说标签状态 (启用/禁用)
 * 对应后端 /api/text_novel_tag/toggleStatus 接口
 * @param id 标签ID
 */
export async function toggleNovelTagStatus(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/toggleStatus', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('标签状态切换成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '标签状态切换失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to toggle novel tag status:', error);
    ElMessage.error('标签状态切换请求失败');
    return { code: 1, msg: '标签状态切换请求失败' };
  }
}

/**
 * 批量设置小说标签状态
 * 对应后端 /api/text_novel_tag/batchSetStatus 接口
 * @param ids 标签ID数组
 * @param status 状态值 (0: 禁用, 1: 启用)
 */
export async function batchSetNovelTagStatus(ids: number[], status: number) {
  try {
    const res = await simpleService.post('/api/text_novel_tag/batchSetStatus', { ids, status });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置标签状态成功！');
      await fetchNovelTags(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '批量设置标签状态失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel tag status:', error);
    ElMessage.error('批量设置标签状态请求失败');
    return { code: 1, msg: '批量设置标签状态请求失败' };
  }
}
