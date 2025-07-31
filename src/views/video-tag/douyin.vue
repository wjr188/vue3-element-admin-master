<template>
  <div class="tag-manage-page">
    <!-- 搜索/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.keyword" placeholder="标签名/别名/拼音" clearable />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="searchForm.group" placeholder="全部分组" clearable style="width: 120px;">
            <el-option label="全部" value="" />
            <el-option v-for="g in allGroups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="openAddDialog" size="small">+ 新增标签</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchDisable" size="small" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="douyinTags"
        v-loading="douyinTagLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column prop="id" label="#ID" width="52" align="center" />
        <el-table-column prop="name" label="标签名" min-width="110" align="center">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="title-cell">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="alias" label="别名/拼音" min-width="90" align="center" />
        <el-table-column prop="group" label="分组" min-width="90" align="center" />
        <el-table-column prop="desc" label="描述" min-width="140" align="center">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.desc" placement="top">
              <span class="title-cell" style="max-width: 120px;">{{ scope.row.desc }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="60" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="内容数" min-width="65" align="center" />
        <el-table-column prop="sort" label="排序" min-width="55" align="center" />
        <el-table-column prop="create_time" label="创建时间" min-width="112" align="center" />
        <el-table-column prop="update_time" label="更新时间" min-width="112" align="center" />
        <el-table-column label="操作" fixed="right" width="158" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
              <el-button size="small" type="warning" @click="toggleStatus(scope.row)">
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="douyinTagTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      ></el-pagination>
    </el-card>

    <!-- 新增/编辑标签弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增标签':'编辑标签'" width="420px" @close="onDialogClose">
      <el-form :model="dialogForm" label-width="72px" size="small" ref="dialogFormRef">
        <el-form-item label="标签名" prop="name" required>
          <el-input v-model="dialogForm.name" placeholder="必填" maxlength="16" />
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input v-model="dialogForm.alias" maxlength="24" placeholder="可选，如英文/拼音" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-select v-model="dialogForm.group" placeholder="选择分组" style="width:100%">
            <el-option v-for="g in allGroups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="dialogForm.desc" maxlength="48" type="textarea" :autosize="{minRows:2,maxRows:3}" placeholder="可选" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dialogForm.sort" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitTag">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入抖音标签 Store
import {
  douyinTags,
  douyinTagTotal,
  douyinTagLoading,
  fetchTagList,
  addTag,
  updateTag,
  deleteTag,
  batchDeleteTags,
  batchDisableTags,
  toggleTagStatus,
} from '@/store/modules/douyin-tag.store'

// 类型定义
interface Tag {
  id: number;
  name: string;
  alias?: string;
  group?: string;
  desc?: string;
  status: number; // 0:禁用, 1:启用
  count: number; // 内容数
  sort: number;
  create_time: string;
  update_time: string;
}

// ======================= 初始化加载数据 =======================
onMounted(() => {
  // 确保在组件挂载时，初始数据被正确加载
  fetchTagList(searchForm.value);
})

// ===================== 筛选/搜索表单 =====================
const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  group: '',
  status: '' as '' | 0 | 1
})

// 所有的分组选项 (从当前标签数据中动态提取)
const allGroups = computed(() => {
  const set = new Set<string>()
  // 确保 douyinTags 已经是一个数组，即使是空数组
  douyinTags.value.forEach(t => t.group && set.add(t.group))
  return Array.from(set)
})

async function onSearch() {
  searchForm.value.page = 1;
  await fetchTagList(searchForm.value);
}
async function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', group: '', status: '' };
  await fetchTagList(searchForm.value);
}

// ===================== 表格操作 =====================
const selectedRows = ref<Tag[]>([])
function handleSelectionChange(rows: Tag[]) { selectedRows.value = rows }

// ===================== 弹窗表单 =====================
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref({
  id: null as null|number,
  name: '',
  alias: '',
  group: '',
  desc: '',
  status: 1,
  sort: 0
})
const dialogFormRef = ref();

function openAddDialog() {
  dialogType.value = 'add';
  // 确保所有字段都有初始值
  Object.assign(dialogForm.value, { id: null, name: '', alias: '', group: '', desc: '', status: 1, sort: 0 });
  dialogVisible.value = true;
}
function openEditDialog(row: Tag) {
  dialogType.value = 'edit';
  // 使用展开运算符确保深拷贝，避免直接修改props
  Object.assign(dialogForm.value, { ...row });
  dialogVisible.value = true;
}
function onDialogClose() {
    if (dialogFormRef.value) {
        dialogFormRef.value.resetFields();
    }
    // 确保所有字段都有初始值，防止下次打开时保留旧数据
    Object.assign(dialogForm.value, { id: null, name: '', alias: '', group: '', desc: '', status: 1, sort: 0 });
}

async function submitTag() {
  if (!dialogForm.value.name) {
      ElMessage.error('标签名必填');
      return;
  }
  const submitData = {
      ...dialogForm.value,
      // 显式转换为数字，Element Plus Switch组件 v-model绑定到1/0可能已经是数字
      status: Number(dialogForm.value.status)
  };

  try {
      let res;
      if (dialogType.value === 'add') {
          res = await addTag(submitData);
      } else {
          if (submitData.id === null) {
              ElMessage.error('编辑失败：标签ID不存在');
              return;
          }
          res = await updateTag(submitData);
      }

      if (res && res.code === 0) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功！' : '保存成功！');
          dialogVisible.value = false;
      } else {
          ElMessage.error(res?.msg || '操作失败！');
      }
  } catch (error) {
      ElMessage.error('请求失败，请检查网络或后端服务');
      console.error('Submit Tag Error:', error);
  }
}

// ===================== 批量操作 =====================
async function toggleStatus(row: Tag) {
  const action = row.status === 1 ? '禁用' : '启用';
  await ElMessageBox.confirm(`确定${action}标签 “${row.name}” 吗？`, '提示', { type: 'warning' }).then(async () => {
    const res = await toggleTagStatus(row.id);
    if (res && res.code === 0) {
      ElMessage.success(`${action}成功`);
    } else {
      ElMessage.error(res?.msg || `${action}失败`);
    }
  }).catch(() => {
    ElMessage.info(`已取消${action}`);
  });
}

async function onDelete(row: Tag) {
  await ElMessageBox.confirm(`确认删除标签 “${row.name}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteTag(row.id);
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onBatchDisable() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选要操作的标签');
  }
  await ElMessageBox.confirm('确定批量禁用已选标签吗？', '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map((t: Tag) => t.id);
    const res = await batchDisableTags(ids, 0);
    if (res && res.code === 0) {
      ElMessage.success('批量禁用成功');
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || '批量禁用失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量禁用');
  });
}

async function onBatchDelete() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选要删除的标签');
  }
  await ElMessageBox.confirm('确定批量删除已选标签？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map((t: Tag) => t.id);
    const res = await batchDeleteTags(ids);
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}
</script>

<style scoped>
.tag-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; margin-bottom: 15px; }
.custom-table { font-size: 12px; border-radius: 9px; }
.header-cell {
  font-weight: 600;
  font-size: 12px !important;
  background: #f6f8fa !important;
  color: #333 !important;
  border-bottom: 1.1px solid #ebeef5 !important;
  padding: 6px 0;
}
.body-cell {
  font-size: 12px;
  color: #222;
  border-bottom: 1px solid #ebeef5 !important;
  padding: 4px 0;
}
.el-table th, .el-table td {
  border-right: 1px solid #ebeef5 !important;
  padding: 0 2px !important;
}
.el-table th:last-child, .el-table td:last-child { border-right: none !important; }
.el-table { border-radius: 9px; overflow: hidden; }
.el-table::before { height: 0; }
.el-card {
  border-radius: 9px;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 1px 8px 0 rgba(0,0,0,0.02) !important;
}
.el-button {
  border-radius: 5px !important;
  font-size: 11px !important;
  padding: 1px 8px !important;
  min-width: 52px !important;
}
.action-group {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}
.title-cell {
  cursor: pointer;
  display: inline-block;
  max-width: 72px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.title-tooltip {
  font-size: 14px;
  padding: 7px 10px;
  white-space: pre-line;
}
</style>
