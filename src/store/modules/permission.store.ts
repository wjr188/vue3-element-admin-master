import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import { constantRoutes } from '@/router'
import router from '@/router'
import MenuAPI, { type RouteVO } from '@/api/system/menu.api'
import { getContentVipMap } from '@/api/permission'
import { store } from '@/store'      // hook 用
import request from '@/utils/request' // 如需直接在本文件用 request
import { useUserStoreHook } from '@/store/modules/user.store'

const modules = import.meta.glob('../../views/**/**.vue')
const Layout = () => import('@/layout/index.vue')

export const usePermissionStore = defineStore('permission', () => {
  // —— 原有路由相关状态 & 方法 —— //
  const routes = ref<RouteRecordRaw[]>([])
  const mixedLayoutLeftRoutes = ref<RouteRecordRaw[]>([])
  const isRoutesLoaded = ref(false)

  function filterRoutesByPermission(
    routes: RouteRecordRaw[],
    permissions: string[],
    isAdmin: boolean
  ): RouteRecordRaw[] {
    if (isAdmin) return routes; // 超级管理员不过滤
    return routes.filter(route => {
      if (!route.meta?.permission) return true;
      return permissions.includes(route.meta.permission);
    }).map(route => ({
      ...route,
      children: route.children ? filterRoutesByPermission(route.children, permissions, isAdmin) : []
    }));
  }

  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      MenuAPI.getRoutes()
        .then((data) => {
          const dynamicRoutes = parseDynamicRoutes(data)
          const userStore = useUserStoreHook();
          const userPermissions = userStore.currentUser?.permissions || [];
          const isAdmin = userStore.currentUser?.role === 'admin';
          const filteredRoutes = filterRoutesByPermission([...constantRoutes, ...dynamicRoutes], userPermissions, isAdmin);
          routes.value = filteredRoutes;
          isRoutesLoaded.value = true;
          resolve(filteredRoutes);
        })
        .catch(reject)
    })
  }

  function setMixedLayoutLeftRoutes(parentPath: string) {
    const matched = routes.value.find((r) => r.path === parentPath)
    if (matched?.children) {
      mixedLayoutLeftRoutes.value = matched.children
    }
  }

  function resetRouter() {
    routes.value.forEach((r) => {
      if (r.name && !constantRoutes.find((c) => c.name === r.name)) {
        router.removeRoute(r.name)
      }
    })
    routes.value = []
    mixedLayoutLeftRoutes.value = []
    isRoutesLoaded.value = false
  }

  // —— 新增内容–会员卡映射 —— //
  /** 存储后端返回的映射 */
  const vipMap = ref<Record<string, Record<string, number>>>({})

  /** 拉取并缓存映射 */
  async function loadVipMap() {
    try {
      const res = await getContentVipMap()
      // 若你的 request 封装返回 { data }，请改成 res.data
      vipMap.value = res
    } catch (err) {
      console.error('加载内容–会员卡映射失败', err)
    }
  }

  return {
    // 路由逻辑
    routes,
    mixedLayoutLeftRoutes,
    isRoutesLoaded,
    generateRoutes,
    setMixedLayoutLeftRoutes,
    resetRouter,
    // VIP 映射
    vipMap,
    loadVipMap,
  }
})

/** 递归解析后端路由 */
function parseDynamicRoutes(raw: RouteVO[]): RouteRecordRaw[] {
  const out: RouteRecordRaw[] = []
  raw.forEach((route) => {
    const nr = { ...(route as any) } as RouteRecordRaw
    nr.component =
      route.component === 'Layout'
        ? Layout
        : modules[`../../views/${route.component}.vue`] ||
          modules['../../views/error-page/404.vue']
    if (route.children) {
      nr.children = parseDynamicRoutes(route.children)
    }
    out.push(nr)
  })
  return out
}

/**
 * 供「组件外」使用的 hook
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
