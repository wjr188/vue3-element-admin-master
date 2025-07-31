<script setup lang="ts">
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { useSiteConfigStore } from "@/store/siteConfigStore";
import { ElMessage } from "element-plus";

const store = useSiteConfigStore();

// 确保响应式
const form = reactive<Record<string, any>>({});

// 页面加载时加载配置
onMounted(async () => {
  try {
    await store.loadConfigs();
    if (Object.keys(store.configs).length > 0) {
      Object.assign(form, store.configs);
      console.log("✅ 配置已加载：", store.configs);
    } else {
      console.warn("⚠️ 系统配置为空，使用默认值。");
    }
  } catch (err) {
    console.error("❌ 加载配置出错：", err);
    ElMessage.error("加载配置失败，请刷新重试");
  }
});

// 点击保存
const save = async () => {
  try {
    const plain = JSON.parse(JSON.stringify(toRaw(form)));
    console.log("🔵 提交纯对象：", plain);
    await store.saveConfigs(plain);
    ElMessage.success("配置已保存");
  } catch (err) {
    console.error("❌ 保存配置出错：", err);
    ElMessage.error("保存失败，请稍后重试");
  }
};

// 把配置分组
const videoKeys = [
  "free_long_video_daily",
  "free_dy_video_daily",
];

const pointKeys = [
  "point_enabled",
  "point_daily_login",
  "point_bind_mobile",
  "point_bind_email",
  "point_invite_user",
  "point_buy_vip",
  "point_buy_gold"
];

// computed方便过滤
const videoConfigs = computed(() =>
  videoKeys.filter(k => form[k] !== undefined)
);

const pointConfigs = computed(() =>
  pointKeys.filter(k => form[k] !== undefined)
);
</script>

<template>
  <el-card>
    <el-form :model="form" label-width="220px">
      <!-- 🎥 视频配置 -->
      <template v-if="videoConfigs.length">
        <el-divider>视频相关配置</el-divider>
        <el-form-item
          v-for="key in videoConfigs"
          :key="key"
          :label="{
            free_long_video_daily: '每天免费长视频次数',
            free_dy_video_daily: '每天免费抖音次数'
          }[key] || key"
        >
          <el-input-number v-model="form[key]" :min="0" />
        </el-form-item>
      </template>

      <!-- 🟢 积分配置 -->
      <template v-if="pointConfigs.length">
        <el-divider>积分相关配置</el-divider>
        <el-form-item
          v-for="key in pointConfigs"
          :key="key"
          :label="{
            point_enabled: '是否开启积分功能 (1=开 0=关)',
            point_daily_login: '每日登录奖励积分',
            point_bind_mobile: '绑定手机奖励积分',
            point_bind_email: '绑定邮箱奖励积分',
            point_invite_user: '邀请好友奖励积分',
            point_buy_vip: '购买VIP奖励积分',
            point_buy_gold: '购买金币奖励积分'
          }[key] || key"
        >
          <el-input-number
            v-model="form[key]"
            :min="0"
            :max="key==='point_enabled' ? 1 : 999999"
          />
        </el-form-item>
      </template>
    </el-form>
    <el-button type="primary" @click="save" :loading="store.loading">
      保存配置
    </el-button>
  </el-card>
</template>
