// src/store/user.store.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import {
  getUserList,
  createUser,
  updateUser, 
  deleteUser,
  resetPassword,
  changePassword
} from '@/api/user.api';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    userList: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    filterKeyword: '',
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    currentUserId: (state) => state.currentUser?.id || null,
  },

  actions: {
    // 获取用户列表
    async fetchUserList() {
      this.loading = true;
      try {
        const res = await getUserList({
          page: this.pagination.current,
          pageSize: this.pagination.pageSize,
          keyword: this.filterKeyword,
        });

        if (res && res.data) {
          this.userList = Array.isArray(res.data.list) ? res.data.list : [];
          this.pagination.total = res.data.total || 0;
        } else {
          this.userList = [];
          this.pagination.total = 0;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.userList = [];
      } finally {
        this.loading = false;
      }
    },

    // 设置筛选关键词
    setFilterKeyword(keyword) {
      this.filterKeyword = keyword;
      this.pagination.current = 1; // 重置页码
      this.fetchUserList();
    },

    // 设置页码
    setPage(page) {
      this.pagination.current = page;
      this.fetchUserList();
    },

    // 设置每页条数
    setPageSize(size) {
      this.pagination.pageSize = size;
      this.pagination.current = 1; // 重置页码
      this.fetchUserList();
    },

    // 创建用户
    async createUser(userData) {
      try {
        const res = await createUser(userData);
        if (res && res.code === 0) {
          ElMessage.success('创建成功');
          this.fetchUserList();
          return true;
        } else {
          ElMessage.error(res?.msg || '创建失败');
          return false;
        }
      } catch (error) {
        console.error('创建用户失败:', error);
        ElMessage.error('创建用户失败');
        return false;
      }
    },
    
    // 编辑用户
    async editUser(userData) {
      try {
        const res = await updateUser(userData);
        if (res && res.code === 0) {
          ElMessage.success('保存成功');
          this.fetchUserList();
          return true;
        } else {
          ElMessage.error(res?.msg || '保存失败');
          return false;
        }
      } catch (error) {
        console.error('编辑用户失败:', error);
        ElMessage.error('编辑用户失败');
        return false;
      }
    },
    
    // 删除用户
    async deleteUser(id) {
      try {
        const res = await deleteUser(id);
        if (res && res.code === 0) {
          ElMessage.success('删除成功');
          this.fetchUserList();
          return true;
        } else {
          ElMessage.error(res?.msg || '删除失败');
          return false;
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        ElMessage.error('删除用户失败');
        return false;
      }
    },
    
    // 重置用户密码
    async resetPassword(userId, newPassword) {
      try {
        const res = await resetPassword(userId, newPassword);
        if (res && res.code === 0) {
          ElMessage.success('密码重置成功');
          return true;
        } else {
          ElMessage.error(res?.msg || '密码重置失败');
          return false;
        }
      } catch (error) {
        console.error('重置密码失败:', error);
        ElMessage.error('重置密码失败');
        return false;
      }
    },
    
    // 修改自己的密码
    async changePassword(oldPassword, newPassword) {
      try {
        const res = await changePassword({ old_password: oldPassword, new_password: newPassword });
        if (res && res.code === 0) {
          ElMessage.success('密码修改成功');
          return true;
        } else {
          ElMessage.error(res?.msg || '密码修改失败');
          return false;
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败');
        return false;
      }
    }
  }
});