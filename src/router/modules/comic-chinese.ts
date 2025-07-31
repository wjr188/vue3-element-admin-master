// File path: src/router/modules/comic-chinese.ts
export default {
  path: '/comic-manage/chinese', // 漫画管理中文路由路径
  name: 'ComicManageChinese', // 路由名称
  component: () => import('@/views/comic-manage/chinese.vue'), // 指向实际的Vue组件文件
  meta: { permission: "", title: '漫画管理 - 中文', requiresAuth: true } // 路由元信息，包括标题和是否需要认证
};
