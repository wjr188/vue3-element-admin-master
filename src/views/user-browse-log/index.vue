<template>
  <div class="browse-logs-manager">
    <h2>用户浏览记录管理</h2>
    <hr />

    <div class="filter-section">
      <el-form :inline="true" :model="filters" class="demo-form-inline">
        <el-form-item label="内容类型">
          <el-select
            v-model="filters.type"
            placeholder="请选择内容类型"
            @change="handleTypeChange"
            size="large"
            style="width: 200px; font-size: 18px;"
            popper-class="big-select-dropdown"
          >
            <el-option
              v-for="item in contentTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              style="font-size: 18px;"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属分类">
          <el-select
            v-model="filters.category_id"
            placeholder="请选择分类"
            :disabled="!filters.type"
            size="large"
            style="width: 200px; font-size: 18px;"
            popper-class="big-select-dropdown"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              style="font-size: 18px;"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input
            v-model="filters.user_uuid"
            placeholder="请输入用户ID"
          ></el-input>
        </el-form-item>

        <el-form-item label="内容标题">
          <el-input
            v-model="filters.keyword"
            placeholder="请输入内容标题关键词"
          ></el-input>
        </el-form-item>

        <el-form-item label="时间区间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchBrowseLogs">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      :data="browseLogs"
      v-loading="loading"
      style="width: 100%; margin-top: 20px"
      border
    >
      <el-table-column
        prop="user_uuid"
        label="用户ID"
        width="180"
      ></el-table-column>
      <el-table-column prop="content_title" label="内容标题"></el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default="scope">
          {{ formatContentType(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="category_name"
        label="分类"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="browse_time"
        label="浏览时间"
        width="180"
      ></el-table-column>
      <el-table-column label="章节/进度" width="120">
        <template #default="scope">
          {{ formatExtra(scope.row.extra) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            @click="goToContentDetail(scope.row.content_id, scope.row.type)"
            type="text"
            size="small"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.page_size"
      :total="total"
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
      layout="total, sizes, prev, pager, next, jumper"
      background
      style="margin-top: 20px; text-align: right"
    ></el-pagination>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch,
} from 'vue';
import { ElMessage } from 'element-plus';
import { useBrowseHistoryStore } from '@/store/modules/userBrowseLog.store';
import { storeToRefs } from 'pinia';

const filters = reactive({
  type: '',
  category_id: null,
  user_uuid: '',
  keyword: '',
  start_time: '',
  end_time: '',
});
const pagination = reactive({
  page: 1,
  page_size: 10,
});
const dateRange = ref([]);

const browseHistoryStore = useBrowseHistoryStore();
const {
  browseLogs,
  total,
  loading,
  contentTypes,
  categories,
} = storeToRefs(browseHistoryStore);

watch(dateRange, (newRange) => {
  if (newRange && newRange.length === 2) {
    filters.start_time = newRange[0];
    filters.end_time = newRange[1];
  } else {
    filters.start_time = '';
    filters.end_time = '';
  }
});

const fetchContentTypes = async () => {
  await browseHistoryStore.fetchContentTypes();
};

const fetchCategories = async (type) => {
  await browseHistoryStore.fetchCategories(type);
};

const handleTypeChange = async () => {
  filters.category_id = null;
  await fetchCategories(filters.type);
  fetchBrowseLogs();
};

const fetchBrowseLogs = async () => {
  const params = {
    ...filters,
    page: pagination.page,
    page_size: pagination.page_size,
  };
  await browseHistoryStore.fetchBrowseLogs(params);
};

const resetFilters = () => {
  filters.type = '';
  filters.category_id = null;
  filters.user_uuid = '';
  filters.keyword = '';
  filters.start_time = '';
  filters.end_time = '';
  dateRange.value = [];
  pagination.page = 1;
  fetchCategories('');
  fetchBrowseLogs();
};

const handlePageSizeChange = (size) => {
  pagination.page_size = size;
  pagination.page = 1;
  fetchBrowseLogs();
};

const handleCurrentPageChange = (page) => {
  pagination.page = page;
  fetchBrowseLogs();
};

const formatContentType = (typeValue) => {
  const type = contentTypes.value.find((item) => item.value === typeValue);
  return type ? type.label : typeValue;
};

const formatExtra = (extra) => {
  if (!extra) return '-';
  if (extra.progress !== undefined) return `${extra.progress}%`;
  if (extra.chapter_id !== undefined) return `章节 ${extra.chapter_id}`;
  if (extra.page_num !== undefined) return `页数 ${extra.page_num}`;
  return JSON.stringify(extra);
};

const goToContentDetail = (contentId, type) => {
  ElMessage.info(
    `跳转到内容ID: ${contentId}, 类型: ${type} 的详情页`
  );
  console.log('Navigate to content detail:', { contentId, type });
};

onMounted(() => {
  fetchContentTypes();
  fetchBrowseLogs();
  console.log('browseLogs', browseLogs)
  console.log('total', total)
  console.log('loading', loading)
  console.log('contentTypes', contentTypes)
  console.log('categories', categories)
});
</script>

<style scoped>
.browse-logs-manager {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
}

.el-form-item {
  margin-right: 20px;
  margin-bottom: 10px; /* 调整表单项之间的垂直间距 */
}

.big-select-dropdown .el-select-dropdown__item {
  font-size: 18px;
  min-height: 40px;
  line-height: 40px;
}
</style>