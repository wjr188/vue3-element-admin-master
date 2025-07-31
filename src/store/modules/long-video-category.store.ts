// 文件路径: src/store/modules/long-video-category.store.ts

import { ref } from 'vue'
import service from '@/utils/request' // 确保这里导入的是你的 axios 封装实例
import { ElMessage } from 'element-plus' // ElMessage 可以保留，用于 store 内部的特殊提示，但通常全局拦截器处理即可

// 主分类、子分类、加载状态
export const parentCategories = ref<any[]>([])
export const childCategories = ref<any[]>([])
export const categoryLoading = ref(false)

/**
 * 获取长视频分类列表（主/子分类）
 * 官方接口 GET /api/long/categories/list
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function fetchCategoryList() {
  console.log('fetchCategoryList: 开始获取分类列表...');
  categoryLoading.value = true;
  try {
    const res = await service.get('/api/long/categories/list');
    // service.get 返回的 `res` 已经是后端返回的 `data` 业务数据，例如 { parents: [...], children: [...] }
    // 【关键调试点】请务必在这里查看 `res.children` 是否包含重复 ID
    console.log('fetchCategoryList: 从后端获取的原始 children 数据:', res.children);
    console.log('fetchCategoryList: 从后端获取的原始 parents 数据:', res.parents);  

    if (res && Array.isArray(res.parents) && Array.isArray(res.children)) {
      // 对 `childCategories` 和 `parentCategories` 进行去重处理，以防后端返回重复数据
      // 虽然最好的解决方案是后端保证数据唯一性，但前端可以作为一道防线
      const uniqueChildCategories = Array.from(new Map(res.children.map((item: any) => [item.id, item])).values());
      const uniqueParentCategories = Array.from(new Map(res.parents.map((item: any) => [item.id, item])).values());

      parentCategories.value = uniqueParentCategories || [];
      childCategories.value = uniqueChildCategories || [];
      console.log('fetchCategoryList: 分类列表数据更新成功。');
      return { success: true, message: '获取成功', data: res };
    } else {
      // 这种情况通常意味着后端返回的数据结构不符合预期，即使 code=0
      console.error('fetchCategoryList: 后端返回列表数据结构异常:', res);
      ElMessage.error('获取长视频分类数据结构异常。');
      return { success: false, message: '获取长视频分类数据结构异常' };
    }
  } catch (error: any) {
    parentCategories.value = [];
    childCategories.value = [];
    console.error('fetchCategoryList: 请求列表发生异常:', error);
    ElMessage.error(error.message || '请求长视频分类失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求长视频分类失败，请检查网络或后端服务。' };
  } finally {
    categoryLoading.value = false;
    console.log('fetchCategoryList: 获取分类列表结束。');
  }
}

/**
 * 新增分类（统一处理主分类和子分类的添加）
 * @param data 包含分类名称 (name), 父分类ID (parent_id), 排序 (sort), 状态 (status), 标签 (tags)
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function addCategory(data: { name: string; parent_id: number; sort?: number; status?: boolean | number; tags?: string[]; icon?: string }) {
  console.log('addCategory: 开始执行，传入数据:', data);
  try {
    let url = '';
    let requestData: any = { ...data };

    if (data.parent_id === 0) {
      url = '/api/long/categories/add-parent';
      if (!requestData.icon) requestData.icon = '';
      // 其它字段处理...
      if (requestData.hasOwnProperty('tags')) { delete requestData.tags; }
      if (requestData.hasOwnProperty('sort')) { delete requestData.sort; }
      if (requestData.hasOwnProperty('status')) { delete requestData.status; }
      console.log('addCategory: 识别为主分类，发送数据:', requestData);
    } else {
      url = '/api/long/categories/add-child';
      // 不要删除 icon 字段！！！
      console.log('addCategory: 识别为子分类，发送数据:', requestData);
    }

    const res = await service.post(url, requestData);
    console.log('addCategory: 从 request.ts 返回的业务数据:', res);

    // 成功后刷新列表
    await fetchCategoryList();
    console.log('addCategory: 新增成功，已刷新列表。');

    // 返回统一的成功格式，包含从后端获取的 id
    return { success: true, message: '新增分类成功', data: res };
  } catch (error: any) {
    console.error('addCategory: 请求新增分类发生异常:', error);
    ElMessage.error(error.message || '请求新增分类失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求新增分类失败，请检查网络或后端服务。' };
  }
}

/**
 * 更新分类（主/子分类通用）
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function updateCategory(data: any) {
  try {
    let requestData = { ...data };
    // 只有主分类才传icon字段，子分类不传
    if (requestData.parent_id === 0) {
      if (!requestData.icon) requestData.icon = '';
    } else {
      // 不要删除 icon 字段！！！
    }
    const res = await service.post('/api/long/categories/update', requestData);
    await fetchCategoryList();
    return { success: true, message: '编辑分类成功', data: res };
  } catch (error: any) {
    console.error('updateCategory: 请求更新分类发生异常:', error);
    ElMessage.error(error.message || '请求更新分类失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求更新分类失败，请检查网络或后端服务。' };
  }
}

/**
 * 删除分类（主/子分类通用）
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function deleteCategory(id: number) {
  try {
    const res = await service.post('/api/long/categories/delete', { id });
    await fetchCategoryList();
    return { success: true, message: '删除分类成功', data: res };
  } catch (error: any) {
    console.error('deleteCategory: 请求删除分类发生异常:', error);
    ElMessage.error(error.message || '请求删除分类失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求删除分类失败，请检查网络或后端服务。' };
  }
}

/**
 * 批量删除分类
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function batchDeleteCategory(ids: number[]) {
  try {
    const res = await service.post('/api/long/categories/batch-delete', { ids });
    await fetchCategoryList();
    return { success: true, message: '批量删除成功', data: res };
  } catch (error: any) {
    console.error('batchDeleteCategory: 请求批量删除发生异常:', error);
    ElMessage.error(error.message || '请求批量删除失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求批量删除失败，请检查网络或后端服务。' };
  }
}

/**
 * 更新子分类标签
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function updateChildTags(id: number, tags: string[]) {
  try {
    const res = await service.post('/api/long/categories/update-child-tags', { id, tags });
    await fetchCategoryList();
    return { success: true, message: '标签更新成功', data: res };
  } catch (error: any) {
    console.error('updateChildTags: 请求更新标签发生异常:', error);
    ElMessage.error(error.message || '请求更新标签失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求更新标签失败，请检查网络或后端服务。' };
  }
}

/**
 * 更新子分类排序
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function updateChildSort(id: number, sort: number) {
  try {
    const res = await service.post('/api/long/categories/update-child-sort', { id, sort });
    await fetchCategoryList();
    return { success: true, message: '子分类排序更新成功', data: res };
  } catch (error: any) {
    console.error('updateChildSort: 请求更新子分类排序发生异常:', error);
    ElMessage.error(error.message || '请求更新子分类排序失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求更新子分类排序失败，请检查网络或后端服务。' };
  }
}

/**
 * 更新主分类排序
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function updateParentSort(id: number, sort: number) {
  try {
    const res = await service.post('/api/long/categories/update-parent-sort', { id, sort });
    await fetchCategoryList();
    return { success: true, message: '主分类排序更新成功', data: res };
  } catch (error: any) {
    console.error('updateParentSort: 请求更新主分类排序发生异常:', error);
    ElMessage.error(error.message || '请求更新主分类排序失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求更新主分类排序失败，请检查网络或后端服务。' };
  }
}

/**
 * 批量保存排序
 * 返回值：{ success: true/false, message?: string, data?: any }
 */
export async function batchUpdateSort(list: { id: number; sort: number }[]) {
  try {
    const res = await service.post('/api/long/categories/batch-update-sort', { list });
    await fetchCategoryList();
    return { success: true, message: '批量排序保存成功', data: res };
  } catch (error: any) {
    console.error('batchUpdateSort: 请求批量排序保存发生异常:', error);
    ElMessage.error(error.message || '请求批量排序保存失败，请检查网络或后端服务。');
    return { success: false, message: error.message || '请求批量排序保存失败，请检查网络或后端服务。' };
  }
}