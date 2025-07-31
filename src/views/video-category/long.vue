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
        :current-node-key="currentTreeId"
        v-loading="categoryLoading"
      >
        <template #default="{ data }">
          <span class="tree-node-label" :class="{ 'active': currentTreeId === data.id }">
            {{ data.name }}
          </span>
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
              <el-button size="small" @click="onReset">重-重置</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="success" @click="openDialog">+ 新建子分类</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="danger" :disabled="!multipleSelection.length" @click="onBatchDelete">
                批量删除
              </el-button>
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
          style="width:100%"
          v-loading="categoryLoading"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="子分类ID" width="90" align="center" />
          <el-table-column prop="name" label="子分类名称" min-width="150" align="center" />
          <el-table-column prop="parentName" label="所属主分类" min-width="120" align="center" />
          <el-table-column prop="icon" label="图标文件名" width="140" align="center">
            <template #default="scope">
              {{ scope.row.icon || '--' }}
            </template>
          </el-table-column>
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
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="warning" @click="onEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="editParentData.id ? '编辑主分类' : '新建主分类'" v-model="parentDialogVisible" width="400px" @close="onMainDialogClose">
      <el-form :model="editParentData" label-width="80px" size="small" ref="parentFormRef">
        <el-form-item label="主分类名称" prop="name" required>
          <el-input v-model="editParentData.name" placeholder="请输入主分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editParentData.icon" placeholder="如 hot.svg" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="parentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onParentSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="editData.id ? '编辑子分类' : '新建子分类'" v-model="dialogVisible" width="400px" @close="onDialogClose">
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
        <!-- 新增图标输入框 -->
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editData.icon" placeholder="如 hot.svg" />
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

    <el-dialog title="编辑标签" v-model="tagDialogVisible" width="320px" @close="onTagDialogClose">
      <el-input v-model="editTagValue" maxlength="8" show-word-limit placeholder="请输入新标签名" />
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onTagSave">保存</el-button>
      </template>
    </el-dialog>

    <LongVideoCategorySortDialog
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
// 导入长视频分类专用的排序管理组件
import LongVideoCategorySortDialog from './components/LongVideoCategorySortDialog.vue'

// 导入长视频分类 Store
import {
  parentCategories,
  childCategories,
  categoryLoading,
  fetchCategoryList,
  addCategory,
  updateCategory,
  deleteCategory, // 确保这个函数已从 store 导入
  batchDeleteCategory,
  updateChildTags,
  updateChildSort,
  // updateParentSort, // 这一行根据实际情况保留或删除，如果 batchUpdateSort 包含了主分类排序
  batchUpdateSort
} from '@/store/modules/long-video-category.store'

// 类型定义 (从 store 复制过来或保持同步)
interface Category {
  id: number;
  name: string;
  parent_id: number; // 0 for parent, non-0 for child
  sort: number;
  status: boolean | number; // 前端用boolean，后端可能用0/1
  tags?: string[];
  videoCount?: number; // 视频数量
}

// ======================= 初始化加载数据 =======================
onMounted(() => {
  fetchCategoryList();
console.log('filteredChildCategories', filteredChildCategories.value);
console.log('parentCategories', parentCategories.value)
console.log('childCategories', childCategories.value)
});

// ===================== 左侧主分类树 =====================
const currentTreeId = ref<number | null>(null)
const treeProps = { label: 'name', children: 'children', isLeaf: 'leaf' }

const categoryTree = computed(() => {
  // 注意：这里创建树结构时，确保子分类的 `leaf` 属性设置正确，以便 Element Plus Tree 正确渲染叶子节点图标
  // 同时，主分类也应该在树中显示，并且可以点击来筛选右侧表格
  const treeNodes = parentCategories.value.map((main: Category) => ({
    id: main.id,
    name: main.name,
    parent_id: 0, // 明确主分类的 parent_id
    children: childCategories.value
      .filter((c: Category) => c.parent_id === main.id)
      .map((c: Category) => ({ id: c.id, name: c.name, parent_id: c.parent_id, leaf: true })) // 子分类是叶子节点
  }));

  // 将主分类自身也添加到可筛选的列表中，以便在表格中显示，因为表格的 onEdit/onDelete 可能直接作用于主分类行
  // 这里需要一个扁平化的所有分类列表，因为表格可能显示主分类行
  const allCategoriesFlat = [
    ...parentCategories.value.map(p => ({ ...p, parentName: '主分类', videoCount: p.videoCount ?? 0, tags: p.tags ?? [] })), // 确保主分类有 parentName, videoCount, tags 属性
    ...childCategories.value.map(c => ({ ...c, parentName: parentCategories.value.find(p => p.id === c.parent_id)?.name ?? '--', videoCount: c.videoCount ?? 0, tags: c.tags ?? [] }))
  ];
  return treeNodes; // tree 结构保持不变
})

// === 修改点：移除 if (!node.leaf)，让点击任何节点都更新 currentTreeId ===
function onTreeSelect(node: any) {
  // 当点击主分类节点时，currentTreeId 设为主分类ID
  // 当点击子分类节点时，currentTreeId 设为子分类ID
  currentTreeId.value = node.id
  currentPage.value = 1 // 切换分类时重置页码
}

// ===================== 右侧筛选区和表格 =====================
const filter = ref({ child: '', tag: '' })

const childCategoryOptions = computed(() => {
  // 如果当前选中了主分类，则只显示该主分类下的子分类作为筛选选项
  if (currentTreeId.value !== null && parentCategories.value.some((c: Category) => c.id === currentTreeId.value)) {
      return childCategories.value.filter((c: Category) => c.parent_id === currentTreeId.value);
  }
  // 否则显示所有子分类作为选项
  return childCategories.value;
})

const pageSize = 10
const currentPage = ref(1)

const filteredChildCategories = computed(() => {
  let list: Category[] = [];

  if (currentTreeId.value === null) {
    // 显式补充 icon 字段
    list = [
      ...parentCategories.value.map(p => ({
        ...p,
        parentName: '主分类',
        videoCount: p.videoCount ?? 0,
        tags: p.tags ?? [],
        status: Boolean(p.status),
        icon: p.icon || '' // 显式补充
      })),
      ...childCategories.value.map(c => ({
        ...c,
        parentName: parentCategories.value.find(p => p.id === c.parent_id)?.name ?? '--',
        videoCount: c.videoCount ?? 0,
        tags: c.tags ?? [],
        status: Boolean(c.status),
        icon: c.icon || '' // 显式补充
      }))
    ];
  } else {
    const isParent = parentCategories.value.some((c: Category) => c.id === currentTreeId.value);
    if (isParent) {
      const selectedParent = parentCategories.value.find((c: Category) => c.id === currentTreeId.value);
      if (selectedParent) {
        list.push({
          ...selectedParent,
          parentName: '主分类',
          videoCount: selectedParent.videoCount ?? 0,
          tags: selectedParent.tags ?? [],
          status: Boolean(selectedParent.status),
          icon: selectedParent.icon || '' // 显式补充
        });
      }
      list = list.concat(
        childCategories.value
          .filter((c: Category) => c.parent_id === currentTreeId.value)
          .map(c => ({
            ...c,
            parentName: selectedParent?.name ?? '--',
            videoCount: c.videoCount ?? 0,
            tags: c.tags ?? [],
            status: Boolean(c.status),
            icon: c.icon || '' // 显式补充
          }))
      );
    } else {
      const selectedChild = childCategories.value.find((c: Category) => c.id === currentTreeId.value);
      if (selectedChild) {
        list.push({
          ...selectedChild,
          parentName: parentCategories.value.find(p => p.id === selectedChild.parent_id)?.name ?? '--',
          videoCount: selectedChild.videoCount ?? 0,
          tags: selectedChild.tags ?? [],
          status: Boolean(selectedChild.status),
          icon: selectedChild.icon || '' // 显式补充
        });
      }
    }
  }

  // 根据筛选条件过滤
  if (filter.value.child) {
    list = list.filter((c: Category) => c.id === Number(filter.value.child));
  }
  if (filter.value.tag) {
    const tagKw = filter.value.tag.toLowerCase();
    list = list.filter((c: Category) => c.tags && c.tags.some(tag => tag.toLowerCase().includes(tagKw)));
  }

  return list;
});


const pagedChildCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredChildCategories.value.slice(start, end)
})

function handlePageChange(page: number) {
  currentPage.value = page
}

const multipleSelection = ref<Category[]>([])
function handleSelectionChange(rows: Category[]) {
  multipleSelection.value = rows
}

async function onBatchDelete() {
  if (!multipleSelection.value.length) {
    return ElMessage.warning('请先勾选要操作的分类');
  }

  // 检查是否有主分类在批量删除中
  const hasParentCategory = multipleSelection.value.some(item => item.parent_id === 0);
  let confirmMessage = '';
  if (hasParentCategory) {
    confirmMessage = '确定批量删除已选分类吗？删除主分类会自动删除所有子分类及其下所有视频！';
  } else {
    confirmMessage = '确定批量删除已选分类吗？这将同时删除其下所有视频！';
  }


  await ElMessageBox.confirm(confirmMessage, '警告', { type: 'warning' }).then(async () => {
    const ids = multipleSelection.value.map((i: Category) => i.id);
    const res = await batchDeleteCategory(ids);
    if (res.success) {
      ElMessage.success('批量删除成功');
      multipleSelection.value = []; // 清空选中
      // fetchCategoryList 已在 Store 内部调用
    } else {
      ElMessage.error(res.message || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

// ===================== 主分类弹窗 =====================
const parentDialogVisible = ref(false)
const editParentData = ref<{ id: number | null; name: string; icon: string }>({ id: null, name: '', icon: '' })
const parentFormRef = ref<any>(null); // 用于表单验证

function openMainDialog() {
  editParentData.value = { id: null, name: '' };
  parentDialogVisible.value = true;
  nextTick(() => { // 确保在弹窗 DOM 渲染后重置表单验证状态
    if (parentFormRef.value) {
      parentFormRef.value.resetFields();
    }
  });
}
function onMainDialogClose() {
    // 关闭弹窗时重置表单和数据
    if (parentFormRef.value) {
      parentFormRef.value.resetFields();
    }
    editParentData.value = { id: null, name: '' };
}

async function onParentSave() {
  if (!parentFormRef.value) return; // 确保表单引用存在
  parentFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let res;
        const submitData = { ...editParentData.value, parent_id: 0 }; // 主分类 parent_id 为 0
        if (submitData.id) {
            res = await updateCategory(submitData); // 更新主分类
        } else {
            res = await addCategory(submitData); // 新建主分类
        }

        if (res.success) {
            ElMessage.success('主分类保存成功');
            parentDialogVisible.value = false;
            // fetchCategoryList 已在 Store 内部调用
        } else {
            ElMessage.error(res.message || '主分类保存失败');
        }
      } catch (error) {
          console.error('保存主分类请求失败:', error);
          ElMessage.error('保存主分类失败，请检查网络或后端服务');
      }
    } else {
      ElMessage.warning('请填写主分类名称');
      return false;
    }
  });
}

// ===================== 新建/编辑子分类弹窗 =====================
const dialogVisible = ref(false)
const editData = ref<{ id: number | null; name: string; parent_id: number | string; sort: number; status: boolean | number; tags?: string[]; icon: string }>({ id: null, name: '', parent_id: '', sort: 1, status: true, tags: [], icon: '' })
const childFormRef = ref<any>(null); // 用于表单验证

function openDialog() {
  editData.value = {
    id: null,
    name: '',
    parent_id: currentTreeId.value !== null && parentCategories.value.some(p => p.id === currentTreeId.value)
                 ? currentTreeId.value // 如果当前选中了主分类，则默认选择该主分类
                 : (parentCategories.value[0]?.id ?? null), // 否则默认选中第一个主分类（如果存在）
    sort: 1,
    status: true,
    tags: []
  };
  dialogVisible.value = true;
  nextTick(() => { // 确保在弹窗 DOM 渲染后重置表单验证状态
    if (childFormRef.value) {
      childFormRef.value.resetFields();
    }
  });
}

function onEdit(row: Category) {
  // 深拷贝 row 数据，避免直接修改表格数据
  editData.value = JSON.parse(JSON.stringify(row));
  editData.value.status = Boolean(row.status); // 确保 status 是布尔值
  dialogVisible.value = true;
}

function onDialogClose() {
    // 关闭弹窗时重置表单和数据
    if (childFormRef.value) {
        childFormRef.value.resetFields();
    }
    editData.value = { id: null, name: '', parent_id: '', sort: 1, status: true, tags: [] };
}

// 修改点 2：onDelete 函数逻辑
async function onDelete(row: Category) {
  let confirmMessage = '';
  // 根据 parent_id 判断是主分类还是子分类
  if (row.parent_id === 0 || row.parent_id === null) { // 假设主分类的 parent_id 为 0 或 null
    confirmMessage = `确定要删除主分类 “${row.name}” 吗？删除主分类会自动删除所有子分类及其下所有视频！`;
  } else {
    confirmMessage = `确定要删除子分类 “${row.name}” 吗？这将同时删除其下所有视频！`;
  }

  await ElMessageBox.confirm(confirmMessage, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteCategory(row.id); // 调用 Store 中的删除接口
    if (res.success) {
      ElMessage.success('删除成功');
      // fetchCategoryList 已在 Store 内部调用
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onSave() {
  if (!childFormRef.value) return; // 确保表单引用存在
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
            res = await updateCategory(submitData); // 更新子分类
        } else {
            res = await addCategory(submitData); // 新建子分类
        }

        if (res.success) {
            ElMessage.success('子分类保存成功');
            dialogVisible.value = false;
            currentPage.value = 1; // 保存成功后重置页码到第一页
            // fetchCategoryList 已在 Store 内部调用，确保数据刷新
        } else {
            ElMessage.error(res.message || '子分类保存失败');
        }
      } catch (error) {
          console.error('保存子分类请求失败:', error);
          ElMessage.error('保存子分类失败，请检查网络或后端服务');
      }
    } else {
      ElMessage.warning('请填写必填项');
      return false;
    }
  });
}

// ===================== 搜索/重置 =====================
function onSearch() {
    currentPage.value = 1; // 搜索时重置页码
}
function onReset() {
    filter.value = { child: '', tag: '' };
    currentTreeId.value = null; // 重置时清空树选择
    currentPage.value = 1; // 重置时也重置页码
}

// ===================== 标签编辑弹窗 =====================
const tagDialogVisible = ref(false)
const editTagValue = ref('')
let editTagRow: Category | null = null
let editTagIndex = -1

function onTagClick(tag: string, row: Category) {
    ElMessage.info(`你点击了标签: ${tag}`);
}

function editTag(tag: string, row: Category) {
    tagDialogVisible.value = true;
    editTagValue.value = tag;
    editTagRow = row;
    editTagIndex = row.tags ? row.tags.indexOf(tag) : -1;
}

function onTagDialogClose() {
    editTagValue.value = '';
    editTagRow = null;
    editTagIndex = -1;
}

async function onTagSave() {
    if (editTagRow && editTagIndex > -1) {
        if (!editTagValue.value.trim()) {
            ElMessage.warning('标签名不能为空');
            return;
        }

        const newTags = [...(editTagRow.tags || [])]; // 确保是数组
        newTags.splice(editTagIndex, 1, editTagValue.value.trim());

        // 过滤掉空字符串和重复的标签
        const uniqueTags = Array.from(new Set(newTags.filter(t => t.trim() !== '')));

        try {
            const res = await updateChildTags(editTagRow.id, uniqueTags);
            if (res.success) {
                ElMessage.success('标签更新成功');
                tagDialogVisible.value = false;
                // fetchCategoryList 已在 Store 内部调用
            } else {
                ElMessage.error(res.message || '标签更新失败');
            }
        } catch (error) {
            console.error('更新标签请求失败:', error);
            ElMessage.error('更新标签失败，请检查网络或后端服务');
        }
    } else if (editTagRow && editTagIndex === -1 && editTagValue.value.trim()) {
        // 如果是添加新标签的逻辑（虽然目前只有编辑已有标签的入口）
        const newTags = Array.from(new Set([...(editTagRow.tags || []), editTagValue.value.trim()].filter(t => t.trim() !== '')));
        try {
            const res = await updateChildTags(editTagRow.id, newTags);
            if (res.success) {
                ElMessage.success('标签添加成功');
                tagDialogVisible.value = false;
            } else {
                ElMessage.error(res.message || '标签添加失败');
            }
        } catch (error) {
            console.error('添加标签请求失败:', error);
            ElMessage.error('添加标签失败，请检查网络或后端服务');
        }
    } else {
        ElMessage.warning('标签名不能为空');
    }
}


async function onSortChange(row: Category) {
    try {
        const res = await updateChildSort(row.id, row.sort);
        if (res.success) {
            ElMessage.success('子分类排序更新成功');
            // Store 内部已调用 fetchCategoryList()，会刷新数据
        } else {
            ElMessage.error(res.message || '子分类排序更新失败');
            // 失败时刷新以恢复数据到最新状态，避免本地脏数据
            await fetchCategoryList();
        }
    } catch (error) {
        console.error('更新子分类排序请求失败:', error);
        ElMessage.error('更新子分类排序失败，请检查网络或后端服务');
        await fetchCategoryList(); // 失败时刷新
    }
}

// =================== 排序管理弹窗逻辑 ===================
const sortDialogVisible = ref(false)

function openSortDialog() {
  sortDialogVisible.value = true;
}

// 接收 LongVideoCategorySortDialog 组件的保存事件
async function onSaveSort(listToSave: { id: number; sort: number }[]) {
  try {
    const res = await batchUpdateSort(listToSave);
    if (res.success) {
      ElMessage.success('排序保存成功');
      // sortDialogVisible.value = false; // 组件内部会关闭弹窗
      // fetchCategoryList 已在 Store 内部调用
    } else {
      ElMessage.error(res.message || '排序保存失败');
    }
  } catch (error) {
    console.error('保存排序请求失败:', error);
    ElMessage.error('保存排序失败，请检查网络或后端服务');
  }
}
</script>

<style scoped>
/* 样式照你原来的保留 */
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