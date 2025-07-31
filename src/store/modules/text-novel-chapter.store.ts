// File path: src/store/modules/text-novel-chapter.store.ts
import { ref } from 'vue';
import simpleService from '@/utils/request-new';
import { ElMessage } from 'element-plus';

// --- State ---
// 章节列表数据
export const chapterList = ref<any[]>([]);
// 章节总数
export const chapterTotal = ref(0);
// 章节列表加载状态
export const chapterLoading = ref(false);

// --- Actions (Functions to modify state or interact with API) ---

/**
 * 获取小说章节列表
 * 对应后端 /api/text_novel_chapter/list 接口
 * @param params 搜索和分页参数 (novelId, page, pageSize)
 */
export async function fetchNovelChapters(params: any) {
  chapterLoading.value = true;
  try {
    const res = await simpleService.get('/api/text_novel_chapter/list', { params });
    console.log('章节接口返回', res); // 日志方便排查
    if (res?.data?.code === 0) {
      chapterList.value = res.data.data.list || [];
      chapterTotal.value = res.data.data.total || 0;
    } else {
      ElMessage.error(res?.data?.msg || '获取章节失败');
    }
    return res?.data || { code: 1, msg: 'fail' }; // 统一返回格式
  } catch (e) {
    ElMessage.error('网络异常');
    return { code: 1, msg: '网络异常' };
  } finally {
    chapterLoading.value = false;
  }
}

/**
 * 获取小说章节详情
 * 对应后端 /api/text_novel_chapter/{id} 接口
 * @param id 章节ID
 */
export async function fetchNovelChapterDetail(id: number) {
  try {
    const res = await simpleService.get(`/api/text_novel_chapter/${id}`);
    if (res && res.data && res.data.code === 0) {
      return res.data;
    } else {
      ElMessage.error(res?.data?.msg || '获取章节详情失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to fetch novel chapter detail:', error);
    ElMessage.error('获取章节详情请求失败');
    return { code: 1, msg: '获取章节详情请求失败' };
  }
}

/**
 * 新增小说章节
 * 对应后端 /api/text_novel_chapter/add 接口
 * @param chapterData 章节数据
 */
export async function addNovelChapter(chapterData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_chapter/add', chapterData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('新增章节成功！');
    } else {
      ElMessage.error(res?.data?.msg || '新增章节失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to add novel chapter:', error);
    ElMessage.error('新增章节请求失败');
    return { code: 1, msg: '新增章节请求失败' };
  }
}

/**
 * 更新小说章节
 * 对应后端 /api/text_novel_chapter/update 接口
 * @param chapterData 章节数据
 */
export async function updateNovelChapter(chapterData: any) {
  try {
    const res = await simpleService.post('/api/text_novel_chapter/update', chapterData);
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('更新章节成功！');
    } else {
      ElMessage.error(res?.data?.msg || '更新章节失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to update novel chapter:', error);
    ElMessage.error('更新章节请求失败');
    return { code: 1, msg: '更新章节请求失败' };
  }
}

/**
 * 删除小说章节
 * 对应后端 /api/text_novel_chapter/delete 接口
 * @param id 章节ID
 */
export async function deleteNovelChapter(id: number) {
  try {
    const res = await simpleService.post('/api/text_novel_chapter/delete', { id });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('删除章节成功！');
    } else {
      ElMessage.error(res?.data?.msg || '删除章节失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to delete novel chapter:', error);
    ElMessage.error('删除章节请求失败');
    return { code: 1, msg: '删除章节请求失败' };
  }
}

/**
 * 批量删除小说章节
 * 对应后端 /api/text_novel_chapter/batchDelete 接口
 * @param ids 章节ID数组
 */
export async function batchDeleteNovelChapters(ids: number[]) {
  try {
    const res = await simpleService.post('/api/text_novel_chapter/batchDelete', { ids });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('批量删除章节成功！');
    } else {
      ElMessage.error(res?.data?.msg || '批量删除章节失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch delete novel chapters:', error);
    ElMessage.error('批量删除章节请求失败');
    return { code: 1, msg: '批量删除章节请求失败' };
  }
}

/**
 * 批量更新小说章节排序
 * 对应后端 /api/text_novel_chapter/batchUpdateOrder 接口
 * @param chapters 包含 id 和 chapter_order 的对象数组 [{ id: number, chapter_order: number }, ...]
 */
export async function batchUpdateNovelChapterOrder(chapters: Array<{ id: number, chapter_order: number }>) {
  try {
    const res = await simpleService.post('/api/text_novel_chapter/batchUpdateOrder', { chapters });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('章节排序更新成功！');
    } else {
      ElMessage.error(res?.data?.msg || '章节排序更新失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('Failed to batch update novel chapter order:', error);
    ElMessage.error('章节排序更新请求失败');
    return { code: 1, msg: '章节排序更新请求失败' };
  }
  
}
/**
 * 设为免费接口调用
 * 对应后端 /api/text_novel_chapter/setFree 接口
 * @param chapterIds 章节ID数组
 */
export async function setFree(chapterIds: number[]) {
  if (!chapterIds || chapterIds.length === 0) {
    ElMessage.warning('请选择要设为免费的章节');
    return { code: 1, msg: '章节ID不能为空' };
  }
  try {
    const res = await simpleService.post('/api/text_novel_chapter/setFree', { ids: chapterIds });
    if (res && res.data && res.data.code === 0) {
      ElMessage.success('设为免费成功');
    } else {
      ElMessage.error(res?.data?.msg || '设为免费失败');
    }
    return res?.data || { code: 1, msg: 'fail' };
  } catch (error) {
    console.error('设为免费请求失败:', error);
    ElMessage.error('设为免费请求失败');
    return { code: 1, msg: '设为免费请求失败' };
  }
}