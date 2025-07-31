<template>
  <div class="comic-category-manage-page">
    <!-- 左侧 分类树 -->
    <div class="side-tree">
      <div class="tree-header">
        漫画分类树
        <el-button type="success" size="small" @click="openAddMainCategoryDialog" style="margin-left: 12px;">
          + 新建主分类
        </el-button>
      </div>
      <el-tree
        :data="mainCategoryTree"
        :props="treeProps"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="onCategorySelect"
        :current-node-key="currentSelectedCategoryId"
      >
        <template #default="{ node, data }">
          <span :class="['tree-node', { active: currentSelectedCategoryId === data.id }]">
            {{ data.name }} ({{ data.comic_count || 0 }})
            <span v-if="data.children && data.children.length > 0" style="color: #999;"> - {{ data.children.length }}个子分类</span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧 内容区 -->
    <div class="main-content">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filterForm" class="search-form">
          <el-form-item label="分类名称">
            <el-input v-model="filterForm.keyword" placeholder="分类名称" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="所属主分类">
            <el-select v-model="filterForm.parentId" placeholder="全部主分类" clearable style="width: 150px">
              <el-option label="全部主分类" value="" />
              <el-option v-for="item in mainCategoryList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 100px;">
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
            <el-button type="success" size="small" @click="openAddSubCategoryDialog">+ 新建子分类</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" size="small" @click="onBatchDelete" :disabled="!selectedRows.length">批量删除</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="warning" size="small" @click="onBatchSetStatus(1)" :disabled="!selectedRows.length">批量启用</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="info" size="small" @click="onBatchSetStatus(0)" :disabled="!selectedRows.length">批量禁用</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格区 -->
      <el-table
        :data="filteredCategoryTableData"
        v-loading="loading"
        border
        stripe
        class="custom-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="150" align="left" />
        <el-table-column prop="parent_name" label="所属主分类" min-width="120" align="center">
          <template #default="scope">
            {{ scope.row.parent_name || '主分类' }}
          </template>
        </el-table-column>
        <el-table-column prop="comic_count" label="漫画数量" width="90" align="center" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column
  prop="layout_type"
  label="布局类型"
  width="100"
  align="center"
  v-if="filterForm.parentId !== ''"
>
  <template #default="scope">
    <span>{{ scope.row.layout_type || '-' }}</span>
  </template>
</el-table-column>
<el-table-column
  prop="icon"
  label="图标"
  width="60"
  align="center"
  v-if="filterForm.parentId !== ''"
>
  <template #default="scope">
    <img v-if="scope.row.icon" :src="`/icons/${scope.row.icon}`" style="width:24px;height:24px;" />
  </template>
</el-table-column>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'info'" size="small">{{ scope.row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditCategoryDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建/编辑分类弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogForm.id ? '编辑分类' : '新建分类'" width="380px">
      <el-form :model="dialogForm" label-width="90px">
        <el-form-item label="分类名称" required>
          <el-input v-model="dialogForm.name" maxlength="16" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="dialogForm.parent_id" placeholder="请选择所属主分类" clearable style="width: 100%">
            <el-option label="作为主分类" :value="0" /> <!-- 0 表示它是主分类 -->
            <el-option v-for="item in mainCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sort" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item
  label="布局类型"
  v-if="Number(dialogForm.parent_id) > 0"
>
  <el-select v-model="dialogForm.layout_type" placeholder="请选择布局类型" style="width: 100%">
    <el-option label="横滑卡片" value="type1" />
    <el-option label="三宫格" value="type2" />
    <el-option label="两宫格" value="type3" />
    <el-option label="九宫格" value="type4" />
    <el-option label="列表" value="list" />
    <el-option label="不限制" value="type5" />
    <el-option label="横图视频卡" value="videocard" />
  </el-select>
</el-form-item>
<!-- 这里插入：icon 字段，只对子分类展示 -->
    <el-form-item
      label="图标文件"
      v-if="Number(dialogForm.parent_id) > 0"
    >
      <el-input v-model="dialogForm.icon" placeholder="如 hot1.svg，留空不显示" style="width: 180px;" />
      <template #append>
        <img
          v-if="dialogForm.icon"
          :src="`/icons/${dialogForm.icon}`"
          style="width: 24px; height: 24px; margin-left: 4px;"
          alt="icon预览"
          @error="e => (e.target.style.display='none')"
        />
      </template>
    </el-form-item>
    <!-- ↑↑↑ 这就是你的“编辑/新增”子分类时的icon输入框，只对子分类弹出 -->
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategoryDialog" :loading="dialogLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useComicCategoryStore } from '@/store/modules/comicCategory.store'
const categoryStore = useComicCategoryStore()
const { mainCategories, subCategories, loading } = storeToRefs(categoryStore)

// ======================= 状态变量 =======================

// 筛选表单
const filterForm = ref({
  keyword: '',
  parentId: '', // 用 '' 表示全部
  status: ''
});

// 左侧树形结构的数据源
const mainCategoryTree = computed(() => {
  return mainCategories.value.map(mainCat => {
    const subCats = subCategories.value.filter(subCat => subCat.parent_id === mainCat.id);
    return {
      id: mainCat.id,
      name: mainCat.name,
      comic_count: mainCat.comic_count || 0,
      // 嵌套子分类
      children: subCats.map(subCat => ({ 
        id: subCat.id, 
        name: subCat.name,
        comic_count: subCat.comic_count || 0
      }))
    };
  });
});

const currentSelectedCategoryId = ref<number | null>(null); // 当前选中的树节点ID

// 下拉列表选项
const mainCategoryList = computed(() => mainCategories.value); // 主分类列表用于筛选和弹窗选择

// 表格数据 (根据筛选条件和树形选择动态计算)
const filteredCategoryTableData = computed(() => {
  let data: any[] = [];
  // parentId 为空字符串时，显示所有主分类
  if (filterForm.value.parentId === '') {
    data = mainCategories.value.map(cat => ({ ...cat, parent_name: '' }));
  } else {
    // 选了主分类，显示该主分类下的子分类
    data = subCategories.value
      .filter(subCat => subCat.parent_id == filterForm.value.parentId)
      .map(subCat => {
        const parent = mainCategories.value.find(mainCat => mainCat.id === subCat.parent_id);
        return { ...subCat, parent_name: parent ? parent.name : '未知主分类' };
      });
  }
  // 关键词和状态筛选
  data = data.filter(item => {
    const matchesKeyword = !filterForm.value.keyword || item.name.includes(filterForm.value.keyword);
    const matchesStatus = filterForm.value.status === '' || item.status == filterForm.value.status;
    return matchesKeyword && matchesStatus;
  });
  return data;
});


const selectedRows = ref<any[]>([]); // 表格多选行

// 弹窗相关
const dialogVisible = ref(false);
const dialogForm = ref<any>({
  id: null,
  name: '',         // 分类名称
  parent_id: 0,     // 父级ID，0为主分类
  sort: 1,          // 排序
  status: 1,        // 状态
  // remark: '',    // 如需备注可加
});
const dialogLoading = ref(false); // 弹窗保存按钮加载状态

const treeProps = { label: 'name', children: 'children' }; // ElTree 的 props 配置

// ======================= 生命周期 & 数据加载 =======================

onMounted(async () => {
  await categoryStore.fetchCategories()
});

// 监听树节点选择变化，更新表格数据
watch(currentSelectedCategoryId, (newId) => {
  if (newId !== null) {
    filterForm.value.parentId = String(newId);
  } else {
    filterForm.value.parentId = '';
  }
});

watch([currentSelectedCategoryId, () => filterForm.value.parentId], (val) => {
  console.log('当前选中ID:', val[0], '筛选parentId:', val[1])
}, { immediate: true })

watch(filteredCategoryTableData, (val) => {
  console.log('表格实际渲染数据:', val)
}, { immediate: true })

watch(mainCategories, (val) => {
  console.log('页面watch到mainCategories:', val);
}, { immediate: true })

// ======================= 筛选与重置 =======================

function onSearch() {
  // 由于数据已经在 store 中，这里的搜索主要是基于 filterForm 重新计算 computed 属性
  // 如果分类数据量巨大，可能需要将筛选逻辑放到 fetchComicCategories 中，并传递 searchForm 作为参数
  // 目前按当前设计，本地筛选足够
}

function onReset() {
  filterForm.value = { keyword: '', parentId: '', status: '' };
  currentSelectedCategoryId.value = null;
}

// ======================= 树形操作 =======================

function onCategorySelect(data: any) {
  // 如果点击的是主分类，则显示其子分类
  // 如果点击的是子分类，则显示该子分类（也可以考虑只显示其兄弟分类）
  currentSelectedCategoryId.value = data.id; // 更新当前选中的分类ID
}

// ======================= 表格操作 =======================

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

/**
 * 删除分类
 */
async function onDelete(row: any) {
  const confirmMsg = row.parent_id === 0 ? `确定删除主分类 “${row.name}” 吗？此操作会同时删除其下的所有子分类和关联漫画！` : `确定删除子分类 “${row.name}” 吗？`;
  await ElMessageBox.confirm(confirmMsg, '警告', { type: 'warning' }).then(async () => {
    const res = await categoryStore.deleteCategory(row.id);
    if (res && res.code === 0) {
      // fetchComicCategories 会在 store action 中自动调用，刷新UI
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

/**
 * 批量删除分类
 */
async function onBatchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要删除的分类');
  await ElMessageBox.confirm('确定批量删除已选分类吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await categoryStore.batchDeleteCategories(ids);
    if (res && res.code === 0) {
      selectedRows.value = [];
      // fetchComicCategories 会在 store action 中自动调用，刷新UI
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

/**
 * 批量设置分类状态 (启用/禁用)
 * @param status 1为启用，0为禁用
 */
async function onBatchSetStatus(status: number) {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的分类');
  const actionText = status === 1 ? '启用' : '禁用';
  await ElMessageBox.confirm(`确定批量${actionText}已选分类吗？`, '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await categoryStore.batchSetCategoryStatus(ids, status);
    if (res && res.code === 0) {
      selectedRows.value = [];
      // fetchComicCategories 会在 store action 中自动调用，刷新UI
    } else {
      ElMessage.error(res?.msg || `批量${actionText}失败`);
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// ======================= 弹窗操作 =======================

/**
 * 打开新增主分类弹窗
 */
function openAddMainCategoryDialog() {
  dialogForm.value = {
    id: null,
    name: '',
    parent_id: 0, // 0 表示主分类
    sort: 1,
    status: 1
  };
  dialogVisible.value = true;
}

/**
 * 打开新增子分类弹窗
 */
function openAddSubCategoryDialog() {
  if (!currentSelectedCategoryId.value) {
    ElMessage.warning('请先在左侧选择一个主分类');
    return;
  }
  dialogForm.value = {
    id: null,
    name: '',
    parent_id: currentSelectedCategoryId.value, // 必须是主分类id
    sort: 1,
    status: 1,
    layout_type: 'type1',
    icon: '' // 新增
  };
  dialogVisible.value = true;
}

function openEditCategoryDialog(row) {
  dialogForm.value = {
    ...row,
    status: Number(row.status),
    layout_type: row.layout_type || (row.parent_id ? 'type1' : undefined),
    icon: row.icon || ''  // 新增
  }
  dialogVisible.value = true;
}

/**
 * 提交分类弹窗表单
 */
async function submitCategoryDialog() {
  if (!dialogForm.value.name) return ElMessage.warning('分类名称为必填项');
  if (dialogForm.value.parent_id === null || dialogForm.value.parent_id === '') {
    return ElMessage.warning('请选择所属分类');
  }
  dialogLoading.value = true;
  try {
    // 只对子分类提交 layout_type/icon
    let submitData = {
      ...dialogForm.value,
      status: dialogForm.value.status ? 1 : 0
    }
    if (!submitData.parent_id || submitData.parent_id == 0) {
      delete submitData.layout_type // 主分类不能有布局字段
      delete submitData.icon        // 主分类不能有icon
    }
    let res;
    if (submitData.id) {
      res = await categoryStore.updateCategory(submitData);
    } else {
      res = await categoryStore.addCategory(submitData);
    }
    if (res && res.code === 0) {
      dialogVisible.value = false;
    } else {
      ElMessage.error(res?.msg || '保存失败');
    }
  } catch (error) {
    console.error('提交分类表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    dialogLoading.value = false;
  }
}

</script>

<style scoped>
.comic-category-manage-page {
  display: flex;
  gap: 18px;
  min-height: 82vh;
}
.side-tree {
  width: 260px; /* 稍微宽一点以容纳更多文本 */
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
.custom-table {
  font-size: 13px;
  min-width: 900px;
}
/* 沿用OnlyFans的按钮样式 */
.el-button {
  border-radius: 5px !important;
  font-size: 11px !important;
  padding: 1px 8px !important;
  min-width: 52px !important;
}
.el-card {
  border-radius: 9px;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 1px 8px 0 rgba(0,0,0,0.02) !important;
}
.el-table th, .el-table td {
  border-right: 1px solid #ebeef5 !important;
  padding: 0 2px !important;
}
.el-table th:last-child, .el-table td:last-child { border-right: none !important; }
.el-table { border-radius: 9px; overflow: hidden; }
.el-table::before { height: 0; }
</style>
