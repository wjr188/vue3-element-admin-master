<template>
  <div class="comic-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/标签" clearable />
        </el-form-item>
        <!-- 已移除作者筛选 -->
        <el-form-item label="主分类">
          <el-select v-model="searchForm.mainCategoryId" placeholder="全部主分类" clearable style="width: 120px;">
            <el-option label="全部主分类" value="" />
            <el-option v-for="item in mainCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select v-model="searchForm.subCategoryId" placeholder="全部子分类" clearable style="width: 120px;">
            <el-option label="全部子分类" value="" />
            <el-option v-for="item in subCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable style="width: 120px;">
            <el-option label="全部标签" value="" />
            <el-option v-for="t in tagList" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="连载状态">
          <el-select v-model="searchForm.serializationStatus" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="连载中" :value="1" />
            <el-option label="已完结" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="searchForm.shelfStatus" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="() => onSearch(true)" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加漫画专辑</el-button>
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
          <el-button type="warning" @click="onBatchSetVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetCoin" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <div style="font-size:15px; font-weight:bold; color:#222; margin:12px 0 2px 0;">
    当前共 {{ mangaTotal }} 本漫画，
    合计 <span style="color:#409EFF;">{{ totalChapterCount }}</span> 个章节
  </div>
      <el-table
        :data="mangaList"
        v-loading="mangaLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="id" label="#编号" width="55" align="center" />
        <el-table-column prop="cover" label="封面" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.cover" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover"/>
            <div v-else style="width:52px; height:52px; background-color:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="标题" min-width="100" align="center" />
        <el-table-column prop="category_id" label="主分类" min-width="90" align="center">
          <template #default="scope">
            {{ getCategoryName(scope.row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="sub_category_id" label="子分类" min-width="90" align="center">
          <template #default="scope">
            {{ getSubCategoryName(scope.row.sub_category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="100" align="center">
          <template #default="scope">
            <el-tag v-for="tagName in getTagNames(scope.row.tags)" :key="tagName" size="small" type="danger" style="margin:1px;">{{ tagName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_serializing" label="连载状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_serializing === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.is_serializing === 1 ? '连载中' : '已完结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_shelf" label="上架状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_shelf === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.is_shelf === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chapter_count" label="章节数" width="70" align="center">
  <template #default="scope">
    <span style="font-weight: 500; color: #409EFF;">
      {{ scope.row.chapter_count ?? 0 }}
    </span>
  </template>
</el-table-column>

        <!-- 新增 VIP 列 -->
        <el-table-column prop="is_vip" label="VIP" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_vip === 1 ? 'warning' : 'info'" size="small">
              {{ scope.row.is_vip === 1 ? 'VIP' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 新增金币列 -->
        <el-table-column prop="coin" label="金币" width="80" align="center">
          <template #default="scope">
            <span>{{ scope.row.coin || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="阅读量" width="80" align="center">
  <template #default="scope">
    <span>{{ scope.row.views || 0 }}</span>
  </template>
</el-table-column>
<el-table-column prop="likes" label="点赞量" width="80" align="center">
  <template #default="scope">
    <span>{{ scope.row.likes || 0 }}</span>
  </template>
</el-table-column>
<el-table-column prop="collects" label="收藏量" width="80" align="center">
  <template #default="scope">
    <span>{{ scope.row.collects || 0 }}</span>
  </template>
</el-table-column>
        <el-table-column prop="created_at" label="发布时间" min-width="100" align="center" />
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
        :total="mangaTotal"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 添加/编辑漫画专辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加漫画专辑':'编辑漫画专辑'" width="580px">
      <el-form :model="dialogForm" label-width="90px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="dialogForm.title" placeholder="请输入漫画专辑标题" clearable />
        </el-form-item>
        <!-- 已移除作者选择框 -->
        <el-form-item label="主分类" required>
          <el-select v-model="dialogForm.main_category_id" placeholder="请选择主分类" style="width:100%">
            <el-option v-for="item in mainCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select v-model="dialogForm.sub_category_id" placeholder="请选择子分类" clearable style="width:100%">
            <el-option v-for="item in filteredSubCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="dialogForm.tags" multiple clearable collapse-tags style="width:100%">
            <el-option v-for="t in tagList" :key="t.id" :label="t.name" :value="t.id" />
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
        <el-form-item label="描述">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="请输入漫画描述" />
        </el-form-item>
        <el-form-item label="连载状态">
          <el-switch v-model="dialogForm.serialization_status" active-text="连载中" inactive-text="已完结" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="dialogForm.shelf_status" active-text="上架" inactive-text="下架" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="dialogForm.is_vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币">
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

    <!-- 漫画预览弹窗 (简化版，仅展示章节页列表) -->
    <el-dialog v-model="previewVisible" title="漫画预览" width="780px">
      <div class="preview-chapter-pages">
        <h3 v-if="currentPreviewManga.title">{{ currentPreviewManga.title }} - 预览</h3>
        <div v-for="chapter in currentPreviewManga.chapters" :key="chapter.id" class="chapter-preview">
          <h4>{{ chapter.title }} ({{ chapter.pages.length }}页)</h4>
          <div class="page-list">
            <img v-for="page in chapter.pages" :key="page.url" :src="page.url" style="max-width:200px;max-height:160px;margin:4px;border-radius:7px; object-fit: cover;" />
          </div>
        </div>
        <div v-if="!currentPreviewManga.chapters || currentPreviewManga.chapters.length === 0">
          暂无章节内容可预览。
        </div>
      </div>
    </el-dialog>

    <!-- 章节管理弹窗 (MangaChapterManageDialog.vue) -->
    <MangaChapterManageDialog
      v-if="chapterManageDialogVisible"
      :manga-id="currentMangaForChapterManage?.id"
      :manga-title="currentMangaForChapterManage?.title || ''"
      @close="chapterManageDialogVisible = false; onSearch();"
    />

    <!-- 章节图片预览 (新增部分) -->
    <div v-if="currentPreviewManga.chapters && currentPreviewManga.chapters.length > 0" style="margin-top: 20px;">
      <h4>章节图片预览</h4>
      <div v-for="chapter in currentPreviewManga.chapters" :key="chapter.id" style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="flex: 1; font-weight: 500;">{{ chapter.title }}</span>
          <el-button size="mini" @click="loadChapterImages(chapter.id, currentPreviewManga.id)">预览图片</el-button>
        </div>
        <div v-if="chapterImages[chapter.id] && chapterImages[chapter.id].length > 0" style="display: flex; flex-wrap: wrap; gap: 8px;">
          <img v-for="url in chapterImages[chapter.id]" :key="url" :src="url" style="max-width: 180px; margin: 5px; border-radius: 6px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useComicCategoryStore } from '@/store/modules/comicCategory.store'
import { useComicTagsStore } from '@/store/modules/comicTags.store'
import { useComicMangaStore } from '@/store/modules/comicManga.store'
import { storeToRefs } from 'pinia'
import MangaChapterManageDialog from '@/views/comic-manage/components/MangaChapterManageDialog.vue'

// Pinia store
const categoryStore = useComicCategoryStore()
const tagStore = useComicTagsStore()
const mangaStore = useComicMangaStore()
const { mainCategories, subCategories } = storeToRefs(categoryStore)
const { tags } = storeToRefs(tagStore)
const { mangaList, total: mangaTotal, loading: mangaLoading } = storeToRefs(mangaStore)

// ======================= 状态变量 =======================

const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  // 已移除 authorIdZZ
  mainCategoryId: '',
  subCategoryId: '',
  tag: '',
  serializationStatus: '', // 连载状态 (1:连载中, 0:已完结)
  shelfStatus: '',         // 上架状态 (1:上架, 0:已下架)
});

// 表格多选
const selectedRows = ref<any[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref<'add'|'edit'>('add');
const dialogForm = ref<any>({
  id: null,
  title: '',              // 对应后端 name
  description: '',        // 对应后端 intro
  cover_url: '',          // 对应后端 cover
  main_category_id: '',   // 对应后端 category_id
  sub_category_id: '',    // 对应后端 sub_category_id
  tags: [],              // 对应后端 tags (逗号分隔字符串)
  is_vip: false,         // 对应后端 is_vip (0/1)
  coin: 0,               // 对应后端 coin
  views: 0,
  likes: 0,
  collects: 0,
  serialization_status: 1, // 对应后端 is_serializing
  shelf_status: 1,       // 对应后端 is_shelf
  sort: 0,
  status: 1,
  remark: '',
  cover_file_list: [],   // 仅前端用
});
const dialogLoading = ref(false); // 弹窗内保存按钮的加载状态
const totalChapterCount = computed(() =>
  mangaList.value.reduce((sum, item) => sum + (item.chapter_count || 0), 0)
)
// 预览弹窗
const previewVisible = ref(false);
const currentPreviewManga = ref<any>({}); // 当前预览的漫画数据，包含章节和页面

// 章节管理弹窗
const chapterManageDialogVisible = ref(false);
const currentMangaForChapterManage = ref<any>(null); // 当前操作章节管理的漫画

// 下拉列表数据 (从漫画分类和标签 Store 获取)
// 已移除 authorList
const mainCategoryList = computed(() => mainCategories.value)
const subCategoryList = computed(() => subCategories.value)
const tagList = computed(() => tags.value)

// 选中的主分类下的子分类
const filteredSubCategoryList = computed(() => {
  if (!dialogForm.value.main_category_id) return subCategoryList.value
  return subCategoryList.value.filter(item => item.parent_id === dialogForm.value.main_category_id)
})

// ======================= 生命周期 & 初始化 =======================

onMounted(async () => {
  await categoryStore.fetchCategories()
  await tagStore.fetchTags()
  await mangaStore.fetchMangaList(searchForm.value)
});
watch([() => searchForm.value.page, () => searchForm.value.pageSize], () => {
  onSearch()
})
// ======================= 数据获取与列表操作 =======================

/**
 * 获取漫画列表
 */
async function fetchMangaList() {
  await mangaStore.fetchMangaList(searchForm.value)
}

/**
 * 搜索按钮点击
 */
function onSearch(resetPage = false) {
  if (resetPage) searchForm.value.page = 1
  const searchParams = {
    page: searchForm.value.page,
    pageSize: searchForm.value.pageSize,
    keyword: searchForm.value.keyword,
    category_id: searchForm.value.mainCategoryId,
    sub_category_id: searchForm.value.subCategoryId,
    tag: searchForm.value.tag,
    is_serializing: searchForm.value.serializationStatus,
    is_shelf: searchForm.value.shelfStatus,
  }
  mangaStore.fetchMangaList(searchParams)
}

/**
 * 重置按钮点击
 */
function onReset() {
  searchForm.value = {
    page: 1,
    pageSize: 10,
    keyword: '',
    // 已移除 authorId
    mainCategoryId: '',
    subCategoryId: '',
    tag: '',
    serializationStatus: '',
    shelfStatus: '',
  };
  onSearch(true);
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
    return ElMessage.warning('请先勾选要删除的漫画专辑');
  }
  const ids = selectedRows.value.map(row => row.id);
  try {
    await mangaStore.batchDeleteManga(ids);
    ElMessage.success('批量删除成功');
    selectedRows.value = [];
    onSearch();
  } catch (err: any) {
    ElMessage.error(err?.message || '批量删除失败');
  }
}

/**
 * 批量设置连载状态
 */
async function onBatchSetSerializationStatus() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选漫画专辑');
  }
  ElMessageBox.confirm('请选择要设置的连载状态', '批量设置连载状态', {
    confirmButtonText: '连载中',
    cancelButtonText: '已完结',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    await mangaStore.batchSetSerializationStatus(ids, 1);
    ElMessage.success('批量设置为连载中成功');
    selectedRows.value = [];
    onSearch();
  }).catch(async (action) => {
    if (action === 'cancel') {
      await ElMessageBox.confirm('确定批量设置已完结吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        await mangaStore.batchSetSerializationStatus(ids, 0);
        ElMessage.success('批量设置为已完结成功');
        selectedRows.value = [];
        onSearch();
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置上架/下架状态
 */
async function onBatchSetShelfStatus() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选漫画专辑');
  }
  ElMessageBox.confirm('请选择要设置的上架状态', '批量设置上架状态', {
    confirmButtonText: '上架',
    cancelButtonText: '下架',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    await mangaStore.batchSetShelfStatus(ids, 1);
    ElMessage.success('批量设置上架成功');
    selectedRows.value = [];
    onSearch();
  }).catch(async (action) => {
    if (action === 'cancel') {
      await ElMessageBox.confirm('确定批量设置下架吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        await mangaStore.batchSetShelfStatus(ids, 0);
        ElMessage.success('批量设置下架成功');
        selectedRows.value = [];
        onSearch();
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置VIP
 */
async function onBatchSetVip() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选漫画专辑');
  }
  ElMessageBox.confirm('确定批量设置为VIP吗？', '批量设置VIP', {
    confirmButtonText: '设为VIP',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    await mangaStore.batchSetVip(ids, 1);
    for (const mangaId of ids) {
      await mangaStore.setAllChaptersVipByMangaId(mangaId, 1);
    }
    ElMessage.success('批量设置VIP成功');
    selectedRows.value = [];
    onSearch();
  }).catch(() => {
    ElMessage.info('已取消设置VIP');
  });
}

/**
 * 批量设置金币
 */
async function onBatchSetCoin() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选漫画专辑');
  }
  ElMessageBox.prompt('请输入要设置的金币数量', '批量设置金币', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '金币数量必须是数字'
  }).then(async ({ value }) => {
    const coin = parseInt(value);
    if (isNaN(coin) || coin < 0) {
      return ElMessage.error('金币数量无效');
    }
    const ids = selectedRows.value.map(row => row.id);
    await mangaStore.batchSetCoin(ids, coin);
    for (const mangaId of ids) {
      await mangaStore.setAllChaptersCoinByMangaId(mangaId, coin);
    }
    ElMessage.success('批量设置金币成功');
    selectedRows.value = [];
    onSearch();
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
    id: null,
    title: '',
    description: '',
    cover_url: '',
    main_category_id: '',
    sub_category_id: '',
    tags: [],
    is_vip: false,
    coin: 0,
    serialization_status: 1,
    shelf_status: 1,
    sort: 0,
    status: 1,
    remark: '',
    cover_file_list: [],
  };
  dialogVisible.value = true;
}

/**
 * 打开编辑弹窗
 */
async function onEdit(row: any) {
  dialogType.value = 'edit';
  const res = await mangaStore.fetchMangaDetail(row.id);
  if (res) {
    const mangaDetail = res;
    dialogForm.value = {
      id: mangaDetail.id,
      title: mangaDetail.name,                    // 后端name -> 前端title
      description: mangaDetail.intro,             // 后端intro -> 前端description  
      cover_url: mangaDetail.cover,               // 后端cover -> 前端cover_url
      main_category_id: mangaDetail.category_id,  // 后端category_id -> 前端main_category_id
      sub_category_id: mangaDetail.sub_category_id,
      tags: mangaDetail.tags ? Array.isArray(mangaDetail.tags) ? mangaDetail.tags : (mangaDetail.tags || '').split(',')
 : [], // 字符串转数组
      is_vip: mangaDetail.is_vip === 1,           // 数字转布尔
      coin: mangaDetail.coin || 0,
      views: mangaDetail.views ?? 0,
  likes: mangaDetail.likes ?? 0,
  collects: mangaDetail.collects ?? 0,
      serialization_status: mangaDetail.is_serializing, // 后端is_serializing -> 前端serialization_status
      shelf_status: mangaDetail.is_shelf,         // 后端is_shelf -> 前端shelf_status
      sort: mangaDetail.sort || 0,
      status: mangaDetail.status || 1,
      remark: mangaDetail.remark || '',
      cover_file_list: mangaDetail.cover ? [{ url: mangaDetail.cover, name: '封面', uid: Date.now() }] : [],
    };
    dialogVisible.value = true;
  } else {
    ElMessage.error('获取漫画详情失败');
  }
}

/**
 * 提交新增/编辑表单
 */
async function submitDialog() {
  if (!dialogForm.value.title || !dialogForm.value.main_category_id) {
    return ElMessage.error('标题、主分类为必填项');
  }

  dialogLoading.value = true;
  try {
    // 构建提交数据 - 字段映射到后端格式
    const submitData = {
      id: dialogForm.value.id,
      name: dialogForm.value.title,                    // 前端title -> 后端name
      intro: dialogForm.value.description,             // 前端description -> 后端intro
      cover: dialogForm.value.cover_url,               // 前端cover_url -> 后端cover
      category_id: dialogForm.value.main_category_id,  // 前端main_category_id -> 后端category_id
      sub_category_id: dialogForm.value.sub_category_id,
      tags: Array.isArray(dialogForm.value.tags) ? dialogForm.value.tags.join(',') : '', // 数组转字符串
      is_vip: dialogForm.value.is_vip ? 1 : 0,         // 布尔转数字
      coin: dialogForm.value.coin || 0,
       views: dialogForm.value.views || 0,
  likes: dialogForm.value.likes || 0,
  collects: dialogForm.value.collects || 0,
      is_serializing: dialogForm.value.serialization_status, // 前端serialization_status -> 后端is_serializing
      is_shelf: dialogForm.value.shelf_status,         // 前端shelf_status -> 后端is_shelf
      sort: dialogForm.value.sort || 0,
      status: dialogForm.value.status || 1,
      remark: dialogForm.value.remark || '',
    };
    
    let res;
    if (dialogType.value === 'add') {
      res = await mangaStore.addManga(submitData);
    } else {
      res = await mangaStore.updateManga(submitData);
    }
    console.log('store返回的完整结果:', res);

    // 只要没报错就认为成功
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
    dialogVisible.value = false;
    onSearch();
  } catch (error) {
    console.error('提交异常:', error);
    ElMessage.error('提交失败');
  } finally {
    dialogLoading.value = false;
  }
}

/**
 * 预览漫画
 */
async function onPreview(row: any) {
  const chapters = await mangaStore.fetchChapters(row.id)
  if (Array.isArray(chapters)) {
    currentPreviewManga.value = {
      title: row.name,  // ✅ 改为 row.name，不是 row.title
      chapters: chapters || []
    }
    previewVisible.value = true
  }
}

/**
 * 删除漫画
 */
async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除漫画专辑 "${row.name}" 吗？`, '警告', { type: 'warning' }); // ✅ 改为 row.name
  const res = await mangaStore.deleteManga(row.id);
  if (res && res.code == 0) {  // 改这里：=== 改成 ==
    ElMessage.success('删除成功');
    onSearch();
  } else {
    ElMessage.error(res?.msg || '删除失败');
  }
}

/**
 * 打开章节管理弹窗
 */
function onManageChapters(row: any) {
  currentMangaForChapterManage.value = {
    id: row.id,
    title: row.name  // ✅ 改为 row.name
  };
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

// 新增：漫画章节图片加载
const images = ref<string[]>([])

// 用对象存储每个章节的图片
const chapterImages = ref<Record<number, string[]>>({})

async function loadChapterImages(chapterId: number, mangaId: number) {
  chapterImages.value[chapterId] = await mangaStore.fetchChapterImages(mangaId, chapterId)
}

// 添加这些方法到 script 中
function getCategoryName(categoryId: number) {
  const category = mainCategoryList.value.find(item => item.id === categoryId)
  return category ? category.name : '未知分类'
}

function getSubCategoryName(subCategoryId: number) {
  const subCategory = subCategoryList.value.find(item => item.id === subCategoryId)
  return subCategory ? subCategory.name : '无子分类'
}

// 获取标签名称数组
function getTagNames(tags: string) {
  if (!tags) return []
  
  // 将字符串分割成ID数组
  let tagIds = tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
  
  // 将ID映射为标签名称
  return tagIds.map(id => {
    const tag = tagList.value.find(t => t.id === id)
    return tag ? tag.name : `ID:${id}` // 找不到标签时显示ID
  })
}

// 保留原有的 getTagsArray 方法（其它地方可能还在用）
function getTagsArray(tags: string) {
  if (!tags) return []
  return tags.split(',').filter(tag => tag.trim())
}
</script>

<style scoped>
.comic-manage-page { padding: 18px; }
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
.preview-chapter-pages {
  max-height: 70vh; /* 控制预览区域高度 */
  overflow-y: auto;
  padding-right: 10px; /* 防止滚动条遮挡内容 */
}
.preview-chapter-pages h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}
.chapter-preview {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}
.chapter-preview h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #555;
  font-size: 16px;
}
.page-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
