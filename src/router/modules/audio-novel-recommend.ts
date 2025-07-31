// 文件路径: src/router/modules/audio-novel-recommend.ts

/**
 * 有声小说推荐路由
 */
const audioNovelRecommendRoute = {
    path: '/audio-novel-recommend',
    name: 'AudioNovelRecommend',
    component: () => import('@/views/recommend-manage/audio-novel-recommend.vue'),
    meta: { permission: "", title: '有声小说推荐', requiresAuth: true }
  };
  
  export default audioNovelRecommendRoute;
  