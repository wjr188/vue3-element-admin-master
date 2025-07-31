<template>
  <div class="comic-tag-manage-page">
    <!-- Search/Batch Operation Area -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.keyword" placeholder="标签名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
          <el-button type="warning" @click="onBatchSetStatus(0)" size="small" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetStatus(1)" size="small" :disabled="selectedRows.length === 0">批量启用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Area -->
    <el-card class="table-card">
      <el-table
        :data="tags"
        v-loading="loading"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="#ID" width="60" align="center" />
        <el-table-column prop="name" label="标签名" min-width="150" align="center" />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status == 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column prop="content_count" label="内容数" width="80" align="center" />
        <el-table-column prop="created_at" label="创建时间" min-width="115" align="center" />
        <el-table-column prop="updated_at" label="更新时间" min-width="115" align="center" />
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
        <el-form-item label="标签名" required>
          <el-input v-model="dialogForm.name" placeholder="必填" maxlength="16" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sort" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitTag" :loading="dialogLoading">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/utils/request' // 假设你的请求工具在这里
import { useComicTagsStore } from '@/store/modules/comicTags.store'
import { storeToRefs } from 'pinia'

// 导入漫画标签 Store
const tagStore = useComicTagsStore()
const { tags, loading } = storeToRefs(tagStore)

// Search conditions
const searchForm = ref({
  keyword: '',
  status: ''
})

// Table selection
const selectedRows = ref<any[]>([])

// Dialog related
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  name: '',
  status: 1,
  sort: 0,
  remark: '', // 可选
})
const dialogLoading = ref(false);

// Get tag data
async function fetchTableData() {
  console.log('页面开始获取标签数据')
  await tagStore.fetchTags(searchForm.value)
  console.log('页面获取完成，当前tags:', tagStore.tags)
}

onMounted(async () => {
  await fetchTableData() // Load tag data on mount
})

function onReset() {
  searchForm.value = { keyword: '', status: '' }
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
  
  dialogLoading.value = true;
  try {
    let res
    if (dialogType.value === 'add') {
      res = await tagStore.addTag(dialogForm.value) // Call Store's addComicTag
    } else {
      res = await tagStore.updateTag(dialogForm.value) // Call Store's updateComicTag
    }
    console.log('接口原始返回:', res, typeof res.data, res.data);
    if (res && res.code === 0) {
      ElMessage.success('操作成功！')
      dialogVisible.value = false
      await fetchTableData() // Refresh table data
    } else {
      ElMessage.error(res?.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交标签表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    dialogLoading.value = false;
  }
}

// Batch Set Status (Enable/Disable)
async function onBatchSetStatus(status: number) {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  const actionText = status === 1 ? '启用' : '禁用';
  const ids = selectedRows.value.map(r => r.id)
  ElMessageBox.confirm(`确定要批量${actionText}已选标签吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await tagStore.batchSetTagStatus(ids, status); // Call Store's batchSetComicTagStatus
    if (res && res.code === 0) {
      ElMessage.success(`批量${actionText}成功`)
      selectedRows.value = []; // Clear selection
      fetchTableData()
    } else {
      ElMessage.error(res?.msg || '操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// Batch Delete
function onBatchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  ElMessageBox.confirm('确定要批量删除已选标签吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    const res = await tagStore.batchDeleteTags(ids) // Call Store's batchDeleteComicTags
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功')
      selectedRows.value = []; // Clear selection
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
    const res = await tagStore.deleteTag(row.id) // Call Store's deleteComicTag
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
.comic-tag-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; margin-bottom: 15px; }
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
