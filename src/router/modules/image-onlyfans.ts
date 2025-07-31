// File path: src/router/modules/image-onlyfans.ts
// 对应图片管理
export default {
  path: '/onlyfans-image-manage', // 媒体管理路由路径
  name: 'OnlyFansImageManage',
  // 修正后的组件路径
  component: () => import('@/views/image-manage/onlyfans.vue'), // 注意这里是 onlyfans.vue
  meta: { permission: "", title: 'OnlyFans媒体管理', requiresAuth: true }
};