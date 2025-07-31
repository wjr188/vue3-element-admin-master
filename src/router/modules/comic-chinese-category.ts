// File path: src/router/modules/comic-chinese-category.ts
export default {
  path: '/comic-category-manage', // 漫画分类管理路由路径
  name: 'ComicCategoryManage', // 路由名称
  // 修正组件导入路径中的文件名
  component: () => import('@/views/comic-category/chinese.vue'), // 指向实际的Vue组件文件
  meta: { permission: "", title: '漫画分类管理', requiresAuth: true } // 路由元信息，包括标题和是否需要认证
};