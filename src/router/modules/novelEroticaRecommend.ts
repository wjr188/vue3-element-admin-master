export default {
    path: 'erotica-recommend',
    component: () => import('@/views/recommend-manage/NovelEroticaRecommend.vue'),
    name: 'NovelEroticaRecommend',
    meta: { permission: "",
      title: '文字推荐',
      icon: 'star', // 可以自定义
      // 其它meta字段随需要加
    }
  }
  