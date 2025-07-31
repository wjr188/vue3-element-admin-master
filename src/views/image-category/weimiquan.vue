<template>
  <div class="category-manage-wrapper">
    <!-- 左侧 博主树 -->
    <div class="side-tree">
      <div class="tree-header">
        博主分类树
        <el-button type="success" size="small" @click="openCreatorDialog" style="margin-left: 12px;">
          + 新建博主
        </el-button>
      </div>
      <el-tree
        :data="creatorTree"
        :props="treeProps"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="onCreatorSelect"
        :current-node-key="currentCreatorId"
      >
        <template #default="{ data }">
          <span :class="['tree-node', { active: currentCreatorId === data.id }]">{{ data.name }}</span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧 内容区 -->
    <div class="main-content">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filterForm" class="search-form">
          <el-form-item label="主分类">
            <el-select v-model="filterForm.parentId" placeholder="全部主分类" clearable style="width: 130px">
              <el-option label="全部主分类" value="" />
              <el-option v-for="item in parentCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="子分类">
            <el-select v-model="filterForm.childId" placeholder="全部子分类" clearable style="width: 130px">
              <el-option label="全部子分类" value="" />
              <el-option v-for="item in childCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="filterForm.tag" placeholder="全部标签" clearable style="width: 130px">
              <el-option label="全部标签" value="" />
              <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="博主">
            <el-select v-model="filterForm.creatorId" placeholder="全部博主" clearable style="width: 130px">
              <el-option label="全部博主" value="" />
              <el-option v-for="item in creators" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchChildCategories" size="small">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetFilter" size="small">重置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="small" @click="openChildDialog">+ 新建子分类</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" size="small" @click="openParentDialog">+ 新建主分类</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" size="small" @click="onBatchDelete" :disabled="!selectedRows.length">批量删除</el-button>
          </el-form-item>
          <!-- 新增：图片排序管理入口 -->
          <el-form-item>
            <el-button type="primary" size="small" @click="openImageSortDialog">图片排序管理</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格区 -->
      <el-table
        :data="childCategoryList"
        border
        stripe
        class="custom-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="子分类ID" width="90" align="center" />
        <el-table-column prop="name" label="子分类名称" min-width="120" align="center" />
        <el-table-column prop="parentName" label="所属主分类" min-width="120" align="center" />
        <el-table-column prop="creatorName" label="博主" min-width="90" align="center" />
        <el-table-column prop="imageCount" label="图片数" min-width="70" align="center" />
        <el-table-column prop="tags" label="标签" min-width="120" align="center">
          <template #default="scope">
            <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" style="margin:0 2px;">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" min-width="70" align="center" />
        <el-table-column prop="status" label="状态" min-width="65" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'info'" size="small">{{ scope.row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditChildDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="onDeleteChild(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建/编辑博主弹窗 -->
    <el-dialog v-model="creatorDialogVisible" :title="creatorDialogForm.id ? '编辑博主' : '新建博主'" width="360px">
      <el-form :model="creatorDialogForm" label-width="72px">
        <el-form-item label="博主名称">
          <el-input v-model="creatorDialogForm.name" maxlength="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creatorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreatorDialog">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑主分类弹窗 -->
    <el-dialog v-model="parentDialogVisible" :title="parentDialogForm.id ? '编辑主分类' : '新建主分类'" width="360px">
      <el-form :model="parentDialogForm" label-width="72px">
        <el-form-item label="主分类名称">
          <el-input v-model="parentDialogForm.name" maxlength="10" />
        </el-form-item>
        <el-form-item label="所属博主">
          <el-select v-model="parentDialogForm.creatorId" placeholder="选择博主" style="width: 100%">
            <el-option v-for="item in creators" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="parentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitParentDialog">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑子分类弹窗 -->
    <el-dialog v-model="childDialogVisible" :title="childDialogForm.id ? '编辑子分类' : '新建子分类'" width="360px">
      <el-form :model="childDialogForm" label-width="72px">
        <el-form-item label="子分类名称">
          <el-input v-model="childDialogForm.name" maxlength="12" />
        </el-form-item>
        <el-form-item label="所属主分类">
          <el-select v-model="childDialogForm.parentId" placeholder="选择主分类" style="width: 100%">
            <el-option v-for="item in parentCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属博主">
          <el-select v-model="childDialogForm.creatorId" placeholder="选择博主" style="width: 100%">
            <el-option v-for="item in creators" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="childDialogForm.tags" multiple clearable style="width: 100%">
            <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="childDialogForm.sort" :min="1" style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="childDialogForm.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="childDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitChildDialog">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增：图片排序管理弹窗 -->
    <el-dialog
      v-model="imageSortDialogVisible"
      title="微密圈图片排序管理"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <!-- 导入并使用图片排序管理的组件 -->
      <!-- 路径已修正为指向 image-manage/components/ 目录 -->
      <WeimiImageSortDialog @close="imageSortDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/utils/request'
// 修正导入路径：从 '@/views/image-category/components/WeimiImageSortDialog.vue'
// 改为指向 'image-manage/components/'
import WeimiImageSortDialog from '@/views/image-manage/components/WeimiImageSortDialog.vue'; // <-- 这一行已修正

// ==== 数据区 ====
const creators = ref<any[]>([]) // 所有博主
const creatorTree = ref<any[]>([]) // 树形结构
const currentCreatorId = ref<number | null>(null)

// 分类相关
const parentCategories = ref<any[]>([]) // 主分类
const childCategories = ref<any[]>([]) // 子分类

// 筛选
const filterForm = ref({
  parentId: '',
  childId: '',
  tag: '',
  creatorId: ''
})

// ==== 加载数据 ====
onMounted(async () => {
  await fetchCreators()
  await fetchParentCategories()
  await fetchChildCategories()
})

// 获取博主
async function fetchCreators() {
  const res = await service.get('/api/weimiquan/creator/list')
  if (res.data.code === 0) {
    creators.value = res.data.data || []
    creatorTree.value = creators.value.map(item => ({
      id: item.id,
      name: item.name
    }))
    if (!currentCreatorId.value && creators.value.length) {
      currentCreatorId.value = creators.value[0].id
    }
  }
}
// 新建/编辑/删除博主
const creatorDialogVisible = ref(false)
const creatorDialogForm = ref<any>({ id: null, name: '' })
function openCreatorDialog() {
  creatorDialogForm.value = { id: null, name: '' }
  creatorDialogVisible.value = true
}
async function submitCreatorDialog() {
  const name = creatorDialogForm.value.name?.trim()
  if (!name) return ElMessage.warning('请输入博主名称')
  let res
  if (creatorDialogForm.value.id) {
    res = await service.post('/api/weimiquan/creator/update', creatorDialogForm.value)
  } else {
    res = await service.post('/api/weimiquan/creator/add', creatorDialogForm.value)
  }
  if (res.data.code === 0) {
    ElMessage.success('保存成功')
    creatorDialogVisible.value = false
    await fetchCreators()
    await fetchParentCategories()
    await fetchChildCategories()
  }
}
async function onCreatorSelect(node: any) {
  currentCreatorId.value = node.id
  await fetchParentCategories()
  await fetchChildCategories()
}

// 主分类相关
async function fetchParentCategories() {
  const res = await service.get('/api/weimiquan/category/parent-list', {
    params: { creatorId: filterForm.value.creatorId || currentCreatorId.value } // 修改：如果筛选器没有选择博主，则使用当前选中的博主ID
  })
  if (res.data.code === 0) {
    parentCategories.value = res.data.data || []
  }
}
// 新建/编辑主分类
const parentDialogVisible = ref(false)
const parentDialogForm = ref<any>({ id: null, name: '', creatorId: '' })
function openParentDialog() {
  parentDialogForm.value = { id: null, name: '', creatorId: currentCreatorId.value }
  parentDialogVisible.value = true
}
async function submitParentDialog() {
  if (!parentDialogForm.value.name || !parentDialogForm.value.creatorId) {
    return ElMessage.warning('请输入完整信息')
  }
  let res
  if (parentDialogForm.value.id) {
    res = await service.post('/api/weimiquan/category/update-parent', parentDialogForm.value)
  } else {
    res = await service.post('/api/weimiquan/category/add-parent', parentDialogForm.value)
  }
  if (res.data.code === 0) {
    ElMessage.success('保存成功')
    parentDialogVisible.value = false
    await fetchParentCategories()
  }
}
const parentCategoryOptions = computed(() =>
  parentCategories.value.filter(p => !filterForm.value.creatorId || p.creatorId == filterForm.value.creatorId)
)

// 子分类相关
async function fetchChildCategories() {
  const res = await service.get('/api/weimiquan/category/child-list', {
    params: {
      parentId: filterForm.value.parentId,
      creatorId: filterForm.value.creatorId || currentCreatorId.value,
      tag: filterForm.value.tag
    }
  })
  if (res.data.code === 0) {
    childCategories.value = res.data.data || []
  }
}
const childCategoryOptions = computed(() =>
  childCategories.value.filter(c => !filterForm.value.parentId || c.parentId == filterForm.value.parentId)
)
const tagOptions = computed(() => {
  // 所有子分类里的tag去重
  const set = new Set<string>()
  childCategories.value.forEach(c => (c.tags || []).forEach((t: string) => set.add(t)))
  return Array.from(set)
})

// 子分类表格列表（加上主分类名、博主名）
const childCategoryList = computed(() =>
  childCategories.value.map(row => ({
    ...row,
    parentName: parentCategories.value.find((p: any) => p.id === row.parentId)?.name || '--',
    creatorName: creators.value.find((c: any) => c.id === row.creatorId)?.name || '--'
  }))
)

// 新建/编辑/删除子分类
const childDialogVisible = ref(false)
const childDialogForm = ref<any>({
  id: null,
  name: '',
  parentId: '',
  creatorId: '',
  tags: [],
  sort: 1,
  status: true
})
function openChildDialog() {
  childDialogForm.value = {
    id: null,
    name: '',
    parentId: '',
    creatorId: currentCreatorId.value,
    tags: [],
    sort: 1,
    status: true
  }
  childDialogVisible.value = true
}
function openEditChildDialog(row: any) {
  childDialogForm.value = { ...row }
  childDialogVisible.value = true
}
async function submitChildDialog() {
  if (!childDialogForm.value.name || !childDialogForm.value.parentId || !childDialogForm.value.creatorId) {
    return ElMessage.warning('请填写完整信息')
  }
  let res
  if (childDialogForm.value.id) {
    res = await service.post('/api/weimiquan/category/update-child', childDialogForm.value)
  } else {
    res = await service.post('/api/weimiquan/category/add-child', childDialogForm.value)
  }
  if (res.data.code === 0) {
    ElMessage.success('保存成功')
    childDialogVisible.value = false
    await fetchChildCategories()
  }
}
async function onDeleteChild(row: any) {
  await ElMessageBox.confirm('确认删除该子分类？', '提示', { type: 'warning' })
  const res = await service.post('/api/weimiquan/category/delete-child', { id: row.id })
  if (res.data.code === 0) {
    ElMessage.success('删除成功')
    await fetchChildCategories()
  }
}

// 批量删除
const selectedRows = ref<any[]>([])
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}
async function onBatchDelete() {
  if (!selectedRows.value.length) return
  await ElMessageBox.confirm('确定批量删除已选子分类？', '提示', { type: 'warning' })
  const ids = selectedRows.value.map(row => row.id)
  const res = await service.post('/api/weimiquan/category/batch-delete-child', { ids })
  if (res.data.code === 0) {
    ElMessage.success('批量删除成功')
    await fetchChildCategories()
    selectedRows.value = []
  }
}

// 筛选重置
function resetFilter() {
  filterForm.value = { parentId: '', childId: '', tag: '', creatorId: '' }
  fetchChildCategories()
}

const treeProps = { label: 'name', children: 'children' }

// 新增：图片排序管理弹窗相关逻辑
const imageSortDialogVisible = ref(false); // 控制图片排序弹窗的显示隐藏

const openImageSortDialog = () => {
  imageSortDialogVisible.value = true;
};
</script>

<style scoped>
.category-manage-wrapper {
  display: flex;
  gap: 18px;
  min-height: 82vh;
}
.side-tree {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(30,40,60,0.04);
  min-height: 580px;
  padding: 16px 10px 0 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.tree-header {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
}
.tree-node.active {
  color: #409eff;
  font-weight: bold;
}
.tree-node {
  font-size: 14px;
  user-select: none;
}
.main-content {
  flex: 1;
  min-width: 900px;
  display: flex;
  flex-direction: column;
}
.filter-bar {
  margin-bottom: 10px;
}
.custom-table { font-size: 13px; min-width: 900px; }
</style>