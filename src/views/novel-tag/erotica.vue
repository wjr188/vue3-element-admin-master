<template>
  <div class="text-novel-tag-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.keyword" placeholder="标签名" clearable />
        </el-form-item>
        <!--
          // 如果标签需要关联到具体的小说、分类（系列/合集），可以在这里添加筛选条件
          // 目前文字小说标签后端控制器没有 creatorId, seriesId, collectionId
          // 如果未来需要，请确保后端API支持这些筛选并在此处添加
          <el-form-item label="所属小说">
            <el-select v-model="searchForm.novelId" placeholder="全部小说" clearable style="width: 130px;">
              <el-option label="全部" value="" />
              // TODO: 绑定到小说列表数据
              <el-option v-for="novel in novelList" :key="novel.id" :label="novel.title" :value="novel.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属分类">
            <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 130px;">
              <el-option label="全部" value="" />
              // 绑定到小说分类数据 (主分类或所有分类)
              <el-option v-for="cat in novelMainCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-form-item>
        -->
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
          <el-button type="success" @click="onAdd" size="small">+ 添加标签</el-button>
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
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="novelTagList"
        v-loading="novelTagLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="id" label="#编号" width="60" align="center" />
        <el-table-column prop="name" label="标签名称" min-width="150" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" @change="markTagSortChanged(scope.row)" />
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
      <!-- 标签管理通常不分页，因为数量相对较少，且需要展示所有供选择 -->
    </el-card>

    <!-- 添加/编辑标签弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加标签':'编辑标签'" width="450px">
      <el-form :model="dialogForm" label-width="90px" size="small">
        <el-form-item label="标签名称" required>
          <el-input v-model="dialogForm.name" placeholder="请输入标签名称" clearable />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入文字小说标签 Store
import {
  novelTagList,
  novelTagLoading,
  fetchNovelTags,
  addNovelTag,
  updateNovelTag,
  deleteNovelTag,
  batchDeleteNovelTags,
  batchSetNovelTagStatus,
  toggleNovelTagStatus, // 即使不直接使用，也导入以便参考
} from '@/store/modules/text-novel-tag.store.ts';

// 导入文字小说分类 Store (可能需要用来作为关联选项，例如标签可以关联到某个分类)
// 这里仅作导入示例，如果标签没有直接关联分类的需求，可以不使用
// import {
//   novelMainCategories,
//   novelSubCategories,
//   fetchNovelCategories,
// } from '@/store/modules/text-novel-category.store.ts';

// ======================= 状态变量 =======================

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: '', // 1启用，0禁用，空表示全部
  // novelId: '', // 如果标签需要关联小说，可以在这里添加筛选
  // categoryId: '', // 如果标签需要关联分类，可以在这里添加筛选
});

// 表格多选
const selectedRows = ref<any[]>([]);
// 记录排序变更的标签ID
const tagSortChangedIds = ref<Set<number>>(new Set());

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref<'add'|'edit'>('add');
const dialogForm = ref<any>({
  id: null,
  name: '',
  sort: 0,
  status: 1, // 默认启用
});
const dialogLoading = ref(false); // 弹窗内保存按钮的加载状态


// ======================= 生命周期 & 初始化 =======================

onMounted(async () => {
  await fetchTableData();
  // 如果标签需要关联分类/小说，可以在这里加载相关数据
  // await fetchNovelCategories();
  // await fetchNovelList(); // 如果有小说列表的 Store
});

// ======================= 数据获取与列表操作 =======================

/**
 * 获取标签列表 (wrapper function)
 */
async function fetchTableData() {
  await fetchNovelTags(searchForm.value);
  tagSortChangedIds.value.clear(); // 刷新列表后清空变更标记
}

/**
 * 搜索按钮点击
 */
function onSearch() {
  fetchTableData();
}

/**
 * 重置按钮点击
 */
function onReset() {
  searchForm.value = {
    keyword: '',
    status: '',
  };
  fetchTableData();
}

/**
 * 处理表格选择变化
 */
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

// ======================= 批量操作 =======================

/**
 * 批量删除
 */
async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的标签');
  }
  await ElMessageBox.confirm('确定批量删除已选标签吗？此操作将同时解除关联小说作品！', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchDeleteNovelTags(ids); // 调用 Store 的批量删除
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = [];
      fetchTableData(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

/**
 * 批量设置标签状态
 * @param status 0:禁用, 1:启用
 */
async function onBatchSetStatus(status: number) {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选标签');
  }
  const actionText = status === 1 ? '启用' : '禁用';
  await ElMessageBox.confirm(`确定批量${actionText}已选标签吗？`, '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetNovelTagStatus(ids, status); // 调用 Store 的批量设置状态
    if (res && res.code === 0) {
      ElMessage.success(`批量${actionText}成功`);
      selectedRows.value = [];
      fetchTableData(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || `批量${actionText}失败`);
    }
  }).catch(() => {
    ElMessage.info(`已取消批量${actionText}`);
  });
}

/**
 * 标记标签排序已修改
 */
function markTagSortChanged(tag: any) {
  tagSortChangedIds.value.add(tag.id);
  // 注意：批量保存排序逻辑在此处未实现，如果需要，可以添加一个 "保存排序" 按钮，并调用后端批量更新接口
  // 例如：await service.post('/api/text_novel_tag/batchUpdateSort', { list: Array.from(tagSortChangedIds.value).map(id => novelTagList.value.find(t => t.id === id)) });
}

// ======================= 单条操作 =======================

/**
 * 打开新增弹窗
 */
function onAdd() {
  dialogType.value = 'add';
  dialogForm.value = {
    id: null,
    name: '',
    sort: 0,
    status: 1,
  };
  dialogVisible.value = true;
}

/**
 * 打开编辑弹窗
 */
function onEdit(row: any) {
  dialogType.value = 'edit';
  // 复制当前行数据到表单
  dialogForm.value = { ...row };
  dialogVisible.value = true;
}

/**
 * 提交新增/编辑表单
 */
async function submitDialog() {
  if (!dialogForm.value.name) {
    return ElMessage.error('标签名称为必填项');
  }

  dialogLoading.value = true;
  try {
    let res;
    if (dialogType.value === 'add') {
      res = await addNovelTag(dialogForm.value); // 调用 Store 的新增
    } else {
      res = await updateNovelTag(dialogForm.value); // 调用 Store 的更新
    }

    if (res && res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
      dialogVisible.value = false;
      fetchTableData(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '操作失败');
    }
  } catch (error) {
    console.error('提交表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    dialogLoading.value = false;
  }
}

/**
 * 删除标签
 */
async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除标签 “${row.name}” 吗？此操作将同时解除关联小说作品！`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteNovelTag(row.id); // 调用 Store 的删除
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}
</script>

<style scoped>
.text-novel-tag-manage-page { padding: 18px; }
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
