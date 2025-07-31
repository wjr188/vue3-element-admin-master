// E:\vue3\vue3-element-admin-master\src\router\modules\influencer-group-manage.js

export default {
    name: 'InfluencerGroupManage',
    path: 'group',
    component: () => import('@/views/other-image-manage/InfluencerGroupManage.vue'),
    meta: { permission: "",
      title: '博主分组管理',
      icon: 'user-group',
      keepAlive: true
    }
  }
  