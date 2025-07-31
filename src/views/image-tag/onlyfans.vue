<template>
  <div class="onlyfans-tag-manage-page">
    <!-- Search/Batch Operation Area -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.keyword" placeholder="标签名/别名/拼音" clearable />
        </el-form-item>
        <el-form-item label="所属创作者">
          <el-select v-model="searchForm.creatorId" placeholder="全部创作者" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option v-for="creator in onlyfansParentCategories" :key="creator.id" :label="creator.name" :value="creator.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容系列">
          <el-select v-model="searchForm.seriesId" placeholder="全部内容系列" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option v-for="cat in onlyfansParentCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容合集">
          <el-select v-model="searchForm.collectionId" placeholder="全部内容合集" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option v-for="cat in onlyfansChildCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchTableData" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="openAddDialog" size="small">+ 新增标签</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchDisable" size="small">批量禁用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Area -->
    <el-card class="table-card">
      <el-table
        :data="onlyfansTags"
        v-loading="onlyfansTagLoading"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="#ID" width="60" align="center" />
        <el-table-column prop="name" label="标签名" min-width="100" align="center" />
        <el-table-column prop="creator_name" label="所属创作者" min-width="100" align="center" />
        <el-table-column prop="series_name" label="内容系列" min-width="100" align="center" />
        <el-table-column prop="collection_name" label="内容合集" min-width="100" align="center" />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status == 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="媒体数量" width="90" align="center" />
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column prop="create_time" label="创建时间" min-width="115" align="center" />
        <el-table-column prop="update_time" label="更新时间" min-width="115" align="center" />
        <el-table-column label="操作" fixed="right" width="140" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- New/Edit Tag Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增标签':'编辑标签'" width="420px">
      <el-form :model="dialogForm" label-width="80px" size="small">
        <el-form-item label="标签名">
          <el-input v-model="dialogForm.name" placeholder="必填" maxlength="16" />
        </el-form-item>
        <el-form-item label="所属创作者">
          <el-select v-model="dialogForm.creator_id" placeholder="请选择创作者" style="width: 100%;">
            <el-option v-for="creator in onlyfansParentCategories" :key="creator.id" :label="creator.name" :value="creator.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容系列">
          <el-select v-model="dialogForm.series_id" placeholder="请选择内容系列" style="width: 100%;">
            <el-option v-for="cat in onlyfansParentCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容合集">
          <el-select v-model="dialogForm.collection_id" placeholder="请选择内容合集" style="width: 100%;">
            <el-option v-for="cat in onlyfansChildCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
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
import service from '@/utils/request'

// New: Import OnlyFans Category and Tag Store modules
import {
  onlyfansParentCategories,
  onlyfansChildCategories,
  fetchOnlyFansCategories
} from '@/store/modules/onlyfans-categories.store';

import {
  onlyfansTags,
  onlyfansTagLoading,
  fetchOnlyFansTags,
  addOnlyFansTag,
  updateOnlyFansTag,
  deleteOnlyFansTag,
  batchDeleteOnlyFansTags,
  batchSetOnlyFansTagStatus
} from '@/store/modules/onlyfans-tags.store';


// Search conditions
const searchForm = ref({
  keyword: '',
  creatorId: '',
  seriesId: '',
  collectionId: '',
  status: ''
})

// Table data
const selectedRows = ref<any[]>([])

// Dropdown options
const creators = computed(() => onlyfansParentCategories.value);

const childCategoryOptions = computed(() => {
  if (!searchForm.value.seriesId) return onlyfansChildCategories.value
  return onlyfansChildCategories.value.filter(c => c.parent_id == searchForm.value.seriesId)
})

// Dialog related
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  name: '',
  creator_id: '',
  series_id: '',
  collection_id: '',
  status: 1,
  sort: 0
})

// Get all dropdown options
async function fetchAllOptions() {
  await fetchOnlyFansCategories();
  await fetchOnlyFansTags(searchForm.value);
}

// Get tag data
async function fetchTableData() {
  await fetchOnlyFansTags(searchForm.value);
}

onMounted(async () => {
  await fetchAllOptions()
})

function onReset() {
  searchForm.value = { keyword: '', creatorId: '', seriesId: '', collectionId: '', status: '' }
  fetchTableData()
}

// Multi-select
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// Add/Edit
function openAddDialog() {
  dialogType.value = 'add'
  dialogForm.value = {
    id: null,
    name: '',
    creator_id: '',
    series_id: '',
    collection_id: '',
    status: 1,
    sort: 0
  }
  dialogVisible.value = true
}
function openEditDialog(row: any) {
  dialogType.value = 'edit'
  dialogForm.value = { ...row }
  dialogVisible.value = true
}
async function submitTag() {
  if (!dialogForm.value.name) return ElMessage.error('标签名必填')
  if (!dialogForm.value.creator_id) return ElMessage.error('请选择创作者')
  if (!dialogForm.value.series_id) return ElMessage.error('请选择内容系列')
  if (!dialogForm.value.collection_id) return ElMessage.error('请选择内容合集')
  let res
  if (dialogType.value === 'add') {
    res = await addOnlyFansTag(dialogForm.value)
  } else {
    res = await updateOnlyFansTag(dialogForm.value)
  }
  if (res && res.code === 0) {
    ElMessage.success('操作成功！')
    dialogVisible.value = false
    fetchTableData()
  } else {
    ElMessage.error(res?.msg || '操作失败')
  }
}

// Batch Disable
function onBatchDisable() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  const ids = selectedRows.value.map(r => r.id)
  ElMessageBox.confirm('确定要批量禁用已选标签吗？', '警告', { type: 'warning' }).then(async () => {
    const res = await batchSetOnlyFansTagStatus(ids, 0);
    if (res && res.code === 0) {
      ElMessage.success('批量禁用成功')
      fetchTableData()
    } else {
      ElMessage.error(res?.msg || '操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消批量禁用');
  });
}
// Batch Delete
function onBatchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  ElMessageBox.confirm('确定要批量删除已选标签吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    const res = await batchDeleteOnlyFansTags(ids)
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功')
      fetchTableData()
    } else {
      ElMessage.error(res?.msg || '批量删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}
// Delete
function onDelete(row: any) {
  ElMessageBox.confirm('确定要删除该标签吗？', '警告', { type: 'warning' }).then(async () => {
    const res = await deleteOnlyFansTag(row.id)
    if (res && res.code === 0) {
      ElMessage.success('删除成功')
      fetchTableData()
    } else {
      ElMessage.error(res?.msg || '删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}
</script>

<style scoped>
.onlyfans-tag-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; }
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
