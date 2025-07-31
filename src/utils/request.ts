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
    // 🔴 修复模板字符串
    console.groupCollapsed(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log("请求参数:", config.params || config.data);
    
    const accessToken = getAccessToken();
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;  // 🔴 修复这里
      console.log("携带认证令牌:", accessToken);
    } else {
      delete config.headers.Authorization;
      console.log("未携带认证令牌");
    }
    
    console.groupEnd();
    return config;
  },
  (error) => {
    // 🔴 添加请求错误日志
    console.error("[Request] 请求拦截器错误:", {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 🔴 修复模板字符串
    console.groupCollapsed(`[Response] ${response.status} ${response.config.url}`);
    console.log("HTTP 状态:", response.status, response.statusText);
    
    if (response.config.responseType === "blob") {
      console.log("二进制响应，跳过业务处理");
      console.groupEnd();
      return response;
    }
    
    const { code, data, msg } = response.data;
    console.log("业务状态码:", code);
    console.log("业务消息:", msg);
    
    if (code === ResultEnum.SUCCESS) {
      console.log("业务处理成功，返回数据");
      console.groupEnd();
      return data;
    } else {
      // 只抛出错误，不弹窗
      // ElMessage.error(msg || "系统出错"); // 注释或删除
      return Promise.reject(new Error(msg || "Error"));
    }
  },
  async (error) => {
    // 🔴 修复模板字符串
    console.groupCollapsed(`[Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error("错误类型:", error.constructor.name);
    console.error("错误消息:", error.message);
    
    if (error.response) {
      console.error("HTTP 状态码:", error.response.status);
      console.error("响应头:", error.response.headers);
      console.error("响应数据:", error.response.data);
      
      const { code, msg } = error.response.data || {};
      console.log("业务错误码:", code);
      console.log("业务消息:", msg);
    } else if (error.request) {
      console.error("请求对象:", error.request);
      console.error("请求配置:", error.config);
    }
    
    console.error("错误堆栈:", error.stack);
    console.groupEnd();
    
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
        // ElMessage.error(msg || "请求失败，系统出错"); // 注释或删除
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
  // 🔴 修复模板字符串
  console.groupCollapsed("[Token Refresh] 处理 Token 刷新");
  console.log("刷新队列长度:", waitingQueue.length);
  
  return new Promise((resolve) => {
    const retryRequest = () => {
      console.log("重试请求:", config.url);
      if (config.headers) {
        config.headers.Authorization = `Bearer ${getAccessToken()}`;  // 🔴 修复这里
      }
      resolve(service(config));
    };
    waitingQueue.push(retryRequest);

    if (!isRefreshing) {
      isRefreshing = true;
      console.log("开始刷新 Token...");
      useUserStoreHook()
        .refreshToken()
        .then(() => {
          console.log("Token 刷新成功");
          console.log("执行等待队列中的请求:", waitingQueue.length);
          waitingQueue.forEach((callback) => callback());
          waitingQueue.length = 0;
        })
        .catch(async (error) => {
          console.error("刷新 Token 失败:", error);
          await handleSessionExpired();
        })
        .finally(() => {
          isRefreshing = false;
          console.log("Token 刷新流程结束");
        });
    } else {
      console.log("已有 Token 刷新进行中，加入等待队列");
    }
    console.groupEnd();
  });
}

async function handleSessionExpired() {
  // 🔴 添加会话过期日志
  console.groupCollapsed("[Session] 处理会话过期");
  console.log("清除用户会话和缓存");
  
  ElNotification({
    title: "提示",
    message: "您的会话已过期，请重新登录",
    type: "info",
  });
  
  await useUserStoreHook().clearSessionAndCache();
  console.log("跳转到登录页");
  router.push("/login");
  console.groupEnd();
}

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 分页 API 响应类型
export interface ApiListResponse<T = any> {
  code: number;
  data: {
    list: T[];
    total: number;
  };
  msg: string;
}