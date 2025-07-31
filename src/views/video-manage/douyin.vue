<template>
  <div class="douyin-manage-page">
    <el-card shadow="always" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/标签" clearable />
        </el-form-item>
        <el-form-item label="主分类">
          <el-select
            v-model="searchForm.parent_id"
            placeholder="全部主分类"
            clearable
            style="width: 120px;"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in douyinCategoryParents"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select
            v-model="searchForm.category_id"
            placeholder="全部子分类"
            clearable
            style="width: 120px;"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in subCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="searchForm.tags"
            placeholder="全部标签"
            multiple
            clearable
            collapse-tags
            style="width: 130px;"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="tag in douyinTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加视频</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchSortAsc" size="small" :disabled="selectedRows.length === 0">升序置顶</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchPreviewTime" size="small" :disabled="selectedRows.length === 0">批量设置试看时长</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetGold" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="always" class="table-card">
      <el-table
        :data="douyinVideos"
        v-loading="douyinVideoLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        header-cell-class-name="header-cell"
        cell-class-name="body-cell"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column prop="id" label="#编号" width="56" align="center" />
        <el-table-column prop="cover" label="封面" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.cover" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover"/>
            <div v-else style="width:52px; height:52px; background-color:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="92" align="center">
          <template #default="scope">
            <el-tooltip
              effect="dark"
              :content="scope.row.title"
              placement="top"
              :visible="visibleTitleIndex === scope.$index"
              popper-class="title-tooltip"
              @hide="hideTitle"
            >
              <span
                class="title-cell"
                @click.stop="showTitle(scope.$index)"
                :title="scope.row.title"
              >
                {{ scope.row.title }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="68" align="center">
          <template #default="scope">
            <el-tag
              v-for="tag in scope.row.tags"
              :key="tag"
              size="small"
              type="danger"
              style="margin-right: 2px;"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="主分类" min-width="60" align="center" />
        <el-table-column prop="categoryName" label="子分类" min-width="70" align="center" />
        <el-table-column prop="preview" label="试看" min-width="44" align="center">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.preview }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vip" label="VIP" min-width="35" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.vip" type="warning" size="small">VIP</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coin" label="金币" min-width="44" align="center">
          <template #default="scope">
            <el-tag type="warning" size="small">{{ scope.row.coin }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="44" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="play" label="播放" min-width="60" align="center" />
        <el-table-column prop="collect" label="收藏" min-width="55" align="center" />
        <el-table-column prop="upload_time" label="上传" min-width="90" align="center" />
        <el-table-column label="操作" fixed="right" width="122" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="warning" @click="onEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="onCopyLink(scope.row)">复制链接</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
        <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="douyinVideoTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      title="添加新视频"
      width="460px"
      @close="onAddDialogClose"
    >
      <el-form :model="addForm" label-width="82px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="addForm.title" placeholder="请输入视频标题" clearable />
        </el-form-item>
        <el-form-item label="主分类" required>
          <el-select
            v-model="addForm.parent_id"
            placeholder="请选择主分类"
            style="width:100%"
            @change="onParentChange"
          >
            <el-option
              v-for="item in douyinCategoryParents"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" required>
          <el-select v-model="addForm.category_id" placeholder="请选择子分类" style="width:100%">
            <el-option
              v-for="item in addSubCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="addForm.tags"
            multiple
            clearable
            collapse-tags
            placeholder="请选择标签"
            style="width:100%"
          >
            <el-option
              v-for="tag in douyinTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="视频URL地址" required>
          <el-input v-model="addForm.url" placeholder="请输入视频URL地址" clearable />
        </el-form-item>
        <el-form-item label="封面图地址">
          <el-input v-model="addForm.cover" placeholder="图片URL地址" clearable />
        </el-form-item>
        <el-form-item label="试看时长">
          <el-input v-model="addForm.preview" placeholder="如15秒、30秒" clearable />
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="addForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币">
          <el-input-number v-model="addForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAdd">确定</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="batchGoldDialogVisible" title="批量设置金币" width="350px">
      <el-form>
        <el-form-item label="金币数量">
          <el-input-number v-model="batchGoldValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchGoldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchGold">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑视频"
      width="700px"
      @close="onEditDialogClose"
    >
      <el-form :model="editForm" label-width="82px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" clearable />
        </el-form-item>
        <el-form-item label="主分类" required>
          <el-select
            v-model="editForm.parent_id"
            style="width:100%"
            @change="onEditParentChange"
          >
            <el-option
              v-for="item in douyinCategoryParents"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" required>
          <el-select v-model="editForm.category_id" style="width:100%">
            <el-option
              v-for="item in editSubCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editForm.tags"
            multiple
            clearable
            collapse-tags
            style="width:100%"
          >
            <el-option
              v-for="tag in douyinTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="视频URL地址" required>
          <div style="display: flex; width: 100%; align-items: center;">
            <el-input v-model="editForm.url" clearable style="flex: 1; margin-right: 10px;" />
            <el-upload
              class="upload-demo"
              action="http://localhost:8000/api/upload/video"
              :show-file-list="false"
              :on-success="handleVideoUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeVideoUpload"
              accept="video/mp4,video/webm,video/quicktime,application/x-mpegURL,application/octet-stream"
            >
              <el-button type="primary" size="small">上传视频</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="封面图地址">
          <div style="display: flex; width: 100%; align-items: center;">
            <el-input v-model="editForm.cover" placeholder="图片URL地址" clearable style="flex: 1; margin-right: 10px;" />
            <el-upload
              class="upload-demo"
              action="/api/upload/image"
              :show-file-list="false"
              :on-success="handleImageUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeImageUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <el-button type="primary" size="small">上传封面</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="封面预览">
          <img :src="editForm.cover" style="width:100px;border-radius:6px;" v-if="editForm.cover" />
        </el-form-item>
        <el-form-item label="试看时长">
          <el-input v-model="editForm.preview" clearable />
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="editForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币">
          <el-input-number v-model="editForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEdit">保存</el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'

// 导入抖音分类 Store (用于主分类/子分类下拉框)
import { douyinCategoryParents, douyinCategoryChildren, fetchCategoryList as fetchDouyinCategories } from '@/store/modules/douyin-category.store'

// 导入抖音视频 Store (用于视频数据和操作)
import {
  douyinVideos,
  douyinVideoTotal,
  douyinVideoLoading,
  fetchVideoList,
  addVideo,
  updateVideo,
  deleteVideo, // Keep this for single delete, as the batch delete is handled by batchDeleteVideos
  batchDeleteVideos,
  batchSetVip,
  batchSetDuration,
  batchSetGold,
  fetchVideoDetail,
  batchSortAsc
} from '@/store/modules/douyin-video.store'


// 导入抖音标签 Store (用于标签下拉框)
import { douyinTags, fetchTagList as fetchDouyinTags } from '@/store/modules/douyin-tag.store'

// 类型定义 (可以根据实际后端返回的字段调整)
interface VideoRow {
  id: number
  title: string
  tags: string[]
  parent_id: number // 对应主分类ID
  category_id: number // 对应子分类ID
  m3u8?: string
  cover?: string
  preview: string // 试看时长
  vip: boolean // 后端可能存 0/1，前端展示布尔
  coin: number
  status: string // 后端可能存 0/1，前端展示文字
  play: number
  collect: number
  upload_time: string // 上传时间
  // 其他可能字段：duration, like, comment_count 等
  parentName?: string // 方便前端显示
  categoryName?: string // 方便前端显示
  url?: string; // 视频URL地址，优先使用 (此行是你原始代码中已存在的)
  is_vip?: number; // 后端返回的 is_vip 字段
  gold?: number; // 后端返回的 gold 字段
}

// ======================= 初始化加载数据 =======================
onMounted(() => {
  // 同时加载视频列表、分类列表和标签列表
  fetchVideoList(searchForm.value)
  fetchDouyinCategories()
  fetchDouyinTags()
})

// ===================== 筛选/搜索表单 =====================
const searchForm = ref({
  page: 1, // 当前页
  pageSize: 10, // 每页数量
  keyword: '',
  parent_id: '',
  category_id: '',
  tags: [] as number[] // Changed to number[] to match tag.id type if tags are stored by ID
})

// 计算属性，用于子分类下拉框选项 (根据选中的主分类过滤)
const subCategoryOptions = computed(() => {
  if (!searchForm.value.parent_id) return douyinCategoryChildren.value // 如果没有选择主分类，显示所有子分类
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(searchForm.value.parent_id))
})

// `allTags` 变为直接从 `douyinTags` Store 获取的标签名称数组
// 这里假设 douyinTags 是 [{id: ..., name: '...'}] 的格式
const allTags = computed(() => {
  return douyinTags.value.map((tag: any) => tag.name)
})

// `tableData` 已移除，直接使用 `douyinVideos` (来自 Store)

// ===================== 表格操作 =====================
const selectedRows = ref<VideoRow[]>([])

function handleSelectionChange(rows: VideoRow[]) {
  selectedRows.value = rows
}

// 批量删除
async function onBatchDelete() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频');
  }
  await ElMessageBox.confirm('确定批量删除已选视频吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(v => v.id);
    const res = await batchDeleteVideos(ids); // 调用 Store 函数，注意这里是 batchDeleteVideos
    if (res && res.code === 0) { // 检查 code 属性
      ElMessage.success('批量删除成功');
      selectedRows.value = []; // 清空选中
      fetchVideoList(searchForm.value); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '批量删除失败'); // 错误消息来自后端或兜底
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}


// 批量设置金币弹窗
const batchGoldDialogVisible = ref(false)
const batchGoldValue = ref(0)

function onBatchSetGold() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频');
  }
  batchGoldDialogVisible.value = true;
}

async function submitBatchGold() {
  if (batchGoldValue.value < 0) {
    return ElMessage.warning('金币数量不能小于0');
  }
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSetGold(ids, batchGoldValue.value); // 调用 Store 函数
  if (res && res.code === 0) { // 检查 code 属性
    ElMessage.success('金币设置成功！');
    batchGoldDialogVisible.value = false;
    selectedRows.value = [];
    fetchVideoList(searchForm.value); // 刷新列表
  } else {
    ElMessage.error(res?.msg || '金币设置失败'); // 错误消息来自后端或兜底
  }
}

// 批量设置VIP
async function onBatchVip() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要操作的视频');
  }
  await ElMessageBox.confirm('确定批量设置已选视频为VIP吗？', '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(v => v.id);
    const res = await batchSetVip(ids, true); // 调用 Store 函数，设为VIP
    if (res && res.code === 0) { // 检查 code 属性
      ElMessage.success('批量设置VIP成功！');
      selectedRows.value = [];
      fetchVideoList(searchForm.value); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '批量设置VIP失败'); // 错误消息来自后端或兜底
    }
  }).catch(() => {
    ElMessage.info('已取消设置VIP');
  });
}
// 批量升序置顶
async function onBatchSortAsc() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要置顶排序的视频');
  }
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSortAsc(ids); // 调用 Store 方法
  if (res && res.code === 0) {
    ElMessage.success('批量升序置顶成功！');
    selectedRows.value = [];
    searchForm.value.page = 1;
    await nextTick();
    fetchVideoList({ ...searchForm.value });
  } else {
    ElMessage.error(res?.msg || '批量升序置顶失败');
  }
}

// 批量设置试看时长
async function onBatchPreviewTime() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要操作的视频');
  }
  ElMessageBox.prompt('请输入要批量设置的试看时长(如：15秒、30秒)', '批量设置试看时长', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+(秒|分钟|小时)$/, // 简单的时长格式校验
    inputErrorMessage: '时长格式不正确，如：15秒，30分钟'
  }).then(async ({ value }) => {
    const ids = selectedRows.value.map(v => v.id);
    const res = await batchSetDuration(ids, value); // 调用 Store 函数
    if (res && res.code === 0) { // 检查 code 属性
      ElMessage.success('试看时长设置成功！');
      selectedRows.value = [];
      fetchVideoList({ ...searchForm.value, page: 1, order: 'sort asc, id asc' });
    } else {
      ElMessage.error(res?.msg || '试看时长设置失败！'); // 错误消息来自后端或兜底
    }
  }).catch(() => {
    ElMessage.info('已取消设置试看时长');
  });
}


// =================== 添加视频弹窗 ====================
const addDialogVisible = ref(false)
const addForm = ref({
  title: '',
  parent_id: '',
  category_id: '',
  tags: [] as string[],
  url: '',
  cover: '',
  preview: '15秒',
  vip: false,
  coin: 0
})

const addSubCategoryOptions = computed(() => {
  if (!addForm.value.parent_id) return []
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(addForm.value.parent_id))
})

function onParentChange() {
  addForm.value.category_id = '' // 主分类改变时清空子分类
}

function onAdd() {
  addDialogVisible.value = true
  // 重置表单
  Object.assign(addForm.value, {
    title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover: '', preview: '15秒', vip: false, coin: 0
  })
}
function onAddDialogClose() {
  // 关闭弹窗时重置表单（确保再次打开是干净的）
  Object.assign(addForm.value, {
    title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover: '', preview: '15秒', vip: false, coin: 0
  })
}
async function submitAdd() {
  if (
    !addForm.value.title ||
    !addForm.value.parent_id ||
    !addForm.value.category_id ||
    !addForm.value.url
  ) {
    ElMessage.error('请填写完整的标题、主分类、子分类、视频URL地址');
    return;
  }

  // 数据转换：vip (boolean -> 0/1), coin -> gold
  const submitData = {
    ...addForm.value,
    is_vip: addForm.value.vip ? 1 : 0,
    gold: addForm.value.coin,
    tags: addForm.value.tags
  };
  // 移除前端特有字段
  delete (submitData as any).vip;
  delete (submitData as any).coin;

  const res = await addVideo(submitData); // 调用 Store 函数
  if (res && res.code === 0) { // 检查 code 属性
    ElMessage.success('添加成功');
    addDialogVisible.value = false;
    fetchVideoList(searchForm.value); // 刷新列表
  } else {
    ElMessage.error(res?.msg || '添加失败'); // 错误消息来自后端或兜底
  }
}

// =================== 编辑视频弹窗 ====================
const editDialogVisible = ref(false)
const editForm = ref({
  id: null as number | null,
  title: '',
  parent_id: '',
  category_id: '',
  tags: [] as string[],
  url: '',
  cover: '',
  preview: '',
  vip: false,
  coin: 0
})

const editSubCategoryOptions = computed(() => {
  if (!editForm.value.parent_id) return []
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(editForm.value.parent_id))
})

function onEditParentChange() {
  editForm.value.category_id = '' // 主分类改变时清空子分类
}
function onEditDialogClose() {
  // 关闭弹窗时重置表单
  Object.assign(editForm.value, {
    id: null, title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover: '', preview: '', vip: false, coin: 0
  });
}

async function onEdit(row: VideoRow) {
  const detailData = await fetchVideoDetail(row.id); // detailData 已经是后端返回的 data 对象

  if (detailData) {
    // 填充表单，注意后端返回的 is_vip 和 gold 需要转换为前端的 vip 和 coin
    Object.assign(editForm.value, {
      ...detailData, // 直接使用 detailData
      vip: detailData.is_vip === 1, // 后端 0/1 转前端 boolean
      coin: detailData.gold,        // 后端 gold 转前端 coin
      tags: detailData.tags || [],  // 确保标签是数组
      url: detailData.url || ''      // 确保 url 字段正确映射
    });
    editDialogVisible.value = true;
  } else {
    ElMessage.error('获取视频详情失败: 未返回有效数据');
  }
}

async function submitEdit() {
  if (
    !editForm.value.title ||
    !editForm.value.parent_id ||
    !editForm.value.category_id ||
    !editForm.value.url
  ) {
    ElMessage.error('请填写完整的标题、主分类、子分类、视频URL地址');
    return;
  }
  if (!editForm.value.id) { // 编辑时ID必须存在
      ElMessage.error('编辑失败：视频ID不存在');
      return;
  }

  // 数据转换：vip (boolean -> 0/1), coin -> gold
  const submitData = {
    ...editForm.value,
    is_vip: editForm.value.vip ? 1 : 0,
    gold: editForm.value.coin,
    tags: editForm.value.tags
  };
  // 移除前端特有字段
  delete (submitData as any).vip;
  delete (submitData as any).coin;
  // 确保ID在提交数据中
  (submitData as any).id = editForm.value.id;

  const res = await updateVideo(submitData); // 调用 Store 函数
  if (res && res.code === 0) { // 检查 code 属性
    ElMessage.success('保存成功');
    editDialogVisible.value = false;
    fetchVideoList(searchForm.value); // 刷新列表
  } else {
    ElMessage.error(res?.msg || '保存失败'); // 错误消息来自后端或兜底
  }
}

// ========== 单条视频删除 ==========
// The single delete function `onDelete` was present in the script but not referenced in the template.
// I'm keeping it for completeness, assuming it might be used elsewhere or was meant to be added to an individual row action.
async function onDelete(row: VideoRow) {
  await ElMessageBox.confirm(`确定删除视频 “${row.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteVideo([row.id]); // Modified to accept array for consistency, assuming backend deleteVideo can handle single ID in array
    if (res && res.code === 0) { // 检查 code 属性
      ElMessage.success('删除成功');
      fetchVideoList(searchForm.value); // 刷新列表
    } else {
      ElMessage.error(res?.msg || '删除失败'); // Error message from backend or fallback
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// ============== 搜索/重置 ==============
function onSearch(page) {
  if (typeof page === 'number') {
    searchForm.value.page = page;
  } else {
    searchForm.value.page = 1;
  }
  fetchVideoList(searchForm.value);
}


function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', parent_id: '', category_id: '', tags: [] };
  fetchVideoList(searchForm.value); // 重置后重新加载数据
}

// ========== 复制链接 ==========
function onCopyLink(row: VideoRow) {
  const linkToCopy = row.url || row.m3u8; // 优先复制 url，其次 m3u8

  if (!linkToCopy) {
    ElMessage.warning('没有视频链接可复制');
    return;
  }

  // 使用现代 Clipboard API
  navigator.clipboard.writeText(linkToCopy)
    .then(() => {
      ElMessage.success('链接已复制');
    })
    .catch(err => {
      // 兼容性处理或 fallback 到旧方法 (如 document.execCommand('copy'))
      console.error('复制失败：', err);
      ElMessage.error('复制链接失败');
    });
}

// ========== 标题 tooltip 控制 ==========
const visibleTitleIndex = ref<number | null>(null)
function showTitle(index: number) {
  visibleTitleIndex.value = index
}
function hideTitle() {
  visibleTitleIndex.value = null
}

// ======================= 文件上传逻辑 =======================
// 图片上传成功回调
const handleImageUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 0 && response.data && response.data.url) {
    editForm.value.cover = response.data.url; // 将返回的URL设置到封面图地址
    ElMessage.success('封面图上传成功！');
  } else {
    ElMessage.error(response.msg || '封面图上传失败！');
  }
};

// 视频上传成功回调
const handleVideoUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 0 && response.data && response.data.url) {
    editForm.value.url = response.data.url; // 将返回的URL设置到视频URL地址
    ElMessage.success('视频上传成功！');
  } else {
    ElMessage.error(response.msg || '视频上传失败！');
  }
};

// 上传失败回调（图片和视频通用）
const handleUploadError: UploadProps['onError'] = (error, uploadFile, uploadFiles) => {
  ElMessage.error('文件上传失败，请重试！');
  console.error('Upload Error:', error);
};

// 上传前校验（图片）
const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isAllowedType = allowedTypes.includes(rawFile.type);
  const isLt5M = rawFile.size / 1024 / 1024 < 5; // 5MB

  if (!isAllowedType) {
    ElMessage.error('封面图片只能是 JPG/PNG/GIF/WEBP 格式!');
  }
  if (!isLt5M) {
    ElMessage.error('封面图片大小不能超过 5MB!');
  }
  return isAllowedType && isLt5M;
};

// 上传前校验（视频）
const beforeVideoUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'application/x-mpegURL', 'application/octet-stream'];
  const isAllowedType = allowedTypes.includes(rawFile.type);
  const isLt500M = rawFile.size / 1024 / 1024 < 500; // 500MB

  if (!isAllowedType) {
    ElMessage.error('视频文件只能是 MP4/WEBM/MOV/M3U8 格式!');
  }
  if (!isLt500M) {
    ElMessage.error('视频文件大小不能超过 500MB!');
  }
  return isAllowedType && isLt500M;
};

</script>

<style scoped>
.douyin-manage-page {
  padding: 18px;
}
.search-card,
.table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
  border: 1px solid #ebeef5;
}
.search-form {
  padding: 7px 2px 0 2px;
}
.el-form-item {
  margin-right: 7px;
  margin-bottom: 15px; /* 调整表单项间距 */
}
.custom-table {
  font-size: 12px;
  border-radius: 9px;
}
.header-cell {
  font-weight: 600;
  font-size: 12px !important;
  background: #f6f8fa !important;
  color: #333 !important;
  border-bottom: 1.1px solid #ebeef5 !important;
  padding: 6px 0;
}
.body-cell {
  font-size: 12px;
  color: #222;
  border-bottom: 1px solid #ebeef5 !important;
  padding: 4px 0;
}
.el-table th,
.el-table td {
  border-right: 1px solid #ebeef5 !important;
  padding: 0 2px !important;
}
.el-table th:last-child,
.el-table td:last-child {
  border-right: none !important;
}
.el-table {
  border-radius: 9px;
  overflow: hidden;
}
.el-table::before {
  height: 0;
}
.el-card {
  border-radius: 9px;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.02) !important;
}
.el-button {
  border-radius: 5px !important;
  font-size: 11px !important;
  padding: 1px 8px !important;
  min-width: 52px !important;
}
.action-group {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}
.title-cell {
  cursor: pointer;
  display: inline-block;
  max-width: 72px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.title-tooltip {
  font-size: 14px;
  padding: 7px 10px;
  white-space: pre-line;
}
/* 自定义样式，让上传按钮和输入框并排 */
.el-form-item .el-upload {
    margin-left: 10px; /* 调整上传按钮与输入框的间距 */
    display: inline-flex; /* 确保按钮也参与flex布局 */
    align-items: center;
}
</style>