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
      <el-table :data="store.recommendGroups || []" v-loading="store.loading" row-key="id" class="recommend-group-table">
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column prop="name" label="分组名"></el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <div class="sort-controls">
              <el-input-number v-model="row.sort" :min="1" size="small" controls-position="right" @change="markGroupSortChanged"></el-input-number>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="有声小说数" width="100">
          <template #default="{ row }">
            {{ row.novel_count || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default>
            <el-tag type="success">有声</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditGroupDialog(row)">编辑分组</el-button>
            <el-button type="danger" size="small" @click="deleteGroup(row.id)">删除分组</el-button>
            <el-button type="success" size="small" @click="openNovelManageDialog(row)">管理有声小说</el-button>
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
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="groupForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <input type="hidden" v-model="groupForm.type" value="audio" />
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroupForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="novelDialogVisible"
      :title="`管理分组“${currentGroupName}”的有声小说`"
      width="70%"
      top="5vh"
      destroy-on-close
      @close="closeNovelManageDialog"
    >
      <div class="novel-manage-content">
        <div class="left-panel">
          <h3>所有有声小说列表</h3>
          <div class="novel-filter-container">
            <el-form :inline="true" :model="novelFilterForm" class="filter-form">
              <el-form-item label="关键词">
                <el-input v-model="novelFilterForm.keyword" placeholder="搜索小说标题/ID" clearable @keyup.enter="searchNovels"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchNovels">搜索</el-button>
                <el-button @click="resetNovelFilters">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="filteredAllNovelList"
            v-loading="novelLoading"
            height="350px"
            ref="allNovelTableRef"
            @selection-change="handleAllNovelSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="小说标题"></el-table-column>
            <el-table-column prop="author" label="作者" width="120"></el-table-column>
            <el-table-column prop="narrator" label="演播人" width="120"></el-table-column>
            <el-table-column prop="category_name" label="分类" width="100"></el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="addNovelToSelected([row])">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="novel-table-footer">
            <el-pagination
              @size-change="handleNovelSizeChange"
              @current-change="handleNovelCurrentChange"
              :current-page="novelPagination.currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="novelPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="novelPagination.total"
              background
            ></el-pagination>
            <el-button type="success" :disabled="selectedAllNovels.length === 0" @click="addNovelToSelected(selectedAllNovels)">批量添加</el-button>
          </div>
        </div>

        <div class="right-panel">
          <h3>已选有声小说 (拖拽排序)</h3>
          <div class="selected-novel-list" ref="selectedNovelListRef">
            <div v-if="selectedNovelList.length === 0" class="no-novels-placeholder">
              暂无已选有声小说，请从左侧添加
            </div>
            <div
              v-for="(novel, index) in selectedNovelList"
              :key="novel.audio_novel_id || index"
              class="selected-novel-item"
            >
              <el-icon><Rank /></el-icon>
              <span>{{ index + 1 }}. {{ novel.title || '未知标题' }}</span>
              <el-button link type="danger" size="small" @click="removeNovelFromSelected(novel.audio_novel_id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeNovelManageDialog">取消</el-button>
          <el-button type="primary" @click="saveNovelRecommendations">保存</el-button>
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
import { useAudioRecommendStore } from '@/store/audio-recommend.store';
import { debounce } from 'lodash';

const store = useAudioRecommendStore();

const groupFilterForm = ref({ keyword: '' });
const groupFormDialogVisible = ref(false);
const isEditGroup = ref(false);
const groupForm = ref({
  id: null as number | null,
  name: '',
  sort: 1,
  status: 1,
  type: 'audio' // 固定为有声类型
});
const groupFormRef = ref<InstanceType<typeof ElForm>>();
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
};
const groupSortChanged = ref(false);

async function updateGroupAudioNovelCounts() {
  await Promise.all(store.recommendGroups.map(g => store.fetchAudioNovelsForGroup(g.id)));
}

onMounted(async () => {
  await store.fetchRecommendGroups();
  await updateGroupAudioNovelCounts();
  store.fetchAllAudioCategories();
  nextTick(() => {
    setupGroupSortable();
  });
});

function searchGroups() {
  store.setGroupFilter({ keyword: groupFilterForm.value.keyword });
  store.fetchRecommendGroups();
}

function resetGroupFilters() {
  groupFilterForm.value.keyword = '';
  store.setGroupFilter({ keyword: '' });
  store.fetchRecommendGroups();
}

function openAddGroupDialog() {
  isEditGroup.value = false;
  const maxSort = store.recommendGroups && store.recommendGroups.length > 0
    ? Math.max(...store.recommendGroups.map(g => g.sort || 0))
    : 0;
  groupForm.value = { id: null, name: '', sort: maxSort + 1, status: 1, type: 'audio' };
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
    status: row.status, 
    type: 'audio' // 固定为有声类型
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
          status: groupForm.value.status,
          type: groupForm.value.type
        }
      );
    } else {
      response = await store.addRecommendGroup({
        name: groupForm.value.name,
        sort: groupForm.value.sort,
        status: groupForm.value.status,
        type: groupForm.value.type
      });
    }
    if (response && response.code === 0) {
      ElMessage.success(response.msg || (isEditGroup.value ? '分组更新成功！' : '分组添加成功！'));
      groupFormDialogVisible.value = false;
      await store.fetchRecommendGroups();
      await updateGroupAudioNovelCounts();
    } else {
      ElMessage.error(response?.msg || '操作失败，请重试！');
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
    await ElMessageBox.confirm('确定要删除该推荐分组吗？删除后，该分组下的所有有声小说关联也会被移除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await store.deleteRecommendGroup(groupId);
    if (response && response.code === 0) {
      ElMessage.success(response.msg || '分组删除成功！');
      await store.fetchRecommendGroups();
      await updateGroupAudioNovelCounts();
    } else {
      ElMessage.error(response?.msg || '删除失败，请重试！');
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

const novelDialogVisible = ref(false);
const currentRecommendGroupId = ref<number | null>(null);
const currentGroupName = ref('');
const allNovelList = ref<any[]>([]);
const selectedNovelList = ref<any[]>([]);
const selectedAllNovels = ref<any[]>([]);
const novelLoading = ref(false);
const allNovelTableRef = ref<InstanceType<typeof ElTable>>();
const novelFilterForm = ref({ keyword: '' });
const novelPagination = ref({ currentPage: 1, pageSize: 10, total: 0 });

async function getAudioNovelList() {
  const res = await store.fetchAllAudioNovels({
    currentPage: novelPagination.value.currentPage,
    pageSize: novelPagination.value.pageSize,
  });
  allNovelList.value = res.list;
  novelPagination.value.total = res.total;
}

let selectedNovelSortableInstance: Sortable | null = null;
const selectedNovelListRef = ref<HTMLElement | null>(null);

async function openNovelManageDialog(row: any) {
  currentRecommendGroupId.value = row.id;
  currentGroupName.value = row.name;

  const audioNovels = await store.fetchAudioNovelsForGroup(row.id);
  // 只保留有 title 的项
  selectedNovelList.value = (audioNovels || []).filter(novel => novel.title);

  await searchNovels();
  novelDialogVisible.value = true;
  await nextTick();
  setupSelectedNovelSortable();
}

function closeNovelManageDialog() {
  novelDialogVisible.value = false;

  setTimeout(() => {
    currentRecommendGroupId.value = null;
    currentGroupName.value = '';
    allNovelList.value = [];
    selectedNovelList.value = [];
    selectedAllNovels.value = [];
    novelFilterForm.value = { keyword: '' };
    novelPagination.value = { currentPage: 1, pageSize: 10, total: 0 };

    if (selectedNovelSortableInstance) {
      selectedNovelSortableInstance.destroy();
      selectedNovelSortableInstance = null;
    }
  }, 300);
}

async function searchNovels(resetPage = false) {
  if (resetPage) novelPagination.value.currentPage = 1;
  novelLoading.value = true;
  try {
    // 1. 拉取所有分组下已用的有声小说ID（除了当前分组）
    const allGroups = store.recommendGroups;
    const usedAudioNovelIds = new Set<number>();
    for (const group of allGroups) {
      if (group.id == currentRecommendGroupId.value) continue;
      const novels = await store.fetchAudioNovelsForGroup(group.id);
      novels.forEach((n: any) => usedAudioNovelIds.add(Number(n.audio_novel_id)));
    }

    // 2. 拉取所有可选有声小说
    const params = {
      keyword: novelFilterForm.value.keyword,
      currentPage: novelPagination.value.currentPage,
      pageSize: novelPagination.value.pageSize,
    };
    const res = await store.fetchAllAudioNovels(params);

    // 3. 当前页数据过滤掉已被其他分组选中的
    allNovelList.value = res.list.filter((n: any) => !usedAudioNovelIds.has(Number(n.audio_novel_id)));
    novelPagination.value.total = res.total;
  } catch (error) {
    ElMessage.error('加载有声小说列表失败，请重试！');
    console.error(error);
  } finally {
    novelLoading.value = false;
  }
}

function handleNovelCurrentChange(page: number) {
  novelPagination.value.currentPage = page;
  searchNovels();
}

function handleNovelSizeChange(size: number) {
  novelPagination.value.pageSize = size;
  novelPagination.value.currentPage = 1;
  searchNovels();
}

function resetNovelFilters() {
  novelFilterForm.value = { keyword: '' };
  searchNovels(true);
}

function handleAllNovelSelectionChange(selection: any[]) {
  selectedAllNovels.value = selection;
}

function addNovelToSelected(novels: any[]) {
  novels.forEach(novel => {
    if (!selectedNovelList.value.some(item => item.audio_novel_id === novel.audio_novel_id)) {
      selectedNovelList.value.push({
        audio_novel_id: novel.audio_novel_id,
        title: novel.title,
        cover_url: novel.cover_url,
        sort: selectedNovelList.value.length + 1,
      });
    }
  });

  selectedNovelList.value.forEach((item, index) => {
    item.sort = index + 1;
  });

  if (allNovelTableRef.value) {
    allNovelTableRef.value.clearSelection();
  }

  nextTick(() => {
    setupSelectedNovelSortable();
  });

  searchNovels(true);
}

function removeNovelFromSelected(audioNovelId: number) {
  selectedNovelList.value = selectedNovelList.value.filter(item => item.audio_novel_id !== audioNovelId);
  selectedNovelList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  nextTick(() => {
    setupSelectedNovelSortable();
  });
}

function setupSelectedNovelSortable() {
  const el = selectedNovelListRef.value;
  if (el) {
    if (selectedNovelSortableInstance) {
      selectedNovelSortableInstance.destroy();
    }
    selectedNovelSortableInstance = Sortable.create(el as HTMLElement, {
      animation: 150,
      handle: '.el-icon',
      onEnd: ({ newIndex, oldIndex }) => {
        const movedItem = selectedNovelList.value.splice(oldIndex as number, 1)[0];
        selectedNovelList.value.splice(newIndex as number, 0, movedItem);
        selectedNovelList.value.forEach((item, index) => {
          item.sort = index + 1;
        });
      },
    });
  } else if (selectedNovelSortableInstance) {
    selectedNovelSortableInstance.destroy();
    selectedNovelSortableInstance = null;
  }
}

async function saveNovelRecommendations() {
  if (!currentRecommendGroupId.value) {
    ElMessage.error('缺少分组ID，无法保存有声小说！');
    return;
  }

  const payload = selectedNovelList.value.map(item => ({
    audio_novel_id: item.audio_novel_id,
    sort: item.sort,
  }));

  try {
    const success = await store.saveAudioNovelsForGroup(currentRecommendGroupId.value, payload);
    if (success) {
      ElMessage.success('保存成功！');
      closeNovelManageDialog();

      await store.fetchRecommendGroups();
      await Promise.all(store.recommendGroups.map(g => store.fetchAudioNovelsForGroupAndSave(g.id)));
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试！');
    console.error(error);
  }
}

watch(novelDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupSelectedNovelSortable();
    });
  }
});

const filteredAllNovelList = computed(() => {
  const selectedIds = new Set(selectedNovelList.value.map(n => n.audio_novel_id));
  return allNovelList.value.filter(n => !selectedIds.has(n.audio_novel_id));
});

const debouncedSearchNovels = debounce(searchNovels, 300);

watch(
  () => novelFilterForm.value.keyword,
  () => {
    debouncedSearchNovels();
  }
);
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

.novel-manage-content {
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

.novel-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.novel-filter-container .el-form-item {
  margin-bottom: 0;
}

.novel-table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.selected-novel-list {
  flex-grow: 1;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  min-height: 350px;
}

.selected-novel-item {
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

.selected-novel-item:hover {
  background-color: #e0f2ff;
}

.selected-novel-item .el-icon {
  margin-right: 8px;
  cursor: grab;
  color: #409eff;
}

.selected-novel-item span {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-novel-item .el-button {
  margin-left: auto;
}

.no-novels-placeholder {
  text-align: center;
  color: #999;
  padding: 50px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>