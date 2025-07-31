<template>
  <div class="boss-flex-wrap">
    <div class="boss-tree-area">
      <div class="boss-tree-header">
        <span>主分类树</span>
        <el-button size="small" type="success" @click="openMainDialog" style="margin-left:8px;">+ 新建主分类</el-button>
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
      >
        <template #default="{ data }">
          <span
            class="tree-node-label"
            :class="{ 'active': currentTreeId === data.id }"
          >{{ data.name }}</span>
        </template>
      </el-tree>
    </div>

    <div class="boss-table-area">
      <el-card class="table-card" shadow="never">
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
                type="danger"
                :disabled="!multipleSelection.length"
                @click="onBatchDelete"
              >批量删除</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="openSortDialog">排序管理</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          :data="pagedChildCategories"
          row-key="id"
          border
          stripe
          class="boss-table"
          @selection-change="handleSelectionChange"
          style="width: 100%;"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="ID" width="90" align="center" />
          <el-table-column prop="name" label="名称" min-width="150" align="center" />
          <el-table-column prop="parentName" label="所属主分类" min-width="120" align="center" />
          <el-table-column prop="videoCount" label="视频数" width="90" align="center" />
          <el-table-column prop="tags" label="标签" min-width="180" align="center">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags"
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
              <el-input-number
                v-model="scope.row.sort"
                size="small"
                :min="1"
                :controls="true"
                :step="1"
                style="width: 70px;"
                @change="onSortChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status" type="success">启用</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
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

    <el-dialog
      :title="editParentData.id ? '编辑主分类' : '新建主分类'"
      v-model="parentDialogVisible"
      width="400px"
      @close="onMainDialogClose"
    >
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

    <el-dialog
      :title="editData.id ? '编辑子分类' : '新建子分类'"
      v-model="dialogVisible"
      width="400px"
      @close="onDialogClose"
    >
      <el-form :model="editData" label-width="80px" size="small" ref="childFormRef">
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select v-model="editData.parent_id" placeholder="选择上级分类" style="width: 100%;">
            <el-option
              v-for="item in parentCategories" :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name" required>
          <el-input v-model="editData.name" placeholder="请输入子分类名称" />
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

    <el-dialog title="编辑标签" v-model="tagDialogVisible" width="320px" @close="onTagDialogClose">
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

    <DouyinCategorySortDialog :model-value="sortDialogVisible" @update:modelValue="sortDialogVisible = $event" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入抖音分类 Store
import {
  douyinCategoryParents as parentCategories,
  douyinCategoryChildren as childCategories,
  fetchCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,      // 确保这个函数已从 store 导入
  batchDeleteCategories, // 确保这个函数已从 store 导入
  saveCategorySort     // 依然需要这个函数来处理单行排序变化
} from '@/store/modules/douyin-category.store'

// 导入新的抖音分类排序弹窗组件
import DouyinCategorySortDialog from '@/views/video-category/components/DouyinCategorySortDialog.vue'


onMounted(() => { fetchCategoryList() })

interface DouyinCategory { // 定义一个统一的 Category 接口，兼容主分类和子分类
  id: number
  name: string
  parent_id: number | null // 主分类为 0 或 null，子分类为父分类ID
  sort: number
  status: boolean | number // 前端用boolean，后端可能用0/1
  tags?: string[]
  videoCount?: number
}

// 统一类型为 DouyinCategory，避免 DouyinParent 和 DouyinChild 混淆
// const currentTreeId = ref<number>(0) // 0 表示未选中或默认根节点，改为 null 更符合未选中
const currentTreeId = ref<number | null>(null) // 默认未选中任何分类
const currentParentName = ref<string>('') // 这个变量的用处在表格中可能不再必要，因为 parentName 会动态计算

const treeProps = { label: 'name', children: 'children', isLeaf: 'leaf' }

const categoryTree = computed(() => {
  return parentCategories.value.map((main: DouyinCategory) => {
    // 确保主分类节点有 id 和 name 属性
    const childrenNodes = childCategories.value
      .filter((c: DouyinCategory) => c.parent_id === main.id)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map((c: DouyinCategory) => ({
        id: c.id,
        name: c.name,
        parent_id: c.parent_id, // 确保子分类也带上 parent_id
        leaf: true // 子分类是叶子节点
      }))
    return {
      id: main.id,
      name: main.name,
      parent_id: main.parent_id, // 主分类的 parent_id 也带上 (通常为 0 或 null)
      children: childrenNodes
    }
  })
})

const isParentSelected = computed(() => {
  // 如果 currentTreeId 对应的分类在 parentCategories 中，则表示选中了主分类
  return parentCategories.value.some((p: DouyinCategory) => p.id === currentTreeId.value)
})

function onTreeSelect(node: DouyinCategory) { // 节点类型使用 DouyinCategory
  currentTreeId.value = node.id
  // 查找父分类名称，如果需要的话
  const parentItem = parentCategories.value.find((p) => p.id === node.id)
  if (parentItem) currentParentName.value = parentItem.name
  else currentParentName.value = '' // 如果点击的是子分类，清空 parentName
  currentPage.value = 1 // 切换分类时重置页码
}

const filter = ref<{ child: number | ''; tag: string }>({ child: '', tag: '' })

const childCategoryOptions = computed<DouyinCategory[]>(() => {
  // 如果当前选中了主分类，则只显示该主分类下的子分类作为筛选选项
  if (currentTreeId.value !== null && isParentSelected.value) {
      return childCategories.value.filter((c: DouyinCategory) => c.parent_id === currentTreeId.value);
  }
  // 否则显示所有子分类作为选项
  return childCategories.value;
})

const filteredChildCategories = computed<(DouyinCategory & { parentName: string })[]>(() => {
  let list: DouyinCategory[] = []

  if (currentTreeId.value === null) {
    // 如果没有选中任何分类（或重置了筛选），显示所有主分类和子分类
    list = [
      ...parentCategories.value.map(p => ({
        ...p,
        parent_id: 0, // 明确主分类的 parent_id 为 0
        parentName: '主分类',
        videoCount: p.videoCount ?? 0,
        tags: p.tags ?? [],
        status: Boolean(p.status) // 统一为 boolean
      })),
      ...childCategories.value.map(c => ({
        ...c,
        parentName: parentCategories.value.find(p => p.id === c.parent_id)?.name || '--',
        videoCount: c.videoCount ?? 0,
        tags: c.tags ?? [],
        status: Boolean(c.status) // 统一为 boolean
      }))
    ]
  } else {
    // 如果选中了树节点
    const selectedNodeIsParent = parentCategories.value.some((p: DouyinCategory) => p.id === currentTreeId.value);

    if (selectedNodeIsParent) {
      // 如果选中主分类，则显示该主分类自身及其下的所有子分类
      const selectedParent = parentCategories.value.find((p: DouyinCategory) => p.id === currentTreeId.value);
      if (selectedParent) {
        list.push({
          ...selectedParent,
          parent_id: 0, // 明确主分类的 parent_id 为 0
          parentName: '主分类',
          videoCount: selectedParent.videoCount ?? 0,
          tags: selectedParent.tags ?? [],
          status: Boolean(selectedParent.status)
        });
      }
      list = list.concat(childCategories.value.filter((c: DouyinCategory) => c.parent_id === currentTreeId.value).map(c => ({
        ...c,
        parentName: selectedParent?.name || '--',
        videoCount: c.videoCount ?? 0,
        tags: c.tags ?? [],
        status: Boolean(c.status)
      })));
    } else {
      // 如果选中子分类，只显示这一个子分类
      const selectedChild = childCategories.value.find((c: DouyinCategory) => c.id === currentTreeId.value);
      if (selectedChild) {
        list.push({
          ...selectedChild,
          parentName: parentCategories.value.find(p => p.id === selectedChild.parent_id)?.name || '--',
          videoCount: selectedChild.videoCount ?? 0,
          tags: selectedChild.tags ?? [],
          status: Boolean(selectedChild.status)
        });
      }
    }
  }

  // 根据筛选条件过滤
  if (filter.value.child) {
    list = list.filter((c: DouyinCategory) => c.id === Number(filter.value.child));
  }
  if (filter.value.tag) {
    const tagKw = filter.value.tag.toLowerCase();
    list = list.filter((c: DouyinCategory) => c.tags && c.tags.some(tag => tag.toLowerCase().includes(tagKw)));
  }

  // 排序
  list.sort((a, b) => (a.sort || 0) - (b.sort || 0)); // 确保排序

  return list;
})

const pageSize = ref<number>(10)
const currentPage = ref<number>(1)
const pagedChildCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredChildCategories.value.slice(start, start + pageSize.value)
})
function handlePageChange(page: number) { currentPage.value = page }

const multipleSelection = ref<DouyinCategory[]>([])
function handleSelectionChange(rows: DouyinCategory[]) { multipleSelection.value = rows }

async function onBatchDelete() {
  if (!multipleSelection.value.length) {
    return ElMessage.warning('请选择要删除的分类');
  }

  // 检查是否有主分类在批量删除中
  const hasParentCategoryInSelection = multipleSelection.value.some(item => item.parent_id === 0 || item.parent_id === null);
  let confirmMessage = '';
  if (hasParentCategoryInSelection) {
    confirmMessage = '确定批量删除已选分类吗？删除主分类会自动删除所有子分类及其下所有视频！';
  } else {
    confirmMessage = '确定批量删除已选分类吗？这将同时删除其下所有视频！';
  }

  await ElMessageBox.confirm(confirmMessage, '警告', { type: 'warning' }).then(async () => {
    const ids = multipleSelection.value.map((i) => i.id)
    const res = await batchDeleteCategories(ids)
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      multipleSelection.value = []; // 清空选中
      await fetchCategoryList(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

const parentDialogVisible = ref<boolean>(false)
const editParentData = ref<DouyinCategory>({ id: null, name: '', parent_id: 0, sort: 1, status: true }) // 统一类型
const parentFormRef = ref<any>(null); // 用于表单验证

function openMainDialog() {
  editParentData.value = { id: null, name: '', parent_id: 0, sort: 1, status: true } // 初始化主分类数据
  parentDialogVisible.value = true
  nextTick(() => { // 确保在弹窗 DOM 渲染后重置表单验证状态
    if (parentFormRef.value) {
      parentFormRef.value.resetFields();
    }
  });
}
function onMainDialogClose() {
    if (parentFormRef.value) {
      parentFormRef.value.resetFields();
    }
    editParentData.value = { id: null, name: '', parent_id: 0, sort: 1, status: true };
}

async function onParentSave() {
  if (!parentFormRef.value) return;
  parentFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let res;
        // 主分类的 parent_id 始终为 0
        const submitData = { ...editParentData.value, parent_id: 0, status: editParentData.value.status ? 1 : 0 }; // 确保 status 是 0/1
        if (submitData.id) {
          res = await updateCategory(submitData);
        } else {
          res = await addCategory(submitData); // 后端根据 parent_id 0 识别为主分类
        }
        if (res && res.code === 0) {
          ElMessage.success('主分类保存成功');
          parentDialogVisible.value = false;
          await fetchCategoryList(); // 刷新列表
        } else {
          ElMessage.error(res?.msg || '保存失败');
        }
      } catch (error) {
        ElMessage.error('请求保存主分类失败');
        console.error('Save Parent Error:', error);
      }
    } else {
      ElMessage.warning('请填写必填项');
      return false;
    }
  });
}

const dialogVisible = ref<boolean>(false)
const editData = ref<DouyinCategory>({
  id: null,
  name: '',
  parent_id: parentCategories.value[0]?.id ?? null, // 默认选中第一个主分类的ID，如果没有则为null
  sort: 1,
  status: true,
  tags: []
})
const childFormRef = ref<any>(null); // 用于表单验证

function openDialog() {
  editData.value = {
    id: null,
    name: '',
    parent_id: parentCategories.value[0]?.id ?? null,
    sort: 1,
    status: true,
    tags: []
  }
  dialogVisible.value = true
  nextTick(() => { // 确保在弹窗 DOM 渲染后重置表单验证状态
    if (childFormRef.value) {
      childFormRef.value.resetFields();
    }
  });
}
function onEdit(row: DouyinCategory) { // 统一使用 DouyinCategory 类型
  editData.value = { ...row, status: Boolean(row.status) } // 确保 status 转换成布尔值
  dialogVisible.value = true
}

function onDialogClose() {
    if (childFormRef.value) {
        childFormRef.value.resetFields();
    }
    editData.value = { id: null, name: '', parent_id: parentCategories.value[0]?.id ?? null, sort: 1, status: true, tags: [] };
}

async function onDelete(row: DouyinCategory) { // 统一使用 DouyinCategory 类型
  let confirmMessage = '';
  // 判断是主分类还是子分类
  if (row.parent_id === 0 || row.parent_id === null) { // 主分类的 parent_id 为 0 或 null
    confirmMessage = `确定要删除主分类 “${row.name}” 吗？删除主分类会自动删除所有子分类及其下所有视频！`;
  } else {
    confirmMessage = `确定要删除子分类 “${row.name}” 吗？这将同时删除其下所有视频！`;
  }

  await ElMessageBox.confirm(confirmMessage, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteCategory(row.id) // 调用 Store 中的删除接口
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
      await fetchCategoryList(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onSave() {
  if (!childFormRef.value) return;
  childFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let res;
        // 转换 status 为 0 或 1
        const submitData = { ...editData.value, status: editData.value.status ? 1 : 0 };
        // Tags 可能为空或字符串，确保是数组
        if (!submitData.tags || typeof submitData.tags === 'string') {
            submitData.tags = [];
        }

        console.log('onSave: 提交数据', submitData);

        if (submitData.id) {
          res = await updateCategory(submitData);
        } else {
          res = await addCategory(submitData); // 后端根据 parent_id 非 0 识别为子分类
        }
        if (res && res.code === 0) {
          ElMessage.success('保存成功');
          dialogVisible.value = false;
          currentPage.value = 1; // 保存成功后重置页码到第一页
          await fetchCategoryList(); // 刷新列表
        } else {
          ElMessage.error(res?.msg || '保存失败');
        }
      } catch (error) {
        ElMessage.error('请求保存子分类失败');
        console.error('Save Child Error:', error);
      }
    } else {
      ElMessage.warning('请填写必填项');
      return false;
    }
  });
}

const tagDialogVisible = ref<boolean>(false)
const editTagValue = ref<string>('')
let editTagRow: DouyinCategory | null = null // 统一类型
let editTagIndex = -1

function onTagClick(tag: string, row: DouyinCategory) { // 统一类型
  ElMessage.info(`你点击了标签: ${tag}`);
}
function editTag(tag: string, row: DouyinCategory) { // 统一类型
  tagDialogVisible.value = true
  editTagValue.value = tag
  editTagRow = row
  editTagIndex = row.tags ? row.tags.indexOf(tag) : -1 // 确保 tags 存在
}
function onTagDialogClose() {
    editTagValue.value = '';
    editTagRow = null;
    editTagIndex = -1;
}

async function onTagSave() {
  if (!editTagRow || editTagIndex === -1) {
    ElMessage.warning('未选中要编辑的标签或数据异常。');
    tagDialogVisible.value = false;
    return;
  }
  if (!editTagValue.value.trim()) {
    ElMessage.warning('标签名不能为空');
    return;
  }

  const newTags = [...(editTagRow.tags || [])]; // 确保 tags 是数组
  newTags.splice(editTagIndex, 1, editTagValue.value.trim());

  // 过滤掉空字符串和重复的标签
  const uniqueTags = Array.from(new Set(newTags.filter(t => t.trim() !== '')));

  try {
    // 假设 updateCategory 接口可以接收部分字段更新，包括 tags
    const res = await updateCategory({ id: editTagRow.id, tags: uniqueTags });
    if (res && res.code === 0) {
      ElMessage.success('标签更新成功！');
      tagDialogVisible.value = false;
      await fetchCategoryList(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '标签更新失败！');
    }
  } catch (error) {
    ElMessage.error('请求更新标签失败');
    console.error('Save Tag Error:', error);
  }
}

// 单个子分类排序变化
async function onSortChange(row: DouyinCategory) { // 统一类型
  try {
    const res = await saveCategorySort([{ id: row.id, sort: row.sort || 0 }]);
    if (res && res.code === 0) {
      ElMessage.success('排序更新成功！');
      await fetchCategoryList(); // 刷新列表以显示最新顺序
    } else {
      ElMessage.error(res?.msg || '排序更新失败！');
      await fetchCategoryList(); // 失败时刷新以恢复数据到最新状态，避免本地脏数据
    }
  } catch (error) {
    ElMessage.error('请求更新排序失败');
    console.error('Single Sort Change Error:', error);
    await fetchCategoryList(); // 失败时刷新
  }
}

// ====== 排序管理弹窗逻辑 (已移至 DouyinCategorySortDialog.vue) ======
const sortDialogVisible = ref(false) // 仅用于控制新组件的显示隐藏

function openSortDialog() {
  sortDialogVisible.value = true // 打开新的排序弹窗组件
}

// onSearch 和 onReset 确保它们能触发数据刷新
function onSearch() {
  currentPage.value = 1; // 搜索时重置回第一页
  // filteredChildCategories 是 computed 属性，会自动响应 filter 的变化
}
function onReset() {
  filter.value = { child: '', tag: '' };
  currentTreeId.value = null; // 重置时清空树选择
  currentPage.value = 1; // 重置筛选条件后回到第一页
  // filteredChildCategories 是 computed 属性，会自动响应 filter 的变化
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
.el-form-item { margin-right: 7px; margin-bottom: 15px; } /* 调整表单项间距 */
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