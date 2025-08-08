<template>
  <div class="recommend-manage-wrapper">
    <div class="group-management-section">
      <div class="filter-container">
        <el-form :inline="true" :model="groupFilterForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input v-model="groupFilterForm.keyword" placeholder="请输入分组名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchGroups">搜索</el-button>
            <el-button @click="resetGroupFilters">重置</el-button>
            <el-button type="success" @click="openAddGroupDialog">新增推荐分组</el-button>
          </el-form-item>
        </el-form>
      </div>

      <h3>推荐分组列表 (可拖拽排序)</h3>
      <el-table :data="store.recommendGroups" v-loading="store.loading" row-key="id" class="recommend-group-table">
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column prop="name" label="分组名"></el-table-column>
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <div class="sort-controls">
              <el-input-number v-model="row.sort" :min="1" size="small" controls-position="right" @change="markGroupSortChanged"></el-input-number>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="动漫数" width="80">
          <template #default="{ row }">
            {{ store.groupAnimeCounts[row.id] || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="layout_type" label="布局类型" width="100">
  <template #default="scope">
    <span>
      {{ layoutTypeText(scope.row.layout_type) }}
    </span>
  </template>
</el-table-column>
<el-table-column prop="icon" label="图标" width="60">
  <template #default="scope">
    <img v-if="scope.row.icon" :src="`/icons/${scope.row.icon}`" style="width:24px;height:24px;" />
  </template>
</el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditGroupDialog(row)">编辑分组名</el-button>
            <el-button type="danger" size="small" @click="deleteGroup(row.id)">删除分组</el-button>
            <el-button type="success" size="small" @click="openAnimeManageDialog(row)">管理动漫</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-button type="primary" :disabled="!groupSortChanged" @click="saveGroupSort">保存分组排序</el-button>
      </div>
    </div>

    <el-dialog
      v-model="groupFormDialogVisible"
      :title="isEditGroup ? '编辑推荐分组' : '新增推荐分组'"
      width="400px"
      destroy-on-close
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="80px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="groupForm.sort" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="布局类型" prop="layout_type">
  <el-select v-model="groupForm.layout_type" placeholder="请选择布局类型" style="width: 100%">
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
  <el-input v-model="groupForm.icon" placeholder="如 hot1.svg，留空不显示" style="width: 180px;">
    <template #append>
      <img
  v-if="groupForm.icon"
  :src="`/icons/${groupForm.icon}`"
  style="width: 24px; height: 24px; margin-left: 4px;"
  alt="icon预览"
  @error="onIconImgError"
/>

    </template>
  </el-input>
</el-form-item>
        </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroupForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="animeDialogVisible"
      :title="`管理分组“${currentGroupName}”的动漫`"
      width="70%"
      top="5vh"
      destroy-on-close
      @close="closeAnimeManageDialog"
    >
      <div class="anime-manage-content">
        <div class="left-panel">
          <h3>所有动漫列表</h3>
          <div class="anime-filter-container">
            <el-form :inline="true" :model="animeFilterForm" class="filter-form">
              <el-form-item label="关键词">
                <el-input v-model="animeFilterForm.keyword" placeholder="搜索动漫标题/ID" clearable @keyup.enter="searchAnimes"></el-input>
              </el-form-item>
              <el-form-item label="主分类">
                <el-select v-model="animeFilterForm.parentId" placeholder="全部主分类" clearable @change="onAnimeParentCategoryChange">
                  <el-option label="全部主分类" value=""></el-option>
                  <el-option v-for="parent in parents" :key="parent.id" :label="parent.name" :value="parent.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子分类">
                <el-select v-model="animeFilterForm.categoryId" placeholder="全部子分类" clearable>
                  <el-option label="全部子分类" value=""></el-option>
                  <el-option
                    v-for="child in filteredChildCategoriesForSelect"
                    :key="child.id"
                    :label="child.name"
                    :value="child.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="() => searchAnimes()">搜索</el-button>
<el-button @click="() => resetAnimeFilters()">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="filteredAllAnimeList"
            v-loading="animeLoading"
            height="350px"
            ref="allAnimeTableRef"
            @selection-change="handleAllAnimeSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="动漫标题"></el-table-column>
            <el-table-column prop="main_category_name" label="主分类" width="100"></el-table-column>
            <el-table-column prop="child_category_name" label="子分类" width="100"></el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="addAnimeToSelected([row])">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="anime-table-footer">
            <el-pagination
              @size-change="handleAnimeSizeChange"
              @current-change="handleAnimeCurrentChange"
              :current-page="animePagination.currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="animePagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="animePagination.total"
              background
            ></el-pagination>
            <el-button type="success" :disabled="selectedAllAnimes.length === 0" @click="addAnimeToSelected(selectedAllAnimes)">批量添加</el-button>
          </div>
        </div>

        <div class="right-panel">
          <h3>已选动漫 (拖拽排序)</h3>
          <div class="selected-anime-list" ref="selectedAnimeListRef">
            <div v-if="selectedAnimeList.length === 0" class="no-animes-placeholder">
              暂无已选动漫，请从左侧添加
            </div>
            <div
              v-for="(anime, index) in selectedAnimeList"
              :key="anime.video_id"
              class="selected-anime-item"
            >
              <el-icon><Rank /></el-icon>
              <span>{{ index + 1 }}. {{ anime.title }}</span>
              <el-button link type="danger" size="small" @click="removeAnimeFromSelected(anime.video_id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAnimeManageDialog">取消</el-button>
          <el-button type="primary" @click="saveAnimeRecommendations">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElTable, ElForm } from 'element-plus';
import Sortable from 'sortablejs';
import { Rank } from '@element-plus/icons-vue';
import { useAnimeRecommendStore } from '@/store/modules/anime-recommend.store';
const store = useAnimeRecommendStore();

// 推荐分组管理相关
const groupFilterForm = ref({ keyword: '' });
const groupFormDialogVisible = ref(false);
const isEditGroup = ref(false);
const groupForm = ref({
  id: null as number | null,
  name: '',
  sort: 1,
  layout_type: 'type1', // 新增
  icon: '',             // 新增
});
const groupFormRef = ref<InstanceType<typeof ElForm>>();
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  layout_type: [{ required: true, message: '请选择布局类型', trigger: 'change' }],
  icon: [{ required: false, message: '请输入图标文件名', trigger: 'blur' }],
};
const groupSortChanged = ref(false);

// 分类/子分类响应式变量（直接用 store 的 getter）
const parents = computed(() => store.getParentsForFilter);
const children = computed(() => store.getAllChildCategories);

// 子分类筛选
const filteredChildCategoriesForSelect = computed(() => {
  if (!animeFilterForm.value.parentId) return children.value;
  return store.getChildrenByParentId(animeFilterForm.value.parentId);
});

// 统计每个分组下动漫数量
async function updateGroupAnimeCounts() {
  await Promise.all(store.recommendGroups.map(g => store.fetchAnimesForGroup(g.id)));
}

// onMounted 时拉取分组和分类数据
onMounted(async () => {
  await store.fetchRecommendGroups();
  await updateGroupAnimeCounts();
  store.fetchAllParentCategories();
  store.fetchAllChildCategories();
});

// 推荐分组相关操作
function searchGroups() {
  store.groupFilter.keyword = groupFilterForm.value.keyword
  store.fetchRecommendGroups();
}
function resetGroupFilters() {
  groupFilterForm.value.keyword = '';
  store.groupFilter.keyword = '';
  store.fetchRecommendGroups();
}
function openAddGroupDialog() {
  isEditGroup.value = false;
  const maxSort = store.recommendGroups && store.recommendGroups.length > 0
    ? Math.max(...store.recommendGroups.map(g => g.sort || 0))
    : 0;
  groupForm.value = {
    id: null,
    name: '',
    sort: maxSort + 1,
    layout_type: 'type1', // 新增
    icon: '',             // 新增
  };
  groupFormDialogVisible.value = true;
  nextTick(() => {
    groupFormRef.value?.clearValidate();
  });
}
function openEditGroupDialog(row: any) {
  isEditGroup.value = true;
  groupForm.value = {
    id: row.id,
    name: row.name,
    sort: row.sort,
    layout_type: row.layout_type || 'type1', // 新增
    icon: row.icon || '',                    // 新增
  };
  groupFormDialogVisible.value = true;
  nextTick(() => {
    groupFormRef.value?.clearValidate();
  });
}
async function submitGroupForm() {
  try {
    await groupFormRef.value?.validate();
    let response;
    if (isEditGroup.value) {
      response = await store.updateRecommendGroup(
        groupForm.value.id!,
        {
          name: groupForm.value.name,
          sort: groupForm.value.sort,
          layout_type: groupForm.value.layout_type,
          icon: groupForm.value.icon,
        }
      );
    } else {
      response = await store.addRecommendGroup({
        name: groupForm.value.name,
        sort: groupForm.value.sort,
        layout_type: groupForm.value.layout_type,
        icon: groupForm.value.icon,
      });
    }
    if (response) {
  ElMessage.success(isEditGroup.value ? '分组更新成功！' : '分组添加成功！');
  groupFormDialogVisible.value = false;
  await store.fetchRecommendGroups();
} else {
  ElMessage.error('操作失败，请重试！');
}
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试！');
      console.error('Group form submit error:', error);
    }
  }
}
async function deleteGroup(groupId: number) {
  try {
    await ElMessageBox.confirm('确定要删除该推荐分组吗？删除后，该分组下的所有动漫关联也会被移除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await store.deleteRecommendGroup(groupId);
if (response) {
  ElMessage.success('分组删除成功！');
  await store.fetchRecommendGroups();
} else {
  ElMessage.error('删除失败，请重试！');
}
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试！');
      console.error('Delete group error:', error);
    }
  }
}
let groupSortableInstance: Sortable | null = null;
function setupGroupSortable() {
  const el = document.querySelector('.recommend-group-table .el-table__body-wrapper tbody');
  if (el) {
    if (groupSortableInstance) {
      groupSortableInstance.destroy();
    }
    groupSortableInstance = Sortable.create(el as HTMLElement, {
      animation: 150,
      onEnd: ({ newIndex, oldIndex }) => {
        const currentGroups = [...store.recommendGroups];
        const movedItem = currentGroups.splice(oldIndex as number, 1)[0];
        currentGroups.splice(newIndex as number, 0, movedItem);

        store.recommendGroups = currentGroups.map((item, index) => ({
          ...item,
          sort: index + 1
        }));
        groupSortChanged.value = true;
      },
    });
  } else if (groupSortableInstance) {
    groupSortableInstance.destroy();
    groupSortableInstance = null;
  }
}
function markGroupSortChanged() {
  groupSortChanged.value = true;
}
async function saveGroupSort() {
  const sortedData = store.recommendGroups.map(item => ({
    id: item.id,
    sort: item.sort
  }));
  const success = await store.saveGroupSort(sortedData);
  if (success) {
    groupSortChanged.value = false;
  }
}
watch(() => store.recommendGroups, () => {
  updateGroupAnimeCounts();
});

// 动漫管理相关
const animeDialogVisible = ref(false);
const currentRecommendGroupId = ref<number | null>(null);
const currentGroupName = ref('');
const allAnimeList = ref<any[]>([]);
const selectedAnimeList = ref<any[]>([]);
const selectedAllAnimes = ref<any[]>([]);
const animeLoading = ref(false);
const allAnimeTableRef = ref<InstanceType<typeof ElTable>>();
const animeFilterForm = ref({
  keyword: '',
  parentId: '',
  categoryId: '',
});
const animePagination = ref({ currentPage: 1, pageSize: 10, total: 0 });
const animeList = ref<any[]>([]);

async function getAnimeList() {
  const res = await store.fetchAllAnimes({
    currentPage: animePagination.value.currentPage,
    pageSize: animePagination.value.pageSize,
  });
  animeList.value = res.list;
  animePagination.value.total = res.total;
}

let selectedAnimeSortableInstance: Sortable | null = null;
const selectedAnimeListRef = ref<HTMLElement | null>(null);

async function openAnimeManageDialog(row: any) {
  currentRecommendGroupId.value = row.id;
  currentGroupName.value = row.name;
  animeDialogVisible.value = true;
  animeLoading.value = true;
  allAnimeList.value = [];
  selectedAnimeList.value = [];
  try {
    // 关键：先刷新所有分组下的动漫
    await Promise.all(store.recommendGroups.map(g => store.fetchAnimesForGroup(g.id)));
    const existingAnimes = await store.fetchAnimesForGroup(row.id);
    selectedAnimeList.value = existingAnimes.map((anime: any) => ({
      recommend_id: anime.recommend_id,
      video_id: anime.video_id,
      title: anime.title,
      cover_url: anime.cover_url,
      sort: anime.sort,
    }));
    selectedAnimeList.value.forEach((item, index) => {
      item.sort = index + 1;
    });
    await searchAnimes();
  } catch (error) {
    ElMessage.error('加载动漫失败，请重试！');
    console.error('Failed to load animes for group:', error);
  } finally {
    animeLoading.value = false;
    nextTick(() => {
      setupSelectedAnimeSortable();
    });
  }
}
function closeAnimeManageDialog() {
  animeDialogVisible.value = false;
  currentRecommendGroupId.value = null;
  currentGroupName.value = '';
  allAnimeList.value = [];
  selectedAnimeList.value = [];
  selectedAllAnimes.value = [];
  animeFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  animePagination.value = { currentPage: 1, pageSize: 10, total: 0 };
  if (selectedAnimeSortableInstance) {
    selectedAnimeSortableInstance.destroy();
    selectedAnimeSortableInstance = null;
  }
}
function layoutTypeText(type: string) {
  const map: Record<string, string> = {
    type1: '横滑卡片',
    type2: '三宫格',
    type3: '两宫格',
    type4: '九宫格',
    list: '列表',
    type5: '不限制',
    videocard: '横图视频卡'
  }
  return map[type] || type || '-';
}
function onIconImgError(e: Event) {
  const target = e.target as HTMLImageElement | null;
  if (target) target.style.display = 'none';
}

async function searchAnimes(resetPage = false) {
  if (resetPage) animePagination.value.currentPage = 1;
  animeLoading.value = true;
  try {
    // 1. 拉取所有分组下已用的动漫ID（除了当前分组）
    const allGroups = store.recommendGroups;
    const usedAnimeIds = new Set<number>();
    for (const group of allGroups) {
      if (group.id == currentRecommendGroupId.value) continue;
      const animes = await store.fetchAnimesForGroup(group.id);
      animes.forEach((v: any) => usedAnimeIds.add(Number(v.video_id)));
    }

    // 2. 拉取所有可选动漫（分页接口，返回当前页数据和总数）
    const res = await store.fetchAllAnimes({
      keyword: animeFilterForm.value.keyword,
      parentId: animeFilterForm.value.parentId,
      categoryId: animeFilterForm.value.categoryId,
      currentPage: animePagination.value.currentPage,
      pageSize: animePagination.value.pageSize,
    });

    // 3. 当前页数据过滤掉已被其他分组选中的
    allAnimeList.value = res.list.filter((v: any) => !usedAnimeIds.has(Number(v.id)));
    animePagination.value.total = res.total; // 用接口返回的总数
    if (allAnimeTableRef.value) {
      allAnimeTableRef.value.clearSelection();
    }
  } catch (error) {
    ElMessage.error('搜索动漫失败！');
    console.error('Search all animes error:', error);
  } finally {
    animeLoading.value = false;
  }
}
function handleAnimeCurrentChange(page: number) {
  animePagination.value.currentPage = page;
  searchAnimes();
}
function handleAnimeSizeChange(size: number) {
  animePagination.value.pageSize = size;
  animePagination.value.currentPage = 1;
  searchAnimes();
}
function resetAnimeFilters() {
  animeFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  searchAnimes(true);
}
function onAnimeParentCategoryChange() {
  animeFilterForm.value.categoryId = '';
  searchAnimes(true);
}
function handleAllAnimeSelectionChange(selection: any[]) {
  selectedAllAnimes.value = selection;
}
function addAnimeToSelected(animes: any[]) {
  animes.forEach(anime => {
    if (!selectedAnimeList.value.some(item => item.video_id === anime.id)) {
      selectedAnimeList.value.push({
        recommend_id: currentRecommendGroupId.value!,
        video_id: anime.id,
        title: anime.title,
        cover_url: anime.cover_url || '',
        sort: 0,
      });
    }
  });
  selectedAnimeList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  if (allAnimeTableRef.value) {
    allAnimeTableRef.value.clearSelection();
  }
  nextTick(() => {
    setupSelectedAnimeSortable();
  });
}
function removeAnimeFromSelected(animeId: number) {
  selectedAnimeList.value = selectedAnimeList.value.filter(item => item.video_id !== animeId);
  selectedAnimeList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  nextTick(() => {
    setupSelectedAnimeSortable();
  });
}
function setupSelectedAnimeSortable() {
  const el = selectedAnimeListRef.value;
  if (el) {
    if (selectedAnimeSortableInstance) {
      selectedAnimeSortableInstance.destroy();
    }
    selectedAnimeSortableInstance = Sortable.create(el as HTMLElement, {
      animation: 150,
      handle: '.el-icon',
      onEnd: ({ newIndex, oldIndex }) => {
        const movedItem = selectedAnimeList.value.splice(oldIndex as number, 1)[0];
        selectedAnimeList.value.splice(newIndex as number, 0, movedItem);
        selectedAnimeList.value.forEach((item, index) => {
          item.sort = index + 1;
        });
      },
    });
  } else if (selectedAnimeSortableInstance) {
    selectedAnimeSortableInstance.destroy();
    selectedAnimeSortableInstance = null;
  }
}
async function saveAnimeRecommendations() {
  if (currentRecommendGroupId.value === null) {
    ElMessage.error('缺少推荐分组ID，无法保存动漫。');
    return;
  }
  const payload = selectedAnimeList.value.map(anime => ({
    recommend_id: currentRecommendGroupId.value!,
    video_id: anime.video_id,
    sort: anime.sort,
  }));
  try {
    const success = await store.saveAnimesForGroup(currentRecommendGroupId.value, payload);
    if (success) {
      ElMessage.success('动漫推荐保存成功！');
      // 保存后刷新所有分组下动漫
      await Promise.all(store.recommendGroups.map(g => store.fetchAnimesForGroup(g.id)));
      await searchAnimes();
      closeAnimeManageDialog();
    }
  } catch (error) {
    ElMessage.error('保存动漫推荐失败，请重试！');
    console.error('Save anime recommendations error:', error);
  }
}
watch(animeDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupSelectedAnimeSortable();
    });
  }
});

// 计算属性，用于过滤掉已选的动漫
const filteredAllAnimeList = computed(() => {
  const selectedIds = new Set(selectedAnimeList.value.map(v => v.video_id));
  return allAnimeList.value.filter(v => !selectedIds.has(v.id));
});
</script>

<style scoped>
.recommend-manage-wrapper {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px);
}

.filter-container,
.group-management-section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 0;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.recommend-group-table {
  width: 100%;
}

.table-footer {
  margin-top: 20px;
  text-align: right;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.anime-manage-content {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  min-height: 500px;
}

.left-panel, .right-panel {
  flex: 1;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 15px;
  background-color: #fdfdfd;
  display: flex;
  flex-direction: column;
}

.left-panel h3, .right-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: none;
  padding-bottom: 0;
}

.anime-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.anime-filter-container .el-form-item {
  margin-bottom: 0;
}

.anime-table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.selected-anime-list {
  flex-grow: 1;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  min-height: 350px;
}

.selected-anime-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 5px;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  cursor: grab;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.selected-anime-item:hover {
  background-color: #e0f2ff;
}

.selected-anime-item .el-icon {
  margin-right: 8px;
  cursor: grab;
  color: #409eff;
}

.selected-anime-item span {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-anime-item .el-button {
  margin-left: auto;
}

.no-animes-placeholder {
  text-align: center;
  color: #999;
  padding: 50px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>