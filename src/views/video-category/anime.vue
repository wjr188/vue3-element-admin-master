<template>
  <div class="boss-flex-wrap">
    <div class="boss-tree-area">
      <div class="boss-tree-header">
        <span>主分类树</span>
        <el-button size="small" type="success" @click="openMainDialog" style="margin-left:8px;">
          + 新建主分类
        </el-button>
      </div>
      <el-tree
        class="boss-tree"
        :data="categoryTree"
        :props="treeProps"
        node-key="id"
        default-expand-all
        highlight-current
        :expand-on-click-node="true"
        @node-click="onTreeSelect"
        :current-node-key="currentTreeId !== null ? currentTreeId : undefined"
        v-loading="categoryLoading"
      >
        <template #default="{ data }">
          <span :class="{ 'active': currentTreeId === data.id }">{{ data.name }}</span>
        </template>
      </el-tree>
    </div>

    <div class="boss-table-area">
      <el-card class="table-card" shadow="never">
        <div class="filter-bar">
          <el-form :inline="true" :model="filter" class="search-form">
            <el-form-item label="子分类">
              <el-select v-model="filter.child" placeholder="全部子分类" clearable size="small" style="width: 150px">
                <el-option label="全部子分类" value="" />
                <el-option
                  v-for="item in childCategoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="filter.tag" placeholder="标签模糊搜索" clearable size="small" style="width: 120px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="onSearch">搜索</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="small" @click="onReset">重置</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="success" @click="openDialog">+ 新建子分类</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="danger" :disabled="!multipleSelection.length" @click="onBatchDelete">批量删除</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="openSortDialog" :disabled="!isParentSelected">排序管理</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-table
  :data="pagedCategories"
  row-key="id"
  border
  stripe
  class="boss-table"
  @selection-change="handleSelectionChange"
  style="width:100%"
  v-loading="categoryLoading"
>
          <el-table-column
  type="selection"
  width="50"
  align="center"
  :selectable="row => !row.isParent"
/>

          <el-table-column prop="id" label="子分类ID" width="90" align="center" />
          <el-table-column prop="name" label="子分类名称" min-width="150" align="center">
  <template #default="scope">
    <span v-if="scope.row.isParent" style="font-weight:bold;color:#409EFF">
      {{ scope.row.name }}（主分类）
    </span>
    <span v-else>
      {{ scope.row.name }}
    </span>
  </template>
</el-table-column>
          <el-table-column prop="parentName" label="所属主分类" min-width="120" align="center" />
          <el-table-column prop="videoCount" label="视频数" width="90" align="center" />
          <el-table-column prop="tags" label="标签" min-width="180" align="center">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags"
                :key="tag"
                size="small"
                type="warning"
                style="margin-right: 4px;cursor:pointer"
                @click="onTagClick(tag, scope.row)"
                @dblclick.stop="editTag(tag, scope.row)"
              >{{ tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="100" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.sort"
                size="small"
                :min="1"
                :controls="true"
                :step="1"
                style="width:70px"
                @change="onSortChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag type="success" v-if="scope.row.status">启用</el-tag>
              <el-tag type="info" v-else>禁用</el-tag>
            </template>
          </el-table-column>
          <!-- 布局类型 -->
<el-table-column prop="layout_type" label="布局类型" width="100" align="center">
  <template #default="scope">
    <span>{{ scope.row.layout_type || '-' }}</span>
  </template>
</el-table-column>

<!-- 图标 -->
<el-table-column prop="icon" label="图标" width="80" align="center">
  <template #default="scope">
    <img
      v-if="scope.row.icon"
      :src="`/icons/${scope.row.icon}`"
      alt="icon"
      style="width: 24px; height: 24px; display: block; margin: 0 auto;"
      @error="e => (e.target.style.display = 'none')"
    />
    <span v-else>-</span>
  </template>
</el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="scope">
              <el-button
  size="small"
  type="warning"
  @click="scope.row.isParent ? onEditParent(scope.row) : onEdit(scope.row)"
>编辑</el-button>
<el-button
  size="small"
  type="danger"
  @click="scope.row.isParent ? onDeleteParent(scope.row) : onDelete(scope.row)"
>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 18px; text-align: right;"
          background
          layout="prev, pager, next, jumper"
          :total="filteredChildCategories.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </el-card>
    </div>

    <el-dialog :title="editParentData.id ? '编辑主分类' : '新建主分类'" v-model="parentDialogVisible" width="400px" @close="onMainDialogClose" append-to-body>
      <el-form :model="editParentData" label-width="80px" size="small" ref="parentFormRef">
        <el-form-item label="主分类名称" prop="name" required>
          <el-input v-model="editParentData.name" placeholder="请输入主分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="parentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onParentSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="editData.id ? '编辑子分类' : '新建子分类'" v-model="dialogVisible" width="400px" @close="onDialogClose" append-to-body>
      <el-form :model="editData" label-width="80px" size="small" ref="childFormRef">
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select v-model="editData.parent_id" placeholder="选择主分类" style="width: 100%">
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name" required>
          <el-input v-model="editData.name" placeholder="请输入子分类名称" />
        </el-form-item>
        <el-form-item label="布局类型" prop="layout_type">
      <el-select v-model="editData.layout_type" placeholder="请选择布局类型" style="width: 100%">
        <el-option label="横滑卡片" value="type1" />
        <el-option label="三宫格" value="type2" />
        <el-option label="两宫格" value="type3" />
        <el-option label="九宫格" value="type4" />
        <el-option label="列表" value="list" />
        <el-option label="不限制" value="type5" />
        <el-option label="横图视频卡" value="videocard" />
      </el-select>
    </el-form-item>

    <el-form-item label="图标文件" prop="icon">
      <el-input v-model="editData.icon" placeholder="请输入图标文件名，如 hot1.svg" style="width: 180px;">
        <template #append>
          <img
            v-if="editData.icon"
            :src="`/icons/${editData.icon}`"
            alt="icon预览"
            style="width: 24px; height: 24px; margin-left: 8px;"
            @error="e => (e.target.style.display = 'none')"
          />
        </template>
      </el-input>
    </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editData.sort" :min="1" controls-position="right" style="width:100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="editData.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog title="编辑标签" v-model="tagDialogVisible" width="320px" @close="onTagDialogClose" append-to-body>
      <el-input v-model="editTagValue" maxlength="8" show-word-limit placeholder="请输入新标签名" />
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onTagSave">保存</el-button>
      </template>
    </el-dialog>

    <AnimeCategorySortDialog
      v-model="sortDialogVisible"
      :parentCategories="parentCategories"
      :childCategories="childCategories"
      @save="onSaveSort"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

import AnimeCategorySortDialog from './components/AnimeCategorySortDialog.vue'

// —— 新的 Pinia 分类 store —— 
import { useAnimeCategoriesStore } from '@/store/animeCategories.store'
import { storeToRefs } from 'pinia'

const animeCategoriesStore = useAnimeCategoriesStore()
const { parentCategories, childCategories, loading: categoryLoading } = storeToRefs(animeCategoriesStore)
const {
  fetchCategories,
  addParentCategory,
  addChildCategory,
  updateCategory,
  removeCategory,
  batchRemoveCategories,
  batchUpdateCategorySort,
} = animeCategoriesStore
// 当前选中的主分类
const selectedParent = computed<Category | null>(() =>
  parentCategories.value.find(p => p.id === currentTreeId.value) || null
);

// 拼接主分类 + 子分类分页数据
const pagedCategories = computed(() => {
  const children = pagedChildCategories.value
  if (selectedParent.value && currentPage.value === 1) {
    // 只在第一页拼接主分类行，防止分页错乱
    return [
      {
        ...selectedParent.value,
        parentName: '--',
        sort: selectedParent.value.sort || 0,
        status: Boolean(selectedParent.value.status),
        isParent: true, // 用于标记主分类
      },
      ...children,
    ]
  }
  return children
})


interface Category {
  id: number;
  name: string;
  parent_id: number;
  sort: number;
  status: number;
  tags?: string[];
  videoCount?: number;
  create_time?: string;
  update_time?: string;
}

interface CategoryTreeNode {
  id: number;
  name: string;
  children?: CategoryTreeNode[];
  leaf?: boolean;
  isParent?: boolean;
  parent_id?: number;
}

onMounted(async () => {
  await fetchCategories()
  if (parentCategories.value.length > 0) {
    currentTreeId.value = parentCategories.value[0].id
  }
});

const currentTreeId = ref<number | null>(null)
const treeProps = { label: 'name', children: 'children', isLeaf: 'leaf' }

const categoryTree = computed<CategoryTreeNode[]>(() => {
  return parentCategories.value.map((main: Category) => {
    const childrenNodes = childCategories.value
      .filter((c: Category) => c.parent_id === main.id)
      .map((c: Category) => ({
        id: c.id,
        name: c.name,
        leaf: true,
        parent_id: main.id
      }));
    return { id: main.id, name: main.name, children: childrenNodes, isParent: true };
  });
});

const isParentSelected = computed(() => {
  return currentTreeId.value !== null && parentCategories.value.some((p: Category) => p.id === currentTreeId.value);
});

function onTreeSelect(node: CategoryTreeNode) {
  if (node.isParent) {
    currentTreeId.value = node.id;
  } else if (node.parent_id) {
    currentTreeId.value = node.parent_id;
  } else {
    const foundChild = childCategories.value.find(c => c.id === node.id);
    currentTreeId.value = foundChild ? foundChild.parent_id : null;
  }
  currentPage.value = 1;
}

const filter = ref<{ child: number | ''; tag: string }>({ child: '', tag: '' })

const childCategoryOptions = computed<Category[]>(() => {
  if (currentTreeId.value === null) {
      return childCategories.value;
  }
  return childCategories.value.filter((c: Category) => c.parent_id === currentTreeId.value);
});

const filteredChildCategories = computed<(Category & { parentName: string })[]>(() => {
  let list: Category[] = [];
  if (currentTreeId.value === null) {
      list = childCategories.value;
  } else {
      const isParent = parentCategories.value.some((c: Category) => c.id === currentTreeId.value);
      if (isParent) {
          list = childCategories.value.filter((c: Category) => c.parent_id === currentTreeId.value);
      } else {
          list = childCategories.value.filter((c: Category) => c.id === currentTreeId.value);
      }
  }

  if (filter.value.child) {
    list = list.filter((c: Category) => c.id === Number(filter.value.child));
  }
  if (filter.value.tag) {
    const tagKw = filter.value.tag.toLowerCase();
    list = list.filter((c: Category) =>
      c.tags && c.tags.some((tag: string) => tag.toLowerCase().includes(tagKw))
    );
  }

  return list.map((row: Category) => ({
    ...row,
    parentName: parentCategories.value.find((p: Category) => p.id === row.parent_id)?.name ?? '--',
    sort: row.sort || 0,
  })).sort((a,b) => (a.sort || 0) - (b.sort || 0));
});

const pageSize = ref<number>(10)
const currentPage = ref<number>(1)
const pagedChildCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredChildCategories.value.slice(start, end)
})
function handlePageChange(page: number) {
  currentPage.value = page
}

const multipleSelection = ref<Category[]>([])
function handleSelectionChange(rows: Category[]) { multipleSelection.value = rows }
async function onBatchDelete() {
  if (!multipleSelection.value.length) {
    return ElMessage.warning('请先勾选要操作的分类');
  }
  await ElMessageBox.confirm('确定批量删除已选分类吗？这将同时删除其下所有视频！', '警告', { type: 'warning' }).then(async () => {
    try {
      const ids = multipleSelection.value.map(i => i.id);
      const res = await batchRemoveCategories(ids);
      if (res && res.code === 0) {
        ElMessage.success('批量删除成功！')
        multipleSelection.value = []
        await fetchCategories()
      } else {
        ElMessage.error(res?.msg || '批量删除失败！');
      }
    } catch (error) {
      console.error('批量删除请求失败:', error);
      ElMessage.error('批量删除失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

const parentDialogVisible = ref(false)
const editParentData = ref<{ id: number | null; name: string }>({ id: null, name: '' })
const parentFormRef = ref<FormInstance>();

function openMainDialog() {
  editParentData.value = { id: null, name: '' }
  parentDialogVisible.value = true
}
function onMainDialogClose() {
    if (parentFormRef.value) {
        parentFormRef.value.resetFields();
    }
    editParentData.value = { id: null, name: '' };
}
async function onParentSave() {
  if (!editParentData.value.name.trim()) {
    return ElMessage.error('主分类名称不能为空');
  }

  try {
    let res;
    const submitData = { ...editParentData.value, parent_id: 0, sort: 1, status: 1 };
    if (submitData.id) {
      res = await updateCategory(submitData as Category)
    } else {
      res = await addParentCategory(editParentData.value.name)
    }

    if (res && res.code === 0) {
      ElMessage.success('主分类保存成功！')
      parentDialogVisible.value = false
      await fetchCategories()
    } else {
      ElMessage.error(res?.msg || '主分类保存失败！');
    }
  } catch (error) {
    console.error('保存主分类请求失败:', error);
    ElMessage.error('保存主分类失败，请检查网络或后端服务');
  }
}

const dialogVisible = ref(false)
const editData = ref<{ id: number | null; name: string; parent_id: number | ''; sort: number; status: boolean; tags: string[] }>({
  id: null,
  name: '',
  parent_id: '',
  sort: 1,
  status: true,
  tags: [],
  layout_type: 'type2',
  icon: '',
})
const childFormRef = ref<FormInstance>();

function openDialog() {
  editData.value = {
    id: null,
    name: '',
    parent_id: currentTreeId.value || (parentCategories.value[0]?.id ?? null),
    sort: 1,
    status: true,
    tags: []
  }
  dialogVisible.value = true
}
function onEdit(row: Category) {
  editData.value = {
    ...row,
    status: Boolean(row.status),
    layout_type: row.layout_type || 'type2',  // 给默认值，比如 'type2'
    icon: row.icon || '',
  } as {
    id: number | null;
    name: string;
    parent_id: number | '';
    sort: number;
    status: boolean;
    tags: string[];
    layout_type?: string;
    icon?: string;
  }
  dialogVisible.value = true
}

function onDialogClose() {
    if (childFormRef.value) {
        childFormRef.value.resetFields();
    }
    editData.value = { id: null, name: '', parent_id: '', sort: 1, status: true, tags: [] };
}
async function onDelete(row: Category) {
  await ElMessageBox.confirm(`确认删除子分类 “${row.name}” 吗？这将同时删除其下所有视频！`, '警告', { type: 'warning' }).then(async () => {
    try {
      const res = await removeCategory(row.id)
      if (res && res.code === 0) {
        ElMessage.success('删除成功')
        await fetchCategories()
      } else {
        ElMessage.error(res?.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除请求失败:', error);
      ElMessage.error('删除失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}
async function onSave() {
  if (!editData.value.name.trim() || editData.value.parent_id === null || editData.value.parent_id === '') {
    return ElMessage.error('子分类名称和主分类必填');
  }

  try {
    let res;
    const submitData = { ...editData.value, status: editData.value.status ? 1 : 0 };
    if (submitData.id) {
      res = await updateCategory(submitData as Category)
    } else {
      res = await addChildCategory(submitData as Omit<Category, 'id' | 'create_time' | 'update_time' | 'videoCount'>)
    }

    if (res && res.code === 0) {
      ElMessage.success('子分类保存成功！')
      dialogVisible.value = false
      await fetchCategories()
    } else {
      ElMessage.error(res?.msg || '子分类保存失败！');
    }
  } catch (error) {
    console.error('保存子分类请求失败:', error);
    ElMessage.error('保存子分类失败，请检查网络或后端服务');
  }
}

function onSearch() {
  currentPage.value = 1
}
function onReset() {
  filter.value = { child: '', tag: '' }
  currentPage.value = 1
}
function onEditParent(row: Category) {
  editParentData.value = { id: row.id, name: row.name }
  parentDialogVisible.value = true
}

function onDeleteParent(row: Category) {
  ElMessageBox.confirm('确定删除主分类及其所有子分类吗？', '提示', { type: 'warning' })
    .then(async () => {
      await removeCategory(row.id)
      await fetchCategories()
      ElMessage.success('主分类已删除')
    })
    .catch(() => {})
}

const tagDialogVisible = ref(false)
const editTagValue = ref('')
let editTagRow: Category | null = null
let editTagIndex = -1
function onTagClick(tag: string, row: Category) {
  ElMessage.info(`你点击了标签: ${tag}`);
}
function editTag(tag: string, row: Category) {
  tagDialogVisible.value = true
  editTagValue.value = tag
  editTagRow = row
  editTagIndex = row.tags ? row.tags.indexOf(tag) : -1
}
function onTagDialogClose() {
    editTagValue.value = '';
    editTagRow = null;
    editTagIndex = -1;
}
async function onTagSave() {
  if (editTagRow && editTagIndex > -1 && editTagValue.value.trim()) {
    const newTags = [...(editTagRow.tags || [])];
    newTags.splice(editTagIndex, 1, editTagValue.value.trim());

    const uniqueTags = Array.from(new Set(newTags.filter(t => t.trim() !== '')));

    try {
      const res = await updateCategory({ ...editTagRow, tags: uniqueTags, status: editTagRow.status ? 1 : 0 });
      if (res && res.code === 0) {
        ElMessage.success('标签已修改');
        tagDialogVisible.value = false;
        await fetchCategories();
      } else {
        ElMessage.error(res?.msg || '标签修改失败');
      }
    } catch (error) {
      console.error('更新标签请求失败:', error);
      ElMessage.error('更新标签失败，请检查网络或后端服务');
    }
  } else {
    ElMessage.warning('标签名不能为空');
  }
}

async function onSortChange(row: Category) {
  try {
    const res = await batchUpdateCategorySort([{ id: row.id, sort: row.sort || 0 }]);
    if (res && res.code === 0) {
      ElMessage.success('子分类排序更新成功');
    } else {
      ElMessage.error(res?.msg || '子分类排序更新失败');
      await fetchCategories();
    }
  } catch (error) {
    console.error('更新子分类排序请求失败:', error);
    ElMessage.error('更新子分类排序失败，请检查网络或后端服务');
    await fetchCategories();
  }
}

const sortDialogVisible = ref(false)

function openSortDialog() {
  if (!isParentSelected.value) {
    ElMessage.warning('请先选择一个主分类');
    return;
  }
  sortDialogVisible.value = true;
}

async function onSaveSort(listToSave: Array<{ id: number; sort: number }>) {
  if (!isParentSelected.value) {
    ElMessage.warning('未选择主分类，无法保存排序');
    return;
  }
  if (!listToSave.length) {
    ElMessage.warning('当前主分类下没有子分类可保存排序');
    return;
  }
  try {
    const res = await batchUpdateCategorySort(listToSave);
    if (res && res.code === 0) {
      ElMessage.success('子分类排序保存成功');
      await fetchCategories();
    } else {
      ElMessage.error(res?.msg || '子分类排序保存失败');
    }
  } catch (error) {
    console.error('保存子分类排序请求失败:', error);
    ElMessage.error('保存子分类排序失败，请检查网络或后端服务');
  }
}
</script>

<style scoped>
.boss-flex-wrap {
  display: flex;
  flex-direction: row;
  min-height: 80vh;
  gap: 18px;
}
.boss-tree-area {
  width: 195px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(30,40,60,0.04);
  min-height: 580px;
  padding: 16px 10px 0 10px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.boss-tree-header {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
}
.boss-tree {
  font-size: 14px;
  --el-tree-node-content-height: 33px;
}
.tree-node-label {
  font-size: 13px;
  user-select: none;
}
.tree-node-label.active {
  color: #409eff;
  font-weight: bold;
}
.boss-table-area {
  flex: 1;
  min-width: 800px;
  display: flex;
  flex-direction: column;
}
.table-card {
  width: 100%;
  min-height: 580px;
}
.filter-bar {
  margin-bottom: 10px;
}
.boss-table { font-size: 13px; min-width: 1000px; }
</style>
