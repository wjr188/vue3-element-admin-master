// src/router/modules/user-browse-log.ts
const Layout = () => import('@/layout/index.vue');

export default {
  path: '/user-browse-log',
  component: Layout,
  meta: { permission: "",
    title: '浏览记录',
    icon: 'Monitor',
    order: 900
  },
  children: [
    {
      path: '',
      name: 'UserBrowseLog',
      component: () => import('@/views/user-browse-log/index.vue'),
      meta: { permission: "", title: '浏览记录', icon: 'Monitor' }
    }
  ]
}
