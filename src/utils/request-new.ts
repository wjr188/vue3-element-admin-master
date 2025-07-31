import { useUserStore } from "@/store/modules/user.store";
import axios from "axios";

const ACCESS_TOKEN_KEY = "access_token"; // 跟 setAccessToken 保持一致！

export const simpleService = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
});

// 仅添加token头，无响应拦截器
simpleService.interceptors.request.use(config => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY); // 统一用 access_token
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器：强制下线
simpleService.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.data?.code === 401)) {
      const userStore = useUserStore();
      userStore.clearSessionAndCache();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default simpleService;