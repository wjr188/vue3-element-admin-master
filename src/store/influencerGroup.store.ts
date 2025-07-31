import { defineStore } from 'pinia'
import {
  getInfluencerGroups,
  getInfluencerList,
  createInfluencerGroup,
  createInfluencer,
  updateInfluencerGroup, // 新增
  deleteInfluencerGroup, // 新增
} from '@/api/influencerGroup.api'

export const useInfluencerGroupStore = defineStore('influencerGroup', {
  state: () => ({
    groupList: [] as { id: number; name: string }[],
    influencerList: [] as any[],
    loading: false,
    total: 0,
    currentGroupId: '' as string, // 当前选中的分组ID，空字符串表示“全部”
    searchKeyword: '', // 搜索关键词
  }),
  actions: {
    async fetchGroupList() {
      try {
        const res = await getInfluencerGroups()
        console.log('分组接口返回：', res)
        if (res.data.code === 0) {
          this.groupList = res.data.data?.list || []
          this.total = res.data.data?.total || 0
        } else {
          console.error('获取分组列表失败:', res.data.msg, res)
          this.groupList = []
          this.total = 0
        }
        return this.groupList
      } catch (error) {
        console.error('请求分组列表出错:', error)
        this.groupList = []
        this.total = 0
      }
    },
    async fetchInfluencerList() {
      this.loading = true
      try {
        const params: any = {
          keyword: this.searchKeyword,
        }
        if (this.currentGroupId) {
          params.group_id = this.currentGroupId
        }
        const res = await getInfluencerList(params)
        if (res.data.code === 0) {
          this.influencerList = res.data.data?.list || []
          this.total = res.data.data?.total || 0
        } else {
          console.error('获取博主列表失败:', res.data.msg)
          this.influencerList = []
          this.total = 0
        }
        return res
      } catch (error) {
        console.error('请求博主列表出错:', error)
        this.influencerList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    async addGroup(data: { name: string }) {
      return await createInfluencerGroup(data)
    },
    async updateGroup(id: number, data: { name: string }) {
      return await updateInfluencerGroup(id, data)
    },
    async deleteGroup(id: number) {
      return await deleteInfluencerGroup(id)
    },
    async addInfluencer(data: any) {
      return await createInfluencer(data)
    },
    setSearchKeyword(keyword: string) {
      this.searchKeyword = keyword
    },
    setCurrentGroupId(groupId: string) {
      this.currentGroupId = groupId
    },
  },
})
