import { defineStore } from 'pinia';
import {
  fetchInfluencerList,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  batchDeleteInfluencers,
  fetchCountryOptions,
  fetchTagOptions,
  fetchGroupOptions // 新增
} from '@/api/influencer';

export const useInfluencerStore = defineStore('influencer', {
  state: () => ({
    influencerList: [],
    loading: false,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
    },
    countryOptions: [],
    tagOptions: [],
    groupOptions: [], // 新增
  }),
  actions: {
    async getList(params = {}) {
      this.loading = true;
      try {
        const page = params.currentPage || params.page || this.pagination.currentPage;
        const pageSize = params.pageSize || this.pagination.pageSize;
        const finalParams = { ...params, page, pageSize };
        console.log('[store] fetchInfluencerList params:', finalParams);
        const res = await fetchInfluencerList(finalParams);
        console.log('[store] fetchInfluencerList result:', res);
        this.influencerList = (res && res.data && res.data.data && Array.isArray(res.data.data.list))
          ? res.data.data.list.map(item => ({
              ...item,
              tags: item.tags
                ? (Array.isArray(item.tags)
                    ? item.tags
                    : (typeof item.tags === 'string' && item.tags !== ''
                        ? item.tags.split(',').map(Number)
                        : []))
                : []
            }))
          : [];
        this.pagination.total = res && res.data && res.data.data && res.data.data.total ? res.data.data.total : 0;
      } finally {
        this.loading = false;
      }
    },
    async create(data) {
      await createInfluencer(data);
      await this.getList();
    },
    async update(data) {
      await updateInfluencer(data); // 只传对象
      await this.getList();
    },
    async remove(data) {
      await deleteInfluencer(data); // 只传对象
      await this.getList();
    },
    async batchRemove(data) {
      await batchDeleteInfluencers(data); // 只传对象
      await this.getList();
    },
    async getCountryOptions() {
      try {
        const res = await fetchCountryOptions();
        console.log('fetchCountryOptions 返回：', res);
        if (Array.isArray(res)) {
          this.countryOptions = res;
        } else if (res && Array.isArray(res.data)) {
          this.countryOptions = res.data;
        } else if (res && Array.isArray(res.data?.list)) {
          this.countryOptions = res.data.list;
        } else if (res && Array.isArray(res.data?.data)) {
          // 适配你的接口结构
          this.countryOptions = res.data.data;
        } else if (typeof res === 'string') {
          try {
            const arr = JSON.parse(res);
            this.countryOptions = Array.isArray(arr) ? arr : [];
          } catch {
            this.countryOptions = [];
          }
        } else {
          this.countryOptions = [];
        }
      } catch (e) {
        this.countryOptions = [];
      }
    },
    async getTagOptions() {
      const res = await fetchTagOptions();
      this.tagOptions = res.data.list;
    },
    async getGroupOptions() {
      try {
        const res = await fetchGroupOptions();
        console.log('fetchGroupOptions 返回：', res);
        // 适配你的接口结构
        if (Array.isArray(res)) {
          this.groupOptions = res;
        } else if (res && Array.isArray(res.data)) {
          this.groupOptions = res.data;
        } else if (res && Array.isArray(res.data?.list)) {
          this.groupOptions = res.data.list;
        } else if (res && Array.isArray(res.data?.data)) {
          this.groupOptions = res.data.data;
        } else if (res && res.data && res.data.data && Array.isArray(res.data.data.list)) {
          this.groupOptions = res.data.data.list;
        } else {
          this.groupOptions = [];
        }
        console.log('最终 groupOptions:', this.groupOptions);
      } catch (e) {
        this.groupOptions = [];
      }
    }
  }
});
