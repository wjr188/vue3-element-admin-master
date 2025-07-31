// 文件路径: src/router/modules/audio-novel-category.ts

/**
 * 有声小说分类管理路由
 */
const audioNovelCategoryRoute = {
  path: '/audio-novel-category-manage', // 有声小说分类管理路由路径
  name: 'AudioNovelCategoryManage',
  component: () => import('@/views/novel-category/audio.vue'), // 对应有声小说分类管理页面
  meta: { permission: "", title: '有声小说分类管理', requiresAuth: true }
};

export default audioNovelCategoryRoute;
  