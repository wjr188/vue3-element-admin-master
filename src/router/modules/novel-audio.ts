// 文件路径: src/router/modules/audio-novel-manage.ts

/**
 * 有声小说管理路由
 */
const audioNovelManageRoute = {
  path: '/audio-novel-manage', // 有声小说管理路由路径
  name: 'AudioNovelManage',
  component: () => import('@/views/novel-manage/audio.vue'), // 对应有声小说管理页面
  meta: { permission: "", title: '有声小说管理', requiresAuth: true }
};

export default audioNovelManageRoute;
  