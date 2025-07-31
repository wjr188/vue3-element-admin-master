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
        <el-table-column label="视频数" width="80">
          <template #default="{ row }">
            {{ row.videos ? row.videos.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="120">
          <template #default="{ row }">
            <span v-if="row.icon">{{ row.icon }}</span>
            <span v-else>--</span>
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
        <el-form-item label="图标" prop="icon">
          <el-input v-model="groupForm.icon" placeholder="如 star.svg"></el-input>
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
            <el-table-column prop="main_category_name" label="主分类" width="100"></el-table-column>
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
import { useRecommendCategoryStore } from '@/store/modules/recommend-category.store';
const store = useRecommendCategoryStore();

// 推荐分组管理相关
const groupFilterForm = ref({ keyword: '' });
const groupFormDialogVisible = ref(false);
const isEditGroup = ref(false);
const groupForm = ref({ id: null as number | null, name: '', icon: '', sort: 1 });
const groupFormRef = ref<InstanceType<typeof ElForm>>();
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
};
const groupSortChanged = ref(false);

// 分类/子分类响应式变量（直接用 store 的 getter）
const parents = computed(() => store.getParentsForFilter);
const children = computed(() => store.getAllChildCategories);

// 子分类筛选
const filteredChildCategoriesForSelect = computed(() => {
  if (!videoFilterForm.value.parentId) return children.value;
  return store.getChildrenByParentId(videoFilterForm.value.parentId);
});

// onMounted 时拉取分组和分类数据
onMounted(async () => {
  await store.fetchRecommendGroups();
  store.fetchAllParentCategories();
  store.fetchAllChildCategories();
});

// 推荐分组相关操作
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
  groupForm.value = { id: null, name: '', icon: '', sort: maxSort + 1 }; // 补上 icon
  groupFormDialogVisible.value = true;
  nextTick(() => {
    groupFormRef.value?.clearValidate();
  });
}
function openEditGroupDialog(row: any) {
  isEditGroup.value = true;
  groupForm.value = { id: row.id, name: row.name, icon: row.icon || '', sort: row.sort };
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
          icon: groupForm.value.icon, // 新增
          sort: groupForm.value.sort
        }
      );
    } else {
      response = await store.addRecommendGroup({
        name: groupForm.value.name,
        icon: groupForm.value.icon, // 新增
        sort: groupForm.value.sort
      });
    }
    if (response && response.code === 200) {
      ElMessage.success(response.msg || (isEditGroup.value ? '分组更新成功！' : '分组添加成功！'));
      groupFormDialogVisible.value = false;
      await store.fetchRecommendGroups();
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
    await ElMessageBox.confirm('确定要删除该推荐分组吗？删除后，该分组下的所有视频关联也会被移除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await store.deleteRecommendGroup(groupId);
    if (response && response.code === 200) {
      ElMessage.success(response.msg || '分组删除成功！');
      await store.fetchRecommendGroups();
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



// 视频管理相关
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
const videoList = ref<any[]>([]);

async function getVideoList() {
  const res = await store.fetchAllVideos({
    currentPage: videoPagination.value.currentPage,
    pageSize: videoPagination.value.pageSize,
  });
  videoList.value = res.list;
  videoPagination.value.total = res.total;
}

let selectedVideoSortableInstance: Sortable | null = null;
const selectedVideoListRef = ref<HTMLElement | null>(null);

async function openVideoManageDialog(row: any) {
  currentRecommendGroupId.value = row.id;
  currentGroupName.value = row.name;
  videoDialogVisible.value = true;
  videoLoading.value = true;
  allVideoList.value = [];
  selectedVideoList.value = [];
  try {
    // 只请求当前分组下的视频
    const existingVideos = await store.fetchVideosForGroup(row.id);
    selectedVideoList.value = existingVideos.map((video: any) => ({
      recommend_id: video.recommend_id,
      video_id: video.video_id,
      title: video.title,
      cover_url: video.cover_url,
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
    // 统计所有分组已选视频ID（包括当前分组）
    const allGroups = store.recommendGroups;
    const usedVideoIds = new Set<number>();
    for (const group of allGroups) {
      if (Array.isArray(group.videos)) {
        group.videos.forEach((v: any) => usedVideoIds.add(Number(v.video_id)));
      }
    }

    // 拉取所有未被选中的视频（分页接口，返回当前页数据和总数），传 excludeIds
    const res = await store.fetchAllVideos({
      keyword: videoFilterForm.value.keyword,
      parentId: videoFilterForm.value.parentId,
      categoryId: videoFilterForm.value.categoryId,
      currentPage: videoPagination.value.currentPage,
      pageSize: videoPagination.value.pageSize,
      excludeIds: Array.from(usedVideoIds), // 关键参数
    });

    // 当前页数据直接用接口返回，无需再过滤
    allVideoList.value = res.list;
    videoPagination.value.total = res.total;

    // 如果当前页没数据且不是第一页且总数>0，自动跳到第一页
    if (
      res.list.length === 0 &&
      videoPagination.value.currentPage !== 1 &&
      videoPagination.value.total > 0
    ) {
      videoPagination.value.currentPage = 1;
      await searchVideos();
      return;
    }

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
  searchVideos(); // 不传 true
}
function handleVideoSizeChange(size: number) {
  videoPagination.value.pageSize = size;
  videoPagination.value.currentPage = 1;
  searchVideos(); // 不传 true
}
function resetVideoFilters() {
  videoFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  searchVideos(true); // 这里才传 true
}
function onVideoParentCategoryChange() {
  videoFilterForm.value.categoryId = '';
  searchVideos(true); // 这里才传 true
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
        cover_url: video.cover_url || '',
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
    const response = await store.saveVideosForGroup(currentRecommendGroupId.value, payload);
    if (response && response.code === 200) {
      // 只弹一次
      ElMessage.success(response.msg || '视频推荐保存成功！');
      await store.fetchRecommendGroups();
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

// 新增：计算属性，用于过滤掉已选的视频
const filteredAllVideoList = computed(() => {
  const selectedIds = new Set(selectedVideoList.value.map(v => v.video_id));
  return allVideoList.value.filter(v => !selectedIds.has(v.id));
});
</script>

<style scoped>
/* 样式与之前版本保持一致，此处省略，请确保您在实际文件中包含它们 */
.recommend-manage-wrapper {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px); /* Adjust based on your header height */
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
.video-filter-container .el-select,
.video-filter-container .el-input {
  width: 200px; /* 或更大，比如240px，根据实际内容调整 */
  min-width: 160px;
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
  min-height: 550px;
  max-height: 350px; /* 固定最大高度 */
  overflow-y: auto;   /* 超出时滚动 */
  background: #fff;
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
  max-width: 220px; /* 限制最大宽度，可根据实际调整 */
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