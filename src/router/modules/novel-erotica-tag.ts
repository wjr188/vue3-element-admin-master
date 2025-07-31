// 文件路径: src/router/modules/novel-erotica-tag.ts
// 对应文字小说标签管理页面: E:\vue3\vue3-element-admin-master\src\views\novel-tag\erotica.vue
export default {
    path: '/novel-tag/erotica', // 前端路由路径
    name: 'NovelEroticaTagManage', // 路由名称，用于跳转和菜单
    component: () => import('@/views/novel-tag/erotica.vue'), // 指向文字小说标签管理页面的Vue组件文件
    meta: { permission: "", title: '文字小说标签', requiresAuth: true } // 路由元信息，包括标题和是否需要认证
  };