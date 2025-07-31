// src/store/channel.js (或者您如果使用 TypeScript 可能是 channel.ts)
import { defineStore } from 'pinia';
import {
  getChannelList,
  addChannel,
  updateChannel,
  deleteChannel as deleteChannelApi
} from '@/api/channel';
import { ElMessage, ElMessageBox } from 'element-plus';

export const useChannelStore = defineStore('channel', {
  state: () => ({
    channelList: [], // 渠道列表数据
    channelTotal: 0, // 渠道总数
    channelLoading: false, // 渠道列表加载状态

    // 筛选条件 (用于渠道管理页面自身的查询)
    channelFilter: {
      channel_name: '',
      channel_domain: '',
      status: null, // 假设有状态筛选
      page: 1,
      page_size: 10,
    },

    // 新增/编辑渠道的表单及弹窗状态
    dialogVisible: false, // 控制弹窗显示隐藏
    dialogType: 'add', // 'add' 或 'edit'
    currentChannel: {
      channel_id: null, // 编辑时使用
      channel_name: '',
      channel_domain: '',
      status: 1, // 默认启用，1: 启用, 0: 禁用
      // 根据您的实际需求添加更多字段
      // contact_person: '',
      // contact_phone: '',
    },
    isSubmitting: false, // 表单提交加载状态
  }),

  actions: {
    // 设置筛选条件
    setChannelFilter(filter) {
      Object.assign(this.channelFilter, filter);
    },

    // 获取渠道列表
    async fetchChannelList() {
      console.log('fetchChannelList 被调用了');
      const response = await getChannelList(this.channelFilter);
      console.log('接口原始返回：', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data.list:', response.data?.data?.list);
      // 兼容 AxiosResponse 和直接返回对象
      const data = response.data ? response.data : response;
      this.channelList = Array.isArray(data.data?.list) ? data.data.list : [];
      this.channelTotal = data.data?.total || 0;
      console.log('赋值后 channelList:', this.channelList);
    },

    // 新增渠道
    async addChannel() {
      this.isSubmitting = true;
      try {
        const response = await addChannel(this.currentChannel);
        if (response && response.code === 200) {
          ElMessage.success('渠道添加成功！');
          this.dialogVisible = false; // 关闭弹窗
          this.resetCurrentChannel(); // 重置表单
          this.fetchChannelList(); // 刷新列表
          return true;
        } else {
          ElMessage.error(response.message || '渠道添加失败！');
          return false;
        }
      } catch (error) {
        console.error('API请求失败 (addChannel):', error);
        ElMessage.error('网络请求失败，请稍后再试');
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    // 更新渠道
    async updateChannel(payload) {
      this.isSubmitting = true;
      try {
        const data = payload || this.currentChannel;
        const response = await updateChannel(data);
        // 兼容 axios 和直接返回
        const res = response?.data ? response.data : response;
        if (res.code === 200) {
          ElMessage.success(res.message || '渠道更新成功！');
          this.dialogVisible = false;
          this.resetCurrentChannel();
          await this.fetchChannelList();
          return true;
        } else {
          ElMessage.error(res.message || '渠道更新失败！');
          return false;
        }
      } catch (error) {
        ElMessage.error('网络请求失败，请稍后再试');
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    // 删除渠道
    async deleteChannel(channel_id) {
      try {
        await ElMessageBox.confirm('此操作将永久删除该渠道, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        if (!channel_id) {
          ElMessage.error('缺少渠道ID，无法删除！');
          return false;
        }
        const response = await deleteChannelApi(channel_id);
        if (response && response.code === 200) {
          ElMessage.success('渠道删除成功！');
          this.fetchChannelList(); // 刷新列表
          return true;
        } else {
          ElMessage.error(response.message || '渠道删除失败！');
          return false;
        }
      } catch (error) {
        if (error === 'cancel') {
          ElMessage.info('已取消删除');
        } else {
          console.error('API请求失败 (deleteChannel):', error);
          ElMessage.error('网络请求失败，请稍后再试');
        }
        return false;
      }
    },

    // 设置当前编辑/新增渠道的表单数据
    setCurrentChannel(data) {
      console.log('setCurrentChannel:', data);
      Object.assign(this.currentChannel, data);
    },

    // 重置当前渠道表单数据 (用于弹窗关闭或新增后)
    resetCurrentChannel() {
      this.currentChannel = {
        channel_id: null,
        channel_name: '',
        channel_domain: '',
        status: 1,
      }
    },

    // 重置筛选条件
    resetChannelFilter() {
      this.channelFilter = this.$reset().channelFilter;
    },
  },
});