// src/router/modules/channelUserRechargeDetail.ts
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

const channelUserRechargeDetailRouter: RouteRecordRaw = {
  path: '/channel-user-recharge-detail', // 用户访问这个URL会看到这个页面
  component: Layout,
  redirect: '/channel-user-recharge-detail/index',
  meta: { permission: "",
    title: '注册用户明细',
    hidden: true, // **重点：这个页面是下钻的，通常不直接在侧边栏显示，所以设为隐藏**
    // activeMenu: '/channel-recharge-stats/index', // **可选：当在这个下钻页面时，让侧边栏高亮“渠道汇总统计”那个菜单项**
    // 其他 meta 信息
  },
  children: [
    {
      path: 'index', // 完整的URL是 /channel-user-recharge-detail/index
      component: () => import('@/views/user-data/ChannelUserRechargeDetail.vue'), // 指向你的组件文件
      name: 'ChannelUserRechargeDetail', // 路由名称
      meta: { permission: "",
        title: '注册用户明细',
      },
    },
  ],
};

export default channelUserRechargeDetailRouter;