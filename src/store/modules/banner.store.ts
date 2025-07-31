import { ref } from 'vue';
import service from '@/utils/request'; // 假设您的请求工具在此路径

// 响应式状态
export const banners = ref([]);
export const totalBanners = ref(0);
export const loading = ref(false);

/**
 * 获取轮播广告列表
 * @param {object} params - 查询参数 (e.g., { page: 1, pageSize: 10 })
 */
export async function fetchBannerList(params = { page: 1, pageSize: 10 }) {
  loading.value = true;
  try {
    const res = await service.get('/api/banner/list', { params });
    // 假设后端返回的数据结构是 { list: [], total: 0 }
    if (res && Array.isArray(res.list) && typeof res.total === 'number') {
      banners.value = res.list;
      totalBanners.value = res.total;
      return { success: true, message: '获取广告列表成功' };
    } else {
      console.error('fetchBannerList: 后端返回数据结构异常或空:', res);
      return { success: false, message: '获取广告列表失败: 数据格式异常' };
    }
  } catch (error) {
    console.error('fetchBannerList: 请求广告列表失败:', error);
    return { success: false, message: `获取广告列表失败: ${error.message}` };
  } finally {
    loading.value = false;
  }
}

/**
 * 新增轮播广告
 * @param {object} data - 广告数据
 */
export async function addBanner(data) {
  try {
    const res = await service.post('/api/banner/add', data);
    if (res && res.id) { // 假设成功新增后会返回新广告的ID
      return { success: true, message: '新增广告成功', id: res.id };
    } else {
      console.error('addBanner: 后端返回新增数据异常:', res);
      return { success: false, message: '新增广告失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('addBanner: 请求新增广告失败:', error);
    return { success: false, message: `新增广告失败: ${error.message}` };
  }
}

/**
 * 更新轮播广告
 * @param {object} data - 广告数据 (包含ID)
 */
export async function updateBanner(data) {
  try {
    const res = await service.post('/api/banner/update', data);
    if (res) { // 假设成功更新后返回非空结果
      return { success: true, message: '更新广告成功' };
    } else {
      console.error('updateBanner: 后端返回更新数据异常:', res);
      return { success: false, message: '更新广告失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('updateBanner: 请求更新广告失败:', error);
    return { success: false, message: `更新广告失败: ${error.message}` };
  }
}

/**
 * 删除轮播广告
 * @param {number} id - 广告ID
 */
export async function deleteBanner(id) {
  try {
    const res = await service.post('/api/banner/delete', { id });
    if (res) { // 假设成功删除后返回非空结果
      return { success: true, message: '删除广告成功' };
    } else {
      console.error('deleteBanner: 后端返回删除数据异常:', res);
      return { success: false, message: '删除广告失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('deleteBanner: 请求删除广告失败:', error);
    return { success: false, message: `删除广告失败: ${error.message}` };
  }
}

/**
 * 上传广告图片
 * @param {File} file - 文件对象
 */
export async function uploadBannerImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file); // 'file' 应该与后端期望的字段名匹配

    const res = await service.post('/api/banner/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // 假设后端上传成功后返回 { url: '...' }
    if (res && res.url) {
      return { success: true, message: '图片上传成功', url: res.url };
    } else {
      console.error('uploadBannerImage: 后端返回上传数据异常:', res);
      return { success: false, message: '图片上传失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('uploadBannerImage: 请求上传图片失败:', error);
    return { success: false, message: `图片上传失败: ${error.message}` };
  }
}

/**
 * 更新广告状态
 * @param {number} id - 广告ID
 * @param {number} status - 新状态 (0: 禁用, 1: 启用)
 */
export async function updateBannerStatus(id, status) {
  try {
    const res = await service.post('/api/banner/update', { id, status });
    if (res) {
      return { success: true, message: '状态更新成功' };
    } else {
      console.error('updateBannerStatus: 后端返回状态更新数据异常:', res);
      return { success: false, message: '状态更新失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('updateBannerStatus: 请求更新状态失败:', error);
    return { success: false, message: `状态更新失败: ${error.message}` };
  }
}

/**
 * 更新广告排序
 * @param {number} id - 广告ID
 * @param {number} sort_order - 新的排序号
 */
export async function updateBannerSort(id, sort_order) {
  try {
    const res = await service.post('/api/banner/update', { id, sort_order });
    if (res) {
      return { success: true, message: '排序更新成功' };
    } else {
      console.error('updateBannerSort: 后端返回排序更新数据异常:', res);
      return { success: false, message: '排序更新失败: 后端返回异常' };
    }
  } catch (error) {
    console.error('updateBannerSort: 请求更新排序失败:', error);
    return { success: false, message: `排序更新失败: ${error.message}` };
  }
}
