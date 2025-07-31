// File path: src/router/modules/onlyfans-category.ts
// 对应分类管理
export default {
  path: '/onlyfans-category-manage', // 分类管理路由路径
  name: 'OnlyFansCategoryManage',
  // 修正后的组件路径
  component: () => import('@/views/image-category/onlyfans.vue'), // 注意这里是 onlyfans.vue
  meta: { permission: "", title: 'OnlyFans分类管理', requiresAuth: true }
};