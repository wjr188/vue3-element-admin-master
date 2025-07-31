<template>
  <el-dialog
    v-model="dialogVisible"
    title="OnlyFans媒体排序管理"
    width="80%"
    top="5vh"
    destroy-on-close
    @close="emit('close')"
  >
    <div class="media-sort-container">
      <!-- 搜索和筛选区域 -->
      <div class="filter-area">
        <el-input v-model="searchKeyword" placeholder="搜索媒体标题或ID" clearable style="width: 200px; margin-right: 10px;"></el-input>
        <el-select v-model="selectedCreatorId" placeholder="选择创作者" clearable style="width: 150px; margin-right: 10px;">
          <el-option label="全部创作者" value=""></el-option>
          <el-option v-for="creator in creators" :key="creator.id" :label="creator.name" :value="creator.id"></el-option>
        </el-select>
        <el-select v-model="selectedSeriesId" placeholder="选择内容系列" clearable style="width: 150px; margin-right: 10px;">
          <el-option label="全部内容系列" value=""></el-option>
          <el-option v-for="series in parentCategories" :key="series.id" :label="series.name" :value="series.id"></el-option>
        </el-select>
        <el-select v-model="selectedCollectionId" placeholder="选择内容合集" clearable style="width: 150px; margin-right: 10px;">
          <el-option label="全部内容合集" value=""></el-option>
          <el-option v-for="collection in filteredChildCategories" :key="collection.id" :label="collection.name" :value="collection.id"></el-option>
        </el-select>
        <el-button type="primary" @click="fetchSortableMedia">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <!-- 媒体列表 - 拖拽排序 -->
      <el-table
        :data="sortableMedia"
        v-loading="mediaLoading"
        row-key="id"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="id" label="#ID" width="80" align="center"></el-table-column>
        <el-table-column prop="cover_url" label="封面" width="100" align="center">
          <template #default="scope">
            <img :src="scope.row.cover_url" alt="封面" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" align="left"></el-table-column>
        <el-table-column prop="creatorName" label="创作者" width="120" align="center"></el-table-column>
        <el-table-column prop="seriesName" label="内容系列" width="120" align="center"></el-table-column>
        <el-table-column prop="collectionName" label="内容合集" width="120" align="center"></el-table-column>
        <el-table-column prop="sort" label="当前排序" width="100" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" @change="markAsChanged(scope.row)"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button type="text" size="small" @click="moveUp(scope.$index)">上移</el-button>
            <el-button type="text" size="small" @click="moveDown(scope.$index)">下移</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalMedia"
        @size-change="fetchSortableMedia"
        @current-change="fetchSortableMedia"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveSortOrder" :loading="saveLoading">保存排序</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  fetchOnlyFansMedia, // 用于获取媒体列表进行排序
  batchUpdateOnlyFansMediaSort // 用于批量更新排序
} from '@/store/modules/onlyfans-media.store';

import {
  onlyfansParentCategories,
  onlyfansChildCategories,
  fetchOnlyFansCategories
} from '@/store/modules/onlyfans-categories.store';

// 定义 emits
const emit = defineEmits(['close']);

const dialogVisible = ref(true); // 控制弹窗显示
const mediaLoading = ref(false); // 媒体加载状态
const saveLoading = ref(false); // 保存按钮加载状态

const sortableMedia = ref<any[]>([]); // 可排序的媒体列表
const changedMedia = ref<Set<number>>(new Set()); // 记录被修改过排序的媒体ID

// 搜索和筛选条件
const searchKeyword = ref('');
const selectedCreatorId = ref('');
const selectedSeriesId = ref('');
const selectedCollectionId = ref('');

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalMedia = ref(0);

// 从分类 Store 获取创作者、内容系列和内容合集
const creators = computed(() => onlyfansParentCategories.value.filter(cat => cat.parent_id === 0)); // 假设 parent_id为0的是创作者
const parentCategories = computed(() => onlyfansParentCategories.value.filter(cat => cat.parent_id !== 0)); // 假设 parent_id不为0的是内容系列
const allChildCategories = computed(() => onlyfansChildCategories.value); // 所有子分类

// 过滤子分类，使其与选定的内容系列关联
const filteredChildCategories = computed(() => {
  if (!selectedSeriesId.value) {
    return allChildCategories.value;
  }
  return allChildCategories.value.filter(cat => cat.parent_id === selectedSeriesId.value);
});


// 监听筛选条件变化，重置页码
watch([searchKeyword, selectedCreatorId, selectedSeriesId, selectedCollectionId], () => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchOnlyFansCategories(); // 加载分类和创作者数据
  await fetchSortableMedia(); // 加载可排序的媒体数据
});

/**
 * 获取可排序的媒体列表
 */
async function fetchSortableMedia() {
  mediaLoading.value = true;
  changedMedia.value.clear(); // 每次加载新数据时清空变更记录

  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value,
    creatorId: selectedCreatorId.value,
    seriesId: selectedSeriesId.value,
    collectionId: selectedCollectionId.value,
    // 确保从后端获取媒体时包含 sort 字段，以便于前端修改和回传
  };

  try {
    const res = await fetchOnlyFansMedia(params);
    if (res && res.code === 0) {
      // 假设 res.data.list 已经包含 sort 字段
      // 并且可能需要添加 creatorName, seriesName, collectionName 等字段用于显示
      sortableMedia.value = (res.data.list || []).map((media: any) => {
        const creator = creators.value.find(c => c.id === media.creator_id);
        const series = parentCategories.value.find(s => s.id === media.series_id);
        const collection = allChildCategories.value.find(col => col.id === media.collection_id);

        return {
          ...media,
          creatorName: creator ? creator.name : '未知',
          seriesName: series ? series.name : '未知',
          collectionName: collection ? collection.name : '未知',
          sort: media.sort || 0 // 确保有默认排序值
        };
      });
      totalMedia.value = res.data.total || 0;
    } else {
      ElMessage.error(res?.msg || '获取媒体列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch sortable media:', error);
    ElMessage.error('获取媒体列表请求失败');
  } finally {
    mediaLoading.value = false;
  }
}

/**
 * 标记媒体为已修改，以便在保存时只提交修改过的项
 * @param row 被修改的行数据
 */
function markAsChanged(row: any) {
  changedMedia.value.add(row.id);
}

/**
 * 上移媒体
 * @param index 媒体在数组中的索引
 */
function moveUp(index: number) {
  if (index > 0) {
    const currentMedia = sortableMedia.value[index];
    const prevMedia = sortableMedia.value[index - 1];

    // 交换 sort 值
    const tempSort = currentMedia.sort;
    currentMedia.sort = prevMedia.sort;
    prevMedia.sort = tempSort;

    // 交换数组中的位置 (可选，如果只根据sort渲染可以不交换位置，但为了UI同步最好交换)
    [sortableMedia.value[index], sortableMedia.value[index - 1]] =
      [sortableMedia.value[index - 1], sortableMedia.value[index]];

    // 标记为已修改
    markAsChanged(currentMedia);
    markAsChanged(prevMedia);
  }
}

/**
 * 下移媒体
 * @param index 媒体在数组中的索引
 */
function moveDown(index: number) {
  if (index < sortableMedia.value.length - 1) {
    const currentMedia = sortableMedia.value[index];
    const nextMedia = sortableMedia.value[index + 1];

    // 交换 sort 值
    const tempSort = currentMedia.sort;
    currentMedia.sort = nextMedia.sort;
    nextMedia.sort = tempSort;

    // 交换数组中的位置
    [sortableMedia.value[index], sortableMedia.value[index + 1]] =
      [sortableMedia.value[index + 1], sortableMedia.value[index]];

    // 标记为已修改
    markAsChanged(currentMedia);
    markAsChanged(nextMedia);
  }
}

/**
 * 保存排序顺序
 */
async function saveSortOrder() {
  if (changedMedia.value.size === 0) {
    ElMessage.info('没有检测到排序变更');
    return;
  }

  saveLoading.value = true;
  try {
    const updatedSortList = sortableMedia.value
      .filter(media => changedMedia.value.has(media.id))
      .map(media => ({ id: media.id, sort: media.sort }));

    const res = await batchUpdateOnlyFansMediaSort(updatedSortList); // 调用 Store 中的批量更新排序函数
    if (res && res.code === 0) {
      ElMessage.success('排序保存成功！');
      changedMedia.value.clear(); // 清空变更记录
      await fetchSortableMedia(); // 重新获取数据以确保UI同步最新排序
    } else {
      ElMessage.error(res?.msg || '排序保存失败');
    }
  } catch (error) {
    console.error('Failed to save sort order:', error);
    ElMessage.error('保存排序请求失败');
  } finally {
    saveLoading.value = false;
  }
}

/**
 * 重置筛选条件
 */
function resetFilters() {
  searchKeyword.value = '';
  selectedCreatorId.value = '';
  selectedSeriesId.value = '';
  selectedCollectionId.value = '';
  // fetchSortableMedia 会在 watch 中被触发，因为 currentPage 被重置为 1
}

</script>

<style scoped>
.media-sort-container {
  padding: 20px;
}
.filter-area {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 增加筛选项之间的间距 */
  align-items: center;
}
</style>
