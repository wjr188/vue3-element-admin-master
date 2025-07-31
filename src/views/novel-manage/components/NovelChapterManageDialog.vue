<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="85%"
    top="3vh"
    destroy-on-close
    @close="emit('close')"
  >
    <div class="chapter-manage-container">
      <!-- 顶部操作区 -->
      <div class="header-actions">
        <el-button type="success" @click="openAddChapterDialog"> + 添加章节</el-button>
        <el-button type="danger" @click="onBatchDeleteChapters" :disabled="selectedChapters.length === 0">批量删除</el-button>
        <el-button type="primary" @click="saveChapterSort" :loading="saveSortLoading">保存章节排序</el-button>
         <!-- 新增设为免费按钮 -->
        <el-button
          type="warning"
          :disabled="selectedChapters.length === 0"
          @click="onBatchSetFree"
          style="margin-left: 10px;"
        >
          设为免费
        </el-button>
      </div>

      <!-- 章节列表 -->
      <el-table
        :data="chapterList"
        v-loading="chapterLoading"
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
        <el-table-column prop="chapter_order" label="章节序号" width="90" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.chapter_order" :min="1" size="small" @change="markChapterSortChanged(scope.row)"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column prop="word_count" label="字数" width="80" align="center" />
       <el-table-column prop="is_vip" label="是否VIP" width="80" align="center">
  <template #default="scope">
    <el-tag :type="scope.row.is_vip ? 'warning' : 'info'" size="small">{{ scope.row.is_vip ? 'VIP' : '普通' }}</el-tag>
  </template>
</el-table-column>

<el-table-column prop="coin" label="所需金币" width="80" align="center" />

        <el-table-column prop="publish_time" label="发布时间" width="120" align="center" />
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditChapterDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="onPreviewChapter(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="onDeleteChapter(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 章节分页 (如果章节很多的话) -->
      <el-pagination
        v-model:current-page="chapterCurrentPage"
        v-model:page-size="chapterPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="chapterTotal"
        @size-change="fetchChapters"
        @current-change="fetchChapters"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <!-- 添加/编辑章节弹窗 -->
    <el-dialog v-model="chapterDialogVisible" :title="currentChapterForm.id ? '编辑章节' : '添加章节'" width="80%" top="5vh">
      <el-form :model="currentChapterForm" label-width="90px" size="small">
        <el-form-item label="章节标题" required>
          <el-input v-model="currentChapterForm.title" placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="章节序号" required>
          <el-input-number v-model="currentChapterForm.chapter_order" :min="1" />
        </el-form-item>
        <el-form-item label="章节内容" required>
          <!-- 富文本编辑器 -->
          <div ref="editorRef" style="height: 300px; border: 1px solid #ccc;"></div>
        </el-form-item>
        <el-form-item label="是否VIP">
  <el-switch v-model="currentChapterForm.is_vip" active-text="是" inactive-text="否" :active-value="1" :inactive-value="0" />
</el-form-item>
<el-form-item label="所需金币" v-if="currentChapterForm.is_vip">
  <el-input-number v-model="currentChapterForm.coin" :min="0" />
</el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitChapterForm" :loading="chapterDialogLoading">
            {{ currentChapterForm.id ? '保存' : '确定' }}
          </el-button>
          <el-button @click="chapterDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 章节内容预览弹窗 -->
    <el-dialog v-model="chapterPreviewVisible" :title="currentPreviewChapter.title + ' - 内容预览'" width="700px">
      <div class="chapter-content-display" v-html="currentPreviewChapter.content || '暂无内容'"></div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import service from '@/utils/request'; // 假设你的请求工具在这里
import Quill from 'quill'; // 导入 Quill
import 'quill/dist/quill.snow.css'; // Quill 的样式

// 导入文字小说章节 Store
import {
  chapterList,
  chapterTotal,
  chapterLoading,
  fetchNovelChapters,
  fetchNovelChapterDetail,
  addNovelChapter,
  updateNovelChapter,
  deleteNovelChapter,
  batchDeleteNovelChapters,
  batchUpdateNovelChapterOrder,
  setFree,
} from '@/store/modules/text-novel-chapter.store';

// Define received props
const props = defineProps<{
  novelId: number | null;
  novelTitle: string;
}>();

// Define component events
const emit = defineEmits(['close']);

const dialogVisible = ref(true); // Control main dialog display
const dialogTitle = computed(() => `《${props.novelTitle}》章节管理`);

// Chapter list related
const selectedChapters = ref<any[]>([]); // Chapter multi-selection
const chapterSortChangedIds = ref<Set<number>>(new Set()); // Record chapter sort changes

// Chapter pagination
const chapterCurrentPage = ref(1);
const chapterPageSize = ref(10);

// Add/Edit chapter dialog
const chapterDialogVisible = ref(false);
const chapterDialogLoading = ref(false);
const currentChapterForm = ref<any>({
  id: null,
  novel_id: props.novelId, // Associated novel ID
  title: '',
  chapter_order: 1,
  content: '', // Chapter content
  is_paid: 0, // Default to free
  coin_required: 0,
});

// Rich text editor instance
const editorRef = ref<HTMLElement | null>(null);
let quillEditor: Quill | null = null;

// Chapter content preview
const chapterPreviewVisible = ref(false);
const currentPreviewChapter = ref<any>({});


// Watch for novelId changes to reload chapters
watch(() => props.novelId, (newNovelId) => {
  if (newNovelId) {
    fetchChapters();
  } else {
    chapterList.value = [];
    chapterTotal.value = 0;
  }
}, { immediate: true }); // Execute immediately on component mount

// Watch for chapter dialog display, initialize/set rich text editor
watch(chapterDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (editorRef.value && !quillEditor) {
        quillEditor = new Quill(editorRef.value, {
          theme: 'snow',
          placeholder: '在这里编写章节内容...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'], // toggled buttons
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }], // custom button values
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }], // superscript/subscript
              [{ 'indent': '-1'}, { 'indent': '+1' }], // outdent/indent
              [{ 'direction': 'rtl' }], // text direction
              [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['clean'] // remove formatting button
            ]
          }
        });
        // Listen for text changes, synchronize to currentChapterForm.content
        quillEditor.on('text-change', () => {
          currentChapterForm.value.content = quillEditor?.root.innerHTML || '';
        });
      }
      // Set editor content
      if (quillEditor) {
        quillEditor.root.innerHTML = currentChapterForm.value.content || '';
      }
    });
  } else {
    // When the dialog closes, optionally destroy Quill instance to prevent memory leaks
    // if (quillEditor) {
    //   quillEditor.destroy();
    //   quillEditor = null;
    // }
  }
});


// ======================= Chapter List Operations =======================

/**
 * Fetch chapter list
 */
async function fetchChapters() {
  if (!props.novelId) return;

  const params = {
    novelId: props.novelId,
    page: chapterCurrentPage.value,
    pageSize: chapterPageSize.value,
  };

  const res = await fetchNovelChapters(params);
  if (res?.code === 0 && res?.data) {
    chapterList.value = res.data.list.map(item => ({
      ...item,
      is_vip: item.is_vip ?? 0,  // 对应后端字段
      coin: item.coin ?? 0,       // 对应后端字段
    }));
    chapterTotal.value = res.data.total || 0;
  } else {
    ElMessage.error(res?.msg || '获取小说章节失败');
  }
  chapterSortChangedIds.value.clear();
}

/**
 * Handle chapter multi-selection change
 */
function handleChapterSelectionChange(rows: any[]) {
  selectedChapters.value = rows;
}

/**
 * Open add chapter dialog
 */
function openAddChapterDialog() {
  currentChapterForm.value = {
    id: null,
    novel_id: props.novelId,
    title: '',
    chapter_order: (chapterList.value.length > 0 ? Math.max(...chapterList.value.map(c => c.chapter_order)) : 0) + 1, // Default order is max + 1
    content: '',
    is_paid: 0,
    coin_required: 0,
  };
  chapterDialogVisible.value = true;
  // Clear editor content
  if (quillEditor) {
    quillEditor.root.innerHTML = '';
  }
}

/**
 * Open edit chapter dialog
 */
async function openEditChapterDialog(chapter: any) {
  const res = await fetchNovelChapterDetail(chapter.id);
  if (res && res.code === 0 && res.data) {
    currentChapterForm.value = {
      ...res.data,
      is_vip: res.data.is_vip ?? 0,
      coin: res.data.coin ?? 0,
    };
    chapterDialogVisible.value = true;
    if (quillEditor) {
      quillEditor.root.innerHTML = currentChapterForm.value.content || '';
    }
  } else {
    ElMessage.error(res?.msg || '获取章节详情失败');
  }
}

/**
 * Submit chapter form (add or edit)
 */
async function submitChapterForm() {
  if (!currentChapterForm.value.title || !currentChapterForm.value.chapter_order || !currentChapterForm.value.content) {
    return ElMessage.error('章节标题、序号和内容为必填项');
  }

  chapterDialogLoading.value = true;
  try {
    const submitData = {
      ...currentChapterForm.value,
      novel_id: props.novelId,
      is_vip: currentChapterForm.value.is_vip,
      coin: currentChapterForm.value.coin,
    };

    // 删除不需要的字段
    delete submitData.id;

    let res;
    if (currentChapterForm.value.id) {
      res = await updateNovelChapter(submitData);
    } else {
      res = await addNovelChapter(submitData);
    }

    if (res && res.data.code === 0) {
      ElMessage.success(currentChapterForm.value.id ? '章节保存成功' : '章节添加成功');
      chapterDialogVisible.value = false;
      fetchChapters();
      emit('close');
    } else {
      ElMessage.error(res.data.msg || '章节操作失败');
    }
  } catch (error) {
    console.error('提交章节失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    chapterDialogLoading.value = false;
  }
}

/**
 * Delete chapter
 */
async function onDeleteChapter(chapter: any) {
  await ElMessageBox.confirm(`确定删除章节 “${chapter.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    // Corresponds to backend API /api/text_novel_chapter/delete
    const res = await deleteNovelChapter(chapter.id);
    if (res && res.code === 0) {
      ElMessage.success('章节删除成功');
      fetchChapters();
      emit('close'); // Notify parent component that novel chapter count might be updated
    } else {
      ElMessage.error(res.data.msg || '章节删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

/**
 * Batch delete chapters
 */
async function onBatchDeleteChapters() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的章节');
  }
  await ElMessageBox.confirm('确定批量删除已选章节吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedChapters.value.map(c => c.id);
    // Corresponds to backend API /api/text_novel_chapter/batchDelete
    const res = await batchDeleteNovelChapters(ids);
    if (res && res.data.code === 0) {
      ElMessage.success('批量删除章节成功');
      selectedChapters.value = [];
      fetchChapters();
      emit('close'); // Notify parent component that novel chapter count might be updated
    } else {
      ElMessage.error(res.data.msg || '批量删除章节失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

/**
 * Preview chapter content
 */
async function onPreviewChapter(chapter: any) {
  // To ensure the preview content is the latest, re-fetch chapter details (including content) from the backend
  const res = await fetchNovelChapterDetail(chapter.id);
  if (res && res.code === 0 && res.data) {
    currentPreviewChapter.value = res.data;
    chapterPreviewVisible.value = true;
  } else {
    ElMessage.error(res?.msg || '获取章节内容失败');
  }
}

/**
 * Mark chapter sort order as changed
 */
function markChapterSortChanged(chapter: any) {
  chapterSortChangedIds.value.add(chapter.id);
}

/**
 * Save chapter sort order
 */
const saveSortLoading = ref(false);
async function saveChapterSort() {
  if (chapterSortChangedIds.value.size === 0) {
    ElMessage.info('没有检测到章节排序变更');
    return;
  }
  saveSortLoading.value = true;
  try {
    const updatedSortList = chapterList.value
      .filter(chapter => chapterSortChangedIds.value.has(chapter.id))
      .map(chapter => ({ id: chapter.id, chapter_order: chapter.chapter_order }));

    // Corresponds to backend API /api/text_novel_chapter/batchUpdateOrder
    const res = await batchUpdateNovelChapterOrder(updatedSortList);
    if (res && res.code === 0) {
      ElMessage.success('章节排序保存成功！');
      chapterSortChangedIds.value.clear();
      fetchChapters(); // Re-fetch data to ensure UI synchronizes with latest sort order
    } else {
      ElMessage.error(res?.msg || '章节排序保存失败');
    }
  } catch (error) {
    console.error('Save chapter sort order request failed:', error);
    ElMessage.error('Save chapter sort order request failed');
  } finally {
    saveSortLoading.value = false;
  }
}
// 新增设为免费逻辑
async function onBatchSetFree() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选要设为免费的章节');
  }
  const ids = selectedChapters.value.map(c => c.id);
  try {
    const res = await setFree(ids); // 你之前加的设为免费请求方法
    if (res && res.code === 0) {
      ElMessage.success('设为免费成功');
      fetchChapters();
      selectedChapters.value = [];
    } else {
      ElMessage.error(res?.msg || '设为免费失败');
    }
  } catch (error) {
    console.error('设为免费失败:', error);
    ElMessage.error('设为免费请求失败');
  }
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
.chapter-content-display {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fcfcfc;
  max-height: 50vh;
  overflow-y: auto;
  line-height: 1.8;
  font-size: 15px;
  color: #333;
  word-wrap: break-word; /* Ensure long words break */
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
}
</style>
