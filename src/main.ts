// src/main.ts
import 'element-plus/dist/index.css' // 必须加上这句！
import { createApp } from "vue"
import App from "./App.vue"
import setupPlugins from "@/plugins"
import ElementPlus from 'element-plus'
// 1. 引入 Pinia
import { createPinia } from "pinia"

// 2. Element Plus 暗黑主题样式（可按项目需求删减）
import "element-plus/theme-chalk/dark/css-vars.css"
import "@/styles/dark/css-vars.css"
import "@/styles/index.scss"
import "uno.css"
import "animate.css"
import "default-passive-events"

// 3. 创建 Vue 应用
const app = createApp(App)

app.use(ElementPlus)
// 4. 创建并注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 🔥 5. 全局拉取“内容–会员卡”映射
import { usePermissionStore } from "@/store/modules/permission.store"
const permStore = usePermissionStore()
permStore.loadVipMap()

// 6. 注册自定义插件（router、i18n、其他插件）
app.use(setupPlugins)

// 7. 挂载应用
app.mount("#app")

