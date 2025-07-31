// 文件路径: src/router/modules/audio-novel-tag.ts

/**
 * 有声小说标签管理路由
 */
const audioNovelTagRoute = {
    path: '/audio-novel-tag-manage', // 有声小说标签管理路由路径
    name: 'AudioNovelTagManage',
    component: () => import('@/views/novel-tag/audio.vue'), // 对应有声小说标签管理页面
    meta: { permission: "", title: '有声小说标签管理', requiresAuth: true }
  };
  
  export default audioNovelTagRoute;