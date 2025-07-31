import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  fetchAudioNovelCategoriesAPI,
  addAudioNovelCategoryAPI,
  updateAudioNovelCategoryAPI,
  deleteAudioNovelCategoryAPI,
  batchDeleteAudioNovelCategoriesAPI,
  batchSetAudioNovelCategoryStatusAPI
} from '@/api/audio-novel-category.api';

export const useAudioNovelCategoryStore = defineStore('audioNovelCategory', {
  state: () => ({
    mainCategories: [] as any[],
    subCategories: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const res = await fetchAudioNovelCategoriesAPI();
        if (res.data.code === 0) {
          this.mainCategories = res.data.data.mainCategories || res.data.data || [];
          this.subCategories = res.data.data.subCategories || [];
        } else {
          ElMessage.error(res.data.msg || '获取有声小说分类列表失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('获取有声小说分类列表请求失败');
        return { code: 1, msg: '获取有声小说分类列表请求失败' };
      } finally {
        this.loading = false;
      }
    },
    async addCategory(data: any) {
      try {
        const res = await addAudioNovelCategoryAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('新增分类成功！');
          await this.fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '新增分类失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('新增分类请求失败');
        return { code: 1, msg: '新增分类请求失败' };
      }
    },
    async updateCategory(data: any) {
      try {
        const res = await updateAudioNovelCategoryAPI(data);
        if (res.data.code === 0) {
          ElMessage.success('更新分类成功！');
          await this.fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '更新分类失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('更新分类请求失败');
        return { code: 1, msg: '更新分类请求失败' };
      }
    },
    async deleteCategory(id: number) {
      try {
        const res = await deleteAudioNovelCategoryAPI(id);
        if (res.data.code === 0) {
          ElMessage.success('删除分类成功！');
          await this.fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '删除分类失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('删除分类请求失败');
        return { code: 1, msg: '删除分类请求失败' };
      }
    },
    async batchDeleteCategories(ids: number[]) {
      try {
        const res = await batchDeleteAudioNovelCategoriesAPI(ids);
        if (res.data.code === 0) {
          ElMessage.success('批量删除成功！');
          await this.fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '批量删除分类失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('批量删除分类请求失败');
        return { code: 1, msg: '批量删除分类请求失败' };
      }
    },
    async batchSetStatus(ids: number[], status: number) {
      try {
        const res = await batchSetAudioNovelCategoryStatusAPI(ids, status);
        if (res.data.code === 0) {
          ElMessage.success('批量设置分类状态成功！');
          await this.fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '批量设置分类状态失败');
        }
        return res.data;
      } catch (error) {
        ElMessage.error('批量设置分类状态请求失败');
        return { code: 1, msg: '批量设置分类状态请求失败' };
      }
    }
  }
});