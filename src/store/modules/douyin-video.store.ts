// 文件路径: src/store/modules/douyin-video.store.ts

import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

// 短视频数据类型
export interface DouyinVideo {
  id: number;
  title: string;
  cover_url: string; // 视频的封面图片URL，与数据库 cover_url 字段一致
  url: string; // 视频的通用URL地址
  parent_id: number;
  category_id: number;
  tags?: string[];
  // **关键修改：将 'preview' 改为 'preview_duration'，与数据库字段名完全一致**
  preview_duration: string; // 试看时长字段，与数据库 preview_duration 字段一致
  gold: number;
  is_vip: number;
  status: string;
  play: number;
  collect: number;
  upload_time: string;
  m3u8?: string; // 保留 m3u8 字段，用于兼容旧数据，后端可能仍然返回
  // 其他字段可扩展
}

// 响应式数据
export const douyinVideos = ref<DouyinVideo[]>([]);
export const douyinVideoTotal = ref(0);
export const douyinVideoLoading = ref(false);

/**
 * 获取抖音短视频列表
 */
export async function fetchVideoList(params: any = {}) {
  douyinVideoLoading.value = true;
  try {
    const res = await service.get('/api/douyin/videos/list', { params });
    if (res) {
      douyinVideos.value = res.list || [];
      douyinVideoTotal.value = res.total || 0;
    } else {
      douyinVideos.value = [];
      douyinVideoTotal.value = 0;
      console.error('获取抖音视频列表失败: 未返回有效数据');
      ElMessage.error('获取抖音视频列表失败: 未返回有效数据');
    }
    return res;
  } catch (error: any) {
    douyinVideos.value = [];
    douyinVideoTotal.value = 0;
    console.error('请求抖音视频列表失败:', error);
    throw error;
  } finally {
    douyinVideoLoading.value = false;
  }
}

/**
 * 新增抖音短视频
 */
export async function addVideo(data: any) {
  try {
    // 这里 data 会根据 DouyinVideo 接口进行类型推断，
    // 所以确保传入 data 的对象属性名是 cover_url 和 preview_duration
    const res = await service.post('/api/douyin/videos/add', data);
    if (res) {
      await fetchVideoList();
      ElMessage.success('新增抖音视频成功');
      return res;
    } else {
      ElMessage.error('新增抖音视频失败: 未返回有效数据');
      throw new Error('新增抖音视频失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求新增抖音视频失败:', error);
    throw error;
  }
}

/**
 * 编辑抖音短视频
 */
export async function updateVideo(data: any) {
  try {
    const res = await service.post('/api/douyin/videos/update', data);
    if (res) {
      await fetchVideoList();
      ElMessage.success('编辑抖音视频成功');
      return res;
    } else {
      ElMessage.error('编辑抖音视频失败: 未返回有效数据');
      throw new Error('编辑抖音视频失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求编辑抖音视频失败:', error);
    throw error;
  }
}

/**
 * 删除抖音短视频（单个）
 */
export async function deleteVideo(id: number) {
  try {
    const res = await service.post('/api/douyin/videos/delete', { id });
    if (res) {
      await fetchVideoList();
      ElMessage.success('删除抖音视频成功');
      return res;
    } else {
      ElMessage.error('删除抖音视频失败: 未返回有效数据');
      throw new Error('删除抖音视频失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求删除抖音视频失败:', error);
    throw error;
  }
}

/**
 * 批量删除抖音短视频
 */
export async function batchDeleteVideos(ids: number[]) {
  try {
    const res = await service.post('/api/douyin/videos/batch-delete', { ids });
    if (res) {
      await fetchVideoList();
      ElMessage.success('批量删除抖音视频成功');
      return res;
    } else {
      ElMessage.error('批量删除抖音视频失败: 未返回有效数据');
      throw new Error('批量删除抖音视频失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求批量删除抖音视频失败:', error);
    throw error;
  }
}

/**
 * 批量设置VIP
 */
export async function batchSetVip(ids: number[], isVip: boolean = true) {
  try {
    const res = await service.post('/api/douyin/videos/batch-set-vip', { ids, is_vip: isVip ? 1 : 0 });
    if (res) {
      await fetchVideoList();
      ElMessage.success('批量设置VIP成功');
      return res;
    } else {
      ElMessage.error('批量设置VIP失败: 未返回有效数据');
      throw new Error('批量设置VIP失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求批量设置VIP失败:', error);
    throw error;
  }
}

/**
 * 批量设置试看时长
 * @param ids 视频ID数组
 * @param preview_duration 试看时长 (string 类型，例如 "15秒")
 */
export async function batchSetDuration(ids: number[], preview_duration: string) {
  try {
    // 确保这里发送给后端的字段名是后端期望的 'preview'，如果后端接口需要 'preview'
    // 而数据库字段是 'preview_duration'，那么这里需要做映射。
    // 但是，更推荐后端接口也统一为 preview_duration。
    // 假设后端接口 /api/douyin/videos/batch-set-preview 接收的参数名为 'preview'，
    // 那么这里保持发送 'preview' 是正确的。
    const res = await service.post('/api/douyin/videos/batch-set-preview', { ids, preview: preview_duration });
    if (res) {
      await fetchVideoList();
      ElMessage.success('批量设置试看时长成功');
      return res;
    } else {
      ElMessage.error('批量设置试看时长失败: 未返回有效数据');
      throw new Error('批量设置试看时长失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求批量设置试看时长失败:', error);
    throw error;
  }
}

/**
 * 批量设置金币
 */
export async function batchSetGold(ids: number[], gold: number) {
  try {
    const res = await service.post('/api/douyin/videos/batch-set-gold', { ids, gold });
    if (res) {
      await fetchVideoList();
      ElMessage.success('批量设置金币成功');
      return res;
    } else {
      ElMessage.error('批量设置金币失败: 未返回有效数据');
      throw new Error('批量设置金币失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求批量设置金币失败:', error);
    throw error;
  }
}

/**
 * 获取单个视频详情
 */
export async function fetchVideoDetail(id: number) {
  try {
    const res = await service.get(`/api/douyin/videos/${id}`);
    if (res) {
      return res;
    } else {
      ElMessage.error('获取抖音视频详情失败: 未返回有效数据');
      throw new Error('获取抖音视频详情失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求抖音视频详情失败:', error);
    throw error;
  }
}

/**
 * 批量升序置顶（让勾选视频在子分类内sort最小）
 * @param ids 选中视频ID数组
 */
export async function batchSortAsc(ids: number[]) {
  try {
    const res = await service.post('/api/douyin/videos/batch-sort-asc', { ids });
    if (res) {
      await fetchVideoList(); // 排序后刷新表格
      ElMessage.success('批量升序置顶成功');
      return res;
    } else {
      ElMessage.error('批量升序置顶失败: 未返回有效数据');
      throw new Error('批量升序置顶失败: 未返回有效数据');
    }
  } catch (error: any) {
    console.error('请求批量升序置顶失败:', error);
    throw error;
  }
}