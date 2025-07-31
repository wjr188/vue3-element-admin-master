<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="80%"
    top="5vh"
    destroy-on-close
    append-to-body
    @close="emit('close')"
  >
    <div class="chapter-manage-container">
      <!-- 顶部操作区 -->
      <div class="header-actions">
        <el-button type="success" @click="openAddChapterDialog"> + 添加章节</el-button>
        <el-button type="danger" @click="onBatchDeleteChapters" :disabled="selectedChapters.length === 0">批量删除</el-button>
        <el-button type="primary" @click="saveChapterSort" :loading="saveSortLoading">保存章节排序</el-button>
        <el-button type="success" @click="onBatchSetFree" :disabled="selectedChapters.length === 0">批量设为免费</el-button>

      </div>

      <!-- 章节列表 -->
      <el-table
        :data="audioNovelChapterList"
        v-loading="audioNovelChapterLoading"
        row-key="id"
        border
        stripe
        class="custom-table"
        style="width: 100%; margin-top: 15px;"
        @selection-change="handleChapterSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="#ID" width="60" align="center" />
        <el-table-column prop="title" label="章节标题" min-width="180" align="left" />
        <el-table-column prop="chapter_order" label="章节序号" width="100" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.chapter_order" :min="1" size="small" @change="markChapterSortChanged(scope.row)"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="is_vip" label="VIP章节" width="80" align="center">
  <template #default="scope">
    <el-tag :type="scope.row.is_vip === 1 ? 'warning' : 'info'" size="small">
      {{ scope.row.is_vip === 1 ? '是' : '否' }}
    </el-tag>
  </template>
</el-table-column>
<el-table-column prop="coin" label="金币" width="70" align="center">
  <template #default="scope">
    <span>{{ scope.row.coin || 0 }}</span>
  </template>
</el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="120" align="center" />
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditChapterDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="onPreviewChapter(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="onDeleteChapter(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 章节分页 -->
      <el-pagination
        v-model:current-page="chapterCurrentPage"
        v-model:page-size="chapterPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="audioNovelChapterTotal"
        @size-change="fetchChapters"
        @current-change="fetchChapters"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <!-- 添加/编辑章节弹窗 -->
    <el-dialog
  v-model="chapterDialogVisible"
  :title="currentChapterForm.id ? '编辑章节' : '添加章节'"
  width="580px"
  append-to-body
  destroy-on-close
  @close="closeDialog"
>
      <el-form :model="currentChapterForm" label-width="90px" size="small">
        <el-form-item label="章节标题" required>
          <el-input v-model="currentChapterForm.title" placeholder="请输入章节标题" clearable />
        </el-form-item>
        <el-form-item label="章节序号" required>
          <el-input-number v-model="currentChapterForm.chapter_order" :min="1" style="width: 120px;" />
        </el-form-item>
       <el-form-item label="音频文件" required>
  <el-upload
    action="YOUR_UPLOAD_API"
    :file-list="currentChapterForm.audio_file_list"
    :limit="1"
    :on-remove="handleRemoveAudio"
    :on-success="handleAudioUploadSuccess"
    :before-upload="beforeUploadAudio"
    accept=".mp3,.wav,.m4a"
    :show-file-list="false"
  >
    <el-button type="primary" size="small">点击上传</el-button>
  </el-upload>

  <!-- 填写/显示音频链接（可上传、可粘贴） -->
  <el-input
    v-model="currentChapterForm.audio_url"
    placeholder="可填写外链，或上传后自动填充"
    clearable
    style="margin-top: 8px"
  />

  <el-button size="small" style="margin:8px 0 0 8px" @click="handleGetAudioUrlDuration">获取时长</el-button>

  <div v-if="currentChapterForm.audio_url" style="margin: 8px 0 0 0;">
    <span>音频链接：</span>
    <a :href="currentChapterForm.audio_url" target="_blank">{{ getAudioFileName(currentChapterForm.audio_url) }}</a>
  </div>
</el-form-item>


<el-form-item label="音频时长(秒)">
  <el-input-number v-model="currentChapterForm.duration" :min="0" :step="1" style="width:120px" :readonly="durationReadonly" />
  <el-tooltip content="通常上传后自动填充或点按钮获取，可手动修改" placement="top">
    <el-icon><info-filled /></el-icon>
  </el-tooltip>
</el-form-item>
        <el-form-item label="VIP专享">
  <el-switch v-model="currentChapterForm.is_vip" active-text="是" inactive-text="否" :active-value="1" :inactive-value="0" />
</el-form-item>
<el-form-item label="金币">
  <el-input-number v-model="currentChapterForm.coin" :min="0" style="width: 120px;" />
</el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitChapterForm" :loading="chapterDialogLoading">
            {{ currentChapterForm.id ? '保存' : '确定' }}
          </el-button>
          <el-button @click="chapterDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 章节音频预览弹窗 -->
     <el-dialog
      v-model="chapterPreviewVisible"
      :title="currentPreviewChapter.title + ' - 音频预览'"
      width="500px"
      append-to-body
      destroy-on-close
      @close="chapterPreviewVisible = false"
    >
      <div class="audio-preview-section">
        <audio controls :src="fullAudioUrlForPreview" style="width: 100%;"></audio>
        <div v-if="!currentPreviewChapter.audio_url">
          本章节暂无音频内容。
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';

// 1. 引入 Pinia 章节 store
import { useAudioNovelChapterStore } from '@/store/modules/audio-novel-chapter.store';

// 2. 实例化 store
const chapterStore = useAudioNovelChapterStore();

// 3. 组件 props
const props = defineProps<{
  novelId: number | null;
  novelTitle: string;
  audioUrlPrefix: string;
}>();

const emit = defineEmits(['close']);
const durationReadonly = ref(false);

const dialogVisible = ref(true);
const dialogTitle = computed(() => `《${props.novelTitle}》章节管理`);

// 4. 章节列表相关
const selectedChapters = ref<any[]>([]);
const chapterSortChangedIds = ref<Set<number>>(new Set());

// 5. 章节分页
const chapterCurrentPage = ref(1);
const chapterPageSize = ref(10);

// 6. 添加/编辑章节弹窗
const chapterDialogVisible = ref(false);
const chapterDialogLoading = ref(false);
const currentChapterForm = ref<any>({
  id: null,
  novel_id: props.novelId,
  title: '',
  chapter_order: 1,
  audio_url: '',
  audio_file_list: [],
  duration: 0,
  is_vip: 0,
  coin: 0,
});

// 7. 章节音频预览
const chapterPreviewVisible = ref(false);
const currentPreviewChapter = ref<any>({});
const saveSortLoading = ref(false);

// 章节音频预览完整音频URL
const fullAudioUrlForPreview = computed(() => {
  if (!currentPreviewChapter.value.audio_url) return '';
  return (props.audioUrlPrefix || '') + currentPreviewChapter.value.audio_url;
});

// 编辑弹窗音频URL
const fullAudioUrlForForm = computed(() => {
  if (!currentChapterForm.value.audio_url) return '';
  return (props.audioUrlPrefix || '') + currentChapterForm.value.audio_url;
});

// 8. 章节列表/总数/加载状态直接用 store
const audioNovelChapterList = computed(() => Array.isArray(chapterStore.list) ? chapterStore.list : []);
const audioNovelChapterTotal = computed(() => chapterStore.total);
const audioNovelChapterLoading = computed(() => chapterStore.loading);

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

// 监听 novelId 变化来重新加载章节
watch(
  () => props.novelId,
  (newNovelId) => {
    if (newNovelId) {
      fetchChapters();
    } else {
      // 正确清空方式
      chapterStore.list = [];
      chapterStore.total = 0;
    }
  },
  { immediate: true }
);


// ======================= 章节列表操作 =======================

/**
 * 获取章节列表
 */
async function fetchChapters() {
  if (!props.novelId) return;

  chapterSortChangedIds.value.clear(); // 刷新列表前清除排序变更标记

  await chapterStore.fetchList({
    novelId: props.novelId,
    page: chapterCurrentPage.value,
    pageSize: chapterPageSize.value,
  });
}

/**
 * 章节多选变化
 */
function handleChapterSelectionChange(rows: any[]) {
  selectedChapters.value = rows;
}

/**
 * 打开添加章节弹窗
 */
function openAddChapterDialog() {
  currentChapterForm.value = {
    id: null,
    novel_id: props.novelId,
    title: '',
    chapter_order: (audioNovelChapterList.value.length > 0 ? Math.max(...audioNovelChapterList.value.map(c => c.chapter_order)) : 0) + 1, // 默认序号为最大+1
    audio_url: '',
    audio_file_list: [],
    duration: 0,
    is_vip: 0,
    coin: 0,
  };
  chapterDialogVisible.value = true;
}

/**
 * 打开编辑章节弹窗
 */
async function openEditChapterDialog(chapter: any) {
  currentChapterForm.value = {
    ...chapter,
    audio_file_list: chapter.audio_url ? [{ url: (props.audioUrlPrefix || '') + chapter.audio_url, name: chapter.audio_url.substring(chapter.audio_url.lastIndexOf('/') + 1) || chapter.audio_url, uid: Date.now() }] : [],
    is_vip: chapter.is_vip ?? 0,
    coin: chapter.coin ?? 0,
  };
  chapterDialogVisible.value = true;
}

/**
 * 提交章节表单（添加或编辑）
 */
async function submitChapterForm() {
  if (!currentChapterForm.value.title || !currentChapterForm.value.chapter_order) {
    return ElMessage.error('章节标题和序号为必填项');
  }
 if (!currentChapterForm.value.audio_url) {
  return ElMessage.error('请上传音频文件或填写音频链接');
}

  chapterDialogLoading.value = true;
  try {
    const submitData = {
  ...currentChapterForm.value,
  novel_id: props.novelId,
};
delete submitData.audio_file_list;

    let res;
    if (currentChapterForm.value.id) {
      res = await chapterStore.update(submitData);
    } else {
      res = await chapterStore.add(submitData);
    }

    if (res && res.code === 0) {
      ElMessage.success(currentChapterForm.value.id ? '章节保存成功' : '章节添加成功');
      chapterDialogVisible.value = false;
      fetchChapters(); // 刷新章节列表
    } else {
      ElMessage.error(res?.msg || '章节操作失败');
    }
  } catch (error) {
    console.error('提交章节表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    chapterDialogLoading.value = false;
  }
}

/**
 * 删除章节
 */
async function onDeleteChapter(chapter: any) {
  await ElMessageBox.confirm(`确定删除章节 “${chapter.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await chapterStore.remove(chapter.id);
    if (res && res.code === 0) {
      ElMessage.success('章节删除成功');
      fetchChapters();
    } else {
      ElMessage.error(res?.msg || '章节删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

/**
 * 批量删除章节
 */
async function onBatchDeleteChapters() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的章节');
  }
  await ElMessageBox.confirm('确定批量删除已选章节吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedChapters.value.map(c => c.id);
    const res = await chapterStore.batchDelete(ids);
    if (res && res.code === 0) {
      ElMessage.success('批量删除章节成功');
      selectedChapters.value = [];
      fetchChapters();
    } else {
      ElMessage.error(res?.msg || '批量删除章节失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

/**
 * 预览章节音频
 */
function onPreviewChapter(chapter: any) {
  currentPreviewChapter.value = chapter;
  chapterPreviewVisible.value = true;
}

/**
 * 标记章节排序已修改
 */
function markChapterSortChanged(chapter: any) {
  chapterSortChangedIds.value.add(chapter.id);
}

/**
 * 保存章节排序
 */
async function saveChapterSort() {
  if (chapterSortChangedIds.value.size === 0) {
    ElMessage.info('没有检测到章节排序变更');
    return;
  }
  saveSortLoading.value = true;
  try {
    // 过滤出所有被修改过的章节，并提取其ID和新的排序值
    const updatedSortList = audioNovelChapterList.value
      .filter(chapter => chapterSortChangedIds.value.has(chapter.id))
      .map(chapter => ({ id: chapter.id, chapter_order: chapter.chapter_order }));

    const res = await chapterStore.batchUpdateOrder(updatedSortList);
    if (res && res.code === 0) {
      ElMessage.success('章节排序保存成功！');
      chapterSortChangedIds.value.clear(); // 清空变更记录
      fetchChapters(); // 重新获取数据以确保UI同步最新排序
    } else {
      ElMessage.error(res?.msg || '章节排序保存失败');
    }
  } catch (error) {
    console.error('保存章节排序请求失败:', error);
    ElMessage.error('保存章节排序请求失败');
  } finally {
    saveSortLoading.value = false;
  }
}
async function onBatchSetFree() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选章节');
  }
  const ids = selectedChapters.value.map(c => c.id);
  const res = await chapterStore.setChaptersFree(ids);
  if (res && res.code === 0) {
    ElMessage.success('批量设为免费成功');
    fetchChapters();
    selectedChapters.value = [];
  } else {
    ElMessage.error(res?.msg || '操作失败');
  }
}

// ======================= 音频文件上传 =======================

function handleRemoveAudio(file: any, fileList: any) {
  currentChapterForm.value.audio_file_list = [];
  currentChapterForm.value.audio_url = '';
  currentChapterForm.value.duration = 0;
}

function handleAudioUploadSuccess(response: any, file: any, fileList: any) {
  if (response && response.code === 0 && response.data && response.data.url) {
    currentChapterForm.value.audio_url = response.data.url; // 假设后端返回相对路径
    currentChapterForm.value.duration = response.data.duration || 0; // 假设后端返回音频时长
    // 确保 fileList 只有一张图片
    currentChapterForm.value.audio_file_list = [{ url: (props.audioUrlPrefix || '') + response.data.url, name: file.name, uid: file.uid }];
    ElMessage.success('音频上传成功！');
  } else {
    ElMessage.error('音频上传失败：' + (response?.msg || '未知错误'));
    currentChapterForm.value.audio_file_list = []; // 清空，防止显示错误文件
  }
}

function beforeUploadAudio(file: File) {
  const isAudio = file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.type === 'audio/mp4'; // mp3/wav/m4a
  const isLt50M = file.size / 1024 / 1024 < 50;

  if (!isAudio) {
    ElMessage.error('上传音频只能是 MP3/WAV/M4A 格式!');
  }
  if (!isLt50M) {
    ElMessage.error('上传音频文件大小不能超过 50MB!');
  }
  return isAudio && isLt50M;
}

// 关闭弹窗时，清空表单和多选
function closeDialog() {
  chapterDialogVisible.value = false;
  currentChapterForm.value = {
    id: null,
    novel_id: props.novelId,
    title: '',
    chapter_order: 1,
    audio_url: '',
    audio_file_list: [],
    duration: 0,
    is_vip: 0,
    coin: 0,
  };
  selectedChapters.value = [];
}
function getAudioFileName(url: string) {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1) || url;
}
function handleGetAudioUrlDuration() {
  const url = currentChapterForm.value.audio_url;
  if (!url) {
    ElMessage.warning('请上传或填写音频链接');
    return;
  }
  const audio = new Audio();
  audio.src = url;
  audio.addEventListener('loadedmetadata', () => {
    currentChapterForm.value.duration = Math.floor(audio.duration);
    durationReadonly.value = true;
    ElMessage.success('已获取音频时长');
  });
  audio.addEventListener('error', () => {
    durationReadonly.value = false;
    ElMessage.error('音频地址无效，无法获取时长');
  });
}

</script>

<style scoped>
.chapter-manage-container {
  padding: 20px;
}
.header-actions {
  margin-bottom: 20px;
}
.custom-table {
  font-size: 12px;
  border-radius: 9px;
}
.el-table th, .el-table td {
  border-right: 1px solid #ebeef5 !important;
  padding: 0 2px !important;
}
.el-table th:last-child, .el-table td:last-child {
  border-right: none !important;
}
.el-table {
  border-radius: 9px;
  overflow: hidden;
}
.audio-preview-section {
  padding: 10px;
  text-align: center;
}
/* 调整 el-upload 样式 */
.el-upload {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: auto;
  height: auto;
  line-height: normal;
  border: none;
}
.el-upload__tip {
  margin-left: 10px;
  line-height: 1.5;
  color: #909399;
  font-size: 12px;
}
.el-upload-list {
  margin-top: 10px;
}
.el-upload-list__item {
  width: 100%; /* Make list item take full width */
  height: auto; /* Adjust height based on content */
  margin-top: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
