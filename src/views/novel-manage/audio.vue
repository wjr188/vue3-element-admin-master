<template>
  <div class="audio-novel-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/演播人/作者/标签" clearable />
        </el-form-item>
        <el-form-item label="演播人">
          <el-select v-model="searchForm.narrator" placeholder="全部演播人" clearable style="width: 120px;">
            <el-option label="全部演播人" value="" />
            <!-- 这里需要一个演播人列表，目前后端和 Store 还没有单独管理演播人，可以根据实际数据动态生成或从其他地方获取 -->
            <el-option v-for="narrator in uniqueNarrators" :key="narrator" :label="narrator" :value="narrator" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="searchForm.author" placeholder="全部作者" clearable style="width: 120px;">
            <el-option label="全部作者" value="" />
            <!-- 这里需要一个作者列表，目前后端和 Store 还没有单独管理作者，可以根据实际数据动态生成或从其他地方获取 -->
            <el-option v-for="author in uniqueAuthors" :key="author" :label="author" :value="author" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 120px;">
            <el-option label="全部分类" value="" />
            <el-option v-for="item in audioNovelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable style="width: 120px;">
            <el-option label="全部标签" value="" />
            <el-option v-for="t in audioNovelTags" :key="t.id" :label="t.name" :value="t.name" />
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
        <el-form-item label="可见性">
          <el-select v-model="searchForm.visibility" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="可见" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加有声小说</el-button>
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
          <el-button type="info" @click="onBatchSetVisibility" size="small" :disabled="selectedRows.length === 0">批量设置可见性</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetVipFree" size="small" :disabled="selectedRows.length === 0">批量设置VIP免费</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetCoinPerChapter" size="small" :disabled="selectedRows.length === 0">批量设置每集金币</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onBatchSetNarrator" size="small" :disabled="selectedRows.length === 0">批量设置演播人</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="audioNovelList"
        v-loading="audioNovelLoading"
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
        <el-table-column prop="narrator" label="演播人" min-width="80" align="center" />
        <el-table-column prop="author" label="作者" min-width="80" align="center" />
        <el-table-column prop="category_name" label="分类" min-width="90" align="center" />
        <el-table-column prop="tags" label="标签" min-width="100" align="center">
          <template #default="scope">
            <el-tag v-for="t in scope.row.tags" :key="t" size="small" type="danger" style="margin:1px;">{{ t }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chapter_count" label="集数" width="60" align="center" />
        <el-table-column prop="total_duration" label="总时长" width="80" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.total_duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="serialization_status" label="连载状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.serialization_status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.serialization_status === 1 ? '连载中' : '已完结' }}
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
            <el-tag :type="scope.row.visibility === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.visibility === 1 ? '可见' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_vip_free" label="VIP免费" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_vip_free" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coin_per_chapter" label="每集金币" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.coin_per_chapter && scope.row.coin_per_chapter > 0" type="warning" size="small">{{ scope.row.coin_per_chapter }}</el-tag>
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
        :total="audioNovelTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 添加/编辑有声小说弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加有声小说':'编辑有声小说'" width="680px">
      <el-form :model="dialogForm" label-width="90px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="dialogForm.title" placeholder="请输入有声小说标题" clearable />
        </el-form-item>
        <el-form-item label="演播人" required>
          <el-input v-model="dialogForm.narrator" placeholder="请输入演播人名称" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="dialogForm.author" placeholder="请输入作者名称（可选）" clearable />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="dialogForm.category_id" placeholder="请选择分类" style="width:100%">
            <el-option v-for="item in audioNovelMainCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="dialogForm.tags" multiple clearable collapse-tags style="width:100%">
            <el-option v-for="t in audioNovelTags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            action="YOUR_UPLOAD_API_URL" <!-- 请替换为你的实际图片上传 API URL -->
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
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="请输入有声小说描述" />
        </el-form-item>
        <el-form-item label="音频前缀URL">
          <el-input v-model="dialogForm.audio_url_prefix" placeholder="例如: https://yourdomain.com/audios/" clearable />
          <el-tooltip content="用于章节音频URL的公共前缀，方便管理" placement="top">
            <el-icon><info-filled /></el-icon>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="连载状态">
          <el-switch v-model="dialogForm.serialization_status" active-text="连载中" inactive-text="已完结" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="dialogForm.shelf_status" active-text="上架" inactive-text="下架" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-switch v-model="dialogForm.visibility" active-text="可见" inactive-text="隐藏" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="VIP免费">
          <el-switch v-model="dialogForm.is_vip_free" active-text="是" inactive-text="否" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="每集金币">
          <el-input-number v-model="dialogForm.coin_per_chapter" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDialog" :loading="dialogLoading">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 有声小说预览弹窗 (简化版，仅展示基本信息和播放器) -->
    <el-dialog v-model="previewVisible" :title="currentPreviewAudioNovel.title + ' - 预览'" width="780px">
      <div class="audio-novel-preview-content">
        <div class="cover-image">
          <img :src="currentPreviewAudioNovel.cover_url" alt="封面" v-if="currentPreviewAudioNovel.cover_url" />
          <div v-else class="no-cover">无封面</div>
        </div>
        <div class="detail-info">
          <h3>{{ currentPreviewAudioNovel.title }}</h3>
          <p><strong>演播人:</strong> {{ currentPreviewAudioNovel.narrator || '未知' }}</p>
          <p><strong>作者:</strong> {{ currentPreviewAudioNovel.author || '未知' }}</p>
          <p><strong>分类:</strong> {{ currentPreviewAudioNovel.category_name || '未知' }}</p>
          <p><strong>集数:</strong> {{ currentPreviewAudioNovel.chapter_count || 0 }}</p>
          <p><strong>总时长:</strong> {{ formatDuration(currentPreviewAudioNovel.total_duration) }}</p>
          <p><strong>描述:</strong> {{ currentPreviewAudioNovel.description || '暂无描述' }}</p>
          <p><strong>标签:</strong>
            <el-tag v-for="t in currentPreviewAudioNovel.tags" :key="t" size="small" type="danger" style="margin:1px;">{{ t }}</el-tag>
            <span v-if="!currentPreviewAudioNovel.tags || currentPreviewAudioNovel.tags.length === 0">无</span>
          </p>
        </div>
        <!-- 简单的音频播放器，仅播放第一集作为预览 -->
        <div class="audio-player-section" v-if="currentPreviewAudioNovel.chapters && currentPreviewAudioNovel.chapters.length > 0">
          <h4>试听第一集: {{ currentPreviewAudioNovel.chapters[0].title }}</h4>
          <audio controls :src="currentPreviewAudioNovel.chapters[0].full_audio_url" style="width: 100%;"></audio>
        </div>
        <div v-else class="audio-player-section">
          <p>暂无章节内容可试听。</p>
        </div>
      </div>
    </el-dialog>

    <!-- 章节管理弹窗 (AudioNovelChapterManageDialog.vue 组件) -->
    <AudioNovelChapterManageDialog
      v-if="chapterManageDialogVisible"
      :novel-id="currentAudioNovelForChapterManage?.id"
      :novel-title="currentAudioNovelForChapterManage?.title"
      :audio-url-prefix="currentAudioNovelForChapterManage?.audio_url_prefix"
      @close="chapterManageDialogVisible = false; onSearch();"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

// 新 store 引入
import { useAudioNovelStore } from '@/store/modules/audio-novel.store'
import { useAudioNovelCategoryStore } from '@/store/modules/audio-novel-category.store'
import { useAudioNovelTagStore } from '@/store/modules/audio-novel-tag.store'
import { useAudioNovelChapterStore } from '@/store/modules/audio-novel-chapter.store'
import AudioNovelChapterManageDialog from './components/AudioNovelChapterManageDialog.vue'

// 实例化 store
const audioNovelStore = useAudioNovelStore()
const categoryStore = useAudioNovelCategoryStore()
const tagStore = useAudioNovelTagStore()
const chapterStore = useAudioNovelChapterStore()

// 搜索表单
const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  narrator: '',
  author: '',
  categoryId: '',
  tag: '',
  serializationStatus: '',
  shelfStatus: '',
  visibility: '',
})

// 表格多选
const selectedRows = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  title: '',
  narrator: '',
  author: '',
  description: '',
  cover_url: '',
  cover_file_list: [],
  audio_url_prefix: '',
  category_id: '',
  tags: [],
  serialization_status: 1,
  shelf_status: 1,
  visibility: 1,
  is_vip_free: 0,
  coin_per_chapter: 0,
})
const dialogLoading = ref(false)

// 预览弹窗
const previewVisible = ref(false)
const currentPreviewAudioNovel = ref<any>({})

// 章节管理弹窗
const chapterManageDialogVisible = ref(false)
const currentAudioNovelForChapterManage = ref<any>(null)

// 下拉列表
const uniqueNarrators = computed(() => {
  const narrators = new Set<string>()
  audioNovelStore.list.forEach(novel => {
    if (novel.narrator) narrators.add(novel.narrator)
  })
  return Array.from(narrators)
})
const uniqueAuthors = computed(() => {
  const authors = new Set<string>()
  audioNovelStore.list.forEach(novel => {
    if (novel.author) authors.add(novel.author)
  })
  return Array.from(authors)
})
const audioNovelMainCategories = computed(() => categoryStore.mainCategories)
const audioNovelTags = computed(() => tagStore.list)
const audioNovelList = computed(() => audioNovelStore.list)
const audioNovelLoading = computed(() => audioNovelStore.loading)
const audioNovelTotal = computed(() => audioNovelStore.total)

// 生命周期
onMounted(async () => {
  await categoryStore.fetchCategories()
  await tagStore.fetchList() // 注意这里是 fetchList，不是 fetchTags
  await audioNovelStore.fetchList(searchForm.value)
})

// ======================= 格式化函数 =======================
function formatDuration(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

// ======================= 数据获取与列表操作 =======================

/**
 * 获取有声小说列表
 */
async function fetchTableData() {
  await audioNovelStore.fetchList(searchForm.value);
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
    narrator: '',
    author: '',
    categoryId: '',
    tag: '',
    serializationStatus: '',
    shelfStatus: '',
    visibility: '',
  };
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
    return ElMessage.warning('请先勾选要删除的有声小说');
  }
  await ElMessageBox.confirm('确定批量删除已选有声小说吗？此操作将同时删除其所有章节！', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchDelete(ids);
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = [];
      fetchTableData();
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
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.confirm('请选择要设置的连载状态', '批量设置连载状态', {
    confirmButtonText: '连载中',
    cancelButtonText: '已完结',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "连载中"
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchSetSerializationStatus(ids, 1);
    if (res && res.code === 0) {
      ElMessage.success('批量设置连载中成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "已完结"
      await ElMessageBox.confirm('确定批量设置已选有声小说为已完结状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await audioNovelStore.batchSetSerializationStatus(ids, 0);
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
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.confirm('请选择要设置的上架状态', '批量设置上架状态', {
    confirmButtonText: '上架',
    cancelButtonText: '下架',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "上架"
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchSetShelfStatus(ids, 1);
    if (res && res.code === 0) {
      ElMessage.success('批量设置上架成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "下架"
      await ElMessageBox.confirm('确定批量设置已选有声小说为下架状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await audioNovelStore.batchSetShelfStatus(ids, 0);
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
    } else {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置可见性
 */
async function onBatchSetVisibility() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.confirm('请选择要设置的可见性', '批量设置可见性', {
    confirmButtonText: '可见',
    cancelButtonText: '隐藏',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "可见"
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchSetVisibility(ids, 1);
    if (res && res.code === 0) {
      ElMessage.success('批量设置可见成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "隐藏"
      await ElMessageBox.confirm('确定批量设置已选有声小说为隐藏状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await audioNovelStore.batchSetVisibility(ids, 0);
        if (res && res.code === 0) {
          ElMessage.success('批量设置隐藏成功');
          selectedRows.value = [];
          fetchTableData();
        } else {
          ElMessage.error(res?.msg || '批量设置失败');
        }
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置VIP免费
 */
async function onBatchSetVipFree() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.confirm('请选择是否设置VIP免费', '批量设置VIP免费', {
    confirmButtonText: '设置为VIP免费',
    cancelButtonText: '取消VIP免费',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(async () => { // 用户选择 "设置为VIP免费"
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchSetVipFree(ids, 1);
    if (res && res.code === 0) {
      ElMessage.success('批量设置VIP免费成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置失败');
    }
  }).catch(async (action) => {
    if (action === 'cancel') { // 用户选择 "取消VIP免费"
      await ElMessageBox.confirm('确定批量取消已选有声小说的VIP免费状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await audioNovelStore.batchSetVipFree(ids, 0);
        if (res && res.code === 0) {
          ElMessage.success('批量取消VIP免费成功');
          selectedRows.value = [];
          fetchTableData();
        } else {
          ElMessage.error(res?.msg || '批量设置失败');
        }
      }).catch(() => {
        ElMessage.info('已取消设置');
      });
    } else {
      ElMessage.info('已取消设置');
    }
  });
}

/**
 * 批量设置每集金币
 */
async function onBatchSetCoinPerChapter() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.prompt('请输入要设置的每集金币数量', '批量设置每集金币', {
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
    const res = await audioNovelStore.batchSetCoinPerChapter(ids, coin);
    if (res && res.code === 0) {
      ElMessage.success('批量设置每集金币成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置每集金币失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置金币');
  });
}

/**
 * 批量设置演播人
 */
async function onBatchSetNarrator() {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请先勾选有声小说');
  }
  ElMessageBox.prompt('请输入要设置的演播人名称', '批量设置演播人', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.+$/, // 演播人名称不能为空
    inputErrorMessage: '演播人名称不能为空'
  }).then(async ({ value }) => {
    const narratorName = value;
    const ids = selectedRows.value.map(row => row.id);
    const res = await audioNovelStore.batchSetNarrator(ids, narratorName);
    if (res && res.code === 0) {
      ElMessage.success('批量设置演播人成功');
      selectedRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(res?.msg || '批量设置演播人失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置演播人');
  });
}

// ======================= 单条操作 =======================

/**
 * 打开新增弹窗
 */
function onAdd() {
  dialogType.value = 'add';
  dialogForm.value = {
    id: null, title: '', narrator: '', author: '', description: '', cover_url: '', cover_file_list: [],
    audio_url_prefix: '', category_id: '', tags: [], serialization_status: 1, shelf_status: 1,
    visibility: 1, is_vip_free: 0, coin_per_chapter: 0,
  };
  dialogVisible.value = true;
}

/**
 * 打开编辑弹窗
 */
async function onEdit(row: any) {
  dialogType.value = 'edit';
  try {
    const res = await audioNovelStore.fetchDetail(row.id); // 从 Store 获取详情
    if (res && res.code === 0 && res.data) {
      const novelDetail = res.data;
      dialogForm.value = {
        ...novelDetail,
        // 转换 el-upload 需要的格式
        cover_file_list: novelDetail.cover_url ? [{ url: novelDetail.cover_url, name: '封面', uid: Date.now() }] : [],
        // tags 需要确保是数组
        tags: novelDetail.tags || [],
      };
      dialogVisible.value = true;
    } else {
      ElMessage.error(res?.msg || '获取有声小说详情失败');
    }
  } catch (error) {
    console.error('获取有声小说详情请求失败:', error);
    ElMessage.error('获取有声小说详情请求失败');
  }
}

/**
 * 提交新增/编辑表单
 */
async function submitDialog() {
  if (!dialogForm.value.title || !dialogForm.value.narrator || !dialogForm.value.category_id) {
    return ElMessage.error('标题、演播人、分类为必填项');
  }

  dialogLoading.value = true;
  try {
    const submitData = {
      ...dialogForm.value,
      cover_url: dialogForm.value.cover_file_list.length > 0 ? dialogForm.value.cover_file_list[0].url : '',
    };
    // 清理前端特有字段
    delete submitData.cover_file_list;

    let res;
    if (dialogType.value === 'add') {
      res = await audioNovelStore.add(submitData);
    } else {
      res = await audioNovelStore.update(submitData);
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
 * 预览有声小说
 */
async function onPreview(row: any) {
  // 假设后端有获取有声小说所有章节的接口 /api/audio_novel_chapter/list?novelId={novelId}
  try {
    // 首先获取小说详情，因为其中包含 audio_url_prefix
    const novelDetailRes = await audioNovelStore.fetchDetail(row.id);
    if (!novelDetailRes || novelDetailRes.code !== 0 || !novelDetailRes.data) {
      ElMessage.error(novelDetailRes?.msg || '获取小说详情失败，无法预览');
      return;
    }
    const novel = novelDetailRes.data;

    // 然后获取章节列表
    const chapterRes = await chapterStore.fetchList({ novelId: row.id, page: 1, pageSize: 1 }); // 只取第一集用于预览
    if (chapterRes.code === 0 && chapterRes.data && chapterRes.data.list.length > 0) {
      const firstChapter = chapterRes.data.list[0];
      currentPreviewAudioNovel.value = {
        ...novel,
        chapters: [{
          ...firstChapter,
          // 拼接完整的音频URL
          full_audio_url: (novel.audio_url_prefix || '') + firstChapter.audio_url
        }],
      };
      previewVisible.value = true;
    } else {
      currentPreviewAudioNovel.value = { ...novel, chapters: [] }; // 没有章节也显示基本信息
      previewVisible.value = true;
      ElMessage.info('该有声小说暂无章节可试听。');
    }
  } catch (error) {
    console.error('获取有声小说章节预览失败:', error);
    ElMessage.error('获取有声小说章节预览失败');
  }
}

/**
 * 删除有声小说
 */
async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除有声小说 “${row.title}” 吗？此操作将同时删除其所有章节！`, '警告', { type: 'warning' }).then(async () => {
    const res = await audioNovelStore.remove(row.id) // 这里用 remove
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
async function onManageChapters(row: any) {
  // 确保传递完整的有声小说对象，包括 audio_url_prefix
  currentAudioNovelForChapterManage.value = row;
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
</script>

<style scoped>
.audio-novel-manage-page { padding: 18px; }
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
.audio-novel-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}
.cover-image img {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.cover-image .no-cover {
  width: 180px;
  height: 180px;
  background-color: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
}
.detail-info {
  width: 100%;
  text-align: left;
  padding: 0 20px;
}
.detail-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 20px;
  text-align: center;
}
.detail-info p {
  margin-bottom: 5px;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}
.audio-player-section {
  width: 100%;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  text-align: center;
}
.audio-player-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
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
