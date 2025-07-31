<template>
  <div class="text-novel-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/作者/ID/标签" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 120px;">
            <el-option label="全部分类" value="" />
            <el-option v-for="item in novelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable style="width: 120px;">
  <el-option label="全部标签" value="" />
  <el-option v-for="t in novelTagList" :key="t.id" :label="t.name" :value="t.id" />
</el-select>
        </el-form-item>
        <el-form-item label="连载状态">
          <el-select v-model="searchForm.serializationStatus" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="连载中" :value="1" />
            <el-option label="已完结" :value="0" />
            <el-option label="暂停" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="searchForm.shelfStatus" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见性">
          <el-select v-model="searchForm.visibility" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="公开" :value="1" />
            <el-option label="私密" :value="0" />
            <el-option label="VIP专属" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加小说</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetSerializationStatus" size="small" :disabled="selectedRows.length === 0">批量设置连载状态</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetShelfStatus" size="small" :disabled="selectedRows.length === 0">批量设置上架</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchSetVisibility" size="small" :disabled="selectedRows.length === 0">批量设置可见性</el-button>
        </el-form-item>
        <!-- 更新这里为批量设置VIP -->
        <el-form-item>
  <el-button type="warning" @click="onBatchSetVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
</el-form-item>
<el-form-item>
  <el-button type="danger" @click="onBatchCancelVip" size="small" :disabled="selectedRows.length === 0">批量取消VIP</el-button>
</el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetCoinPerChapter" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="novelList"
        v-loading="novelLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="id" label="#编号" width="55" align="center" />
        <el-table-column prop="cover_url" label="封面" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.cover_url" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover_url"/>
            <div v-else style="width:52px; height:52px; background-color:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="100" align="center" />
        <el-table-column prop="author" label="作者" min-width="80" align="center" />
        <el-table-column prop="category_name" label="分类" min-width="90" align="center" />
        <el-table-column prop="tags" label="标签" min-width="100" align="center">
  <template #default="scope">
    <el-tag
      v-for="t in scope.row.tags"
      :key="t"
      size="small"
      type="danger"
      style="margin:1px;"
    >
      {{ tagNameById(t) }}
    </el-tag>
  </template>
</el-table-column>
        <el-table-column prop="chapter_count" label="章节数" width="70" align="center" />
        <el-table-column prop="total_words" label="总字数" width="80" align="center" />
        <el-table-column prop="serialization_status" label="连载状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getSerializationStatusType(scope.row.serialization_status)" size="small">
              {{ getSerializationStatusText(scope.row.serialization_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shelf_status" label="上架状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.shelf_status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.shelf_status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visibility" label="可见性" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getVisibilityType(scope.row.visibility)" size="small">
              {{ getVisibilityText(scope.row.visibility) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_vip" label="VIP" width="70" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_vip" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coin" label="金币" width="80" align="center">
  <template #default="scope">
    <el-tag v-if="scope.row.coin && scope.row.coin > 0" type="warning" size="small">{{ scope.row.coin }}</el-tag>
    <el-tag v-else type="info" size="small">免费</el-tag>
  </template>
</el-table-column>

<!-- 新增：阅读量、点赞量、收藏量 -->
<el-table-column prop="views" label="阅读量" width="80" align="center">
  <template #default="scope">
    <el-tag type="info" size="small">{{ scope.row.views || 0 }}</el-tag>
  </template>
</el-table-column>
<el-table-column prop="likes" label="点赞量" width="80" align="center">
  <template #default="scope">
    <el-tag type="success" size="small">{{ scope.row.likes || 0 }}</el-tag>
  </template>
</el-table-column>
<el-table-column prop="collects" label="收藏量" width="80" align="center">
  <template #default="scope">
    <el-tag type="warning" size="small">{{ scope.row.collects || 0 }}</el-tag>
  </template>
</el-table-column>
        <el-table-column prop="publish_time" label="发布时间" min-width="100" align="center" />
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="onEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="success" @click="onManageChapters(scope.row)">章节管理</el-button>
            <el-button size="small" type="info" @click="onPreview(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="novelTotal"
        @size-change="onPageChange"
        @current-change="onPageChange"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 添加/编辑小说弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加小说':'编辑小说'" width="580px">
      <el-form :model="dialogForm" label-width="90px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="dialogForm.title" placeholder="请输入小说标题" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="dialogForm.author" placeholder="请输入作者名" clearable />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="dialogForm.category_id" placeholder="请选择小说分类" style="width:100%">
            <el-option v-for="item in novelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="dialogForm.tags" multiple clearable collapse-tags style="width:100%">
  <el-option v-for="t in novelTagList" :key="t.id" :label="t.name" :value="t.id" />
</el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            action="YOUR_UPLOAD_API_URL"
            list-type="picture-card"
            :file-list="dialogForm.cover_file_list"
            :limit="1"
            :on-remove="handleRemoveCover"
            :on-success="handleCoverUploadSuccess"
            :before-upload="beforeUploadCover"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="请输入小说简介" />
        </el-form-item>
        <el-form-item label="连载状态">
          <el-select v-model="dialogForm.serialization_status" placeholder="请选择" style="width:100%">
            <el-option label="连载中" :value="1" />
            <el-option label="已完结" :value="0" />
            <el-option label="暂停" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="dialogForm.shelf_status" active-text="上架" inactive-text="下架" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-select v-model="dialogForm.visibility" placeholder="请选择" style="width:100%">
            <el-option label="公开" :value="1" />
            <el-option label="私密" :value="0" />
            <el-option label="VIP专属" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="dialogForm.is_vip" active-text="是" inactive-text="否" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="每章金币">
  <el-input-number v-model="dialogForm.coin" :min="0" style="width: 120px" />
</el-form-item>
<el-form-item label="阅读量">
  <el-input-number v-model="dialogForm.views" :min="0" style="width: 120px" />
</el-form-item>
<el-form-item label="点赞量">
  <el-input-number v-model="dialogForm.likes" :min="0" style="width: 120px" />
</el-form-item>
<el-form-item label="收藏量">
  <el-input-number v-model="dialogForm.collects" :min="0" style="width: 120px" />
</el-form-item>
<el-form-item>
  <el-button type="primary" @click="submitDialog" :loading="dialogLoading">{{ dialogType==='add'?'确定':'保存' }}</el-button>
  <el-button @click="dialogVisible=false">取消</el-button>
</el-form-item>
      </el-form>
    </el-dialog>
     <!-- 小说预览弹窗 (简化版，仅展示章节标题和内容摘要) -->
    <el-dialog v-model="previewVisible" title="小说预览" width="780px">
      <div class="preview-novel-content">
        <h3 v-if="currentPreviewNovel.title">{{ currentPreviewNovel.title }} - 预览</h3>
        <div v-if="currentPreviewNovel.chapters && currentPreviewNovel.chapters.length > 0">
          <div v-for="chapter in currentPreviewNovel.chapters" :key="chapter.id" class="chapter-preview-item">
            <h4>{{ chapter.chapter_order}}. {{ chapter.title }}</h4>
            <div class="chapter-content-preview" v-html="chapter.content ? chapter.content.substring(0, 200) + '...' : '暂无内容' "></div>
          </div>
        </div>
        <div v-else>
          暂无章节内容可预览。
        </div>
      </div>
    </el-dialog>

    <!-- 章节管理弹窗 (NovelChapterManageDialog.vue) -->
    <NovelChapterManageDialog
      v-if="chapterManageDialogVisible"
      :novel-id="currentNovelForChapterManage?.id"
      :novel-title="currentNovelForChapterManage?.title"
      @close="chapterManageDialogVisible = false; onSearch();"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/utils/request' // 假设您的请求工具在这里

// 导入文字小说 Store
import {
  novelList,
  novelTotal,
  novelLoading,
  fetchNovelList,
  fetchNovelDetail,
  addNovel,
  updateNovel,
  deleteNovel,
  batchDeleteNovels,
  batchSetNovelSerializationStatus,
  batchSetNovelShelfStatus,
  batchSetNovelVisibility,
  batchSetVip,
  batchCancelVip,
  batchSetCoin,
} from '@/store/modules/text-novel.store';

// 导入文字小说分类 Store
import {
  novelMainCategories, // 从这里导入文字小说的主分类
  fetchNovelCategories,
} from '@/store/modules/text-novel-category.store';

// 导入文字小说标签 Store
import {
  novelTagList, // 从这里导入文字小说标签
  fetchNovelTags,
} from '@/store/modules/text-novel-tag.store';

// 导入章节管理子组件 (路径基于当前文件)
import NovelChapterManageDialog from './components/NovelChapterManageDialog.vue';


// ======================= 状态变量 =======================

// 搜索表单
const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  categoryId: '',
  tag: '',
  serializationStatus: '', // 1:连载中, 0:已完结, 2:暂停
  shelfStatus: '',         // 1:上架, 0:下架
  visibility: '',          // 1:公开, 0:私密, 2:VIP专属
});

// 表格多选
const selectedRows = ref<any[]>([]);
function tagNameById(id: number|string) {
  const tag = novelTagList.value.find(t => t.id === Number(id));
  return tag ? tag.name : id;
}

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref<'add'|'edit'>('add');
const dialogForm = ref<any>({
  id: null, title: '', author: '', description: '', cover_url: '', cover_file_list: [],
  category_id: '', tags: [], serialization_status: 1, shelf_status: 1, visibility: 1,
  is_vip_free: 0, coin_per_chapter: 0,
});
const dialogLoading = ref(false); // 弹窗内保存按钮的加载状态

// 预览弹窗
const previewVisible = ref(false);
const currentPreviewNovel = ref<any>({}); // 当前预览的小说数据，包含章节和内容摘要

// 章节管理弹窗
const chapterManageDialogVisible = ref(false);
const currentNovelForChapterManage = ref<any>(null); // 当前操作章节管理的小说

// ======================= 生命周期 & 初始化 =======================

onMounted(async () => {
  // 加载小说分类和标签数据
  await fetchNovelCategories();
  await fetchNovelTags();
  await fetchTableData();       // 加载小说列表
});

// ======================= 数据获取与列表操作 =======================

/**
 * 获取小说列表 (wrapper function)
 */
async function fetchTableData() {
  // 传入 searchForm.value 作为参数，由 Store 调用后端 API
  await fetchNovelList(searchForm.value);
  // novelList 和 novelTotal 已经是响应式引用，会直接更新
}

/**
 * 搜索按钮点击
 */
function onSearch() {
  searchForm.value.page = 1; // 搜索时重置回第一页
  fetchTableData();
}

/**
 * 重置按钮点击
 */
function onReset() {
  searchForm.value = {
    page: 1,
    pageSize: 10,
    keyword: '',
    categoryId: '',
    tag: '',
    serializationStatus: '',
    shelfStatus: '',
    visibility: '',
  };
  fetchTableData();
}
function onPageChange() {
  fetchTableData();
}

/**
 * 处理表格选择变化
 */
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

// ======================= 批量操作 =======================

/**
 * 批量删除
 */
async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的小说');
  }
  await ElMessageBox.confirm('确定批量删除已选小说吗？此操作会同时删除关联章节！', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchDeleteNovels(ids); // 调用 Store 的批量删除
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = [];
      fetchTableData(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

/**
 * 批量设置连载状态
 */
async function onBatchSetSerializationStatus() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选小说');
  }
  ElMessageBox.confirm('请选择要设置的连载状态', '批量设置连载状态', {
    confirmButtonText: '连载中',
    cancelButtonText: '已完结',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "连载中"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetNovelSerializationStatus(ids, 1); // 调用 Store
    if (res && res.code === 0) {
      ElMessage.success('批量设置连载中成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "已完结"
      await ElMessageBox.confirm('确定批量设置已选小说为已完结状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await batchSetNovelSerializationStatus(ids, 0); // 调用 Store
        if (res && res.code === 0) {
          ElMessage.success('批量设置已完结成功');
          selectedRows.value = [];
          fetchTableData();
        } else {
          ElMessage.error(res?.msg || '批量设置失败');
        }
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else if (action === 'close') { // 用户点击关闭
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置上架/下架状态
 */
async function onBatchSetShelfStatus() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选小说');
  }
  ElMessageBox.confirm('请选择要设置的上架状态', '批量设置上架状态', {
    confirmButtonText: '上架',
    cancelButtonText: '下架',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "上架"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetNovelShelfStatus(ids, 1); // 调用 Store
    if (res && res.code === 0) {
      ElMessage.success('批量设置上架成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "下架"
      await ElMessageBox.confirm('确定批量设置已选小说为下架状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await batchSetNovelShelfStatus(ids, 0); // 调用 Store
        if (res && res.code === 0) {
          ElMessage.success('批量设置下架成功');
          selectedRows.value = [];
          fetchTableData();
        } else {
          ElMessage.error(res?.msg || '批量设置失败');
        }
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else if (action === 'close') {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置可见性
 */
async function onBatchSetVisibility() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选小说');
  }
  ElMessageBox.confirm('请选择要设置的可见性状态', '批量设置可见性', {
    confirmButtonText: '公开',
    cancelButtonText: '私密',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "公开"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetNovelVisibility(ids, 1); // 调用 Store
    if (res && res.code === 0) {
      ElMessage.success('批量设置公开成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "私密"
      await ElMessageBox.confirm('确定批量设置已选小说为私密状态吗？', '提示', {
        confirmButtonText: '设为私密',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await batchSetNovelVisibility(ids, 0); // 调用 Store
        if (res && res.code === 0) {
          ElMessage.success('批量设置私密成功');
          selectedRows.value = [];
          fetchTableData();
        } else {
          ElMessage.error(res?.msg || '批量设置失败');
        }
      }).catch(async (innerAction) => {
        if (innerAction === 'cancel') { // 用户选择 "VIP专属"
           await ElMessageBox.confirm('确定批量设置已选小说为VIP专属吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
           }).then(async () => {
              const ids = selectedRows.value.map(row => row.id);
              const res = await batchSetNovelVisibility(ids, 2); // 调用 Store
              if (res && res.code === 0) {
                 ElMessage.success('批量设置VIP专属成功');
                 selectedRows.value = [];
                 fetchTableData();
              } else {
                 ElMessage.error(res?.msg || '批量设置失败');
              }
           }).catch(() => {
              ElMessage.info('已取消设置');
           });
        } else if (innerAction === 'close') {
            ElMessage.info('已取消设置');
        }
      });
    } else if (action === 'close') {
      ElMessage.info('已取消设置');
    }
  });
}

// 批量设置VIP
async function onBatchSetVip() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选小说');
  }
  const ids = selectedRows.value.map(row => row.id);
  const res = await batchSetVip(ids);
  if (res && res.code === 0) {
    ElMessage.success('批量设置VIP成功');
    selectedRows.value = [];
    fetchTableData();
  } else {
    ElMessage.error(res?.msg || '批量设置VIP失败');
  }
}

// 批量取消VIP
async function onBatchCancelVip() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选小说');
  }
  const ids = selectedRows.value.map(row => row.id);
  const res = await batchCancelVip(ids);
  if (res && res.code === 0) {
    ElMessage.success('批量取消VIP成功');
    selectedRows.value = [];
    fetchTableData();
  } else {
    ElMessage.error(res?.msg || '批量取消VIP失败');
  }
}

// 批量设置金币
async function onBatchSetCoinPerChapter() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选小说');
  }
  ElMessageBox.prompt('请输入要设置的金币数量 (0为免费)', '批量设置每章金币', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '金币数量必须是数字且非负'
  }).then(async ({ value }) => {
    const coin = parseInt(value);
    if (isNaN(coin) || coin < 0) {
      return ElMessage.error('金币数量无效');
    }
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetCoin(ids, coin);
    if (res && res.code === 0) {
      ElMessage.success('批量设置每章金币成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置每章金币失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置金币');
  });
}

// ======================= 单条操作 =======================

/**
 * 打开新增弹窗
 */
function onAdd() {
  dialogType.value = 'add';
  dialogForm.value = {
    id: null, title: '', author: '', description: '', cover_url: '', cover_file_list: [],
    category_id: '', tags: [], serialization_status: 1, shelf_status: 1, visibility: 1,
    is_vip_free: 0, coin_per_chapter: 0,
  };
  dialogVisible.value = true;
}

/**
 * 打开编辑弹窗
 */
async function onEdit(row: any) {
  dialogType.value = 'edit';
  // 通过 ID 从后端获取最新详情
  const res = await fetchNovelDetail(row.id); // 调用 Store 的获取详情
  if (res && res.code === 0 && res.data) {
    const novelDetail = res.data;
    dialogForm.value = {
      ...novelDetail,
      tags: Array.isArray(novelDetail.tags)
        ? novelDetail.tags
        : (typeof novelDetail.tags === 'string' && novelDetail.tags)
          ? novelDetail.tags.split(',').map(id => Number(id))
          : [],
      cover_file_list: novelDetail.cover_url
        ? [{ url: novelDetail.cover_url, name: '封面', uid: Date.now() }]
        : [],
    };
    dialogVisible.value = true;
  } else {
    ElMessage.error(res?.msg || '获取小说详情失败');
  }
}

/**
 * 提交新增/编辑表单
 */
async function submitDialog() {
  if (!dialogForm.value.title || !dialogForm.value.category_id) {
    return ElMessage.error('标题和分类为必填项');
  }

  dialogLoading.value = true;
  try {
    const submitData = {
  ...dialogForm.value,
  // 保证 tags 是 [数字, ...]，如果是字符串转数字，如果本来是数字也没影响
  tags: Array.isArray(dialogForm.value.tags)
    ? dialogForm.value.tags.map(Number)
    : [],
  cover_url: dialogForm.value.cover_file_list.length > 0 ? dialogForm.value.cover_file_list[0].url : '',
};

    // 清理前端特有字段
    delete submitData.cover_file_list;

    let res;
    if (dialogType.value === 'add') {
      res = await addNovel(submitData); // 调用 Store 的新增
    } else {
      res = await updateNovel(submitData); // 调用 Store 的更新
    }

    if (res && res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
      dialogVisible.value = false;
      fetchTableData(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '操作失败');
    }
  } catch (error) {
    console.error('提交表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    dialogLoading.value = false;
  }
}

/**
 * 预览小说 (简化，仅展示章节标题和部分内容)
 */
async function onPreview(row: any) {
  try {
    const res = await service.get(`/api/text_novel_chapter/list?novelId=${row.id}`);
    if (res && res.data && res.data.code === 0 && res.data.data) {
      currentPreviewNovel.value = {
        title: row.title,
        chapters: res.data.data.list || [],
      };
      previewVisible.value = true;
    } else {
      ElMessage.error(res?.data?.msg || '获取小说章节失败');
    }
  } catch (error) {
    console.error('获取小说章节请求失败:', error);
    ElMessage.error('获取小说章节请求失败');
  }
}

/**
 * 删除小说
 */
async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除小说 “${row.title}” 吗？此操作会同时删除关联章节！`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteNovel(row.id); // 调用 Store 的删除
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

/**
 * 打开章节管理弹窗
 */
function onManageChapters(row: any) {
  currentNovelForChapterManage.value = row;
  chapterManageDialogVisible.value = true;
}

// ======================= 封面图上传 =======================

function handleRemoveCover(file: any, fileList: any) {
  dialogForm.value.cover_file_list = [];
  dialogForm.value.cover_url = '';
}

function handleCoverUploadSuccess(response: any, file: any, fileList: any) {
  if (response && response.code === 0 && response.data && response.data.url) {
    dialogForm.value.cover_url = response.data.url;
    // 确保 fileList 只有一张图片
    dialogForm.value.cover_file_list = [{ url: response.data.url, name: file.name, uid: file.uid }];
    ElMessage.success('封面上传成功！');
  } else {
    ElMessage.error('封面上传失败：' + (response?.msg || '未知错误'));
    dialogForm.value.cover_file_list = []; // 清空，防止显示错误图片
  }
}

function beforeUploadCover(file: File) {
  const isJPGPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGPNG) {
    ElMessage.error('上传封面只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传封面大小不能超过 2MB!');
  }
  return isJPGPNG && isLt2M;
}

// ======================= 辅助函数 (用于表格Tag显示) =======================

function getSerializationStatusText(status: number) {
  switch (status) {
    case 1: return '连载中';
    case 0: return '已完结';
    case 2: return '暂停';
    default: return '未知';
  }
}

function getSerializationStatusType(status: number) {
  switch (status) {
    case 1: return 'success';
    case 0: return 'info';
    case 2: return 'warning';
    default: return 'info';
  }
}

function getVisibilityText(visibility: number) {
  switch (visibility) {
    case 1: return '公开';
    case 0: return '私密';
    case 2: return 'VIP专属';
    default: return '未知';
  }
}

function getVisibilityType(visibility: number) {
  switch (visibility) {
    case 1: return 'success';
    case 0: return 'info';
    case 2: return 'warning';
    default: return 'info';
  }
}
</script>

<style scoped>
.text-novel-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; margin-bottom: 15px; }
.custom-table { font-size: 12px; border-radius: 9px; }
.el-table th, .el-table td {
  border-right: 1px solid #ebeef5 !important;
  padding: 0 2px !important;
}
.el-table th:last-child, .el-table td:last-child { border-right: none !important; }
.el-table { border-radius: 9px; overflow: hidden; }
.el-table::before { height: 0; }
.el-card {
  border-radius: 9px;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 1px 8px 0 rgba(0,0,0,0.02) !important;
}
.el-button {
  border-radius: 5px !important;
  font-size: 11px !important;
  padding: 1px 8px !important;
  min-width: 52px !important;
}
.preview-novel-content {
  max-height: 70vh; /* 控制预览区域高度 */
  overflow-y: auto;
  padding-right: 10px; /* 防止滚动条遮挡内容 */
}
.preview-novel-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}
.chapter-preview-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}
.chapter-preview-item h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #555;
  font-size: 15px;
}
.chapter-content-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap; /* 保留空白符和换行符 */
}
/* 调整 el-upload 样式 */
.el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
.el-upload-list__item {
  width: 100px;
  height: 100px;
}
</style>

