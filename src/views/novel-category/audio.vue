<template>
  <div class="audio-novel-category-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="分类名称" clearable />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="searchForm.parentId" placeholder="全部父级分类" clearable style="width: 130px;">
            <el-option label="全部父级" value="" />
            <el-option label="无父级 (主分类)" :value="0" />
            <el-option v-for="item in audioNovelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
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
          <el-button type="success" @click="onAdd" size="small">+ 添加分类</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetStatus(1)" size="small" :disabled="selectedRows.length === 0">批量启用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetStatus(0)" size="small" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchUpdateSort" size="small" :loading="sortLoading">保存排序</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="allAudioNovelCategories"
        v-loading="audioNovelCategoryLoading"
        row-key="id"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="id" label="#编号" width="60" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="120" align="center" />
        <el-table-column prop="parent_name" label="父级分类" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.parent_id === 0">无</span>
            <span v-else>{{ getParentCategoryName(scope.row.parent_id) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="120" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" @change="markCategorySortChanged(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" min-width="120" align="center" />
        <el-table-column prop="update_time" label="更新时间" min-width="120" align="center" />
        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="onEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 (分类管理通常不分页，因为是树形结构或少量数据，但如果数据量大可按需启用) -->
    </el-card>

    <!-- 添加/编辑分类弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加分类':'编辑分类'" width="450px">
      <el-form :model="dialogForm" label-width="90px" size="small">
        <el-form-item label="分类名称" required>
          <el-input v-model="dialogForm.name" placeholder="请输入分类名称" clearable />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="dialogForm.parent_id" placeholder="选择父级分类" style="width:100%" clearable>
            <el-option label="无父级 (主分类)" :value="0" />
            <el-option
              v-for="item in audioNovelMainCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="dialogType === 'edit' && dialogForm.id === item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sort" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDialog" :loading="dialogLoading">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAudioNovelCategoryStore } from '@/store/modules/audio-novel-category.store';

const categoryStore = useAudioNovelCategoryStore();

const searchForm = ref({
  keyword: '',
  parentId: '',
  status: '',
});
const selectedRows = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<'add'|'edit'>('add');
const dialogForm = ref<any>({
  id: null,
  name: '',
  parent_id: 0,
  sort: 0,
  status: 1,
});
const dialogLoading = ref(false);
const sortLoading = ref(false);


const allAudioNovelCategories = computed(() => {
  let categories = [...categoryStore.mainCategories, ...categoryStore.subCategories];
  let filtered = categories.filter(cat => {
    const matchesKeyword = !searchForm.value.keyword || cat.name.includes(searchForm.value.keyword);
    const matchesParentId = searchForm.value.parentId === '' || cat.parent_id === searchForm.value.parentId;
    const matchesStatus = searchForm.value.status === '' || cat.status === searchForm.value.status;
    return matchesKeyword && matchesParentId && matchesStatus;
  });
  filtered.sort((a, b) => a.sort - b.sort);
  return filtered;
});

onMounted(() => {
  categoryStore.fetchCategories();
});

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

function getParentCategoryName(parentId: number) {
  const parent = categoryStore.mainCategories.find(cat => cat.id === parentId);
  return parent ? parent.name : '未知';
}

async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的分类');
  }
  await ElMessageBox.confirm('确定批量删除已选分类吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await categoryStore.batchDeleteCategories(ids);
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = [];
      categoryStore.fetchCategories();
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

async function onBatchSetStatus(status: number) {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选分类');
  }
  const actionText = status === 1 ? '启用' : '禁用';
  await ElMessageBox.confirm(`确定批量${actionText}已选分类吗？`, '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await categoryStore.batchSetStatus(ids, status);
    if (res && res.code === 0) {
      ElMessage.success(`批量${actionText}成功`);
      selectedRows.value = [];
      categoryStore.fetchCategories();
    } else {
      ElMessage.error(res?.msg || `批量${actionText}失败`);
    }
  }).catch(() => {
    ElMessage.info(`已取消批量${actionText}`);
  });
}

function onAdd() {
  dialogType.value = 'add';
  dialogForm.value = {
    id: null,
    name: '',
    parent_id: 0,
    sort: 0,
    status: 1,
  };
  dialogVisible.value = true;
}

function onEdit(row: any) {
  dialogType.value = 'edit';
  dialogForm.value = { ...row };
  dialogVisible.value = true;
}

async function submitDialog() {
  if (!dialogForm.value.name) {
    return ElMessage.error('分类名称为必填项');
  }
  dialogLoading.value = true;
  let res;
  if (dialogType.value === 'add') {
    res = await categoryStore.addCategory(dialogForm.value);
  } else {
    res = await categoryStore.updateCategory(dialogForm.value);
  }
  if (res && res.code === 0) {
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
    dialogVisible.value = false;
    categoryStore.fetchCategories();
  } else {
    ElMessage.error(res?.msg || '操作失败');
  }
  dialogLoading.value = false;
}

async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除分类 “${row.name}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await categoryStore.deleteCategory(row.id);
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
      categoryStore.fetchCategories();
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}
</script>

<style scoped>
.audio-novel-category-manage-page { padding: 18px; }
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
</style>
