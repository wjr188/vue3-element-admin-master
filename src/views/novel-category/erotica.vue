<template>
  <div class="text-novel-category-manage-page">
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
            <el-option v-for="item in novelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
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
        :data="allNovelCategories"
        v-loading="novelCategoryLoading"
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
      <!-- 分页组件 (分类管理通常不分页，因为是树形结构或少量数据)
           如果分类数据量大，可以考虑分页
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="novelTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      /> -->
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
              v-for="item in novelMainCategories"
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入文字小说分类 Store
import {
  novelMainCategories,
  novelSubCategories,
  novelCategoryLoading,
  fetchNovelCategories,
  addNovelCategory,
  updateNovelCategory,
  deleteNovelCategory,
  batchDeleteNovelCategories,
  toggleNovelCategoryStatus,
  batchSetNovelCategoryStatus,
} from '@/store/modules/text-novel-category.store.ts';

// ======================= 状态变量 =======================

// 搜索表单
const searchForm = ref({
  keyword: '',
  parentId: '', // 0表示主分类，具体ID表示子分类，空表示全部
  status: '', // 1启用，0禁用，空表示全部
});

// 表格多选
const selectedRows = ref<any[]>([]);
// 记录排序变更的分类ID
const categorySortChangedIds = ref<Set<number>>(new Set());

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref<'add'|'edit'>('add');
const dialogForm = ref<any>({
  id: null,
  name: '',
  parent_id: 0, // 默认主分类
  sort: 0,
  status: 1, // 默认启用
});
const dialogLoading = ref(false); // 弹窗内保存按钮的加载状态
const sortLoading = ref(false); // 保存排序按钮的加载状态


// 结合主分类和子分类，用于表格显示
const allNovelCategories = computed(() => {
  let categories = [...novelMainCategories.value, ...novelSubCategories.value];

  // 应用筛选
  let filtered = categories.filter(cat => {
    const matchesKeyword = !searchForm.value.keyword ||
                           cat.name.includes(searchForm.value.keyword);
    const matchesParentId = searchForm.value.parentId === '' ||
                            cat.parent_id === searchForm.value.parentId;
    const matchesStatus = searchForm.value.status === '' ||
                          cat.status === searchForm.value.status;
    return matchesKeyword && matchesParentId && matchesStatus;
  });

  // 按 sort 字段排序
  filtered.sort((a, b) => a.sort - b.sort);

  return filtered;
});


// ======================= 生命周期 & 初始化 =======================

onMounted(async () => {
  await fetchTableData();
});

// ======================= 数据获取与列表操作 =======================

/**
 * 获取分类列表 (wrapper function)
 */
async function fetchTableData() {
  // fetchNovelCategories 不接受分页参数，因为它旨在获取所有分类
  // 筛选逻辑放在 computed property 中
  await fetchNovelCategories();
  categorySortChangedIds.value.clear(); // 刷新列表后清空变更标记
}

/**
 * 搜索按钮点击
 */
function onSearch() {
  // 筛选逻辑已在 computed property 中，这里只需重新触发获取数据
  // 这样可以确保数据是最新的，如果后端有根据搜索条件返回的优化
  fetchTableData();
}

/**
 * 重置按钮点击
 */
function onReset() {
  searchForm.value = {
    keyword: '',
    parentId: '',
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

/**
 * 获取父级分类名称
 */
function getParentCategoryName(parentId: number) {
  const parent = novelMainCategories.value.find(cat => cat.id === parentId);
  return parent ? parent.name : '未知';
}

// ======================= 批量操作 =======================

/**
 * 批量删除
 */
async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的分类');
  }
  await ElMessageBox.confirm('确定批量删除已选分类吗？此操作将同时删除其下所有子分类及关联小说！', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchDeleteNovelCategories(ids); // 调用 Store 的批量删除
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
 * 批量设置分类状态
 * @param status 0:禁用, 1:启用
 */
async function onBatchSetStatus(status: number) {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选分类');
  }
  const actionText = status === 1 ? '启用' : '禁用';
  await ElMessageBox.confirm(`确定批量${actionText}已选分类吗？`, '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetNovelCategoryStatus(ids, status); // 调用 Store 的批量设置状态
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
 * 标记分类排序已修改
 */
function markCategorySortChanged(category: any) {
  categorySortChangedIds.value.add(category.id);
}

/**
 * 批量保存排序
 */
async function onBatchUpdateSort() {
  if (categorySortChangedIds.value.size === 0) {
    ElMessage.info('没有检测到分类排序变更');
    return;
  }
  sortLoading.value = true;
  try {
    const updatedSortList = Array.from(categorySortChangedIds.value)
      .map(id => allNovelCategories.value.find(cat => cat.id === id))
      .filter(Boolean) // 过滤掉未找到的分类
      .map(cat => ({ id: cat.id, sort: cat.sort }));

    // 假设后端有 batchUpdateSort 接口，或者直接调用 updateNovelCategory 循环
    // 由于后端没有提供 batchUpdateSort for text novel category，这里模拟批量操作
    // 实际应根据后端API调整
    let successCount = 0;
    for (const item of updatedSortList) {
      const res = await updateNovelCategory(item); // 假设 updateNovelCategory 可以处理只传id和sort
      if (res && res.code === 0) {
        successCount++;
      }
    }

    if (successCount === updatedSortList.length) {
      ElMessage.success('分类排序保存成功！');
      categorySortChangedIds.value.clear();
      fetchTableData(); // 重新获取数据以确保UI同步最新排序
    } else {
      ElMessage.error('部分分类排序保存失败，请检查');
    }

  } catch (error) {
    console.error('保存分类排序请求失败:', error);
    ElMessage.error('保存分类排序请求失败');
  } finally {
    sortLoading.value = false;
  }
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
    parent_id: 0, // 默认主分类
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
    return ElMessage.error('分类名称为必填项');
  }

  dialogLoading.value = true;
  try {
    let res;
    if (dialogType.value === 'add') {
      res = await addNovelCategory(dialogForm.value); // 调用 Store 的新增
    } else {
      res = await updateNovelCategory(dialogForm.value); // 调用 Store 的更新
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
 * 删除分类
 */
async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除分类 “${row.name}” 吗？此操作将同时删除其下所有子分类及关联小说！`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteNovelCategory(row.id); // 调用 Store 的删除
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
.text-novel-category-manage-page { padding: 18px; }
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
