// src/utils/request.ts
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import { getAccessToken } from "@/utils/auth";
import router from "@/router";
import { ElMessage, ElNotification } from "element-plus";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 关键修复
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.responseType === "blob") {
      return response;
    }
    
    const res = response.data;
    
    // 扩展成功状态码判断：200 和 0 都视为成功
    if (res.code === ResultEnum.SUCCESS || res.code === 0) {
      // 返回完整响应体
      return res;
    } else {
      // 特殊处理：如果消息包含"成功"，不显示错误
      if (res.msg && res.msg.includes("成功")) {
        return res; // 直接返回响应，不视为错误
      }
      
      ElMessage.error(res.msg || "系统出错");
      return Promise.reject(new Error(res.msg || "Error"));
    }
  },
  async (error) => {
    console.error("请求错误：", error);
    const { config, response } = error;
    if (response) {
      const { code, msg } = response.data;
      if (code === ResultEnum.ACCESS_TOKEN_INVALID) {
        ElMessage.warning(msg || "Token 已过期，尝试刷新 Token");
        return handleTokenRefresh(config);
      } else if (code === ResultEnum.REFRESH_TOKEN_INVALID) {
        await handleSessionExpired();
        return Promise.reject(new Error(msg || "刷新Token失效，请重新登录"));
      } else {
        // 特殊处理：如果消息包含"成功"，不显示错误
        if (msg && msg.includes("成功")) {
          return response.data; // 直接返回响应，不视为错误
        }
        
        ElMessage.error(msg || "请求失败，系统出错");
      }
    } else {
      if (axios.isCancel(error)) {
        console.warn('请求已被取消:', error.message);
      } else if (error.message === 'Network Error') {
        ElMessage.error("网络连接失败，请检查您的网络！");
      } else if (error.message.includes('timeout')) {
        ElMessage.error("请求超时，请稍后再试！");
      } else {
        ElMessage.error("请求发生未知错误：" + error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default service;

let isRefreshing = false;
const waitingQueue: Array<() => void> = [];

async function handleTokenRefresh(config: InternalAxiosRequestConfig) {
  return new Promise((resolve) => {
    const retryRequest = () => {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${getAccessToken()}`;
      }
      resolve(service(config));
    };
    waitingQueue.push(retryRequest);

    if (!isRefreshing) {
      isRefreshing = true;
      useUserStoreHook()
        .refreshToken()
        .then(() => {
          waitingQueue.forEach((callback) => callback());
          waitingQueue.length = 0;
        })
        .catch(async (error) => {
          console.error("刷新 Token 失败:", error);
          await handleSessionExpired();
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
  });
}

async function handleSessionExpired() {
  ElNotification({
    title: "提示",
    message: "您的会话已过期，请重新登录",
    type: "info",
  });
  await useUserStoreHook().clearSessionAndCache();
  router.push("/login");
}

// 定义通用接口类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

export interface ApiListResponse<T = any> {
  code: number;
  data: {
    list: T[];
    total: number;
    [key: string]: any; // 允许其他分页字段
  };
  msg: string;
}

export async function getRecommendGroups(params) {
  const res = await axios.get('/api/api/recommend/groups', { params });
  return res.data;
}

export async function getAllParentCategories() {
  const res = await service.get<ApiListResponse<Category>>("/api/categories/parents");
  // 如果只返回了 data.list 结构，包一层
  if (res.list && res.total !== undefined) {
    return { code: 200, msg: 'ok', data: res };
  }
  // 否则直接返回
  return res;
}