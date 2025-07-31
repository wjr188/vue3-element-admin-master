<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="80%"
    top="5vh"
    destroy-on-close
    @close="emit('close')"
  >
    <div class="chapter-manage-container">
      <!-- 顶部操作区 -->
      <div class="header-actions">
        <el-button type="success" @click="openAddChapterDialog"> + 添加章节</el-button>
        <el-button type="danger" @click="onBatchDeleteChapters" :disabled="selectedChapters.length === 0">批量删除</el-button>
        <el-button type="primary" @click="saveChapterSort" :loading="saveSortLoading">保存章节排序</el-button>
        <el-button type="info" @click="onBatchSetFree" :disabled="selectedChapters.length === 0">设为免费</el-button>
      </div>

      <!-- 调试信息 -->
      <div class="debug-info">
        <p>漫画ID: {{ props.mangaId }}</p>
        <p>数据条数: {{ chapterList.length }} / 总数: {{ chapterTotal }}</p>
        <p>当前页: {{ chapterCurrentPage }} / 每页: {{ chapterPageSize }}</p>
        <el-button size="small" @click="console.log('chapterList:', chapterList)">打印数据</el-button>
      </div>

      <!-- 章节列表 - 使用计算属性 -->
      <el-table
        :data="chapterList"
        v-loading="chapterLoading"
        row-key="id"
        border
        stripe
        class="custom-table"
        style="width: 100%; margin-top: 15px;"
        @selection-change="onSelectionChange"
        ref="chapterTable"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="#ID" width="60" align="center" />
        <el-table-column prop="title" label="章节标题" min-width="150" align="left" />
        <el-table-column prop="order_num" label="章节序号" width="90" align="center" />
        <el-table-column prop="is_vip" label="VIP" width="60" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_vip" type="warning">VIP</el-tag>
            <span v-else>免费</span>
          </template>
        </el-table-column>
        <el-table-column prop="coin" label="金币" width="70" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.coin && scope.row.coin > 0" type="warning">{{ scope.row.coin }}</el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="140" align="center" />
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditChapterDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="onPreviewChapter(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="onDeleteChapter(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 章节分页 - 修复绑定方式 -->
      <el-pagination
        v-model:current-page="chapterCurrentPage"
        v-model:page-size="chapterPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="chapterTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <!-- 添加/编辑章节弹窗 -->
    <el-dialog v-model="chapterDialogVisible" :title="currentChapterForm.id ? '编辑章节' : '添加章节'" width="680px">
      <el-form :model="currentChapterForm" label-width="90px" size="small">
        <el-form-item label="章节标题" required>
          <el-input v-model="currentChapterForm.title" placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="章节序号" required>
          <el-input-number v-model="currentChapterForm.order_num" :min="1" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitChapterForm" :loading="chapterDialogLoading">
            {{ currentChapterForm.id ? '保存' : '确定' }}
          </el-button>
          <el-button @click="chapterDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 章节页面预览弹窗 -->
    <el-dialog v-model="chapterPreviewVisible" :title="currentPreviewChapter.title + ' - 页面预览'" width="780px">
      <div class="chapter-page-preview-list">
        <img v-for="page in currentPreviewChapter.pages" :key="page.url" :src="page.url" style="max-width:220px;max-height:180px;margin:4px;border-radius:7px; object-fit: cover;" />
        <div v-if="!currentPreviewChapter.pages || currentPreviewChapter.pages.length === 0">
          本章节暂无页面内容。
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useComicMangaStore } from '@/store/modules/comicManga.store'
import service from '@/utils/request' // 添加这行导入

const props = defineProps<{
  mangaId: number | null;
  mangaTitle: string;
}>()

const emit = defineEmits(['close'])

// ---------------- 章节全部走pinia store ------------------
const comicMangaStore = useComicMangaStore()

// 响应式章节数据都只从store里取
const chapterList = computed(() => comicMangaStore.chapterList)
const chapterTotal = ref(0)
const chapterLoading = computed(() => comicMangaStore.chapterLoading)

// 分页本地管理
const chapterCurrentPage = ref(1)
const chapterPageSize = ref(10)

watch(() => props.mangaId, async (newId) => {
  if (newId) {
    await fetchChapters()
  } else {
    comicMangaStore.chapterList = []
    chapterTotal.value = 0
  }
}, { immediate: true })

async function fetchChapters() {
  const res = await comicMangaStore.fetchChapters(props.mangaId, { page: chapterCurrentPage.value, pageSize: chapterPageSize.value })
  if (res && typeof res.total === 'number') {
    chapterTotal.value = res.total
  } else if (Array.isArray(res) && res.length) {
    chapterTotal.value = res.length
  } else {
    chapterTotal.value = 0
  }
}

// 其余 state 不动
const dialogVisible = ref(true)
const selectedChapters = ref<any[]>([])
const saveSortLoading = ref(false)
const chapterDialogVisible = ref(false)
const chapterDialogLoading = ref(false)
const currentChapterForm = ref<any>({
  id: null,
  manga_id: props.mangaId,
  title: '',
  order_num: 1,
})
const chapterPreviewVisible = ref(false)
const currentPreviewChapter = ref<any>({})
const dialogTitle = computed(() => `《${props.mangaTitle}》章节管理`)

// 分页事件
function handleSizeChange(val: number) {
  chapterPageSize.value = val
  chapterCurrentPage.value = 1
  fetchChapters()
}
function handleCurrentChange(val: number) {
  chapterCurrentPage.value = val
  fetchChapters()
}
function onSelectionChange(rows: any[]) {
  selectedChapters.value = rows
}

function openAddChapterDialog() {
  currentChapterForm.value = {
    id: null,
    manga_id: props.mangaId,
    title: '',
    order_num: (chapterList.value.length > 0 ? Math.max(...chapterList.value.map(c => c.order_num)) : 0) + 1,
  };
  chapterDialogVisible.value = true;
}

async function openEditChapterDialog(chapter: any) {
  try {
    const res = await comicMangaStore.fetchChapterDetail(chapter.id); // ✅ 使用 Store
    if (res) {
      currentChapterForm.value = { ...res };
      chapterDialogVisible.value = true;
    } else {
      ElMessage.error('获取章节详情失败');
    }
  } catch (error) {
    console.error('获取章节详情请求失败:', error);
    ElMessage.error('获取章节详情请求失败');
  }
}

async function submitChapterForm() {
  if (!currentChapterForm.value.title || !currentChapterForm.value.order_num) {
    return ElMessage.error('章节标题和序号为必填项');
  }
  chapterDialogLoading.value = true;
  try {
    const submitData = {
      ...currentChapterForm.value,
      manga_id: props.mangaId,
    };
    let res;
    if (currentChapterForm.value.id) {
      res = await comicMangaStore.updateChapter(submitData);
    } else {
      res = await comicMangaStore.addChapter(submitData);
    }
    
    console.log('提交章节表单返回结果:', res); // 添加调试日志
    
    // 简化判断逻辑 - 如果没有抛出异常就认为成功
    ElMessage.success(currentChapterForm.value.id ? '章节保存成功' : '章节添加成功');
    chapterDialogVisible.value = false;
    fetchChapters();
  } catch (error) {
    console.error('提交章节表单请求失败:', error);
    ElMessage.error('请求失败，请检查网络或后端服务');
  } finally {
    chapterDialogLoading.value = false;
  }
}

async function onDeleteChapter(chapter: any) {
  await ElMessageBox.confirm(`确定删除章节 "${chapter.title}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    try {
      const res = await comicMangaStore.deleteChapter(chapter.id);
      console.log('删除章节返回结果:', res); // 添加调试日志
      
      // 简化判断逻辑 - 如果没有抛出异常就认为成功
      ElMessage.success('章节删除成功');
      fetchChapters();
    } catch (error) {
      console.error('删除章节请求失败:', error);
      ElMessage.error('删除章节失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onBatchDeleteChapters() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选要删除的章节');
  }
  await ElMessageBox.confirm('确定批量删除已选章节吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      const ids = selectedChapters.value.map(c => c.id);
      const res = await comicMangaStore.batchDeleteChapter(ids);
      console.log('批量删除章节返回结果:', res); // 添加调试日志
      
      // 简化判断逻辑 - 如果没有抛出异常就认为成功
      ElMessage.success('批量删除章节成功');
      selectedChapters.value = [];
      fetchChapters();
    } catch (error) {
      console.error('批量删除章节请求失败:', error);
      ElMessage.error('批量删除章节失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

async function saveChapterSort() {
  if (!chapterList.value.length) {
    ElMessage.info('没有章节需要保存排序');
    return;
  }
  
  saveSortLoading.value = true;
  try {
    const updatedSortList = chapterList.value.map((chapter, index) => ({
      id: chapter.id,
      order_num: index + 1
    }));
    
    const res = await comicMangaStore.batchUpdateSort(updatedSortList);
    console.log('保存章节排序返回结果:', res); // 添加调试日志
    
    // 简化判断逻辑 - 如果没有抛出异常就认为成功
    ElMessage.success('章节排序保存成功！');
    fetchChapters();
  } catch (error) {
    console.error('保存章节排序请求失败:', error);
    ElMessage.error('保存章节排序失败');
  } finally {
    saveSortLoading.value = false;
  }
}

async function onBatchSetFree() {
  if (selectedChapters.value.length === 0) {
    return ElMessage.warning('请先勾选要设置为免费的章节');
  }
  try {
    const ids = selectedChapters.value.map(c => c.id);
    await comicMangaStore.batchSetChapterFree(ids);
    ElMessage.success('设置免费成功');
    fetchChapters();
  } catch (error) {
    ElMessage.error('设置免费失败');
  }
}
</script>

<style scoped>
.chapter-manage-container {
  padding: 20px;
}
.header-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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
.chapter-page-preview-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

/* 调试信息样式 */
.debug-info {
  margin: 15px 0;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #d1e8ff;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info p {
  margin: 5px 0;
}

/* 无数据提示 */
.no-data-message {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}
</style>