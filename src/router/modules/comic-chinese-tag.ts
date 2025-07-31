// File path: src/router/modules/comic-chinese-tag.ts
export default {
  path: '/comic-tag-manage/chinese', // 漫画标签管理路由路径
  name: 'ComicTagManageChinese', // 路由名称
  component: () => import('@/views/comic-tag/chinese.vue'), // 指向实际的Vue组件文件
  meta: { permission: "", title: '漫画标签管理 - 中文', requiresAuth: true } // 路由元信息，包括标题和是否需要认证
};