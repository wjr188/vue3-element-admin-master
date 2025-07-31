<template>
  <div class="search-hot-keyword-wrapper">
    <!-- 分类 Tabs -->
   <el-tabs v-model="activeType" @tab-change="handleTabChange">
  <el-tab-pane label="全部" name="all" />
  <el-tab-pane label="漫画" name="comic" />
  <el-tab-pane label="小说" name="novel" />
  <el-tab-pane label="视频" name="video" />
  <el-tab-pane label="动漫" name="anime" />
  <el-tab-pane label="有声" name="audio" />
</el-tabs>


    <!-- 操作栏 -->
    <div class="toolbar" style="margin-bottom:16px;">
      <el-button type="primary" @click="openDialog('add')">新增关键词</el-button>
      <el-button @click="refreshList" :loading="store.loading">刷新</el-button>
    </div>

    <!-- 关键词表格 -->
    <el-table :data="store.list" style="width: 100%" v-loading="store.loading" border>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="keyword" label="关键词" width="350" />
      <el-table-column prop="type" label="分类" width="100">
        <template #default="{ row }">
          {{ typeLabel(row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="150">
        <template #default="{ row }">
          <el-input-number
            v-model="row.sort"
            :min="0"
            size="small"
            style="width:80px"
            @change="handleSortChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="160">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
            @change="toggleStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openDialog('edit', row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="400px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="form.keyword" maxlength="64" />
        </el-form-item>
        <el-form-item label="分类" prop="type">
          <el-select v-model="form.type" style="width:100%;">
            <el-option label="全部" value="all" />
            <el-option label="漫画" value="comic" />
            <el-option label="小说" value="novel" />
            <el-option label="视频" value="video" />
            <el-option label="动漫" value="anime" />
            <el-option label="有声" value="audio" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useSearchHotKeywordStore } from "@/store/modules/searchHotKeyword.store";
import type { SearchHotKeyword } from "@/api/searchHotKeyword.api";

const typeOptions = [
  { label: "全部", value: "all" },
  { label: "漫画", value: "comic" },
  { label: "小说", value: "novel" },
  { label: "视频", value: "video" },
  { label: "动漫", value: "anime" },
  { label: "有声", value: "audio" }
];
const typeLabel = (type: string) => typeOptions.find(t => t.value === type)?.label || type;

const store = useSearchHotKeywordStore();

const activeType = ref("all");
const dialogVisible = ref(false);
const dialogTitle = ref("新增关键词");
const formRef = ref();
const form = ref<SearchHotKeyword>({
  id: 0,
  keyword: "",
  type: "comic",
  status: 1,
  sort: 0
});
const rules = {
  keyword: [{ required: true, message: "请输入关键词", trigger: "blur" }],
  type: [{ required: true, message: "请选择分类", trigger: "change" }]
};

// 拉列表
const refreshList = () => store.getList(activeType.value);
onMounted(() => refreshList());
function handleTabChange(newType: string) {
  // activeType 自动赋值，无需手动赋值
  refreshList();
}


function openDialog(mode: "add" | "edit", row?: SearchHotKeyword) {
  dialogTitle.value = mode === "add" ? "新增关键词" : "编辑关键词";
  if (mode === "edit" && row) {
    form.value = { ...row };
  } else {
    form.value = { id: 0, keyword: "", type: activeType.value, status: 1, sort: 0 };
  }
  nextTick(() => formRef.value?.clearValidate());
  dialogVisible.value = true;
}

function handleSubmit() {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    if (form.value.id) {
      await store.update(form.value);
      ElMessage.success("编辑成功");
    } else {
      await store.add({ ...form.value, id: undefined });
      ElMessage.success("新增成功");
    }
    dialogVisible.value = false;
  });
}

function handleDelete(row: SearchHotKeyword) {
  ElMessageBox.confirm(`确定删除“${row.keyword}”吗？`, "提示", {
    type: "warning"
  }).then(async () => {
    await store.remove(row.id, activeType.value);
    ElMessage.success("删除成功");
  });
}

// 单条排序变更（可选批量）
let sortTimeout: ReturnType<typeof setTimeout> | null = null;
function handleSortChange(row: SearchHotKeyword) {
  // 可优化为批量提交，暂时每次直接调接口
  if (sortTimeout) clearTimeout(sortTimeout);
  sortTimeout = setTimeout(async () => {
    await store.sort([{ id: row.id, sort: row.sort }], activeType.value);
    ElMessage.success("排序已更新");
  }, 400);
}

// 启用禁用
async function toggleStatus(row: SearchHotKeyword) {
  await store.update({ ...row });
  ElMessage.success(row.status ? "已启用" : "已禁用");
}
</script>

<style scoped>
.search-hot-keyword-wrapper {
  padding: 20px;
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
</style>
