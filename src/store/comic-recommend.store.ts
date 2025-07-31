import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  getComicRecommendGroups,
  addComicRecommendGroup,
  updateComicRecommendGroup,
  deleteComicRecommendGroup,
  sortComicRecommendGroups,
  getComicGroupComics,
  saveComicGroupComics,
  getComicParentCategories,
  getComicChildCategories,
  getAllComics,
} from '../api/comicRecommend.api';

interface GroupFilter {
  keyword: string;
}
interface GroupPagination {
  currentPage: number;
  pageSize: number;
  total: number;
}
interface ComicListParams {
  keyword?: string;
  parentId?: string | number;
  categoryId?: string | number;
  currentPage?: number;
  pageSize?: number;
}

// -------- 工具函数 --------
function extractListAndTotal(res: any): { list: any[], total: number } {
  if (Array.isArray(res?.data?.data?.list)) {
    return { list: res.data.data.list, total: res.data.data.total ?? res.data.data.list.length };
  }
  if (Array.isArray(res?.data?.list)) {
    return { list: res.data.list, total: res.data.total ?? res.data.list.length };
  }
  if (Array.isArray(res?.data)) {
    return { list: res.data, total: res.data.length };
  }
  if (Array.isArray(res)) {
    return { list: res, total: res.length };
  }
  return { list: [], total: 0 };
}
function extractCodeMsg(res: any): { code: number; msg: string } {
  return {
    code: res.code ?? res.data?.code ?? -1,
    msg: res.msg ?? res.data?.msg ?? ''
  }
}

// ----------------------------

export const useComicRecommendStore = defineStore('comicRecommend', {
  state: () => ({
    recommendGroups: [] as any[],
    groupComicCounts: {} as Record<number, number>,
    allParentCategories: [] as any[],
    allChildCategories: [] as any[],
    loading: false,
    groupFilter: { keyword: '' } as GroupFilter,
    groupPagination: { currentPage: 1, pageSize: 10, total: 0 } as GroupPagination,
  }),
  getters: {
    getParentsForFilter: (state) => state.allParentCategories,
    getAllChildCategories: (state) => state.allChildCategories,
    getChildrenByParentId: (state) => (parentId: number | string) => {
      const pId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
      if (isNaN(pId)) return [];
      return state.allChildCategories.filter((cat) => cat.parent_id === pId);
    },
  },
  actions: {
    // 推荐分组管理
    async fetchRecommendGroups() {
  this.loading = true;
  try {
    const res = await getComicRecommendGroups(this.groupFilter);
    // 只要不是业务异常（如 code 非0），都正常处理
    if (res?.code === 0 || res?.data?.code === 0) {
      const { list, total } = extractListAndTotal(res);
      this.recommendGroups = list;
      this.groupPagination.total = total;
    } else {
      // 业务异常才弹错误（如接口返回 code:1）
      ElMessage.error(res?.msg || '获取推荐分组失败');
      this.recommendGroups = [];
      this.groupPagination.total = 0;
    }
  } catch (e: any) {
    // 真正的异常（比如断网、500）
    this.recommendGroups = [];
    this.groupPagination.total = 0;
    ElMessage.error(e?.message || '获取推荐分组失败');
  } finally {
    this.loading = false;
  }
},

    async addRecommendGroup(data: { name: string; sort: number; category_id?: number, layout_type?: string, icon?: string }) {
      try {
        const res = await addComicRecommendGroup(data);
        const { code, msg } = extractCodeMsg(res);
        if (code === 0) {
          ElMessage.success('添加分组成功');
          await this.fetchRecommendGroups();
        } else {
          ElMessage.error(msg || '添加失败');
        }
        return { code, msg };
      } catch (e: any) {
        ElMessage.error(e?.message || '添加失败');
        return { code: -1, msg: e?.message || '添加失败' };
      }
    },
    async updateRecommendGroup(id: number, data: { name?: string; sort?: number; category_id?: number, layout_type?: string, icon?: string }) {
      try {
        const res = await updateComicRecommendGroup(id, data);
        const { code, msg } = extractCodeMsg(res);
        if (code === 0) {
          ElMessage.success('修改分组成功');
          await this.fetchRecommendGroups();
        } else {
          ElMessage.error(msg || '修改失败');
        }
        return { code, msg };
      } catch (e: any) {
        ElMessage.error(e?.message || '修改失败');
        return { code: -1, msg: e?.message || '修改失败' };
      }
    },
    async deleteRecommendGroup(id: number) {
      try {
        const res = await deleteComicRecommendGroup(id);
        const { code, msg } = extractCodeMsg(res);
        if (code === 0) {
          ElMessage.success('删除成功');
          await this.fetchRecommendGroups();
        } else {
          ElMessage.error(msg || '删除失败');
        }
        return { code, msg };
      } catch (e: any) {
        ElMessage.error(e?.message || '删除失败');
        return { code: -1, msg: e?.message || '删除失败' };
      }
    },
    async saveGroupSort(data: { id: number; sort: number }[]) {
  try {
    // !!! 这里要包一层 { data }
    const res = await sortComicRecommendGroups({ data });
    const { code, msg } = extractCodeMsg(res);
    if (code === 0) {
      ElMessage.success('保存排序成功');
      await this.fetchRecommendGroups();
      return true;
    } else {
      ElMessage.error(msg || '保存排序失败');
      return false;
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '保存排序失败');
    return false;
  }
},

    // 分组下漫画管理（中间表）
    async fetchComicsForGroup(groupId: number) {
      try {
        const res = await getComicGroupComics(groupId);
        const { list } = extractListAndTotal(res);
        return list;
      } catch (e: any) {
        ElMessage.error(e?.message || '获取分组漫画失败');
        return [];
      }
    },
    async saveComicsForGroup(groupId: number, comics: { comic_id: number; sort: number }[]) {
      try {
        const res = await saveComicGroupComics(groupId, comics);
        const { code, msg } = extractCodeMsg(res);
        if (code === 0) {
          ElMessage.success('保存推荐成功');
          await this.fetchRecommendGroups();
          return { code, msg };
        } else {
          ElMessage.error(msg || '保存推荐失败');
          return { code, msg };
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '保存推荐失败');
        return { code: -1, msg: e?.message || '保存推荐失败' };
      }
    },

    // 分类管理
    async fetchAllParentCategories() {
      try {
        const res = await getComicParentCategories();
        const { list } = extractListAndTotal(res);
        this.allParentCategories = list;
      } catch (e: any) {
        this.allParentCategories = [];
        ElMessage.error(e?.message || '获取主分类失败');
      }
    },
    async fetchAllChildCategories() {
      try {
        const res = await getComicChildCategories();
        const { list } = extractListAndTotal(res);
        this.allChildCategories = list;
      } catch (e: any) {
        this.allChildCategories = [];
        ElMessage.error(e?.message || '获取子分类失败');
      }
    },

    // 所有漫画列表（主表）
    async fetchAllComics(params: ComicListParams) {
      try {
        const res = await getAllComics(params);
        const { list, total } = extractListAndTotal(res);
        return { list, total };
      } catch (e: any) {
        ElMessage.error(e?.message || '获取漫画失败');
        return { list: [], total: 0 };
      }
    },

    setGroupFilter(filter: Partial<GroupFilter>) {
      this.groupFilter = { ...this.groupFilter, ...filter };
      this.groupPagination.currentPage = 1;
    },

    async fetchComicsForGroupAndSave(groupId: number) {
      const list = await this.fetchComicsForGroup(groupId);
      const index = this.recommendGroups.findIndex(g => g.id === groupId);
      if (index !== -1) {
        this.recommendGroups[index] = {
          ...this.recommendGroups[index],
          comics: list,
        };
      }
      return list;
    },
  },
});
