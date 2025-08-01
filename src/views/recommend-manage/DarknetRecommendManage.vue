<!-- src/views/recommend/DarknetRecommendManage.vue -->
<template>
  <div class="recommend-manage-wrapper">
    <!-- Group Management Section -->
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
        <el-table-column label="视频数" width="80">
          <template #default="{ row }">
            {{ store.groupVideoCounts[row.id] || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditGroupDialog(row)">编辑分组名</el-button>
            <el-button type="danger" size="small" @click="deleteGroup(row.id)">删除分组</el-button>
            <el-button type="success" size="small" @click="openVideoManageDialog(row)">管理视频</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-button type="primary" :disabled="!groupSortChanged" @click="saveGroupSort">保存分组排序</el-button>
      </div>
    </div>

    <!-- Group Form Dialog -->
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroupForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Video Management Dialog -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="`管理分组“${currentGroupName}”的视频`"
      width="70%"
      top="5vh"
      destroy-on-close
      @close="closeVideoManageDialog"
    >
      <div class="video-manage-content">
        <div class="left-panel">
          <h3>所有视频列表</h3>
          <div class="video-filter-container">
            <el-form :inline="true" :model="videoFilterForm" class="filter-form">
              <el-form-item label="关键词">
                <el-input v-model="videoFilterForm.keyword" placeholder="搜索视频标题/ID" clearable @keyup.enter="searchVideos"></el-input>
              </el-form-item>
              <el-form-item label="主分类">
                <el-select v-model="videoFilterForm.parentId" placeholder="全部主分类" clearable @change="onVideoParentCategoryChange">
                  <el-option label="全部主分类" value=""></el-option>
                  <el-option v-for="parent in parents" :key="parent.id" :label="parent.name" :value="parent.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子分类">
                <el-select v-model="videoFilterForm.categoryId" placeholder="全部子分类" clearable>
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
                <el-button type="primary" @click="searchVideos">搜索</el-button>
                <el-button @click="resetVideoFilters">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="filteredAllVideoList"
            v-loading="videoLoading"
            height="350px"
            ref="allVideoTableRef"
            @selection-change="handleAllVideoSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="视频标题"></el-table-column>
            <el-table-column prop="parent_category_name" label="主分类" width="100"></el-table-column>
            <el-table-column prop="child_category_name" label="子分类" width="100"></el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="addVideoToSelected([row])">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="video-table-footer">
            <el-pagination
              @size-change="handleVideoSizeChange"
              @current-change="handleVideoCurrentChange"
              :current-page="videoPagination.currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="videoPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="videoPagination.total"
              background
            ></el-pagination>
            <el-button type="success" :disabled="selectedAllVideos.length === 0" @click="addVideoToSelected(selectedAllVideos)">批量添加</el-button>
          </div>
        </div>

        <div class="right-panel">
          <h3>已选视频 (拖拽排序)</h3>
          <div class="selected-video-list" ref="selectedVideoListRef">
            <div v-if="selectedVideoList.length === 0" class="no-videos-placeholder">
              暂无已选视频，请从左侧添加
            </div>
            <div
              v-for="(video, index) in selectedVideoList"
              :key="video.video_id"
              class="selected-video-item"
            >
              <el-icon><Rank /></el-icon>
              <span>{{ index + 1 }}. {{ video.title }}</span>
              <el-button link type="danger" size="small" @click="removeVideoFromSelected(video.video_id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeVideoManageDialog">取消</el-button>
          <el-button type="primary" @click="saveVideoRecommendations">保存</el-button>
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
import { useDarknetRecommendStore } from "@/store/modules/darknetRecommend.store";

const store = useDarknetRecommendStore();

// Group management
const groupFilterForm = ref({ keyword: '' });
const groupFormDialogVisible = ref(false);
const isEditGroup = ref(false);
const groupForm = ref({ id: null as number | null, name: '', sort: 1 });
const groupFormRef = ref<InstanceType<typeof ElForm>>();
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
};
const groupSortChanged = ref(false);

// Categories
const parents = computed(() => store.getParentsForFilter);
const children = computed(() => store.getAllChildCategories);

// Filtered child categories for select
const filteredChildCategoriesForSelect = computed(() => {
  if (!videoFilterForm.value.parentId) return children.value;
  return store.getChildrenByParentId(videoFilterForm.value.parentId);
});

// Update group video counts
async function updateGroupVideoCounts() {
  await Promise.all(store.recommendGroups.map(g => store.fetchVideosForGroup(g.id)));
}

onMounted(async () => {
  await store.fetchRecommendGroups();
  await updateGroupVideoCounts();
  store.fetchAllParentCategories();
  store.fetchAllChildCategories();
});

// Group operations
function searchGroups() {
  store.groupFilter.keyword = groupFilterForm.value.keyword;
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
  groupForm.value = { id: null, name: '', sort: maxSort + 1 };
  groupFormDialogVisible.value = true;
  nextTick(() => {
    groupFormRef.value?.clearValidate();
  });
}

function openEditGroupDialog(row: any) {
  isEditGroup.value = true;
  groupForm.value = { id: row.id, name: row.name, sort: row.sort };
  groupFormDialogVisible.value = true;
  nextTick(() => {
    groupFormRef.value?.clearValidate();
  });
}

async function submitGroupForm() {
  try {
    await groupFormRef.value?.validate();
    if (isEditGroup.value) {
      await store.updateRecommendGroup(groupForm.value.id!, { 
        name: groupForm.value.name, 
        sort: groupForm.value.sort 
      });
    } else {
      await store.addRecommendGroup({ 
        name: groupForm.value.name, 
        sort: groupForm.value.sort 
      });
    }
    groupFormDialogVisible.value = false;
    await store.fetchRecommendGroups();
  } catch (error) {
    console.error('Group form submit error:', error);
  }
}

async function deleteGroup(groupId: number) {
  try {
    await ElMessageBox.confirm('确定要删除该推荐分组吗？删除后，该分组下的所有视频关联也会被移除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await store.deleteRecommendGroup(groupId);
    await store.fetchRecommendGroups();
  } catch (error) {
    if (error !== 'cancel') {
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
  updateGroupVideoCounts();
});

// Video management
const videoDialogVisible = ref(false);
const currentRecommendGroupId = ref<number | null>(null);
const currentGroupName = ref('');
const allVideoList = ref<any[]>([]);
const selectedVideoList = ref<any[]>([]);
const selectedAllVideos = ref<any[]>([]);
const videoLoading = ref(false);
const allVideoTableRef = ref<InstanceType<typeof ElTable>>();
const videoFilterForm = ref({
  keyword: '',
  parentId: '',
  categoryId: '',
});
const videoPagination = ref({ currentPage: 1, pageSize: 10, total: 0 });

let selectedVideoSortableInstance: Sortable | null = null;
const selectedVideoListRef = ref<HTMLElement | null>(null);

const usedVideoIds = ref<Set<number>>(new Set());

async function openVideoManageDialog(row: any) {
  currentRecommendGroupId.value = row.id;
  currentGroupName.value = row.name;
  videoDialogVisible.value = true;
  videoLoading.value = true;
  allVideoList.value = [];
  selectedVideoList.value = [];
  usedVideoIds.value = new Set();

  try {
    // 拉取所有分组下的视频
    await Promise.all(store.recommendGroups.map(g => store.fetchVideosForGroup(g.id)));
    // 统计所有分组下已用的视频ID（除了当前分组）
    for (const group of store.recommendGroups) {
      if (group.id == row.id) continue;
      const videos = await store.fetchVideosForGroup(group.id);
      videos.forEach((v: any) => usedVideoIds.value.add(Number(v.video_id)));
    }
    // 当前分组已选
    const existingVideos = await store.fetchVideosForGroup(row.id);
    selectedVideoList.value = existingVideos.map((video: any) => ({
      recommend_id: video.recommend_id,
      video_id: video.video_id,
      title: video.title,
      cover: video.cover,
      sort: video.sort,
    }));
    selectedVideoList.value.forEach((item, index) => {
      item.sort = index + 1;
    });
    await searchVideos();
  } catch (error) {
    ElMessage.error('加载视频失败，请重试！');
    console.error('Failed to load videos for group:', error);
  } finally {
    videoLoading.value = false;
    nextTick(() => {
      setupSelectedVideoSortable();
    });
  }
}

function closeVideoManageDialog() {
  videoDialogVisible.value = false;
  currentRecommendGroupId.value = null;
  currentGroupName.value = '';
  allVideoList.value = [];
  selectedVideoList.value = [];
  selectedAllVideos.value = [];
  videoFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  videoPagination.value = { currentPage: 1, pageSize: 10, total: 0 };
  
  if (selectedVideoSortableInstance) {
    selectedVideoSortableInstance.destroy();
    selectedVideoSortableInstance = null;
  }
}

async function searchVideos(resetPage = false) {
  if (resetPage) videoPagination.value.currentPage = 1;
  videoLoading.value = true;
  try {
    // 1. 拉取所有分组下已用的视频ID（除了当前分组）
    const allGroups = store.recommendGroups;
    const usedVideoIds = new Set<number>();
    for (const group of allGroups) {
      if (group.id == currentRecommendGroupId.value) continue;
      const videos = await store.fetchVideosForGroup(group.id);
      // 打印每个分组下的视频
      console.log('分组', group.id, '下已选视频', videos);
      videos.forEach((v: any) => usedVideoIds.add(Number(v.video_id)));
    }
    // 打印所有已被其他分组选中的ID
    console.log('所有已被其他分组选中的ID:', Array.from(usedVideoIds));

    // 2. 拉取所有可选视频
    const res = await store.fetchAllVideos({
      keyword: videoFilterForm.value.keyword,
      parentId: videoFilterForm.value.parentId,
      categoryId: videoFilterForm.value.categoryId,
      currentPage: videoPagination.value.currentPage,
      pageSize: videoPagination.value.pageSize,
    });
    // 打印所有可选视频
    console.log('接口返回所有可选视频:', res.list);

    // 3. 当前页数据过滤掉已被其他分组选中的
    allVideoList.value = res.list.filter((v: any) => !usedVideoIds.has(Number(v.id)));
    // 打印过滤后的可选视频
    console.log('过滤后可选视频:', allVideoList.value);

    videoPagination.value.total = res.total;
    if (allVideoTableRef.value) {
      allVideoTableRef.value.clearSelection();
    }
  } catch (error) {
    ElMessage.error('搜索视频失败！');
    console.error('Search all videos error:', error);
  } finally {
    videoLoading.value = false;
  }
}

function handleVideoCurrentChange(page: number) {
  videoPagination.value.currentPage = page;
  searchVideos();
}

function handleVideoSizeChange(size: number) {
  videoPagination.value.pageSize = size;
  videoPagination.value.currentPage = 1;
  searchVideos();
}

function resetVideoFilters() {
  videoFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  searchVideos(true);
}

function onVideoParentCategoryChange() {
  videoFilterForm.value.categoryId = '';
  searchVideos(true);
}

function handleAllVideoSelectionChange(selection: any[]) {
  selectedAllVideos.value = selection;
}

function addVideoToSelected(videos: any[]) {
  videos.forEach(video => {
    if (!selectedVideoList.value.some(item => item.video_id === video.id)) {
      selectedVideoList.value.push({
        recommend_id: currentRecommendGroupId.value!,
        video_id: video.id,
        title: video.title,
        cover: video.cover || '',
        sort: 0,
      });
    }
  });
  
  selectedVideoList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  
  if (allVideoTableRef.value) {
    allVideoTableRef.value.clearSelection();
  }
  
  nextTick(() => {
    setupSelectedVideoSortable();
  });
}

function removeVideoFromSelected(videoId: number) {
  selectedVideoList.value = selectedVideoList.value.filter(item => item.video_id !== videoId);
  selectedVideoList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  
  nextTick(() => {
    setupSelectedVideoSortable();
  });
}

function setupSelectedVideoSortable() {
  const el = selectedVideoListRef.value;
  if (el) {
    if (selectedVideoSortableInstance) {
      selectedVideoSortableInstance.destroy();
    }
    selectedVideoSortableInstance = Sortable.create(el as HTMLElement, {
      animation: 150,
      handle: '.el-icon',
      onEnd: ({ newIndex, oldIndex }) => {
        const movedItem = selectedVideoList.value.splice(oldIndex as number, 1)[0];
        selectedVideoList.value.splice(newIndex as number, 0, movedItem);
        selectedVideoList.value.forEach((item, index) => {
          item.sort = index + 1;
        });
      },
    });
  } else if (selectedVideoSortableInstance) {
    selectedVideoSortableInstance.destroy();
    selectedVideoSortableInstance = null;
  }
}

async function saveVideoRecommendations() {
  if (currentRecommendGroupId.value === null) {
    ElMessage.error('缺少推荐分组ID，无法保存视频。');
    return;
  }
  
  const payload = selectedVideoList.value.map(video => ({
    recommend_id: currentRecommendGroupId.value!,
    video_id: video.video_id,
    sort: video.sort,
  }));
  
  try {
    const success = await store.saveVideosForGroup(currentRecommendGroupId.value, payload);
    if (success) {
      ElMessage.success('视频推荐保存成功！');
      await Promise.all(store.recommendGroups.map(g => store.fetchVideosForGroup(g.id)));
      await searchVideos();
      closeVideoManageDialog();
    }
  } catch (error) {
    ElMessage.error('保存视频推荐失败，请重试！');
    console.error('Save video recommendations error:', error);
  }
}

watch(videoDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupSelectedVideoSortable();
    });
  }
});

// Filter out already selected videos
const filteredAllVideoList = computed(() => {
  const selectedIds = new Set(selectedVideoList.value.map(v => v.video_id));
  return allVideoList.value.filter(v => !selectedIds.has(v.id));
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

/* Video Management Dialog Styles */
.video-manage-content {
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

.video-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.video-filter-container .el-form-item {
  margin-bottom: 0;
}

.video-table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.selected-video-list {
  flex-grow: 1;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  min-height: 350px;
}

.selected-video-item {
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

.selected-video-item:hover {
  background-color: #e0f2ff;
}

.selected-video-item .el-icon {
  margin-right: 8px;
  cursor: grab;
  color: #409eff;
}

.selected-video-item span {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-video-item .el-button {
  margin-left: auto;
}

.no-videos-placeholder {
  text-align: center;
  color: #999;
  padding: 50px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>