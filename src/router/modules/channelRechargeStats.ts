// src/router/modules/channelRechargeStats.ts
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue'; // 你的项目布局组件路径

const channelRechargeStatsRouter: RouteRecordRaw = {
  path: '/channel-recharge-stats', // 用户访问这个URL就会看到这个页面
  component: Layout, // 这个页面会嵌套在你的后台管理系统的布局里（有侧边栏、头部等）
  redirect: '/channel-recharge-stats/index', // 访问父路径时，默认重定向到子路由
  meta: { permission: "",
    title: '渠道汇总统计', // 会显示在侧边栏菜单上的名称
    icon: 'el-icon-data-board', // 侧边栏菜单图标
    // 其他 meta 信息，比如 roles 权限控制
  },
  children: [
    {
      path: 'index', // 完整的URL是 /channel-recharge-stats/index
      component: () => import('@/views/user-data/ChannelRechargeStats.vue'), // 指向你的组件文件
      name: 'ChannelRechargeStats', // 这个名称会在跳转时用到，比如 router.push({ name: 'ChannelRechargeStats' })
      meta: { permission: "",
        title: '渠道汇总统计', // 子路由的标题
        // noCache: true, // 是否不缓存
      },
    },
  ],
};

export default channelRechargeStatsRouter;