// File path: src/store/modules/onlyfans-categories.store.ts
import { ref } from 'vue';
import service from '@/utils/request'; // Assume your request utility is here
import { ElMessage } from 'element-plus';

// --- State ---
// 所有内容系列 (原主分类)
export const onlyfansParentCategories = ref<any[]>([]);
// 所有内容合集 (原子分类)
export const onlyfansChildCategories = ref<any[]>([]);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取 OnlyFans 内容系列和内容合集列表
 * 对应后端 /api/onlyfans/category/list 接口
 * 该接口同时返回 series 和 collections
 */
export async function fetchOnlyFansCategories() {
  try {
    const res = await service.get('/api/onlyfans/category/list');
    if (res.data.code === 0) {
      onlyfansParentCategories.value = res.data.data.series || [];
      onlyfansChildCategories.value = res.data.data.collections || [];
    } else {
      ElMessage.error(res.data.msg || '获取分类列表失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to fetch OnlyFans categories:', error);
    ElMessage.error('获取分类列表请求失败');
    return { code: 1, msg: '获取分类列表请求失败' };
  }
}

/**
 * 新增 OnlyFans 分类 (内容系列或内容合集)
 * 对应后端 /api/onlyfans/category/add 接口
 * @param categoryData 分类数据 { name: string, parent_id: number (0 for series), creator_id: number, tags?: string[], sort?: number, status?: number }
 */
export async function addOnlyFansCategory(categoryData: any) {
  try {
    const res = await service.post('/api/onlyfans/category/add', categoryData);
    if (res.data.code === 0) {
      await fetchOnlyFansCategories(); // Refresh all categories after adding
    } else {
      ElMessage.error(res.data.msg || '新增分类失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to add OnlyFans category:', error);
    ElMessage.error('新增分类请求失败');
    return { code: 1, msg: '新增分类请求失败' };
  }
}

/**
 * 更新 OnlyFans 分类 (内容系列或内容合集)
 * 对应后端 /api/onlyfans/category/update 接口
 * @param categoryData 分类数据 { id: number, name: string, parent_id: number, creator_id: number, tags?: string[], sort?: number, status?: number }
 */
export async function updateOnlyFansCategory(categoryData: any) {
  try {
    const res = await service.post('/api/onlyfans/category/update', categoryData);
    if (res.data.code === 0) {
      await fetchOnlyFansCategories(); // Refresh all categories after updating
    } else {
      ElMessage.error(res.data.msg || '更新分类失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to update OnlyFans category:', error);
    ElMessage.error('更新分类请求失败');
    return { code: 1, msg: '更新分类请求失败' };
  }
}

/**
 * 删除 OnlyFans 分类 (内容系列或内容合集)
 * 对应后端 /api/onlyfans/category/delete 接口
 * @param id 分类ID
 */
export async function deleteOnlyFansCategory(id: number) {
  try {
    const res = await service.post('/api/onlyfans/category/delete', { id });
    if (res.data.code === 0) {
      await fetchOnlyFansCategories(); // Refresh all categories after deleting
    } else {
      ElMessage.error(res.data.msg || '删除分类失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to delete OnlyFans category:', error);
    ElMessage.error('删除分类请求失败');
    return { code: 1, msg: '删除分类请求失败' };
  }
}

/**
 * 批量删除 OnlyFans 内容合集
 * 对应后端 /api/onlyfans/category/batchDelete 接口
 * @param ids 待删除的内容合集ID数组
 */
export async function batchDeleteOnlyFansCategories(ids: number[]) {
  try {
    const res = await service.post('/api/onlyfans/category/batchDelete', { ids });
    if (res.data.code === 0) {
      await fetchOnlyFansCategories(); // Refresh all categories after batch deletion
    } else {
      ElMessage.error(res.data.msg || '批量删除分类失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch delete OnlyFans categories:', error);
    ElMessage.error('批量删除分类请求失败');
    return { code: 1, msg: '批量删除分类请求失败' };
  }
}

/**
 * 批量更新 OnlyFans 内容合集排序
 * 对应后端 /api/onlyfans/category/batchUpdateSort 接口
 * @param list 包含 id 和 sort 字段的对象数组 [{ id: number, sort: number }, ...]
 */
export async function batchUpdateOnlyFansCategorySort(list: Array<{ id: number, sort: number }>) {
  try {
    const res = await service.post('/api/onlyfans/category/batchUpdateSort', { list });
    if (res.data.code === 0) {
      await fetchOnlyFansCategories(); // Refresh all categories after sort update
    } else {
      ElMessage.error(res.data.msg || '批量更新排序失败');
    }
    return res.data;
  } catch (error) {
    console.error('Failed to batch update OnlyFans category sort:', error);
    ElMessage.error('批量更新排序请求失败');
    return { code: 1, msg: '批量更新排序请求失败' };
  }
}
