<template>
  <div class="longvideo-manage-page">
    <!-- 功能区（筛选+批量操作） -->
    <el-card shadow="always" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <!-- 关键词 -->
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/标签" clearable />
        </el-form-item>
        <!-- 主分类 -->
        <el-form-item label="主分类">
          <el-select
            v-model="searchForm.parent_id"
            placeholder="全部主分类"
            clearable
            style="width: 120px;"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 子分类 -->
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
        <!-- 标签 -->
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
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <!-- 搜索 / 重置 -->
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <!-- 添加视频 -->
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加视频</el-button>
        </el-form-item>
        <!-- 批量设置VIP -->
        <el-form-item>
          <el-button type="warning" @click="onBatchVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
        </el-form-item>
        <!-- 批量删除 -->
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <!-- 批量设置金币 -->
        <el-form-item>
          <el-button type="warning" @click="onBatchSetGold" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
        <!-- 批量取消VIP -->
        <el-form-item>
          <el-button type="info" @click="onBatchCancelVip" size="small" :disabled="selectedRows.length === 0">批量取消VIP</el-button>
        </el-form-item>
        <!-- 批量取消金币 -->
        <el-form-item>
          <el-button type="info" @click="onBatchCancelGold" size="small" :disabled="selectedRows.length === 0">批量取消金币</el-button>
        </el-form-item>
        <!-- 新增：批量设置播放 -->
        <el-form-item>
          <el-button type="success" @click="onBatchSetPlay" size="small" :disabled="selectedRows.length === 0">批量设置播放</el-button>
        </el-form-item>
        <!-- 新增：批量设置收藏 -->
        <el-form-item>
          <el-button type="success" @click="onBatchSetCollect" size="small" :disabled="selectedRows.length === 0">批量设置收藏</el-button>
        </el-form-item>
        <!-- 升序置顶 -->
        <el-form-item>
          <el-button type="primary" size="small" @click="onBatchSortAsc" :disabled="selectedRows.length === 0" style="min-width: 60px;">升序置顶</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card shadow="always" class="table-card">
      <el-table
        :data="videos"
        v-loading="videoLoading"
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
        <el-table-column prop="cover_url" label="封面" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.cover_url" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover_url"/>
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
            <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" type="danger" style="margin-right: 2px;">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="主分类" min-width="60" align="center" />
        <el-table-column prop="categoryName" label="子分类" min-width="70" align="center" />
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
      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="videoTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      ></el-pagination>
    </el-card>

    <!-- 添加视频弹窗 -->
    <el-dialog v-model="addDialogVisible" title="添加新视频" width="460px" @close="onAddDialogClose">
      <el-form :model="addForm" label-width="82px" size="small" ref="addFormRef">
        <el-form-item label="标题" required>
          <el-input v-model="addForm.title" placeholder="请输入视频标题" clearable />
        </el-form-item>
        <el-form-item label="主分类" required>
          <el-select v-model="addForm.parent_id" placeholder="请选择主分类" style="width:100%" @change="onParentChange">
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" required>
          <el-select v-model="addForm.category_id" placeholder="请选择子分类" style="width:100%">
            <el-option v-for="item in addSubCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="addForm.tags" multiple clearable collapse-tags placeholder="请选择标签" style="width:100%">
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频地址" required>
          <el-input v-model="addForm.url" placeholder="视频URL地址" clearable />
        </el-form-item>
        <el-form-item label="封面图地址">
          <el-input v-model="addForm.cover_url" placeholder="图片URL地址" clearable />
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

    <!-- 批量设置金币弹窗 -->
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

    <!-- 批量设置播放弹窗 -->
    <el-dialog v-model="batchPlayDialogVisible" title="批量设置播放数" width="350px">
      <el-form>
        <el-form-item label="播放数量">
          <el-input-number v-model="batchPlayValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchPlayDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchPlay">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置收藏弹窗 -->
    <el-dialog v-model="batchCollectDialogVisible" title="批量设置收藏数" width="350px">
      <el-form>
        <el-form-item label="收藏数量">
          <el-input-number v-model="batchCollectValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCollectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchCollect">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑视频弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑视频" width="480px" @close="onEditDialogClose">
      <el-form :model="editForm" label-width="82px" size="small" ref="editFormRef">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" clearable />
        </el-form-item>
        <el-form-item label="主分类" required>
          <el-select v-model="editForm.parent_id" style="width:100%" @change="onEditParentChange">
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" required>
          <el-select v-model="editForm.category_id" style="width:100%">
            <el-option v-for="item in editSubCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="editForm.tags" multiple clearable collapse-tags style="width:100%">
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频地址" required>
          <el-input v-model="editForm.url" clearable />
        </el-form-item>
        <el-form-item label="封面图地址">
          <el-input v-model="editForm.cover_url" clearable />
        </el-form-item>
        <el-form-item label="封面预览">
          <img :src="editForm.cover_url" style="width:100px;border-radius:6px;" v-if="editForm.cover_url" />
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

    <!-- 排序管理弹窗（还原回原有的内联逻辑） -->
    <el-dialog v-model="sortDialogVisible" title="排序管理" width="480px" @close="onSortDialogClose">
      <el-form>
        <el-form-item label="主分类">
          <el-select v-model="sortParentId" placeholder="请选择主分类" style="width: 100%" @change="onSortParentChange">
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <div v-if="sortChildList.length">
          <el-form-item
            v-for="item in sortChildList"
            :key="item.id"
            :label="item.name"
            style="margin-bottom: 6px"
          >
            <el-input-number
              v-model="item.sort"
              :min="1"
              style="width: 100px"
            />
          </el-form-item>
        </div>
        <div v-else style="text-align:center;color:#aaa;padding:24px 0">请选择主分类</div>
      </el-form>
      <template #footer>
        <el-button @click="sortDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSaveSort">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入长视频 Store
import {
  videos,
  videoTotal,
  videoLoading,
  fetchVideoList,
  addVideo,
  updateVideo,
  batchDeleteVideos,
  batchSetVip,
  batchSetDuration,
  batchSetGold,
  batchSetPlay,     // 新增
  batchSetCollect,  // 新增
  fetchVideoDetail
} from '@/store/modules/long-video.store'

// 导入批量升序置顶API
import { batchSortAsc } from '@/store/modules/long-video.store'
async function onBatchSortAsc() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要置顶排序的视频');
  }
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSortAsc(ids);
  if (res && res.code === 0) {
    ElMessage.success('批量升序置顶成功！');
    selectedRows.value = [];
    searchForm.value.page = 1;
    await fetchVideoList({ ...searchForm.value });
  } else {
    ElMessage.error(res?.msg || '批量升序置顶失败');
  }
}

// 导入长视频分类 Store
import {
  parentCategories,
  childCategories,
  fetchCategoryList,
  batchUpdateSort
} from '@/store/modules/long-video-category.store'

// 导入长视频标签 Store
import {
  tags,
  fetchTagList
} from '@/store/modules/long-video-tag.store'

const route = useRoute()

// 类型定义
interface VideoRow {
  id: number
  title: string
  tags: string[]
  parent_id: number
  category_id: number
  url?: string // <-- 修正为 url 字段
  cover?: string
  preview: string
  vip: boolean
  coin: number
  status: string
  play: number
  collect: number
  upload_time: string
  parentName?: string
  categoryName?: string
  is_vip?: number;
  gold?: number;
}

interface Category {
  id: number;
  name: string;
  parent_id: number;
  sort: number;
  status: number;
  tags?: string[];
  children?: Category[];
}

interface Tag {
  id: number;
  name: string;
  alias?: string;
  group?: string;
  desc?: string;
  status: number;
  count: number;
  sort: number;
  create_time: string;
  update_time: string;
}

// ======================= 初始化加载数据 =======================
onMounted(async () => {
  await Promise.all([
    fetchVideoList(searchForm.value),
    fetchCategoryList(),
    fetchTagList()
  ])
  if (route.query.category_id) {
    searchForm.value.category_id = Number(route.query.category_id)
    onSearch();
  }
})

watch(
  () => route.query.category_id,
  val => {
    if (val) {
      searchForm.value.category_id = Number(val)
    } else {
      searchForm.value.category_id = ''
    }
    onSearch();
  }
)

// ===================== 筛选/搜索表单 =====================
const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  parent_id: '',
  category_id: '',
  tags: [] as string[]
})

const subCategoryOptions = computed(() => {
  if (!searchForm.value.parent_id) return childCategories.value
  return childCategories.value.filter((c: Category) => c.parent_id === Number(searchForm.value.parent_id))
})

const allTags = computed(() => {
  const set = new Set<string>()
  tags.value.forEach((t: Tag) => t.name && set.add(t.name))
  return Array.from(set)
})

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
    const res = await batchDeleteVideos(ids); // 调用 Store 函数
    if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
      ElMessage.success('批量删除成功');
      selectedRows.value = []; // 清空选中
    } else {
      // 这里的 res?.msg 可能为 undefined，因为 request.ts 已统一处理 msg 弹窗
      ElMessage.error('批量删除失败'); 
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
  if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
    ElMessage.success('金币设置成功！');
    batchGoldDialogVisible.value = false;
    selectedRows.value = [];
  } else {
    // ElMessage.error(res?.msg || '金币设置失败');
    ElMessage.error('金币设置失败');
  }
}

// 批量设置播放弹窗
const batchPlayDialogVisible = ref(false)
const batchPlayValue = ref(0)

function onBatchSetPlay() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频');
  }
  batchPlayDialogVisible.value = true;
}

// 批量设置播放弹窗 - 修复版
async function submitBatchPlay() {
  if (batchPlayValue.value < 0) {
    return ElMessage.warning('播放数量不能小于0');
  }
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSetPlay(ids, batchPlayValue.value);
  console.log('【批量设置播放返回】', res);
  
  // 因为 store 成功时返回 null，失败时会抛异常，所以能执行到这里就是成功
  ElMessage.success('播放数设置成功！');
  batchPlayDialogVisible.value = false;
  selectedRows.value = [];
  await fetchVideoList({ ...searchForm.value });
}

// 批量设置收藏弹窗
const batchCollectDialogVisible = ref(false)
const batchCollectValue = ref(0)

function onBatchSetCollect() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频');
  }
  batchCollectDialogVisible.value = true;
}

// 批量设置收藏弹窗 - 修复版
async function submitBatchCollect() {
  if (batchCollectValue.value < 0) {
    return ElMessage.warning('收藏数量不能小于0');
  }
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSetCollect(ids, batchCollectValue.value);
  console.log('【批量设置收藏返回】', res);
  
  // 因为 store 成功时返回 null，失败时会抛异常，所以能执行到这里就是成功
  ElMessage.success('收藏数设置成功！');
  batchCollectDialogVisible.value = false;
  selectedRows.value = [];
  await fetchVideoList({ ...searchForm.value });
}

// 批量设置VIP
async function onBatchVip() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要操作的视频');
  }
  await ElMessageBox.confirm('确定批量设置已选视频为VIP吗？', '提示', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(v => v.id);
    const res = await batchSetVip(ids, true); // 调用 Store 函数，设为VIP
    if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
      ElMessage.success('批量设置VIP成功！');
      selectedRows.value = [];
    } else {
      // ElMessage.error(res?.msg || '批量设置VIP失败');
      ElMessage.error('批量设置VIP失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置VIP');
  });
}

// 批量取消VIP
async function onBatchCancelVip() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的视频');
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSetVip(ids, false); // 设为非VIP
  if (res) {
    ElMessage.success('批量取消VIP成功！');
    selectedRows.value = [];
    await fetchVideoList({ ...searchForm.value });
  } else {
    ElMessage.error('批量取消VIP失败');
  }
}

async function onBatchCancelGold() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的视频');
  const ids = selectedRows.value.map(v => v.id);
  const res = await batchSetGold(ids, 0); // 金币设为0
  if (res) {
    ElMessage.success('批量取消金币成功！');
    selectedRows.value = [];
    await fetchVideoList({ ...searchForm.value });
  } else {
    ElMessage.error('批量取消金币失败');
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
    if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
      ElMessage.success('试看时长设置成功！');
      selectedRows.value = [];
    } else {
      // ElMessage.error(res?.msg || '试看时长设置失败！');
      ElMessage.error('试看时长设置失败！');
    }
  }).catch(() => {
    ElMessage.info('已取消设置试看时长');
  });
}


const addDialogVisible = ref(false)
const addForm = ref({
  title: '',
  parent_id: '',
  category_id: '',
  tags: [] as string[],
  url: '', // <-- 修正为 url
  cover_url: '',
  vip: false,
  coin: 0
})

const addSubCategoryOptions = computed(() => {
  if (!addForm.value.parent_id) return []
  return childCategories.value.filter((c: Category) => c.parent_id === Number(addForm.value.parent_id))
})

function onParentChange() {
  addForm.value.category_id = '' // 主分类改变时清空子分类
}

function onAdd() {
  addDialogVisible.value = true
  // 重置表单
  Object.assign(addForm.value, {
    title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover_url: '', vip: false, coin: 0
  })
}
function onAddDialogClose() {
  // 关闭弹窗时重置表单（确保再次打开是干净的）
  Object.assign(addForm.value, {
    title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover_url: '', vip: false, coin: 0
  });
}
async function submitAdd() {
  if (
    !addForm.value.title ||
    !addForm.value.parent_id ||
    !addForm.value.category_id ||
    !addForm.value.url // <-- 修正为 url
  ) {
    ElMessage.error('请填写完整的标题、主分类、子分类、视频URL地址'); // <-- 提示语同步更新
    return;
  }

  // 数据转换：vip (boolean -> 0/1), coin -> gold
  const submitData = {
    ...addForm.value,
    is_vip: addForm.value.vip ? 1 : 0,
    gold: addForm.value.coin,
    tags: addForm.value.tags // 标签直接是字符串数组
  };
  // 移除前端特有字段
  delete (submitData as any).vip;
  delete (submitData as any).coin;
  // 由于 addForm 现在直接使用 url，无需在这里删除 m3u8

  const res = await addVideo(submitData); // 调用 Store 函数
  if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
    ElMessage.success('添加成功');
    addDialogVisible.value = false;
    // 添加成功后，fetchVideoList 会自动刷新列表
  } else {
    // ElMessage.error(res?.msg || '添加失败');
    ElMessage.error('添加失败');
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
  url: '', // <-- 修正为 url
  cover_url: '',
  vip: false,
  coin: 0
})

const editSubCategoryOptions = computed(() => {
  if (!editForm.value.parent_id) return []
  return childCategories.value.filter((c: Category) => c.parent_id === Number(editForm.value.parent_id))
})

function onEditParentChange() {
  editForm.value.category_id = '' // 主分类改变时清空子分类
}
function onEditDialogClose() {
  // 关闭弹窗时重置表单
  Object.assign(editForm.value, {
    id: null, title: '', parent_id: '', category_id: '', tags: [],
    url: '', cover_url: '', vip: false, coin: 0
  });
}

async function onEdit(row: VideoRow) {
  const res = await fetchVideoDetail(row.id); // 调用 Store 函数获取详情
  // 修正：request.ts 成功时只返回 data，所以 res 直接就是 data
  if (res && typeof res === 'object') { // 确保 res 是一个有效的对象
    // 填充表单，注意后端返回的 is_vip 和 gold 需要转换为前端的 vip 和 coin
    // 并且如果后端返回的是 url 字段，直接赋值给 editForm.url
    Object.assign(editForm.value, {
      ...res, // res 现在直接是后端 data
      vip: res.is_vip === 1, // 后端 0/1 转前端 boolean
      coin: res.gold,        // 后端 gold 转前端 coin
      tags: res.tags || [],  // 确保标签是数组
      // 这里的视频URL，如果后端返回的是 url 就用 url，如果是 m3u8 也用 m3u8 并赋给 url
      url: res.url || res.m3u8 || '' // 优先取 url，其次取 m3u8，最后为空
    });
    editDialogVisible.value = true;
  } else {
    // ElMessage.error(res?.msg || '获取视频详情失败');
    ElMessage.error('获取视频详情失败');
  }
}

async function submitEdit() {
  if (
    !editForm.value.title ||
    !editForm.value.parent_id ||
    !editForm.value.category_id ||
    !editForm.value.url // <-- 修正为 url
  ) {
    ElMessage.error('请填写完整的标题、主分类、子分类、视频URL地址'); // <-- 提示语同步更新
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
    tags: editForm.value.tags // 标签直接是字符串数组
  };
  // 移除前端特有字段
  delete (submitData as any).vip;
  delete (submitData as any).coin;
  // `url` 字段现在直接在 submitData 中了，不需要 m3u8 -> url 转换和删除 m3u8

  const res = await updateVideo(submitData); // 调用 Store 函数
  if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
    ElMessage.success('保存成功');
    editDialogVisible.value = false;
    // 保存成功后，fetchVideoList 会自动刷新列表
  } else {
    // ElMessage.error(res?.msg || '保存失败');
    ElMessage.error('保存失败');
  }
}

// ========== 单条视频删除 ==========
async function onDelete(row: VideoRow) {
  await ElMessageBox.confirm(`确定删除视频 “${row.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const idsToDelete = [row.id];
    const res = await batchDeleteVideos(idsToDelete); // 调用 Store 函数，传入数组
    if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
      ElMessage.success('删除成功');
    } else {
      // ElMessage.error(res?.msg || '删除失败');
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// ============== 搜索/重置 ==============
function onSearch(page?: number) {
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
  if (!row.url) { // <-- 修正为 url
    ElMessage.warning('没有视频URL地址'); // <-- 提示语同步更新
    return;
  }
  // 使用现代 Clipboard API
  navigator.clipboard.writeText(row.url) // <-- 修正为 url
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

// =================== 排序管理弹窗逻辑 (还原回原有的内联逻辑) ===================
const sortDialogVisible = ref(false)
const sortParentId = ref<number | null>(null)
const sortChildList = ref<any[]>([])

function openSortDialog() {
  sortDialogVisible.value = true
  sortParentId.value = null
  sortChildList.value = []
}
function onSortParentChange(id: number) {
  sortChildList.value = childCategories.value
    .filter((c: Category) => c.parent_id === id)
    .map((c: Category) => ({ ...c })) // 创建副本以允许编辑
}
function onSortDialogClose() {
    sortParentId.value = null;
    sortChildList.value = [];
}
async function onSaveSort() {
  if (!sortChildList.value.length) {
      ElMessage.warning('没有可保存排序的子分类');
      return;
  }
  const list = sortChildList.value.map(i => ({
    id: i.id,
    sort: i.sort || 0
  }));
  try {
    const res = await batchUpdateSort(list); // 调用 long-video-category.store 中的 batchUpdateSort
    if (res) { // 因为 store 已经统一返回 res 对象，这里直接判断 res 存在即可
      ElMessage.success('排序保存成功');
      sortDialogVisible.value = false;
      await fetchCategoryList(); // 刷新分类列表以更新排序
    } else {
      // ElMessage.error(res?.msg || '排序保存失败');
      ElMessage.error('排序保存失败');
    }
  } catch (error) {
    console.error('保存排序请求失败:', error);
    ElMessage.error('保存排序失败，请检查网络或后端服务');
  }
}
</script>

<style scoped>
.longvideo-manage-page {
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
</style>
