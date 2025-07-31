<template>
  <div class="weimiquan-tag-manage-page">
    <!-- 搜索/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.keyword" placeholder="标签名/别名/拼音" clearable />
        </el-form-item>
        <el-form-item label="所属博主">
          <el-select v-model="searchForm.author" placeholder="全部博主" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <!-- 绑定到 weimiParentCategories (作为博主列表) -->
            <el-option v-for="author in weimiParentCategories" :key="author.id" :label="author.name" :value="author.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主分类">
          <el-select v-model="searchForm.parent_id" placeholder="全部主分类" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <!-- 绑定到 weimiParentCategories -->
            <el-option v-for="cat in weimiParentCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select v-model="searchForm.child_id" placeholder="全部子分类" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <!-- 绑定到 weimiChildCategories -->
            <el-option v-for="cat in weimiChildCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
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

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="#ID" width="60" align="center" />
        <el-table-column prop="name" label="标签名" min-width="100" align="center" />
        <el-table-column prop="author_name" label="所属博主" min-width="100" align="center" />
        <el-table-column prop="parent_name" label="主分类" min-width="100" align="center" />
        <el-table-column prop="child_name" label="子分类" min-width="100" align="center" />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status == 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="图片数量" width="90" align="center" />
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

    <!-- 新增/编辑标签弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增标签':'编辑标签'" width="420px">
      <el-form :model="dialogForm" label-width="80px" size="small">
        <el-form-item label="标签名">
          <el-input v-model="dialogForm.name" placeholder="必填" maxlength="16" />
        </el-form-item>
        <el-form-item label="所属博主">
          <el-select v-model="dialogForm.author_id" placeholder="请选择博主" style="width: 100%;">
            <!-- 绑定到 weimiParentCategories (作为博主列表) -->
            <el-option v-for="author in weimiParentCategories" :key="author.id" :label="author.name" :value="author.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主分类">
          <el-select v-model="dialogForm.parent_id" placeholder="请选择主分类" style="width: 100%;">
            <!-- 绑定到 weimiParentCategories -->
            <el-option v-for="cat in weimiParentCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select v-model="dialogForm.child_id" placeholder="请选择子分类" style="width: 100%;">
            <!-- 绑定到 weimiChildCategories -->
            <el-option v-for="cat in weimiChildCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
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

// 新增：导入微密圈分类和标签的 Store 模块
import {
  weimiParentCategories,
  weimiChildCategories,
  fetchWeimiCategories
} from '@/store/modules/weimi-categories.store';

import {
  weimiTags, // 导入 weimiTags (这里的 weimiTags 替代了之前的 allTags)
  fetchWeimiTags,
  addWeimiTag,       // 导入新增标签的函数
  updateWeimiTag,    // 导入编辑标签的函数
  deleteWeimiTag,    // 导入删除标签的函数
  batchDeleteWeimiTags, // 导入批量删除标签的函数
  batchDisableWeimiTags // 导入批量禁用标签的函数
} from '@/store/modules/weimi-tags.store';


// 查询条件
const searchForm = ref({
  keyword: '',
  author: '', // 对应博主ID
  parent_id: '',
  child_id: '',
  status: ''
})

// 表格数据
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])

// 下拉选项
// authors 现在直接绑定到 weimiParentCategories
// parentCategories 现在直接绑定到 weimiParentCategories
// childCategories 现在直接绑定到 weimiChildCategories
// allTags 现在直接绑定到 weimiTags
const authors = computed(() => weimiParentCategories.value); // 假定博主就是一级分类

const childCategoryOptions = computed(() => {
  if (!searchForm.value.parent_id) return weimiChildCategories.value
  return weimiChildCategories.value.filter(c => c.parent_id == searchForm.value.parent_id)
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  name: '',
  author_id: '',
  parent_id: '',
  child_id: '',
  status: 1,
  sort: 0
})

// 获取所有下拉项
async function fetchAllOptions() {
  // 调用 Store 中的 fetch 函数
  await fetchWeimiCategories(); // 获取父分类和子分类，填充 weimiParentCategories 和 weimiChildCategories
  await fetchWeimiTags(); // 获取标签，填充 weimiTags
  // authors 已经通过 computed 绑定到 weimiParentCategories 了，这里不需要单独获取
}

// 获取标签数据 (现在这个函数将请求 weimi-tags.store 中的数据)
async function fetchTableData() {
  // 由于 weimi-tags.store 已经有一个 weimiTags.value 响应式数据
  // 如果这个 fetchTableData 是用来拉取 weimi-tags.store 中的数据并进行筛选
  // 那么可以考虑直接使用 weimiTags.value 或者让 weimi-tags.store 提供一个带筛选参数的 fetch 函数
  // 这里暂时沿用你的 fetchTableData 命名，并假设它从后端拉取过滤后的标签列表
  const res = await service.get('/api/weimiquan-tags/list', { params: searchForm.value })
  if (res.data.code === 0) tableData.value = res.data.data
}

onMounted(async () => {
  await fetchAllOptions() // 加载分类和标签数据
  await fetchTableData() // 加载标签列表
})

function onReset() {
  searchForm.value = { keyword: '', author: '', parent_id: '', child_id: '', status: '' }
  fetchTableData()
}

// 多选
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// 新增/编辑
function openAddDialog() {
  dialogType.value = 'add'
  dialogForm.value = {
    id: null,
    name: '',
    author_id: '',
    parent_id: '',
    child_id: '',
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
  if (!dialogForm.value.author_id) return ElMessage.error('请选择博主')
  if (!dialogForm.value.parent_id) return ElMessage.error('请选择主分类')
  if (!dialogForm.value.child_id) return ElMessage.error('请选择子分类')
  let res
  if (dialogType.value === 'add') {
    res = await addWeimiTag(dialogForm.value) // 调用 Store 中的 addWeimiTag
  } else {
    res = await updateWeimiTag(dialogForm.value) // 调用 Store 中的 updateWeimiTag
  }
  if (res.data.code === 0) {
    ElMessage.success('操作成功！')
    dialogVisible.value = false
    fetchTableData() // 刷新表格数据
  } else {
    ElMessage.error(res.data.msg || '操作失败')
  }
}

// 批量禁用
function onBatchDisable() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  const ids = selectedRows.value.map(r => r.id)
  batchDisableWeimiTags(ids).then(res => { // 调用 Store 中的 batchDisableWeimiTags
    if (res.data.code === 0) {
      ElMessage.success('批量禁用成功')
      fetchTableData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  })
}
// 批量删除
function onBatchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择标签')
  ElMessageBox.confirm('确定要批量删除已选标签吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    const res = await batchDeleteWeimiTags(ids) // 调用 Store 中的 batchDeleteWeimiTags
    if (res.data.code === 0) {
      ElMessage.success('批量删除成功')
      fetchTableData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  })
}
// 删除
function onDelete(row: any) {
  ElMessageBox.confirm('确定要删除该标签吗？', '警告', { type: 'warning' }).then(async () => {
    const res = await deleteWeimiTag(row.id) // 调用 Store 中的 deleteWeimiTag
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchTableData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  })
}
</script>

<style scoped>
.weimiquan-tag-manage-page { padding: 18px; }
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