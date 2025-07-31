// File path: src/store/modules/text-novel-category.store.ts
import { ref } from 'vue';
import simpleService from '@/utils/request-new';
import { ElMessage } from 'element-plus';

// --- State ---
// 小说主分类列表 (parent_id = 0)
export const novelMainCategories = ref<any[]>([]);
// 小说子分类列表 (parent_id != 0)
export const novelSubCategories = ref<any[]>([]);
// 分类列表加载状态
export const novelCategoryLoading = ref(false);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取小说分类列表
 * 对应后端 /api/text_novel_category/list 接口
 * @param params 搜索参数 (keyword, parentId, status)
 */
export async function fetchNovelCategories(params?: any) {
  novelCategoryLoading.value = true;
  try {
    const res = await simpleService.get('/api/text_novel_category/list', { params });
    if (res && res.data && res.data.code === 0) {
      novelMainCategories.value = res.data.data.mainCategories || [];
      novelSubCategories.value = res.data.data.subCategories || [];
    } else {
      ElMessage.error(res?.data?.msg || '获取小说分类失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to fetch novel categories:', error);
    ElMessage.error('获取小说分类请求失败');
    return { code: 1, msg: '获取小说分类请求失败' };
  } finally {
    novelCategoryLoading.value = false;
  }
}

/**
 * 新增小说分类
 * 对应后端 /api/text_novel_category/add 接口
 * @param categoryData 分类数据 { name: string, parent_id?: number, sort?: number, status?: number }
 */
export async function addNovelCategory(categoryData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_category/add', categoryData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('新增分类成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '新增分类失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to add novel category:', error);
    ElMessage.error('新增分类请求失败');
    return { code: 1, msg: '新增分类请求失败' };
  }
}

/**
 * 更新小说分类
 * 对应后端 /api/text_novel_category/update 接口
 * @param categoryData 分类数据 { id: number, name: string, parent_id?: number, sort?: number, status?: number }
 */
export async function updateNovelCategory(categoryData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_category/update', categoryData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('更新分类成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '更新分类失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to update novel category:', error);
    ElMessage.error('更新分类请求失败');
    return { code: 1, msg: '更新分类请求失败' };
  }
}

/**
 * 删除小说分类
 * 对应后端 /api/text_novel_category/delete 接口
 * @param id 分类ID
 */
export async function deleteNovelCategory(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel_category/delete', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('删除分类成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '删除分类失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to delete novel category:', error);
    ElMessage.error('删除分类请求失败');
    return { code: 1, msg: '删除分类请求失败' };
  }
}

/**
 * 批量删除小说分类
 * 对应后端 /api/text_novel_category/batchDelete 接口
 * @param ids 分类ID数组
 */
export async function batchDeleteNovelCategories(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel_category/batchDelete', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量删除分类成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '批量删除分类失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch delete novel categories:', error);
    ElMessage.error('批量删除分类请求失败');
    return { code: 1, msg: '批量删除分类请求失败' };
  }
}

/**
 * 切换小说分类状态 (启用/禁用)
 * 对应后端 /api/text_novel_category/toggleStatus 接口
 * @param id 分类ID
 */
export async function toggleNovelCategoryStatus(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel_category/toggleStatus', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('分类状态切换成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '分类状态切换失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to toggle novel category status:', error);
    ElMessage.error('分类状态切换请求失败');
    return { code: 1, msg: '分类状态切换请求失败' };
  }
}

/**
 * 批量设置小说分类状态
 * 对应后端 /api/text_novel_category/batchSetStatus 接口
 * @param ids 分类ID数组
 * @param status 状态值 (0: 禁用, 1: 启用)
 */
export async function batchSetNovelCategoryStatus(ids: number[], status: number) {
  try {
    const res = await simpleService.post('/api/text_novel_category/batchSetStatus', { ids, status });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量设置分类状态成功！');
      await fetchNovelCategories(); // 刷新列表
    } else {
      ElMessage.error(res?.data?.msg || '批量设置分类状态失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch set novel category status:', error);
    ElMessage.error('批量设置分类状态请求失败');
    return { code: 1, msg: '批量设置分类状态请求失败' };
  }
}
