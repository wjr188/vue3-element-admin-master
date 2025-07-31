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
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
          <el-button type="warning" @click="onBatchDisable" size="small" :disabled="!selectedRows.length">批量禁用</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="!selectedRows.length">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" :disabled="!sortChangedRows.length" @click="onBatchSaveSort">保存排序</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="filteredTagData"
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
        <el-table-column prop="sort" label="排序" min-width="70" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.sort"
              :min="0"
              size="small"
              style="width: 60px"
              @change="onSortChange(scope.row)"
            />
          </template>
        </el-table-column>
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
    </el-card>

    <!-- 新增/编辑标签弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增标签':'编辑标签'" width="420px">
      <el-form :model="dialogForm" label-width="72px" size="small">
        <el-form-item label="标签名">
          <el-input v-model="dialogForm.name" placeholder="必填" maxlength="16" />
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="dialogForm.alias" maxlength="24" placeholder="可选，如英文/拼音" />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="dialogForm.group" placeholder="选择分组" style="width:100%">
            <el-option v-for="g in allGroups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dialogForm.desc" maxlength="48" type="textarea" :autosize="{minRows:2,maxRows:3}" placeholder="可选" />
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
import { useAnimeTagsStore } from '@/store/animeTags.store' // 新的 Pinia store

const animeTagsStore = useAnimeTagsStore()

onMounted(() => {
  animeTagsStore.fetchTags()
})

const searchForm = ref({ keyword: '', group: '', status: '' })
const filteredTagData = computed(() => {
  return animeTagsStore.tags.filter(t => {
    if (searchForm.value.keyword) {
      const kw = searchForm.value.keyword.toLowerCase()
      if (
        !(t.name && t.name.toLowerCase().includes(kw)) &&
        !(t.alias && t.alias.toLowerCase().includes(kw))
      ) return false
    }
    if (searchForm.value.group && t.group !== searchForm.value.group) return false
    if (searchForm.value.status !== '' && String(t.status) !== String(searchForm.value.status)) return false
    return true
  })
})
const allGroups = computed(() => {
  const set = new Set<string>()
  animeTagsStore.tags.forEach(t => t.group && set.add(t.group))
  return Array.from(set)
})
function onSearch() {
  animeTagsStore.fetchTags({
    keyword: searchForm.value.keyword,
    group: searchForm.value.group,
    status: searchForm.value.status,
  })
}
function onReset() {
  searchForm.value = { keyword: '', group: '', status: '' }
  animeTagsStore.fetchTags()
}

// 表格多选
const selectedRows = ref<any[]>([])
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogForm = ref({
  id: null as null | number,
  name: '',
  alias: '',
  group: '',
  desc: '',
  status: 1,
  sort: 0,
})

function openAddDialog() {
  dialogType.value = 'add'
  Object.assign(dialogForm.value, { id: null, name: '', alias: '', group: '', desc: '', status: 1, sort: 0 })
  dialogVisible.value = true
}
function openEditDialog(row: any) {
  dialogType.value = 'edit'
  Object.assign(dialogForm.value, { ...row })
  // 如果后端返回的数据没有 status 字段，给个默认值
  if (typeof dialogForm.value.status === 'undefined') {
    dialogForm.value.status = 1 // 或 0，按你的业务默认
  }
  dialogVisible.value = true
}
async function submitTag() {
  if (!dialogForm.value.name) return ElMessage.error('标签名必填')
  // 强制保证 status 字段为 0 或 1
  if (dialogForm.value.status !== 0 && dialogForm.value.status !== 1) {
    dialogForm.value.status = 1 // 或 0，按你的业务默认
  }
  if (dialogType.value === 'add') {
    const res = await animeTagsStore.addTag({ ...dialogForm.value, status: dialogForm.value.status })
    if (res.code === 0) ElMessage.success('新增成功！')
  } else {
    const res = await animeTagsStore.updateTag({ ...dialogForm.value, status: dialogForm.value.status })
    if (res.code === 0) ElMessage.success('保存成功！')
  }
  dialogVisible.value = false
  animeTagsStore.fetchTags()
}

// 启用/禁用
async function toggleStatus(row: any) {
  await animeTagsStore.toggleTagStatus(row.id)
  animeTagsStore.fetchTags()
  ElMessage.success(row.status === 1 ? '已禁用' : '已启用')
}

// 删除
function onDelete(row: any) {
  ElMessageBox.confirm('确认删除该标签？', '警告', { type: 'warning' }).then(async () => {
    await animeTagsStore.deleteTag(row.id)
    ElMessage.success('删除成功')
    animeTagsStore.fetchTags()
  })
}
function onBatchDisable() {
  if (!selectedRows.value.length) return ElMessage.warning('请先勾选要操作的标签')
  const ids = selectedRows.value.map((t: any) => t.id)
  animeTagsStore.batchDisableTags(ids).then(() => {
    ElMessage.success('批量禁用成功')
    animeTagsStore.fetchTags()
  })
}
function onBatchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先勾选要删除的标签')
  const ids = selectedRows.value.map((row: any) => row.id)
  ElMessageBox.confirm('确定批量删除已选标签？', '警告', { type: 'warning' }).then(async () => {
    await animeTagsStore.batchDeleteTags(ids)
    ElMessage.success('批量删除成功')
    animeTagsStore.fetchTags()
  })
}

// ===== 批量排序 =====
const sortChangedRows = ref<{ id: number, sort: number }[]>([])
function onSortChange(row: any) {
  const idx = sortChangedRows.value.findIndex(item => item.id === row.id)
  if (idx > -1) {
    sortChangedRows.value[idx].sort = row.sort
  } else {
    sortChangedRows.value.push({ id: row.id, sort: row.sort })
  }
}
async function onBatchSaveSort() {
  if (!sortChangedRows.value.length) return
  await animeTagsStore.batchUpdateTagSort(sortChangedRows.value)
  ElMessage.success('排序已更新')
  await animeTagsStore.fetchTags()
  sortChangedRows.value = []
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
.el-form-item { margin-right: 7px; }
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
