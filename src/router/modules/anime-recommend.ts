export default {
  path: '/anime/recommend',
  name: 'AnimeRecommend',
  component: () => import('@/views/recommend-manage/RecommendManage.vue'),
  meta: { permission: "",
    title: '动漫推荐',
    icon: 'icon-tuijian', // 换你喜欢的icon
    type: 'anime',        // 推荐页用来区分复用类型
    alwaysShow: false,    // 单页可不写
  }
}
