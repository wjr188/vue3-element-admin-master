// src/router/modules/video-dark-category.ts
export default {
  path: '/category/dark',
  name: '暗网分类',
  component: () => import('@/views/video-category/dark.vue'),
  meta: { permission: "", title: '暗网分类' }
};

  