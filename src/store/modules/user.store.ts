import { store } from "@/store";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { useDictStoreHook } from "@/store/modules/dict.store";

import * as UserAPI from "@/api/user.api";
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  changePassword,
  getAllPermissions,
  type UserItem,
  type CreateUserParams,
  type EditUserParams,
  type LoginParams, // 用 user.api.ts 里的类型
} from "@/api/user.api";

import { setAccessToken, setRefreshToken, getRefreshToken, clearToken } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<any>({});

  // 账号列表
  const userList = ref<UserItem[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const filterKeyword = ref("");

  // 权限树
  const allPermissions = ref<any[]>([]);

  // 当前登录用户信息
  const currentUser = ref<UserItem | null>(null);
  const currentUserId = computed(() => currentUser.value?.id ?? null);
  const isAdmin = computed(() => currentUser.value?.role === "admin");

  /**
   * 登录
   */
  function login(loginParams: LoginParams) {
    return new Promise<void>((resolve, reject) => {
      UserAPI.login(loginParams)
        .then((res) => {
          if (res.code === 0) {
            const { accessToken, refreshToken } = res.data;
            setAccessToken(accessToken);      // 这里必须用 accessToken
            setRefreshToken && refreshToken && setRefreshToken(refreshToken); // 可选
            resolve();
          } else {
            reject(res.msg || "登录失败");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 获取用户信息
   */
  function getUserInfo() {
    return new Promise<any>((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          Object.assign(userInfo.value, { ...data });
          currentUser.value = data;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 获取账号列表
  async function fetchUserList() {
    loading.value = true;
    try {
      const res = await getUserList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: filterKeyword.value,
      });
      if (res.code === 0) {
        userList.value = res.data.list;
        pagination.total = res.data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  // 设置分页
  function setPage(page: number) {
    pagination.current = page;
    fetchUserList();
  }
  function setPageSize(size: number) {
    pagination.pageSize = size;
    pagination.current = 1;
    fetchUserList();
  }

  // 设置搜索关键词
  function setFilterKeyword(keyword: string) {
    filterKeyword.value = keyword;
    pagination.current = 1;
    fetchUserList();
  }

  // 新建账号
  async function createUserAction(data: CreateUserParams) {
    const res = await createUser(data);
    if (res.code === 0) {
      fetchUserList();
      ElMessage.success("新建账号成功");
      return true;
    }
    ElMessage.error(res.msg || "新建账号失败");
    return false;
  }

  // 编辑账号
  async function editUser(data: EditUserParams) {
    const res = await updateUser(data);
    if (res.code === 0) {
      fetchUserList();
      ElMessage.success("编辑账号成功");
      return true;
    }
    ElMessage.error(res.msg || "编辑账号失败");
    return false;
  }

  // 删除账号
  async function deleteUserAction(id: number) {
    const res = await deleteUser(id);
    if (res.code === 0) {
      fetchUserList();
      ElMessage.success("删除账号成功");
      return true;
    }
    ElMessage.error(res.msg || "删除账号失败");
    return false;
  }

  // 重置账号密码
  async function resetPasswordAction(id: number, password: string) {
    const res = await resetPassword(id, password);
    if (res.code === 0) {
      ElMessage.success("重置密码成功");
      return true;
    }
    ElMessage.error(res.msg || "重置密码失败");
    return false;
  }

  // 修改自己密码
  async function changePasswordAction(old_password: string, new_password: string) {
    const res = await changePassword({ old_password, new_password });
    if (res.code === 0) {
      ElMessage.success("修改密码成功");
      return true;
    }
    ElMessage.error(res.msg || "修改密码失败");
    return false;
  }

  // 获取所有权限点
  async function fetchAllPermissions() {
    const res = await getAllPermissions();
    if (res.code === 0) {
      allPermissions.value = res.data;
    } else {
      allPermissions.value = [];
    }
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      UserAPI.logout()
        .then((res) => {
          clearSessionAndCache();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 刷新 token
   */
  function refreshToken() {
    const refreshTokenValue = getRefreshToken();
    return new Promise<void>((resolve, reject) => {
      UserAPI.refreshToken(refreshTokenValue)
        .then((res) => {
          if (res.code === 0) {
            const { accessToken, refreshToken } = res.data;
            setAccessToken(accessToken);      // 这里改成 accessToken
            setRefreshToken && refreshToken && setRefreshToken(refreshToken); // 可选
            resolve();
          } else {
            reject(res.msg || "刷新token失败");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 清除用户会话和缓存
   */
  function clearSessionAndCache() {
    return new Promise<void>((resolve) => {
      clearToken();
      usePermissionStoreHook().resetRouter();
      useDictStoreHook().clearDictCache();
      userInfo.value = {};
      resolve();
    });
  }

  return {
    userInfo,
    getUserInfo,
    login,
    logout,
    clearSessionAndCache,
    refreshToken,
    userList,
    loading,
    pagination,
    filterKeyword,
    allPermissions,
    currentUser,
    currentUserId,
    isAdmin,
    fetchUserList,
    setPage,
    setPageSize,
    setFilterKeyword,
    createUser: createUserAction,
    editUser,
    deleteUser: deleteUserAction,
    resetPassword: resetPasswordAction,
    changePassword: changePasswordAction,
    fetchAllPermissions,
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
