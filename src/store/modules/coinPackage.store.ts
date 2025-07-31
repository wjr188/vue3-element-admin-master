// src/store/modules/coinPackage.store.ts
import { defineStore } from 'pinia'
import {
  fetchCoinPackageList,
  addCoinPackage,
  updateCoinPackage,
  deleteCoinPackage,
  changeCoinPackageStatus
} from '@/api/coin-package'

export const useCoinPackageStore = defineStore('coinPackage', {
  state: () => ({
    packageList: [] as any[],
    packageTotal: 0,
    packageLoading: false,
    errorMsg: '',
    pagination: {
      page: 1,
      pageSize: 10,
    }
  }),

  actions: {
    // 获取套餐列表
    async fetchList(params: any = {}) {
      this.packageLoading = true
      try {
        const { page, pageSize } = { ...this.pagination, ...params }
        const res = await fetchCoinPackageList({ page, pageSize, ...params })
        this.packageList = res.list || []
        this.packageTotal = res.total || 0
        this.errorMsg = ''
        return res
      } catch (err: any) {
        this.packageList = []
        this.packageTotal = 0
        this.errorMsg = err.message || '加载失败'
        return null
      } finally {
        this.packageLoading = false
      }
    },

    // 新增套餐
    async add(data: any) {
      try {
        const res = await addCoinPackage(data)
        await this.fetchList()
        return res
      } catch (err: any) {
        this.errorMsg = err.message || '新增失败'
        return null
      }
    },

    // 更新套餐
    async update(data: any) {
      try {
        const res = await updateCoinPackage(data)
        await this.fetchList()
        return res
      } catch (err: any) {
        this.errorMsg = err.message || '更新失败'
        return null
      }
    },

    // 删除套餐（支持单个/批量，传数组或数字）
    async remove(ids: number[] | number) {
      try {
        const res = await deleteCoinPackage(ids)
        await this.fetchList()
        return res
      } catch (err: any) {
        this.errorMsg = err.message || '删除失败'
        return null
      }
    },

    // 上下架（支持批量）
    async changeStatus(ids: number[] | number, status: number) {
      try {
        const res = await changeCoinPackageStatus(ids, status)
        await this.fetchList()
        return res
      } catch (err: any) {
        this.errorMsg = err.message || '操作失败'
        return null
      }
    },

    // 支持分页控制
    setPage(page: number) {
      this.pagination.page = page
      this.fetchList()
    },
    setPageSize(pageSize: number) {
      this.pagination.pageSize = pageSize
      this.fetchList()
    }
  }
})
