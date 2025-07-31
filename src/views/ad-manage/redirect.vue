<template>
  <div class="popup-config-container p-4 bg-gray-100 min-h-screen">
    <!-- 顶部 -->
    <div class="header-section flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
      <h1 class="text-2xl font-semibold text-gray-800">弹窗广告配置管理</h1>
      <el-select v-model="activePopupType" placeholder="请选择弹窗类型" @change="loadConfig" style="width: 200px;">
        <el-option
          v-for="type in popupTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
    </div>

    <!-- 配置内容 -->
    <div v-if="!loading" class="bg-white p-4 rounded-lg shadow-sm">
      <template v-if="isArrayType">
        <el-table :data="configData" style="width: 100%" border size="small">
          <el-table-column type="index" label="序号" width="50" />
          <el-table-column label="标题" width="180">
            <template #default="scope">
              <el-input v-model="scope.row.title" size="small"/>
            </template>
          </el-table-column>
          <el-table-column label="图片地址" width="300">
            <template #default="scope">
              <el-input v-model="scope.row.image_url" placeholder="请输入URL" size="small"/>
              <img
                v-if="scope.row.image_url"
                :src="scope.row.image_url"
                class="mt-1 border"
                style="width:48px; height:48px; object-fit:cover;"
              />
            </template>
          </el-table-column>
          <el-table-column label="跳转链接" width="250">
            <template #default="scope">
              <el-input v-model="scope.row.link" size="small"/>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="120">
            <template #default="scope">
              <el-input-number v-model="scope.row.sort_order" :min="1" size="small"/>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-switch
                v-model="scope.row.enabled"
                active-text="启用"
                inactive-text="禁用"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="true"
                :inactive-value="false"
                @change="() => toggleEnabled(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeItem(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" type="primary" @click="addItem">新增一条广告</el-button>
      </template>

      <template v-else>
        <el-form label-width="100px">
          <template v-for="(value, key) in configData" :key="key">
            <el-form-item :label="fieldLabels[key] || key">
              <el-input v-model="configData[key]" size="small"/>
            </el-form-item>
          </template>
        </el-form>
      </template>
      <el-button type="primary" @click="saveConfig" class="mt-4">保存配置</el-button>
    </div>

    <el-skeleton v-else rows="5" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePopupConfigStore } from '@/store/modules/popupConfig.store';

const store = usePopupConfigStore();

const popupTypes = [
  { label: '开屏广告', value: 'splash' },
  { label: '首页弹窗', value: 'home_popup' },
  { label: '应用弹窗', value: 'app_popup' },
  { label: '公告弹窗', value: 'notice' },
  { label: '我的弹窗', value: 'mine' },
];

const activePopupType = ref('splash');
const configData = ref<any>(null);
const currentConfigId = ref<number | null>(null);
const loading = ref(false);

const fieldLabels: Record<string, string> = {
  image_url: '图片地址',
  link: '跳转链接',
  logo_url: 'Logo',
  title: '标题',
  subtitle: '副标题',
  domain: '域名',
  email: '邮箱',
  url: '网址',
  content1: '内容1',
  content2: '内容2',
  content3: '内容3',
  content4: '内容4',
  content5: '内容5',
  content6: '内容6',
  content7: '内容7',
};

// 是否数组类型
const isArrayType = computed(() =>
  ['splash', 'home_popup', 'app_popup'].includes(activePopupType.value)
);

// 加载配置
async function loadConfig() {
  loading.value = true;
  try {
    const result = await store.loadConfig(activePopupType.value);

    if (result) {
      currentConfigId.value = result.id;

      if (isArrayType.value) {
        if (Array.isArray(result.value)) {
          configData.value = result.value;
        } else if (result.value && typeof result.value === 'object') {
          configData.value = [result.value];
        } else {
          configData.value = [];
        }
      } else {
        configData.value = result.value;
      }
    } else {
      currentConfigId.value = null;
      if (isArrayType.value) {
        configData.value = [];
      } else if (activePopupType.value === 'notice') {
        configData.value = {
          content1: '',
          content2: '',
          content3: '',
          content4: '',
          content5: '',
          content6: '',
          content7: ''
        };
      } else if (activePopupType.value === 'mine') {
        configData.value = {
          logo_url: '',
          title: '',
          subtitle: '',
          domain: '',
          email: '',
          url: ''
        };
      }
    }
  } finally {
    loading.value = false;
  }
}

// 保存配置
async function saveConfig() {
  if (!currentConfigId.value) {
    ElMessage.error('未找到配置ID，请先在数据库插入一条初始配置');
    return;
  }
  await store.saveConfig(currentConfigId.value, configData.value);
  ElMessage.success('已保存');
}

// 新增
function addItem() {
  configData.value.push({
    title: '',
    image_url: '',
    link: '',
    sort_order: configData.value.length + 1,
    enabled: true
  });
}

// 删除（带确认并立即保存）
async function removeItem(index: number) {
  try {
    await ElMessageBox.confirm('确认要删除这条广告吗？删除后将无法恢复！', '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    configData.value.splice(index, 1);
    await saveConfig();
  } catch {
    // 取消删除
  }
}

// 启用/禁用自动保存
async function toggleEnabled(row: any) {
  await saveConfig();
}
  
// 初始化
loadConfig();
</script>

<style scoped>
.popup-config-container {
  font-family: 'Inter', sans-serif;
}
</style>
