<template>
  <div class="boss-flex-wrap">
    <!-- 左侧：暗网主分类树 -->
    <div class="boss-tree-area">
      <div class="boss-tree-header">
        <span>主分类树</span>
        <el-button
          size="small"
          type="success"
          @click="openMainDialog"
          style="margin-left: 8px;"
        >+ 新建主分类</el-button>
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
        :current-node-key="currentTreeId"
        v-loading="categoryLoading"
      >
        <!-- 具名插槽 #default -->
        <template #default="{ data }">
          <span
            class="tree-node-label"
            :class="{ 'active': currentTreeId === data.id }"
          >
            {{ data.name }}
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧：子分类表格区 -->
    <div class="boss-table-area">
      <el-card class="table-card" shadow="never">
        <!-- 筛选区 -->
        <div class="filter-bar">
          <el-form :inline="true" :model="filter" class="search-form">
            <el-form-item label="子分类">
              <el-select
                v-model="filter.child"
                placeholder="全部子分类"
                clearable
                size="small"
                style="width: 150px;"
              >
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
              <el-input
                v-model="filter.tag"
                placeholder="标签模糊搜索"
                clearable
                size="small"
                style="width: 120px;"
              />
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
              <el-button
                size="small"
                type="primary"
                icon="el-icon-sort"
                @click="openSortDialog"
                :disabled="!isParentSelected"
              >子分类排序</el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                size="small"
                type="danger"
                :disabled="!multipleSelection.length"
                @click="onBatchDelete"
              >批量删除</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 子分类列表 表格 -->
        <el-table
          :data="pagedChildCategories"
          row-key="id"
          border
          stripe
          class="boss-table"
          @selection-change="handleSelectionChange"
          style="width: 100%;"
          v-loading="categoryLoading"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="子分类ID" width="90" align="center">
            <template #default="scope">
              <span v-if="scope.row.isParent">--</span>
              <span v-else>{{ scope.row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="子分类名称" min-width="150" align="center">
            <template #default="scope">
              <span v-if="scope.row.isParent"></span>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="parentName" label="所属主分类" min-width="120" align="center">
            <template #default="scope">
              <span v-if="scope.row.isParent">{{ scope.row.name }}</span>
              <span v-else>{{ scope.row.parentName || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="videoCount" label="视频数" width="90" align="center" />
          <el-table-column prop="tags" label="标签" min-width="180" align="center">
            <template #default="scope">
              <el-tag
                v-for="tag in (scope.row.tags || [])"
                :key="tag"
                size="small"
                type="warning"
                style="margin-right: 4px; cursor: pointer"
                @click="onTagClick(tag, scope.row)"
                @dblclick.stop="editTag(tag, scope.row)"
              >{{ tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="100" align="center">
            <template #default="scope">
              {{ scope.row.sort }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status" type="success">启用</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="icon" label="图标文件名" width="140" align="center">
            <template #default="scope">
              {{ scope.row.icon || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="scope">
              <div class="action-group">
                <el-button size="small" type="warning" @click="onEdit(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
              </div>
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

    <!-- 主分类 弹窗 -->
    <el-dialog
      :title="editParentData.id ? '编辑主分类' : '新建主分类'"
      v-model="parentDialogVisible"
      width="400px"
      @close="onMainDialogClose"
      append-to-body
    >
      <el-form :model="editParentData" label-width="80px" size="small" ref="parentFormRef">
        <el-form-item label="主分类名称" prop="name" required>
          <el-input v-model="editParentData.name" placeholder="请输入主分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editData.icon" placeholder="如 hot.svg" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="parentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onParentSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑 子分类 弹窗 -->
    <el-dialog
      :title="editData.id ? '编辑子分类' : '新建子分类'"
      v-model="dialogVisible"
      width="400px"
      @close="onDialogClose"
      append-to-body
    >
      <el-form :model="editData" label-width="80px" size="small" ref="childFormRef">
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select v-model.number="editData.parent_id" placeholder="选择主分类" style="width: 100%;">
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="Number(item.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name" required>
          <el-input v-model="editData.name" placeholder="请输入子分类名称" />
        </el-form-item>
        <!-- 补充图标输入框 -->
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editData.icon" placeholder="如 hot.svg" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editData.sort" :min="1" controls-position="right" style="width: 100%;" />
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

    <!-- 标签 编辑 弹窗 -->
    <el-dialog title="编辑标签" v-model="tagDialogVisible" width="320px" @close="onTagDialogClose" append-to-body>
      <el-input
        v-model="editTagValue"
        maxlength="8"
        show-word-limit
        placeholder="请输入新标签名"
      />
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onTagSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入 DarknetCategorySortDialog 组件 -->
    <DarknetCategorySortDialog
      v-model="sortDialogVisible"
      :parentCategories="parentCategories"
      :childCategories="childCategories"
      @save="onSaveSort"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 1. 引用新的 Pinia store
import { useDarknetCategoryStore } from '@/store/darknetCategory.store'
import { storeToRefs } from 'pinia'

// 2. 获取 store 实例和响应式数据
const darknetCategoryStore = useDarknetCategoryStore()
const {
  parentCategories,
  childCategories,
  loading: categoryLoading,
} = storeToRefs(darknetCategoryStore)
const {
  fetchCategories: fetchDarknetCategories,
  addCategory: addDarknetCategory,
  addChildCategory,
  updateCategory: updateDarknetCategory,
  removeCategory: deleteDarknetCategory,
  batchRemoveCategories: batchDeleteDarknetCategories,
  batchUpdateSort: batchUpdateDarknetCategorySort,
  updateCategoryTags: updateDarknetCategoryTags,
  updateCategorySort: updateDarknetCategorySort,
} = darknetCategoryStore

// 3. 其余逻辑和变量保持不变，直接用上面这些 store 方法和 state 替换原有的 options API 变量和方法即可

// ======================= 初始化加载数据 =======================
onMounted(() => {
  fetchDarknetCategories();
})

// ===================== 左侧主分类树 =====================
const currentTreeId = ref<number | null>(null) // 初始为null，表示未选择任何主分类
const currentParentName = ref<string>('未选择主分类') // 这个变量现在只用于显示，排序弹窗内部逻辑使用其props

const treeProps = { label: 'name', children: 'children', isLeaf: 'leaf' }

const categoryTree = computed(() => {
  return parentCategories.value.map((main: DarknetCategory) => {
    const childrenNodes = childCategories.value
      .filter((c: DarknetCategory) => c.parent_id === main.id)
      .map((c: DarknetCategory) => ({
        id: c.id,
        name: c.name,
        leaf: true,
        parent_id: main.id // 方便子节点点击后判断其父ID
      }))
    return { id: main.id, name: main.name, children: childrenNodes, isParent: true }
  })
})

const isParentSelected = computed(() => {
  return currentTreeId.value !== null && parentCategories.value.some((p: DarknetCategory) => p.id === currentTreeId.value);
})

function onTreeSelect(node: any) {
  if (node.isParent) {
    // 选中主分类，显示该主分类下所有子分类
    currentTreeId.value = node.id
  } else {
    // 选中子分类，只显示该子分类
    currentTreeId.value = node.id
  }

  const parentItem = parentCategories.value.find((p) => p.id === (node.isParent ? node.id : node.parent_id))
  currentParentName.value = parentItem ? parentItem.name : '未选择主分类'
  currentPage.value = 1
}

// ===================== 右侧筛选区和表格 =====================
const filter = ref<{ child: number | ''; tag: string }>({ child: '', tag: '' })

const childCategoryOptions = computed<DarknetCategory[]>(() => {
  if (isParentSelected.value && currentTreeId.value !== null) {
    return childCategories.value.filter((c: DarknetCategory) => c.parent_id === currentTreeId.value);
  }
  return childCategories.value;
})


const filteredChildCategories = computed(() => {
  let list = [];
  if (currentTreeId.value === null) {
    list = childCategories.value.map(row => ({
      ...row,
      parentName: parentCategories.value.find((p) => p.id === row.parent_id)?.name ?? '--',
      sort: row.sort || 0,
      status: Boolean(row.status),
      isParent: false,
      videoCount: row.videoCount || 0,
      icon: row.icon ?? '' // 只用空字符串，不用 '--'
    }));
  } else {
    const isParent = parentCategories.value.some((c) => c.id === currentTreeId.value);
    if (isParent) {
      const main = parentCategories.value.find((p) => p.id === currentTreeId.value);
      if (main) {
        const totalVideoCount = childCategories.value
          .filter((c) => c.parent_id === main.id)
          .reduce((sum, c) => sum + (c.videoCount || 0), 0);
        list.push({
          ...main,
          parentName: '--',
          sort: main.sort || 0,
          status: Boolean(main.status),
          isParent: true,
          videoCount: totalVideoCount,
          icon: main.icon ?? '' // 只用空字符串，不用 '--'
        });
      }
      list = list.concat(
        childCategories.value
          .filter((c) => c.parent_id === currentTreeId.value)
          .map(row => ({
            ...row,
            parentName: main?.name ?? '--',
            sort: row.sort || 0,
            status: Boolean(row.status),
            isParent: false,
            videoCount: row.videoCount || 0,
            icon: row.icon ?? '' // 只用空字符串，不用 '--'
          }))
      );
    } else {
      list = childCategories.value
        .filter((c) => c.id === currentTreeId.value)
        .map(row => ({
          ...row,
          parentName: parentCategories.value.find((p) => p.id === row.parent_id)?.name ?? '--',
          sort: row.sort || 0,
          status: Boolean(row.status),
          isParent: false,
          videoCount: row.videoCount || 0,
          icon: row.icon ?? '' // 只用空字符串，不用 '--'
        }));
    }
  }

  // 根据筛选条件过滤
  if (filter.value.child) {
    list = list.filter((c: DarknetCategory) => c.id === Number(filter.value.child));
  }
  if (filter.value.tag) {
    const tagKw = filter.value.tag.toLowerCase();
    list = list.filter((c: DarknetCategory) =>
      c.tags && c.tags.some((tag: string) => tag.toLowerCase().includes(tagKw))
    );
  }

  return list;
});
const pageSize = ref<number>(10)
const currentPage = ref<number>(1)
const pagedChildCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredChildCategories.value.slice(start, start + pageSize.value)
})
function handlePageChange(page: number) {
  currentPage.value = page
}

const multipleSelection = ref<DarknetCategory[]>([])
function handleSelectionChange(rows: DarknetCategory[]) {
  multipleSelection.value = rows
}
async function onBatchDelete() {
  if (!multipleSelection.value.length) {
    return ElMessage.warning('请先勾选要操作的分类');
  }
  await ElMessageBox.confirm('确定批量删除已选分类吗？这将同时删除其下所有视频！', '警告', { type: 'warning' }).then(async () => {
    try {
      const ids = multipleSelection.value.map((i) => i.id);
      const res = await batchDeleteDarknetCategories(ids);
      if (res && res.code === 0) {
        ElMessage.success('批量删除成功');
        multipleSelection.value = [];
        await fetchDarknetCategories();
      } else {
        ElMessage.error(res?.msg || '批量删除失败');
      }
    } catch (error) {
      console.error('批量删除请求失败:', error);
      ElMessage.error('批量删除失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

// ===================== 主分类弹窗 =====================
const parentDialogVisible = ref<boolean>(false)
const editParentData = ref<{ id: number | null; name: string; icon: string }>({ id: null, name: '', icon: '' })
const parentFormRef = ref<FormInstance>()

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
      res = await updateDarknetCategory(submitData as DarknetCategory);
    } else {
      res = await addDarknetCategory(submitData as Omit<DarknetCategory, 'id' | 'videoCount' | 'create_time' | 'update_time'>);
    }

    if (res && res.code === 0) {
      ElMessage.success('主分类保存成功！')
      parentDialogVisible.value = false
      await fetchDarknetCategories()
    } else {
      ElMessage.error(res?.msg || '主分类保存失败！');
    }
  } catch (error) {
    console.error('保存主分类请求失败:', error);
    ElMessage.error('保存主分类失败，请检查网络或后端服务');
  }
}

// ===================== 新建/编辑子分类弹窗 =====================
const dialogVisible = ref<boolean>(false)
const editData = ref<Omit<DarknetCategory, 'videoCount' | 'create_time' | 'update_time'>>({
  id: null,
  name: '',
  parent_id: '',
  sort: 1,
  status: true,
  tags: [],
  icon: ''
})
const childFormRef = ref<FormInstance>()

function openDialog() {
  if (!parentCategories.value.length) {
    ElMessage.warning('请先新建主分类');
    return;
  }
  // 默认选中第一个主分类
  const defaultParentId = Number(parentCategories.value[0].id);
  // 找到当前主分类下所有子分类的最大排序值
  const maxSort = Math.max(
    0,
    ...childCategories.value
      .filter(c => c.parent_id === defaultParentId)
      .map(c => Number(c.sort) || 0)
  );
  editData.value = {
    id: null,
    name: '',
    parent_id: defaultParentId,
    sort: maxSort + 1, // 新建的子分类排序为最大值+1
    status: true,
    tags: []
  }
  dialogVisible.value = true
}
function onEdit(row: DarknetCategory) {
  editData.value = {
    ...row,
    status: Boolean(row.status),
    parent_id: row.parent_id,
    icon: row.icon || '' // 只用空字符串，不用 '--'
  }
  dialogVisible.value = true
}
function onDialogClose() {
    if (childFormRef.value) {
        childFormRef.value.resetFields();
    }
    editData.value = { id: null, name: '', parent_id: '', sort: 1, status: true, tags: [] };
}
async function onDelete(row: DarknetCategory) {
  await ElMessageBox.confirm(`确认删除子分类 “${row.name}” 吗？这将同时删除其下所有视频！`, '警告', { type: 'warning' }).then(async () => {
    try {
      const res = await deleteDarknetCategory(row.id);
      if (res && res.code === 0) {
        ElMessage.success('删除成功');
        await fetchDarknetCategories();
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
    const submitData = { ...editData.value, status: editData.value.status ? 1 : 0, parent_id: Number(editData.value.parent_id) };
    if (submitData.id) {
      res = await updateDarknetCategory(submitData as DarknetCategory);
    } else {
      res = await addChildCategory(submitData as Omit<DarknetCategory, 'id' | 'videoCount' | 'create_time' | 'update_time'>);
    }

    if (res && res.code === 0) {
      ElMessage.success('子分类保存成功！')
      dialogVisible.value = false
      await fetchDarknetCategories()
    } else {
      ElMessage.error(res?.msg || '子分类保存失败！');
    }
  } catch (error) {
    console.error('保存子分类请求失败:', error);
    ElMessage.error('保存子分类失败，请检查网络或后端服务');
  }
}

const tagDialogVisible = ref<boolean>(false)
const editTagValue = ref<string>('')
let editTagRow: DarknetCategory | null = null
let editTagIndex = -1

function onTagClick(tag: string, row: DarknetCategory) {
  ElMessage.info(`你点击了标签: ${tag}`);
}
function editTag(tag: string, row: DarknetCategory) {
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
      const res = await updateDarknetCategoryTags(editTagRow.id, uniqueTags);
      if (res && res.code === 0) {
        ElMessage.success('标签已修改');
        tagDialogVisible.value = false;
        await fetchDarknetCategories();
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

async function onSortChange(row: DarknetCategory) {
  try {
    const res = await updateDarknetCategorySort(row.id, row.sort);
    if (res && res.code === 0) {
      ElMessage.success('子分类排序更新成功');
    } else {
      ElMessage.error(res?.msg || '子分类排序更新失败');
      await fetchDarknetCategories();
    }
  } catch (error) {
    console.error('更新子分类排序请求失败:', error);
    ElMessage.error('更新子分类排序失败，请检查网络或后端服务');
    await fetchDarknetCategories();
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
    ElMessage.warning('没有选择主分类，无法保存排序');
    return;
  }
  if (!listToSave.length) {
    ElMessage.warning('当前主分类下没有子分类需要保存排序');
    return;
  }
  try {
    const res = await batchUpdateDarknetCategorySort(listToSave);
    if (res && res.code === 0) {
      ElMessage.success('子分类排序保存成功');
      await fetchDarknetCategories();
      currentPage.value = 1;
    } else {
      ElMessage.error(res?.msg || '子分类排序保存失败');
    }
  } catch (error) {
    console.error('保存子分类排序请求失败:', error);
    ElMessage.error('保存子分类排序失败，请检查网络或后端服务');
  }
}

function onSearch() {
  currentPage.value = 1;
}
function onReset() {
  filter.value = { child: '', tag: '' };
  currentPage.value = 1;
}
</script>

<style scoped>
.boss-flex-wrap { display: flex; flex-direction: row; min-height: 80vh; gap: 18px; }
.boss-tree-area { width: 195px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(30,40,60,0.04); min-height: 580px; padding: 16px 10px 0 10px; display: flex; flex-direction: column; flex-shrink: 0; }
.boss-tree-header { font-weight: bold; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center; }
.boss-tree { font-size: 14px; --el-tree-node-content-height: 33px; }
.tree-node-label { font-size: 13px; user-select: none; }
.tree-node-label.active { color: #409eff; font-weight: bold; }
.boss-table-area { flex: 1; min-width: 800px; display: flex; flex-direction: column; }
.table-card { width: 100%; }
.filter-bar { margin-bottom: 10px; }
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; }
.boss-table { font-size: 13px; min-width: 1000px; }
.boss-table .el-table__row td .action-group { display: flex !important; align-items: center; justify-content: center; height: 100%; padding: 0; }
.boss-table .el-table__body td { padding-top: 6px !important; padding-bottom: 6px !important; }
.sort-item { display: flex; align-items: center; margin-bottom: 8px; background: #f5f7fa; padding: 8px 12px; border: 1px solid #ebeef5; border-radius: 4px; }
.el-card { border-radius: 9px; border: 1px solid #ebeef5 !important; box-shadow: 0 1px 8px 0 rgba(0,0,0,0.02) !important; }
.el-button { border-radius: 5px !important; font-size: 11px !important; padding: 1px 8px !important; min-width: 52px !important; }
.el-table th, .el-table td { border-right: 1px solid #ebeef5 !important; padding: 0 2px !important; }
.el-table th:last-child, .el-table td:last-child { border-right: none !important; }
.el-table { border-radius: 9px; overflow: hidden; }
.el-table::before { height: 0; }
.el-pagination { margin-top: 18px; }
</style>
