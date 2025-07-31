<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { LocationQuery, RouteLocationRaw, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import router from "@/router";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import { ref, computed } from "vue";
import { useUserStoreHook } from "@/store/modules/user.store"; // ⭐️ Pinia 用户 Store

const { t } = useI18n();
const route = useRoute();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);

const loginFormData = ref({
  username: "",
  password: "",
  rememberMe: false,
});

const loginRules = computed(() => ({
  username: [
    { required: true, trigger: "blur", message: t("login.message.username.required") },
  ],
  password: [
    { required: true, trigger: "blur", message: t("login.message.password.required") },
    { min: 6, message: t("login.message.password.min"), trigger: "blur" },
  ],
}));

const message = ref(""); // 登录提示

const userStore = useUserStoreHook(); // ⭐️ Pinia 用户 store 实例

// 登录表单提交
async function handleLoginSubmit() {
  try {
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;
    loading.value = true;
    message.value = "";

    // ⭐ 登录（参数名必须是 account，不是 username）
    await userStore.login({
      account: loginFormData.value.username,
      password: loginFormData.value.password,
    });

    // ⭐ 拉取用户信息（此时 token 已经存好，info 接口会带 token）
    await userStore.getUserInfo();

    message.value = "登录成功";
    // ⭐ 跳转
    const redirect = (route.query.redirect as string) || "/dashboard";
    await router.push(redirect);
  } catch (error: any) {
    message.value = error?.msg || error?.message || "请求失败";
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}

// 支持外部页面指定重定向路径
function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  const defaultPath = "/";
  const rawRedirect = (query.redirect as string) || defaultPath;
  try {
    const resolved = router.resolve(rawRedirect);
    return { path: resolved.path, query: resolved.query };
  } catch {
    return { path: defaultPath };
  }
}

// 检测 CapsLock 状态
function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<template>
  <div>
    <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3>
    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <div style="color:red;margin:10px 0;" v-if="message">{{ message }}</div>

    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>

    <el-divider>
      <el-text size="small">{{ t("login.otherLoginMethods") }}</el-text>
    </el-divider>
    <div class="flex-center gap-x-5 w-full text-[var(--el-text-color-secondary)]">
      <CommonWrapper>
        <div text-20px class="i-svg:wechat" />
      </CommonWrapper>
      <CommonWrapper>
        <div text-20px cursor-pointer class="i-svg:qq" />
      </CommonWrapper>
      <CommonWrapper>
        <div text-20px cursor-pointer class="i-svg:github" />
      </CommonWrapper>
      <CommonWrapper>
        <div text-20px cursor-pointer class="i-svg:gitee" />
      </CommonWrapper>
    </div>
  </div>
</template>
