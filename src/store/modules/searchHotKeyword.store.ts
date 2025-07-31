import { defineStore } from "pinia";
import {
  fetchSearchHotKeywords,
  addSearchHotKeyword,
  updateSearchHotKeyword,
  deleteSearchHotKeyword,
  sortSearchHotKeywords,
  SearchHotKeyword
} from "@/api/searchHotKeyword.api";

export const useSearchHotKeywordStore = defineStore("searchHotKeyword", {
  state: () => ({
    list: [] as SearchHotKeyword[],
    loading: false
  }),
  actions: {
    async getList(type?: string) {
      this.loading = true;
      try {
        const res = await fetchSearchHotKeywords({ type });
        this.list = res.data?.data?.list || [];
      } finally {
        this.loading = false;
      }
    },
    async add(keyword: Omit<SearchHotKeyword, "id">) {
      await addSearchHotKeyword(keyword);
      await this.getList(keyword.type);
    },
    async update(keyword: SearchHotKeyword) {
      await updateSearchHotKeyword(keyword);
      await this.getList(keyword.type);
    },
    async remove(id: number, type = "all") {
      await deleteSearchHotKeyword(id);
      await this.getList(type);
    },
    async sort(sortList: Array<{ id: number; sort: number }>, type = "all") {
      await sortSearchHotKeywords(sortList);
      await this.getList(type);
    }
  }
});
