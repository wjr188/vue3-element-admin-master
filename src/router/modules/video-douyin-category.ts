// src/router/modules/video-douyin-category.ts
export default {
  path: "douyin",
  component: () => import("@/views/video-category/douyin.vue"),
  meta: { permission: "", title: "抖音分类" }
};
