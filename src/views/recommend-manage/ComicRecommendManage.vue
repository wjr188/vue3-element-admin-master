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
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <div class="sort-controls">
              <el-input-number v-model="row.sort" :min="1" size="small" controls-position="right" @change="markGroupSortChanged"></el-input-number>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="漫画数" width="80">
          <template #default="{ row }">
            {{ row.comic_count || 0 }}
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
        <el-table-column prop="type" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'video' ? 'success' : 'info'">
              {{ scope.row.type === 'video' ? '视频' : '图片' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditGroupDialog(row)">编辑分组名</el-button>
            <el-button type="danger" size="small" @click="deleteGroup(row.id)">删除分组</el-button>
            <el-button type="success" size="small" @click="openComicManageDialog(row)">管理漫画</el-button>
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
      <el-form
  :model="groupForm"
  :rules="groupRules"
  ref="groupFormRef"
  label-width="80px"
  @submit.prevent
>

        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="groupForm.sort" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <!-- 新增布局类型 -->
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
    <!-- 新增icon -->
    <el-form-item label="图标文件" prop="icon">
      <el-input v-model="groupForm.icon" placeholder="如 hot1.svg，留空不显示" style="width: 180px;">
        <template #append>
          <img v-if="groupForm.icon" :src="`/icons/${groupForm.icon}`" style="width: 24px; height: 24px; margin-left: 4px;" alt="icon预览" @error="e => (e.target.style.display='none')" />
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
      v-model="comicDialogVisible"
      :title="`管理分组“${currentGroupName}”的漫画`"
      width="70%"
      top="5vh"
      destroy-on-close
      @close="closeComicManageDialog"
    >
      <div class="video-manage-content">
        <div class="left-panel">
          <h3>所有漫画列表</h3>
          <div class="video-filter-container">
            <el-form :inline="true" :model="comicFilterForm" class="filter-form">
              <el-form-item label="关键词">
                <el-input v-model="comicFilterForm.keyword" placeholder="搜索漫画标题/ID" clearable @keyup.enter="searchComics"></el-input>
              </el-form-item>
              <el-form-item label="主分类">
                <el-select v-model="comicFilterForm.parentId" placeholder="全部主分类" clearable @change="onComicParentCategoryChange">
                  <el-option label="全部主分类" value=""></el-option>
                  <el-option v-for="parent in parents" :key="parent.id" :label="parent.name" :value="parent.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子分类">
                <el-select v-model="comicFilterForm.categoryId" placeholder="全部子分类" clearable>
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
                <el-button type="primary" @click="searchComics">搜索</el-button>
                <el-button @click="resetComicFilters">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="filteredAllComicList"
            v-loading="comicLoading"
            height="350px"
            ref="allComicTableRef"
            @selection-change="handleAllComicSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="漫画标题"></el-table-column>
            <el-table-column prop="main_category_name" label="主分类" width="100"></el-table-column>
            <el-table-column prop="child_category_name" label="子分类" width="100"></el-table-column>
            <el-table-column prop="type" label="类型" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'video' ? 'success' : 'info'">
                  {{ scope.row.type === 'video' ? '视频' : '图片' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="addComicToSelected([row])">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="video-table-footer">
            <el-pagination
              @size-change="handleComicSizeChange"
              @current-change="handleComicCurrentChange"
              :current-page="comicPagination.currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="comicPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="comicPagination.total"
              background
            ></el-pagination>
            <el-button type="success" :disabled="selectedAllComics.length === 0" @click="addComicToSelected(selectedAllComics)">批量添加</el-button>
          </div>
        </div>

        <div class="right-panel">
          <h3>已选漫画 (拖拽排序)</h3>
          <div class="selected-video-list" ref="selectedComicListRef">
            <div v-if="selectedComicList.length === 0" class="no-videos-placeholder">
              暂无已选漫画，请从左侧添加
            </div>
            <!-- 只要保证 comic.title 一定有值即可 -->
            <div
              v-for="(comic, index) in selectedComicList"
              :key="comic.comic_id || index"
              class="selected-video-item"
            >
              <el-icon><Rank /></el-icon>
              <span>{{ index + 1 }}. {{ comic.title || '未知标题' }}</span>
              <el-button link type="danger" size="small" @click="removeComicFromSelected(comic.comic_id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeComicManageDialog">取消</el-button>
          <el-button type="primary" @click="saveComicRecommendations">保存</el-button>
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
import { useComicRecommendStore } from '../../store/comic-recommend.store';
import { debounce } from 'lodash';
const store = useComicRecommendStore();

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

const parents = computed(() => store.getParentsForFilter);
const children = computed(() => store.getAllChildCategories);

const filteredChildCategoriesForSelect = computed(() => {
  if (!comicFilterForm.value.parentId) return children.value;
  return store.allChildCategories.filter(
    cat => String(cat.parent_id) === String(comicFilterForm.value.parentId)
  );
});

async function updateGroupComicCounts() {
  await Promise.all(store.recommendGroups.map(g => store.fetchComicsForGroup(g.id)));
}

// 只在主页面mounted时调用一次
onMounted(async () => {
  await store.fetchRecommendGroups();
  await updateGroupComicCounts(); // 只统计一次
  store.fetchAllParentCategories();
  store.fetchAllChildCategories();
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
function layoutTypeText(type) {
  const map = {
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
    // 确保 response 里一定有 code 字段，并且等于0
    if (response && (response.code === 0 || response.data?.code === 0)) {
      groupFormDialogVisible.value = false;
      // 刷新主列表（确保同步）
      await store.fetchRecommendGroups();
      await updateGroupComicCounts();
    }
    // 不要在页面里再弹窗！ElMessage交给store
  } catch (error) {
    // 不要重复弹窗
  }
}

async function deleteGroup(groupId: number) {
  try {
    await ElMessageBox.confirm('确定要删除该推荐分组吗？删除后，该分组下的所有漫画关联也会被移除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await store.deleteRecommendGroup(groupId);
    if (response && response.code === 0) {
      ElMessage.success(response.msg || '分组删除成功！');
      await store.fetchRecommendGroups();
      await updateGroupComicCounts();
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
  const arr = [...store.recommendGroups];
  const moved = arr.splice(oldIndex, 1)[0];
  arr.splice(newIndex, 0, moved);
  arr.forEach((item, idx) => item.sort = idx + 1);
  // 关键：splice 原地覆盖 pinia 响应式数组
  store.recommendGroups.splice(0, store.recommendGroups.length, ...arr);
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

const comicDialogVisible = ref(false);
const currentRecommendGroupId = ref<number | null>(null);
const currentGroupName = ref('');
const allComicList = ref<any[]>([]);
const selectedComicList = ref<any[]>([]);
const selectedAllComics = ref<any[]>([]);
const comicLoading = ref(false);
const allComicTableRef = ref<InstanceType<typeof ElTable>>();
const comicFilterForm = ref({
  keyword: '',
  parentId: '',
  categoryId: '',
});
const comicPagination = ref({ currentPage: 1, pageSize: 10, total: 0 });
const comicList = ref<any[]>([]);

async function getComicList() {
  const res = await store.fetchAllComics({
    currentPage: comicPagination.value.currentPage,
    pageSize: comicPagination.value.pageSize,
  });
  comicList.value = res.list;
  comicPagination.value.total = res.total;
}

let selectedComicSortableInstance: Sortable | null = null;
const selectedComicListRef = ref<HTMLElement | null>(null);

async function openComicManageDialog(row: any) {
  currentRecommendGroupId.value = row.id;
  currentGroupName.value = row.name;

  const comics = await store.fetchComicsForGroup(row.id);
  console.log('分组下已选漫画:', comics); // 重点看这里
  selectedComicList.value = (comics || []).map(comic => ({
    comic_id: comic.comic_id,
    title: comic.name,
    cover_url: comic.cover,
    sort: comic.sort,
  }));

  await searchComics();
  comicDialogVisible.value = true;
  await nextTick();
  setupSelectedComicSortable();
}
function closeComicManageDialog() {
  comicDialogVisible.value = false;

  setTimeout(() => {
    currentRecommendGroupId.value = null;
    currentGroupName.value = '';
    allComicList.value = [];
    selectedComicList.value = [];
    selectedAllComics.value = [];
    comicFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
    comicPagination.value = { currentPage: 1, pageSize: 10, total: 0 };

    if (selectedComicSortableInstance) {
      selectedComicSortableInstance.destroy();
      selectedComicSortableInstance = null;
    }
  }, 300); // 延迟清空数据
}
async function searchComics(resetPage = false) {
  if (resetPage) comicPagination.value.currentPage = 1;
  comicLoading.value = true;
  try {
    // 只用右侧已选的漫画去重
    const usedComicIds = new Set<number>(selectedComicList.value.map(c => c.comic_id));
    const params = {
      keyword: comicFilterForm.value.keyword,
      currentPage: comicPagination.value.currentPage,
      pageSize: comicPagination.value.pageSize,
      excludeComicIds: Array.from(usedComicIds),
      parentId: comicFilterForm.value.parentId,
      categoryId: comicFilterForm.value.categoryId,
    };
    const res = await store.fetchAllComics(params);
    allComicList.value = res.list;
    comicPagination.value.total = res.total;
  } catch (error) {
    ElMessage.error('加载漫画列表失败，请重试！');
    console.error(error);
  } finally {
    comicLoading.value = false;
  }
}
function handleComicCurrentChange(page: number) {
  comicPagination.value.currentPage = page;
  searchComics();
}
function handleComicSizeChange(size: number) {
  comicPagination.value.pageSize = size;
  comicPagination.value.currentPage = 1;
  searchComics();
}
function resetComicFilters() {
  comicFilterForm.value = { keyword: '', parentId: '', categoryId: '' };
  searchComics(true);
}
function onComicParentCategoryChange() {
  comicFilterForm.value.categoryId = '';
  searchComics(true);
}
function handleAllComicSelectionChange(selection: any[]) {
  selectedAllComics.value = selection;
}
function addComicToSelected(comics: any[]) {
  comics.forEach(comic => {
    if (!selectedComicList.value.some(item => item.comic_id === comic.id)) {
      selectedComicList.value.push({
        comic_id: comic.id,
        title: comic.name,
        cover_url: comic.cover,
        sort: selectedComicList.value.length + 1,
      });
    }
  });

  selectedComicList.value.forEach((item, index) => {
    item.sort = index + 1;
  });

  if (allComicTableRef.value) {
    allComicTableRef.value.clearSelection();
  }

  nextTick(() => {
    setupSelectedComicSortable();
  });

  // 调用刷新，传 true 重置分页
  searchComics(true);

  console.log('添加后 selectedComicList:', JSON.stringify(selectedComicList.value));
  console.log('刷新后左侧列表:', JSON.stringify(allComicList.value));
}
function removeComicFromSelected(comicId: number) {
  selectedComicList.value = selectedComicList.value.filter(item => item.comic_id !== comicId);
  selectedComicList.value.forEach((item, index) => {
    item.sort = index + 1;
  });
  nextTick(() => {
    setupSelectedComicSortable();
  });
}
function setupSelectedComicSortable() {
  const el = selectedComicListRef.value;
  if (el) {
    if (selectedComicSortableInstance) {
      selectedComicSortableInstance.destroy();
    }
    selectedComicSortableInstance = Sortable.create(el as HTMLElement, {
      animation: 150,
      handle: '.el-icon',
      onEnd: ({ newIndex, oldIndex }) => {
        const movedItem = selectedComicList.value.splice(oldIndex as number, 1)[0];
        selectedComicList.value.splice(newIndex as number, 0, movedItem);
        selectedComicList.value.forEach((item, index) => {
          item.sort = index + 1;
        });
      },
    });
  } else if (selectedComicSortableInstance) {
    selectedComicSortableInstance.destroy();
    selectedComicSortableInstance = null;
  }
}
async function saveComicRecommendations() {
  if (!currentRecommendGroupId.value) {
    ElMessage.error('缺少分组ID，无法保存漫画！');
    return;
  }

  const payload = selectedComicList.value.map(item => ({
    comic_id: item.comic_id,
    sort: item.sort,
  }));

  try {
    const success = await store.saveComicsForGroup(currentRecommendGroupId.value, payload);
    if (success) {
      ElMessage.success('保存成功！');
      closeComicManageDialog();

      // 刷新所有分组数据和分组内漫画列表
      await store.fetchRecommendGroups();
      await Promise.all(store.recommendGroups.map(g => store.fetchComicsForGroupAndSave(g.id)));
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试！');
    console.error(error);
  }
}

watch(comicDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupSelectedComicSortable();
    });
  }
});

const filteredAllComicList = computed(() => {
  const selectedIds = new Set(selectedComicList.value.map(c => c.comic_id));
  return allComicList.value.filter(c => !selectedIds.has(c.id));
});

// 添加防抖搜索
const debouncedSearchComics = debounce(searchComics, 300);

watch(
  () => comicFilterForm.value.keyword,
  () => {
    debouncedSearchComics();
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
