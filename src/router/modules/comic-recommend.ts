// src/router/modules/comic-recommend.ts
export default {
  path: 'recommend-manage',
  component: () => import('@/views/recommend-manage/ComicRecommendManage.vue'),
  meta: { permission: "",
    title: '漫画推荐管理',
    icon: 'star',
    alwaysShow: true,
  },
};
