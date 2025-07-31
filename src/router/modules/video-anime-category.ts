// src/router/modules/video-anime-category.ts
export default {
  path: '/category/anime',
  name: '动漫分类',
  component: () => import('@/views/video-category/anime.vue'),   // 这行要对！
  meta: { permission: "", title: '动漫分类', icon: 'icon-anime' }
};
