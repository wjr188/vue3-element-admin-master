// File path: src/router/modules/onlyfans-tag.ts
// 对应标签管理
export default {
  path: '/onlyfans-tag-manage', // 标签管理路由路径
  name: 'OnlyFansTagManage',
  // 修正后的组件路径
  component: () => import('@/views/image-tag/onlyfans.vue'), // 注意这里是 onlyfans.vue
  meta: { permission: "", title: 'OnlyFans标签管理', requiresAuth: true }
};