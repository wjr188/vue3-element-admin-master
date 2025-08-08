<template>
  <div class="darknet-video-manage-page">
    <!-- ========== 1. 功能区（筛选 + 批量操作） ========== -->
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
            @change="onSearchParentChange"
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="已发布" value="已发布" />
            <el-option label="未发布" value="未发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="searchForm.tags"
            multiple
            clearable
            filterable
            collapse-tags
            placeholder="全部标签"
            style="width: 160px;"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
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
          <el-button type="success" @click="openAddDialog" size="small">+ 新增视频</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="!selectedRows.length">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetVip" size="small" :disabled="!selectedRows.length">批量设VIP</el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button type="danger" @click="onBatchSetGold" size="small" :disabled="!selectedRows.length">批量金币</el-button>
        </el-form-item>
        <!-- 添加长视频的完整批量操作按钮 -->
        <el-form-item>
          <el-button type="info" @click="onBatchCancelVip" size="small" :disabled="!selectedRows.length">批量取消VIP</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchCancelGold" size="small" :disabled="!selectedRows.length">批量取消金币</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onBatchSetPlay" size="small" :disabled="!selectedRows.length">批量设置播放</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onBatchSetCollect" size="small" :disabled="!selectedRows.length">批量设置收藏</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchSortAsc" size="small" :disabled="!selectedRows.length">升序置顶</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchSetLike" size="small" :disabled="!selectedRows.length">批量设置点赞</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== 2. 列表表格区 ========== -->
    <el-card class="table-card">
      <el-table
        :data="displayVideos"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        v-loading="videoLoading"
      >
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column prop="id" label="#ID" width="52" align="center" />
        <el-table-column prop="cover" label="封面" width="92" align="center">
          <template #default="scope">
            <img :src="scope.row.cover" style="width:70px;height:40px;border-radius:5px;object-fit:cover;" v-if="scope.row.cover"/>
            <div v-else style="width:70px;height:40px; background-color:#f0f0f0; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="140" align="center">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.title" placement="top" :visible="visibleTitleIndex === scope.$index" @hide="hideTitle">
              <span class="title-cell" @click.stop="showTitle(scope.$index)">{{ scope.row.title }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="主分类" min-width="90" align="center">
          <template #default="scope">
            {{ scope.row.parentName }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="子分类" min-width="90" align="center">
          <template #default="scope">
            {{ scope.row.categoryName }}
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="100" align="center">
          <template #default="scope">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <el-tag
                v-for="tag in (Array.isArray(scope.row.tags) ? scope.row.tags : [])"
                :key="tag"
                type="danger"
                size="small"
                style="margin-bottom: 4px; background: #ffeaea; color: #f56c6c; border: none;"
              >
                {{ typeof tag === 'string' ? tag : (tag.name || '') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gold" label="金币" width="60" align="center" />
        <el-table-column prop="is_vip" label="VIP" width="48" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_vip" type="warning" size="small">
              VIP
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="62" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status == 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="play" label="播放" width="62" align="center" />
        <el-table-column prop="collect" label="收藏" width="62" align="center" />
        <el-table-column prop="like" label="点赞数" width="62" align="center" />
        <el-table-column prop="upload_time" label="上传时间" min-width="122" align="center" />
        <el-table-column label="操作" fixed="right" width="178" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
           
            <el-button size="small" type="warning" @click="onCopyLink(scope.row)">复制链接</el-button>
          </template>
        </el-table-column>
      </el-table>
       <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="darknetVideoTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- ========== 3. 新增/编辑弹窗 ========== -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增视频':'编辑视频'" width="600px" @close="onDialogClose" append-to-body>
      <el-form :model="dialogForm" label-width="80px" size="small" ref="videoFormRef">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="dialogForm.title" maxlength="50" placeholder="必填" />
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-input v-model="dialogForm.cover" placeholder="封面图片URL" />
        </el-form-item>
        <el-form-item label="视频地址" prop="url" required>
          <el-input v-model="dialogForm.url" placeholder="m3u8地址" />
        </el-form-item>
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select v-model="dialogForm.parent_id" placeholder="选择主分类" style="width:100%" @change="onDialogParentChange">
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" prop="category_id" required>
          <el-select v-model="dialogForm.category_id" placeholder="选择子分类" style="width:100%">
            <el-option v-for="item in dialogSubCategoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="dialogForm.tags"
            multiple
            clearable
            collapse-tags
            filterable
            allow-create
            placeholder="标签，回车新建"
            style="width:100%"
          >
            <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.name" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金币" prop="gold">
          <el-input-number v-model="dialogForm.gold" :min="0" style="width: 100px" />
        </el-form-item>
        <el-form-item label="VIP" prop="is_vip">
          <el-switch v-model="dialogForm.is_vip" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" placeholder="选择状态" style="width:100%">
            <el-option label="已发布" value="已发布" />
            <el-option label="未发布" value="未发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="点赞数" prop="like">
          <el-input-number v-model="dialogForm.like" :min="0" style="width: 100px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitVideo">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 添加批量设置播放弹窗 -->
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

    <!-- 添加批量设置收藏弹窗 -->
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

    <!-- 添加批量设置点赞弹窗 -->
    <el-dialog v-model="batchLikeDialogVisible" title="批量设置点赞数" width="350px">
      <el-form>
        <el-form-item label="点赞数量">
          <el-input-number v-model="batchLikeValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchLikeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchLike">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 1. 引用新的 Pinia store
import { useDarknetVideoStore } from '@/store/darknetVideo.store'
import { useDarknetCategoryStore } from '@/store/darknetCategory.store'
import { useDarknetTagStore } from '@/store/darknetTag.store'
import { storeToRefs } from 'pinia'

// 2. 获取 store 实例和响应式数据
const darknetVideoStore = useDarknetVideoStore()
const { videos: darknetVideos, total: darknetVideoTotal, loading: videoLoading } = storeToRefs(darknetVideoStore)
const {
  fetchList: fetchDarknetVideoList,
  add: addDarknetVideo,
  update: updateDarknetVideo,
  remove: deleteDarknetVideo,
  batchRemove: batchDeleteDarknetVideos,
  batchSetVip: batchSetDarknetVip,
  batchSetGold: batchSetDarknetGold,
  batchSetPlay: batchSetDarknetPlay,
  batchSetCollect: batchSetDarknetCollect,
  batchSortAsc: batchSortDarknetAsc,
  fetchDetail: fetchDarknetVideoDetail,
  batchSetLike: batchSetDarknetLike,
} = darknetVideoStore

const darknetCategoryStore = useDarknetCategoryStore()
const { parentCategories, childCategories } = storeToRefs(darknetCategoryStore)
const { fetchCategories: fetchDarknetCategories } = darknetCategoryStore

const darknetTagStore = useDarknetTagStore()
const { tags: darknetTags } = storeToRefs(darknetTagStore)
const { fetchTags: fetchDarknetTags } = darknetTagStore

// 定义用于表格显示的数据接口，将 Store 中的原始数据进行转换
interface DisplayVideoRow extends Omit<DarknetVideo, 'is_vip'> {
  is_vip: boolean;
  parentName?: string;
  categoryName?: string;
}

// 定义表单数据类型
interface DarknetVideoForm {
  id: number | null;
  title: string;
  cover: string;
  url: string;
  parent_id: number | '';
  category_id: number | '';
  tags: string[];
  
  gold: number;
  is_vip: boolean;
  status: string;
}


const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  parent_id: '' as number | '',
  category_id: '' as number | '',
  status: '',
  tags: [] as string[] // 新增
})

const allTags = computed(() => darknetTags.value);

const displayVideos = computed<DisplayVideoRow[]>(() => {
  return darknetVideos.value.map((v: DarknetVideo) => {
    const parent = parentCategories.value.find(p => p.id === v.parent_id);
    const child = childCategories.value.find(c => c.id === v.category_id);

    return {
      ...v,
      is_vip: Boolean(v.is_vip),
      parentName: parent ? parent.name : '-',
      categoryName: child ? child.name : '-'
    };
  });
});


const subCategoryOptions = computed(() => {
  if (searchForm.value.parent_id === '') return childCategories.value;
  return childCategories.value.filter((c: DarknetCategory) => c.parent_id === Number(searchForm.value.parent_id));
});

const selectedRows = ref<DisplayVideoRow[]>([])
function handleSelectionChange(rows: DisplayVideoRow[]) { selectedRows.value = rows }

const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<DarknetVideoForm>({
  id: null,
  title: '', cover: '', url: '',
  parent_id: '', category_id: '',
  tags: [],  gold: 0, is_vip: false, status: '已发布'
})
const videoFormRef = ref<FormInstance>()

const dialogSubCategoryOptions = computed(() => {
  if (dialogForm.value.parent_id === '') return [];
  return childCategories.value.filter((c: DarknetCategory) => c.parent_id === Number(dialogForm.value.parent_id));
});

function onSearchParentChange() {
  searchForm.value.category_id = '';
}

function onDialogParentChange() {
  dialogForm.value.category_id = '';
}


function openAddDialog() {
  dialogType.value = 'add'
  Object.assign(dialogForm.value, {
    id: null, title: '', cover: '', url: '', parent_id: '', category_id: '',
    tags: [],  gold: 0, is_vip: false, status: '已发布'
  })
  dialogVisible.value = true
  nextTick(() => {
    if (videoFormRef.value) {
      videoFormRef.value.clearValidate();
    }
  });
}

async function openEditDialog(row: DisplayVideoRow) {
  dialogType.value = 'edit'
  try {
    const res = await fetchDarknetVideoDetail(row.id);
    if (res && res.code === 0 && res.data) {
      Object.assign(dialogForm.value, {
        ...res.data,
        is_vip: Boolean(res.data.is_vip),
        status: res.data.status == 1 ? '已发布' : '未发布'
      });
      dialogVisible.value = true;
      nextTick(() => {
        if (videoFormRef.value) {
          videoFormRef.value.clearValidate();
        }
      });
    } else {
      ElMessage.error(res?.msg || '获取视频详情失败');
    }
  } catch (error) {
    console.error('获取视频详情请求失败:', error);
    ElMessage.error('获取视频详情失败，请检查网络或后端服务');
  }
}

function onDialogClose() {
  if (videoFormRef.value) {
    videoFormRef.value.resetFields();
  }
  Object.assign(dialogForm.value, {
    id: null, title: '', cover: '', url: '', parent_id: '', category_id: '',
    tags: [],  gold: 0, is_vip: false, status: '已发布'
  });
}

// 1. 提交前转换
async function submitVideo() {
  if (videoFormRef.value) {
    const valid = await videoFormRef.value.validate();
    if (!valid) {
      ElMessage.error('请填写所有必填项');
      return;
    }
  }

  if (!dialogForm.value.title || !dialogForm.value.url ||
      dialogForm.value.parent_id === '' || dialogForm.value.category_id === '') {
    ElMessage.error('标题、视频地址、主分类和子分类均为必填项');
    return;
  }

  // 状态转换
  if (dialogForm.value.status === '已发布') {
    dialogForm.value.status = 1
  } else if (dialogForm.value.status === '未发布') {
    dialogForm.value.status = 0
  }

  try {
    let res;
    if (dialogType.value === 'add') {
      res = await addDarknetVideo(dialogForm.value);
    } else {
      if (dialogForm.value.id === null) {
        ElMessage.error('编辑失败：视频ID不存在');
        return;
      }
      res = await updateDarknetVideo(dialogForm.value);
    }
    
    if (res && res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '新增成功！' : '保存成功！');
      dialogVisible.value = false;
      await fetchAllData();
    } else {
      ElMessage.error(res?.msg || (dialogType.value === 'add' ? '新增失败' : '保存失败'));
    }
  } catch (error) {
    console.error('视频操作请求失败:', error);
    ElMessage.error('操作失败，请检查网络或后端服务');
  }
}

async function onDelete(row: DisplayVideoRow) {
  await ElMessageBox.confirm('确认删除该视频？', '警告', { type: 'warning' }).then(async () => {
    try {
      const res = await deleteDarknetVideo(row.id);
      if (res && res.code === 0) {
        ElMessage.success('删除成功');
        await fetchAllData();
      } else {
        ElMessage.error(res?.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除请求失败:', error);
      ElMessage.error('删除失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onBatchDelete() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先勾选要删除的视频');
    return;
  }
  await ElMessageBox.confirm('确定批量删除已选视频吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      const ids = selectedRows.value.map(v => v.id);
      const res = await batchDeleteDarknetVideos(ids);
      if (res && res.code === 0) {
        ElMessage.success('批量删除成功');
        selectedRows.value = [];
        await fetchAllData();
      } else {
        ElMessage.error(res?.msg || '批量删除失败');
      }
    } catch (error) {
      console.error('批量删除请求失败:', error);
      ElMessage.error('批量删除失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

async function onBatchSetVip() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先勾选要设置VIP的视频');
    return;
  }
  await ElMessageBox.confirm('确定批量设置已选视频为VIP吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      const ids = selectedRows.value.map(v => v.id);
      const res = await batchSetDarknetVip(ids, true);
      if (res && res.code === 0) {
        ElMessage.success('批量VIP设置成功');
        await fetchAllData();
      } else {
        ElMessage.error(res?.msg || '批量VIP设置失败');
      }
    } catch (error) {
      console.error('批量设置VIP请求失败:', error);
      ElMessage.error('设置失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// 批量取消VIP
async function onBatchCancelVip() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的视频')
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetDarknetVip(ids, false) // 设为非VIP
    if (res && res.code === 0) {
      ElMessage.success('批量取消VIP成功！')
      selectedRows.value = []
    } else {
      ElMessage.error(res?.msg || '批量取消VIP失败')
    }
  } catch (error) {
    console.error('批量取消VIP请求失败:', error)
    ElMessage.error('批量取消VIP失败，请检查网络或后端服务')
  }
}


async function onBatchSetGold() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先勾选要设置金币的视频');
    return;
  }
  ElMessageBox.prompt('输入金币数', '批量金币', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '必须是数字'
  }).then(async ({ value }) => {
    try {
      const ids = selectedRows.value.map(v => v.id);
      const res = await batchSetDarknetGold(ids, Number(value));
      if (res && res.code === 0) {
        ElMessage.success('批量金币设置成功');
        await fetchAllData();
      } else {
        ElMessage.error(res?.msg || '批量金币设置失败');
      }
    } catch (error) {
      console.error('批量设置金币请求失败:', error);
      ElMessage.error('设置失败，请检查网络或后端服务');
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// 批量设置播放数
const batchPlayDialogVisible = ref(false)
const batchPlayValue = ref(0)

function onBatchSetPlay() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频')
  }
  batchPlayDialogVisible.value = true
}

async function submitBatchPlay() {
  if (batchPlayValue.value < 0) {
    return ElMessage.warning('播放数量不能小于0')
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetDarknetPlay(ids, batchPlayValue.value)
    if (res && res.code === 0) {
      ElMessage.success('播放数设置成功！')
      batchPlayDialogVisible.value = false
      selectedRows.value = []
    } else {
      ElMessage.error(res?.msg || '播放数设置失败')
    }
  } catch (error) {
    console.error('批量设置播放数请求失败:', error)
    ElMessage.error('播放数设置失败，请检查网络或后端服务')
  }
}

// 批量取消金币
async function onBatchCancelGold() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的视频')
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetDarknetGold(ids, 0) // 金币设为0
    if (res && res.code === 0) {
      ElMessage.success('批量取消金币成功！')
      selectedRows.value = []
    } else {
      ElMessage.error(res?.msg || '批量取消金币失败')
    }
  } catch (error) {
    console.error('批量取消金币请求失败:', error)
    ElMessage.error('批量取消金币失败，请检查网络或后端服务')
  }
}
const batchLikeDialogVisible = ref(false)
const batchLikeValue = ref(0)

function onBatchSetLike() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频')
  }
  batchLikeDialogVisible.value = true
}

async function submitBatchLike() {
  if (batchLikeValue.value < 0) {
    return ElMessage.warning('点赞数量不能小于0')
  }
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetDarknetLike(ids, batchLikeValue.value)
    if (res && res.code === 0) {
      ElMessage.success('点赞数设置成功！')
      batchLikeDialogVisible.value = false
      selectedRows.value = []
      await fetchAllData()
    } else {
      ElMessage.error(res?.msg || '点赞数设置失败')
    }
  } catch (error) {
    console.error('批量设置点赞请求失败:', error)
    ElMessage.error('点赞数设置失败，请检查网络或后端服务')
  }
}
// 批量升序置顶
async function onBatchSortAsc() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先选择要置顶排序的视频')
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSortDarknetAsc(ids)
    if (res && res.code === 0) {
      ElMessage.success('批量升序置顶成功！')
      selectedRows.value = []
      searchForm.value.page = 1
    } else {
      ElMessage.error(res?.msg || '批量升序置顶失败')
    }
  } catch (error) {
    console.error('批量升序置顶请求失败:', error)
    ElMessage.error('升序置顶失败，请检查网络或后端服务')
  }
}
const batchCollectDialogVisible = ref(false)
const batchCollectValue = ref(0)

function onBatchSetCollect() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频')
  }
  batchCollectDialogVisible.value = true
}

async function submitBatchCollect() {
  if (batchCollectValue.value < 0) {
    return ElMessage.warning('收藏数量不能小于0')
  }
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetDarknetCollect(ids, batchCollectValue.value)
    if (res && res.code === 0) {
      ElMessage.success('收藏数设置成功！')
      batchCollectDialogVisible.value = false
      selectedRows.value = []
      await fetchAllData()
    } else {
      ElMessage.error(res?.msg || '收藏数设置失败')
    }
  } catch (error) {
    console.error('批量设置收藏请求失败:', error)
    ElMessage.error('收藏数设置失败，请检查网络或后端服务')
  }
}
// 复制链接功能
function onCopyLink(row: DisplayVideoRow) {
  if (!row.url) {
    ElMessage.warning('没有视频地址');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(row.url).then(() => {
      ElMessage.success('链接已复制到剪贴板！');
    }).catch(err => {
      console.error('Failed to copy using clipboard API:', err);
      fallbackCopyTextToClipboard(row.url);
    });
  } else {
    fallbackCopyTextToClipboard(row.url);
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      ElMessage.success('链接已复制到剪贴板 (备用方法)！');
    } else {
      ElMessage.error('复制失败 (备用方法失败)！');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    ElMessage.error('复制失败，请手动复制！');
  }
  document.body.removeChild(textArea);
}

// 统一的数据获取函数
async function fetchAllData() {
  await Promise.all([
    fetchDarknetCategories(),
    fetchDarknetTags(),
    fetchDarknetVideoList(searchForm.value)
  ]);
}

function onSearch() {
  fetchAllData();
}
function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', parent_id: '', category_id: '', status: '' };
  fetchAllData();
}

const visibleTitleIndex = ref<number | null>(null)
function showTitle(index: number) {
  visibleTitleIndex.value = index
}
function hideTitle() {
  visibleTitleIndex.value = null
}

onMounted(async () => {
  await fetchAllData();
})
</script>

<style scoped>
.darknet-video-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; }
.custom-table { font-size: 12px; border-radius: 9px; }
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
</style>
