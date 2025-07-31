import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layout/index.vue");

// === 视频管理四大路由独立引入 ===
import videoDouyin from "@/router/modules/video-douyin";
import videoLong from "@/router/modules/video-long";
import videoAnime from "@/router/modules/video-anime";
import videoDark from "@/router/modules/video-dark";
// === 推荐页路由 ===
import animeRecommend from "@/router/modules/anime-recommend";
import darknetRecommend from "@/router/modules/darknet-recommend";
import audioNovelRecommend from '@/router/modules/audio-novel-recommend';

// === 图片管理两大路由独立引入 ===
import imageWeimiquan from "@/router/modules/image-weimiquan";
import imageOnlyfans from "@/router/modules/image-onlyfans";
//支付通道
import paymentChannelRoutes from "@/router/modules/PaymentChannelManage";

// === 其他图片管理四大路由独立引入 ===
import InfluencerManage from '@/router/modules/InfluencerManage'
import ContentManage from '@/router/modules/ContentManage'
import TagManage from '@/router/modules/TagManage'
import InfluencerGroupManage from '@/router/modules/influencer-group-manage'

// === 漫画管理子路由 ===
import comicRecommendManage from './modules/comic-recommend'

import comicChinese from "@/router/modules/comic-chinese";

// === 小说管理子路由 ===
import novelErotica from "@/router/modules/novel-erotica";
import novelAudio from "@/router/modules/novel-audio";
import novelEroticaRecommend from './modules/novelEroticaRecommend'

// === 分类菜单所有二级路由独立引入 ===
// 视频分类
import videoDouyinCategory from "@/router/modules/video-douyin-category";
import videoLongCategory from "@/router/modules/video-long-category";
import videoAnimeCategory from "@/router/modules/video-anime-category";
import videoDarkCategory from "@/router/modules/video-dark-category";
// 图片分类
import imageWeimiquanCategory from "@/router/modules/image-weimiquan-category";
import imageOnlyfansCategory from "@/router/modules/image-onlyfans-category";
import imageOtherCategory from "@/router/modules/image-other-category";
// 漫画分类

import comicChineseCategory from "@/router/modules/comic-chinese-category";
// 小说分类
import novelEroticaCategory from "@/router/modules/novel-erotica-category";
import novelAudioCategory from "@/router/modules/novel-audio-category";

// === 标签菜单所有二级路由独立引入 ===
// 视频标签
import videoDouyinTag from "@/router/modules/video-douyin-tag";
import videoLongTag from "@/router/modules/video-long-tag";
import videoAnimeTag from "@/router/modules/video-anime-tag";
import videoDarkTag from "@/router/modules/video-dark-tag";
// 图片标签
import imageWeimiquanTag from "@/router/modules/image-weimiquan-tag";
import imageOnlyfansTag from "@/router/modules/image-onlyfans-tag";
// 注意：根据您提供的导入列表，这里没有其他图片（Twitter, Influencer, Wallpaper, Local）的标签路由文件导入。

// 漫画标签
import comicChineseTag from "@/router/modules/comic-chinese-tag";

// 小说标签
import novelEroticaTag from "@/router/modules/novel-erotica-tag";
import novelAudioTag from "./modules/novel-audio-tag";
//浏览记录
import userBrowseLog from './modules/user-browse-log'


export const constantRoutes: RouteRecordRaw[] = [
  // 重定向
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  // 登录页
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  // 首页
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true },
      },
      {
        path: "my-notice",
        name: "MyNotice",
        component: () => import("@/views/system/notice/components/MyNotice.vue"),
        meta: { title: "我的通知", icon: "user", hidden: true },
      },
    ],
  },

  // ====== 新的业务类型一级菜单结构 ======

  // === 长视频 一级菜单 ===
  {
    path: "/long-video",
    component: Layout,
    redirect: "/long-video/manage",
    meta: { title: "长视频", icon: "video", alwaysShow: true, permission: "video" },
    children: [
      { ...videoLong, path: 'manage', meta: { ...videoLong.meta, title: '视频管理', permission: "video:manage" } },
      { ...videoLongCategory, path: 'category', meta: { ...videoLongCategory.meta, title: '视频分类', permission: "video:category" } },
      { ...videoLongTag, path: 'tag', meta: { ...videoLongTag.meta, title: '视频标签', permission: "video:tag" } },
      {
        path: "home-recommend",
        component: () => import("@/views/recommend-manage/home.vue"),
        meta: { title: "首页推荐", permission: "video:recommend" }
      },
    ],
  },

  // === 抖音 一级菜单 ===
  {
    path: "/douyin",
    component: Layout,
    redirect: "/douyin/manage",
    meta: { title: "抖音", icon: "video", alwaysShow: true, permission: "douyin" },
    children: [
      { ...videoDouyin, path: 'manage', meta: { ...videoDouyin.meta, title: '抖音管理', permission: "douyin:manage" } },
      { ...videoDouyinCategory, path: 'category', meta: { ...videoDouyinCategory.meta, title: '抖音分类', permission: "douyin:category" } },
      { ...videoDouyinTag, path: 'tag', meta: { ...videoDouyinTag.meta, title: '抖音标签', permission: "douyin:tag" } },
    ],
  },

  // === 动漫 一级菜单 ===
  {
    path: "/anime",
    component: Layout,
    redirect: "/anime/manage",
    meta: { title: "动漫", icon: "video", alwaysShow: true, permission: "anime" },
    children: [
      { ...videoAnime, path: 'manage', meta: { ...videoAnime.meta, title: '动漫管理', permission: "anime:manage" } },
      { ...videoAnimeCategory, path: 'category', meta: { ...videoAnimeCategory.meta, title: '动漫分类', permission: "anime:category" } },
      { ...videoAnimeTag, path: 'tag', meta: { ...videoAnimeTag.meta, title: '动漫标签', permission: "anime:tag" } },
      { ...animeRecommend, path: 'recommend', meta: { ...animeRecommend.meta, title: '动漫推荐', permission: "anime:recommend" } },
    ],
  },

  // === 暗网 一级菜单 ===
  {
    path: "/dark-web",
    component: Layout,
    redirect: "/dark-web/manage",
    meta: { title: "暗网", icon: "video", alwaysShow: true, permission: "darknet" },
    children: [
      { ...videoDark, path: 'manage', meta: { ...videoDark.meta, title: '暗网管理', permission: "darknet:manage" } },
      { ...videoDarkCategory, path: 'category', meta: { ...videoDarkCategory.meta, title: '暗网分类', permission: "darknet:category" } },
      { ...videoDarkTag, path: 'tag', meta: { ...videoDarkTag.meta, title: '暗网标签', permission: "darknet:tag" } },
      { ...darknetRecommend, path: 'recommend', meta: { ...darknetRecommend.meta, title: '暗网推荐', permission: "darknet:recommend" } },
    ],
  },

  // === 漫画 一级菜单 ===
  {
    path: "/comic",
    component: Layout,
    redirect: "/comic/japan-manage",
    meta: { title: "漫画", icon: "notebook-2", alwaysShow: true, permission: "comic" },
    children: [
      { ...comicChinese, path: 'chinese-manage', meta: { ...comicChinese.meta, title: '国漫管理', permission: "comic:manage" } },
      { ...comicChineseCategory, path: 'chinese-category', meta: { ...comicChineseCategory.meta, title: '国漫分类', permission: "comic:category" } },
      { ...comicChineseTag, path: 'chinese-tag', meta: { ...comicChineseTag.meta, title: '国漫标签', permission: "comic:tag" } },
      { ...comicRecommendManage, path: 'recommend-manage', meta: { ...comicRecommendManage.meta, title: '漫画推荐', permission: "comic:recommend" } },
    ],
  },

  // === 小说 一级菜单 ===
  // 文字小说 一级菜单
{
  path: "/novel",
  component: Layout,
  redirect: "/novel/erotica-manage",
  meta: {
    title: "文字小说",
    icon: "notebook-2",
    alwaysShow: true,
    permission: "textnovel"
  },
  children: [
    { ...novelErotica, path: 'erotica-manage', meta: { ...novelErotica.meta, title: '文字小说管理', permission: "textnovel:manage" } },
    { ...novelEroticaCategory, path: 'erotica-category', meta: { ...novelEroticaCategory.meta, title: '文字小说分类', permission: "textnovel:category" } },
    { ...novelEroticaTag, path: 'erotica-tag', meta: { ...novelEroticaTag.meta, title: '文字小说标签', permission: "textnovel:tag" } },
    { ...novelEroticaRecommend, meta: { ...novelEroticaRecommend.meta, title: '文字推荐', permission: "textnovel:recommend" } },
  ]
},

// 有声小说 一级菜单
{
  path: "/audio-novel",
  component: Layout,
  redirect: "/audio-novel/audio-manage",
  meta: {
    title: "有声小说",
    icon: "voice", // 你可以换成合适的icon
    alwaysShow: true,
    permission: "audio"
  },
  children: [
    { ...novelAudio, path: 'audio-manage', meta: { ...novelAudio.meta, title: '有声小说管理', permission: "audio:manage" } },
    { ...novelAudioCategory, path: 'audio-category', meta: { ...novelAudioCategory.meta, title: '有声小说分类', permission: "audio:category" } },
    { ...novelAudioTag, path: 'audio-tag', meta: { ...novelAudioTag.meta, title: '有声小说标签', permission: "audio:tag" } },
    { ...audioNovelRecommend, path: 'audio-novel-recommend', meta: { ...audioNovelRecommend.meta, title: '有声小说推荐', permission: "audio:recommend" } }
  ]
},


  // === 图片 一级菜单 ===
  {
    path: "/image",
    component: Layout,
    redirect: "/image/weimiquan-manage",
    meta: {
      title: "图片",
      icon: "picture",
      alwaysShow: true,
    },
    children: [
      // 管理
      { ...imageWeimiquan, path: 'weimiquan-manage', meta: { ...imageWeimiquan.meta, title: '微密圈管理' } },
      { ...imageOnlyfans, path: 'onlyfans-manage', meta: { ...imageOnlyfans.meta, title: 'Onlyfans管理' } },
      
      // 分类
      { ...imageWeimiquanCategory, path: 'weimiquan-category', meta: { ...imageWeimiquanCategory.meta, title: '微密圈分类' } },
      { ...imageOnlyfansCategory, path: 'onlyfans-category', meta: { ...imageOnlyfansCategory.meta, title: 'Onlyfans分类' } },
      { ...imageOtherCategory, path: 'other-category', meta: { ...imageOtherCategory.meta, title: '其他图片分类' } },
      // 标签
      { ...imageWeimiquanTag, path: 'weimiquan-tag', meta: { ...imageWeimiquanTag.meta, title: '微密圈标签' } },
      { ...imageOnlyfansTag, path: 'onlyfans-tag', meta: { ...imageOnlyfansTag.meta, title: 'Onlyfans标签' } },
    ],
  },
  {
    path: "/other-image-manage",
    component: Layout,
    redirect: "/other-image-manage/influencer",
    meta: {
      title: "博主",
      icon: "user",
      alwaysShow: true,
      permission: "blogger"
    },
    children: [
      { ...InfluencerManage, path: 'influencer', meta: { ...InfluencerManage.meta, title: '博主管理', permission: "blogger:manage" } },
      { ...ContentManage, path: 'content', meta: { ...ContentManage.meta, title: '内容管理', permission: "blogger:content" } },
      { ...InfluencerGroupManage, path: 'group', meta: { ...InfluencerGroupManage.meta, title: '博主分组管理', permission: "blogger:group" } },
      { ...TagManage, path: 'tag', meta: { ...TagManage.meta, title: '标签管理', permission: "blogger:tag" } }
    ]
  },

  // ====== 原有的其他菜单 (保持不变) ======

  // ====== 广告管理（一级菜单） ======
  {
    path: "/ad-manage",
    component: Layout,
    meta: { title: "广告管理", icon: "bell", permission: "ad" },
    children: [
      {
        path: "carousel",
        component: () => import("@/views/ad-manage/carousel.vue"),
        meta: { title: "轮播广告", permission: "ad:carousel" }
      },
      {
        path: "interstitial",
        component: () => import("@/views/ad-manage/interstitial.vue"),
        meta: { title: "插屏广告", permission: "ad:insert" }
      },
      {
        path: "redirect",
        component: () => import("@/views/ad-manage/redirect.vue"),
        meta: { title: "跳转广告", permission: "ad:jump" }
      }
    ]
  },
 // ====== 热门关键词（一级菜单）======
  {
    path: "/search-hot-keyword",
    component: Layout,
    meta: { title: "热门关键词", icon: "el-icon-star", alwaysShow: true, permission: "hotkeyword" },
    children: [
      {
        path: "manage",
        name: "SearchHotKeywordManage",
        component: () => import("@/views/search-hot-keyword/index.vue"),
        meta: { title: "热门关键词管理", icon: "el-icon-star", permission: "hotkeyword:manage" }
      }
    ]
  },
  // ====== 会员与支付（一级菜单） ======
  {
    path: "/member-pay",
    component: Layout,
    meta: { title: "会员与支付", icon: "user", permission: "member" },
    children: [
      {
        path: "member",
        component: () => import("@/views/member-pay/member.vue"),
        meta: { title: "用户管理", permission: "member:manage" }
      },
      {
        path: "vip",
        component: () => import("@/views/member-pay/vip.vue"),
        meta: { title: "VIP配置", permission: "vip:config" }
      },
      {
        path: "recharge",
        component: () => import("@/views/member-pay/recharge.vue"),
        meta: { title: "充值记录", permission: "recharge:record" }
      },
      {
        path: "coin",
        component: () => import("@/views/member-pay/coin.vue"),
        meta: { title: "金币管理", permission: "coin:manage" }
      },
      {
        path: 'manage',
        component: () => import('@/views/member-pay/PaymentChannelManage.vue'),
        meta: { title: '支付通道列表', permission: "pay:channelList" }
      },
    ]
  },
// ====== 积分管理（一级菜单） ======
{
  path: "/points",
  component: Layout,
  redirect: "/points/exchange",
  meta: { title: "积分管理", icon: "coin", alwaysShow: true },
  children: [
    {
      path: "exchange",
      component: () => import("@/views/points/ExchangeManage.vue"),
      meta: { title: "积分兑换" }
    },
    {
      path: "records",
      component: () => import("@/views/points/ExchangeRecords.vue"),
      meta: { title: "兑换记录" }
    },
    {
      path: "log",
      component: () => import("@/views/points/PointsLogView.vue"),
      meta: { title: "积分流水" }
    }
  ]
},

  // ===== 渠道总管理（一级菜单） =====
  {
    path: "/channel",
    component: Layout,
    meta: { title: "渠道总管理", icon: "el-icon-connection", permission: "channel" },
    redirect: "/channel/stats",
    children: [
      {
        path: "stats",
        name: "ChannelStats",
        component: () => import("@/views/user-data/ChannelRechargeStats.vue"),
        meta: { title: "渠道汇总统计", icon: "el-icon-data-board", permission: "channel:summary" }
      },
      {
        path: "manage",
        name: "ChannelManage",
        component: () => import("@/views/user-data/ChannelManage.vue"),
        meta: { title: "渠道管理", icon: "el-icon-setting", permission: "channel:manage" }
      },
      {
        path: "user-detail",
        name: "ChannelUserRechargeDetail",
        component: () => import("@/views/user-data/ChannelUserRechargeDetail.vue"),
        meta: {
          title: "注册用户明细",
          hidden: true,
          activeMenu: '/channel/stats'
        }
      }
    ]
  },

  // ====== 系统设置（一级菜单） ======
  {
    path: "/system",
    component: Layout,
    meta: { title: "系统设置", icon: "settings", permission: "system" },
    children: [
      {
        path: "site",
        component: () => import("@/views/system/site.vue"),
        meta: { title: "站点信息", permission: "system:siteInfo" }
      },
      {
        path: "auth",
        component: () => import("@/views/system/auth.vue"),
        meta: { title: "权限设置", permission: "system:auth" }
      },
      {
  path: "config",
  component: () => import("@/views/admin/SiteConfig.vue"),
  meta: { title: "系统配置" }
      }
    ]
  },

  // ... 浏览记录 ...
  userBrowseLog,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

import { useUserStore } from "@/store/modules/user.store";
import { usePermissionStore } from "@/store/modules/permission.store";
import { getAccessToken, clearToken } from "@/utils/auth";

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const permStore = usePermissionStore();
  const token = getAccessToken();

  // 没有 token，直接去登录页
  if (!token) {
    if (to.path !== "/login") {
      next("/login");
    } else {
      next();
    }
    return;
  }

  // 有 token 但没有用户信息，自动获取
  if (!userStore.currentUser?.id) {
    try {
      await userStore.getUserInfo();
      if (permStore.generateRoutes) {
        await permStore.generateRoutes();
      }
      next({ ...to, replace: true });
    } catch (e) {
      clearToken();
      next("/login");
    }
  } else {
    next();
  }
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;