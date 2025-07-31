export default {
  path: '/darknet-recommend',   // 这个 path 实际没用（用 children 的 path: 'recommend'）
  name: 'DarknetRecommendManage',
  component: () => import('@/views/recommend-manage/DarknetRecommendManage.vue'),
  meta: { permission: "",
    title: '暗网推荐管理',
    icon: 'icon-tuijian',
    requiresAuth: true
  }
}
