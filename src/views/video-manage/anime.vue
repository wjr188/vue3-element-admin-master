<template>
  <div class="anime-video-manage-page">
    <!-- 1. 功能区（筛选+批量操作） -->
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
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
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
        <!-- 批量设置 VIP -->
        <el-form-item>
          <el-button type="warning" @click="onBatchVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
        </el-form-item>
        <!-- 批量设置 试看 时长 -->
        <el-form-item>
          <el-button type="info" @click="onBatchPreviewTime" size="small" :disabled="selectedRows.length === 0">批量设置试看时长</el-button>
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
        <!-- 批量设置播放 -->
        <el-form-item>
          <el-button type="success" @click="onBatchSetPlay" size="small" :disabled="selectedRows.length === 0">批量设置播放</el-button>
        </el-form-item>
        <!-- 批量设置收藏 -->
        <el-form-item>
          <el-button type="success" @click="onBatchSetCollect" size="small" :disabled="selectedRows.length === 0">批量设置收藏</el-button>
        </el-form-item>
        <!-- 升序置顶 -->
        <el-form-item>
          <el-button type="primary" size="small" @click="onBatchSortAsc" :disabled="selectedRows.length === 0">升序置顶</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 表格区 -->
    <el-card shadow="always" class="table-card">
      <el-table
        :data="displayVideos"
        v-loading="loading"
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
            <el-tag v-else type="info" size="small">非VIP</el-tag>
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
              <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
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
        :total="total"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 3. 添加视频弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加新视频"
      width="460px"
      @close="onAddDialogClose"
      append-to-body
    >
      <el-form :model="addForm" label-width="82px" size="small" ref="addFormRef">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="addForm.title" placeholder="请输入视频标题" clearable />
        </el-form-item>
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select
            v-model="addForm.parent_id"
            placeholder="请选择主分类"
            style="width:100%"
            @change="onParentChange"
          >
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" prop="category_id" required>
          <el-select v-model="addForm.category_id" placeholder="请选择子分类" style="width:100%">
            <el-option
              v-for="item in addSubCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="addForm.tags"
            multiple
            clearable
            collapse-tags
            filterable
            allow-create
            placeholder="请选择标签或回车新建"
            style="width:100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="m3u8地址" prop="m3u8" required>
          <el-input v-model="addForm.m3u8" placeholder="m3u8视频地址" clearable />
        </el-form-item>
        <el-form-item label="封面图地址" prop="cover">
          <el-input v-model="addForm.cover" placeholder="图片URL地址" clearable />
        </el-form-item>
        <el-form-item label="试看时长" prop="preview">
          <el-input v-model="addForm.preview" placeholder="如15秒、30秒" clearable />
        </el-form-item>
        <el-form-item label="VIP" prop="vip">
          <el-switch v-model="addForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币" prop="coin">
          <el-input-number v-model="addForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAdd">确定</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 批量设置金币弹窗 -->
    <el-dialog v-model="batchGoldDialogVisible" title="批量设置金币" width="350px" @close="onBatchGoldDialogClose" append-to-body>
      <el-form ref="batchGoldFormRef">
        <el-form-item label="金币数量">
          <el-input-number v-model="batchGoldValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchGoldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchGold">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置播放数弹窗 -->
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

    <!-- 批量设置收藏数弹窗 -->
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
    <el-dialog
      v-model="editDialogVisible"
      title="编辑视频"
      width="480px"
      @close="onEditDialogClose"
      append-to-body
    >
      <el-form :model="editForm" label-width="82px" size="small" ref="editFormRef">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="editForm.title" clearable />
        </el-form-item>
        <el-form-item label="主分类" prop="parent_id" required>
          <el-select
            v-model="editForm.parent_id"
            style="width:100%"
            @change="onEditParentChange"
          >
            <el-option
              v-for="item in parentCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" prop="category_id" required>
          <el-select v-model="editForm.category_id" style="width:100%">
            <el-option
              v-for="item in editSubCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="editForm.tags"
            multiple
            clearable
            collapse-tags
            filterable
            allow-create
            style="width:100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="m3u8地址" prop="m3u8" required>
          <el-input v-model="editForm.m3u8" clearable />
        </el-form-item>
        <el-form-item label="封面图地址" prop="cover">
          <el-input v-model="editForm.cover" clearable />
        </el-form-item>
        <el-form-item label="封面预览">
          <img :src="editForm.cover" style="width:100px;border-radius:6px;" v-if="editForm.cover" />
        </el-form-item>
        <el-form-item label="试看时长" prop="preview">
          <el-input v-model="editForm.preview" clearable />
        </el-form-item>
        <el-form-item label="VIP" prop="vip">
          <el-switch v-model="editForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币" prop="coin">
          <el-input-number v-model="editForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEdit">保存</el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 排序管理弹窗（如果动漫视频管理页面也需要这个功能） -->
    <!-- 注意：此弹窗通常在分类管理页面使用，如果视频管理不需要，可删除 -->
    <!-- 确保引入 CategorySortDialog 组件并处理其逻辑 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 1. 引入 Pinia store
import { useAnimeVideosStore } from '@/store/animeVideos.store'
import { storeToRefs } from 'pinia'
import { useAnimeTagsStore } from '@/store/animeTags.store'
import { useAnimeCategoriesStore } from '@/store/animeCategories.store'

// 2. 其它依赖的 store（分类、标签）可继续用原有方式
import {
  animeParentCategories as parentCategories,
  animeChildCategories as childCategories,
  fetchAnimeCategories,
  AnimeCategory as Category
} from '@/store/modules/anime-categories.store'
import {
  animeTags,
  fetchAnimeTags,
  AnimeTag
} from '@/store/modules/anime-tags.store'

const route = useRoute()

// 3. 使用 Pinia store
const animeVideosStore = useAnimeVideosStore()
const { videos, total, loading } = storeToRefs(animeVideosStore)
const {
  fetchList,
  add,
  update,
  remove,
  batchRemove,
  batchSetVip,
  batchSetPreview,
  batchSetGold,
  batchSetPlay,     // 新增
  batchSetCollect,  // 新增
  batchSortAsc,     // 新增
  fetchDetail
} = animeVideosStore

const animeTagsStore = useAnimeTagsStore()
const { tags: animeTags } = storeToRefs(animeTagsStore)
const { fetchTags: fetchAnimeTags } = animeTagsStore

const animeCategoriesStore = useAnimeCategoriesStore()
const { parentCategories, childCategories } = storeToRefs(animeCategoriesStore)
const { fetchCategories: fetchAnimeCategories } = animeCategoriesStore

// ======================= 初始化加载数据 =======================
onMounted(async () => {
  await Promise.all([
    fetchAnimeCategories(),
    fetchAnimeTags(),
    fetchList(searchForm.value) // 用 Pinia store 的 fetchList
  ])
  if (route.query.category_id) {
    searchForm.value.category_id = Number(route.query.category_id)
    onSearch()
  }
})

watch(
  () => route.query.category_id,
  (val) => {
    if (val) {
      searchForm.value.category_id = Number(val)
    } else {
      searchForm.value.category_id = ''
    }
    onSearch()
  }
)

// ===================== 筛选/搜索表单 =====================
interface SearchForm {
  page: number;
  pageSize: number;
  keyword: string;
  parent_id: number | '';
  category_id: number | '';
  tags: string[];
}
const searchForm = ref<SearchForm>({
  page: 1,
  pageSize: 10,
  keyword: '',
  parent_id: '',
  category_id: '',
  tags: []
})

// 计算属性，用于子分类下拉框选项 (根据选中的主分类过滤)
const subCategoryOptions = computed(() => {
  if (searchForm.value.parent_id === '') return childCategories.value; // 如果没有选择主分类，显示所有子分类
  return childCategories.value.filter((c: Category) => c.parent_id === Number(searchForm.value.parent_id));
});

// 计算属性，用于标签下拉框选项
const allTags = computed(() => {
  return animeTags.value; // 直接使用从 Store 导入的标签数据
});

// ===================== 表格数据 =====================
const displayVideos = computed(() => {
  return videos.value.map((video: any) => {
    const parent = parentCategories.value.find(p => p.id === video.parent_id)
    const child = childCategories.value.find(c => c.id === video.category_id)
    return {
      ...video,
      vip: video.is_vip === 1,
      coin: video.gold,
      parentName: parent ? parent.name : '未知主分类',
      categoryName: child ? child.name : '未知子分类',
    }
  })
})

// ===================== 表格操作 =====================
const selectedRows = ref<any[]>([])
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// 批量删除
async function onBatchDelete() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要操作的视频')
  }
  await ElMessageBox.confirm('确定批量删除已选视频吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      const ids = selectedRows.value.map(v => v.id)
      const res = await batchRemove(ids)
      if (res && res.code === 0) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
      } else {
        ElMessage.error(res?.msg || '批量删除失败')
      }
    } catch (error) {
      ElMessage.error('批量删除失败，请检查网络或后端服务')
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除')
  })
}

// 批量设置金币弹窗
const batchGoldDialogVisible = ref(false)
const batchGoldValue = ref(0) // 默认值
const batchGoldFormRef = ref<FormInstance>() // 用于表单验证

function onBatchSetGold() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先勾选需要操作的视频');
    return;
  }
  batchGoldValue.value = 0; // 重置金币值
  batchGoldDialogVisible.value = true;
  nextTick(() => { // 确保弹窗渲染后再清除验证
    if (batchGoldFormRef.value) {
      batchGoldFormRef.value.clearValidate();
    }
  });
}

function onBatchGoldDialogClose() {
  if (batchGoldFormRef.value) {
    batchGoldFormRef.value.resetFields();
  }
  batchGoldValue.value = 0; // 确保关闭时重置
}

async function submitBatchGold() {
  if (batchGoldValue.value < 0) {
    return ElMessage.warning('金币数量不能小于0');
  }
  try {
    const ids = selectedRows.value.map(v => v.id);
    const res = await batchSetGold(ids, batchGoldValue.value); // 调用 Store 函数
    if (res && res.code === 0) {
      ElMessage.success('金币设置成功！');
      batchGoldDialogVisible.value = false;
      selectedRows.value = [];
      // fetchAnimeVideoList 会在 batchSetAnimeGold 成功后自动调用
    } else {
      ElMessage.error(res?.msg || '金币设置失败');
    }
  } catch (error) {
    console.error('批量设置金币请求失败:', error);
    ElMessage.error('设置失败，请检查网络或后端服务');
  }
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
    const res = await batchSetPlay(ids, batchPlayValue.value)
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

// 批量设置收藏数
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
    const res = await batchSetCollect(ids, batchCollectValue.value)
    if (res && res.code === 0) {
      ElMessage.success('收藏数设置成功！')
      batchCollectDialogVisible.value = false
      selectedRows.value = []
    } else {
      ElMessage.error(res?.msg || '收藏数设置失败')
    }
  } catch (error) {
    console.error('批量设置收藏数请求失败:', error)
    ElMessage.error('收藏数设置失败，请检查网络或后端服务')
  }
}

// 批量设置 VIP
async function onBatchVip() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要操作的视频');
    return;
  }
  await ElMessageBox.confirm('确定批量设置已选视频为VIP吗？', '提示', { type: 'warning' }).then(
    async () => {
      try {
        const ids = selectedRows.value.map(v => v.id);
        const res = await batchSetVip(ids, true); // 调用 Store 函数，设为VIP
        if (res && res.code === 0) {
          ElMessage.success('批量设置VIP成功！');
          selectedRows.value = [];
          // fetchAnimeVideoList 会在 batchSetAnimeVip 成功后自动调用
        } else {
          ElMessage.error(res?.msg || 'VIP设置失败');
        }
      } catch (error) {
        console.error('批量设置VIP请求失败:', error);
        ElMessage.error('设置失败，请检查网络或后端服务');
      }
    }
  ).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// 批量取消VIP
async function onBatchCancelVip() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择要操作的视频')
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    const res = await batchSetVip(ids, false) // 设为非VIP
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

// 批量设置 试看 时长
async function onBatchPreviewTime() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要操作的视频');
    return;
  }
  ElMessageBox.prompt('请输入要批量设置的试看时长(如15秒、30秒)', '批量设置试看时长', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+(秒|分钟|小时)?$/, // 允许只输入数字
    inputErrorMessage: '时长格式不正确，例如：15秒, 1分钟',
  }).then(
    async ({ value }) => {
      try {
        const ids = selectedRows.value.map(v => v.id);
        const res = await batchSetPreview(ids, value); // 调用 Store 函数
        if (res && res.code === 0) {
          ElMessage.success('试看时长设置成功！');
          selectedRows.value = [];
          // fetchAnimeVideoList 会在 batchSetAnimePreview 成功后自动调用
        } else {
          ElMessage.error(res?.msg || '试看时长设置失败！');
        }
      } catch (error) {
        console.error('批量设置试看时长请求失败:', error);
        ElMessage.error('设置失败，请检查网络或后端服务');
      }
    }
  ).catch(() => {
    ElMessage.info('已取消操作');
  });
}

// 复制链接功能
function onCopyLink(row: DisplayVideoRow) { // 修正类型为 DisplayVideoRow
  if (!row.m3u8) { // 使用m3u8字段
    ElMessage.warning('没有m3u8地址');
    return;
  }
  // 优先使用 navigator.clipboard，如果不支持则使用 document.execCommand
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(row.m3u8).then(() => {
      ElMessage.success('链接已复制到剪贴板！');
    }).catch(err => {
      console.error('Failed to copy using clipboard API:', err);
      fallbackCopyTextToClipboard(row.m3u8);
    });
  } else {
    fallbackCopyTextToClipboard(row.m3u8);
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // 避免滚动到可视区域外
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

// =================== 添加视频弹窗 ====================
const addDialogVisible = ref(false)
const addForm = ref<VideoForm>({ // 使用 VideoForm 类型
  id: null,
  title: '',
  parent_id: '',
  category_id: '',
  tags: [],
  m3u8: '', // 对应后端 m3u8
  cover: '',
  preview: '15秒',
  vip: false, // 对应后端 vip (0/1)
  coin: 0 // 对应后端 coin
})
const addFormRef = ref<FormInstance>() // 用于表单验证

const addSubCategoryOptions = computed(() => {
  if (addForm.value.parent_id === '') return [];
  return childCategories.value.filter(c => c.parent_id === Number(addForm.value.parent_id));
});

function onParentChange() {
  addForm.value.category_id = ''; // 主分类改变时清空子分类
}

function onAdd() {
  addDialogVisible.value = true;
  // 重置表单数据，确保干净的初始状态
  Object.assign(addForm.value, {
    id: null, title: '', parent_id: '', category_id: '', tags: [],
    m3u8: '', cover: '', preview: '15秒', vip: false, coin: 0
  });
  // 清除表单校验状态
  nextTick(() => {
    if (addFormRef.value) {
      addFormRef.value.clearValidate();
    }
  });
}

function onAddDialogClose() {
  // 重置表单字段和校验状态
  if (addFormRef.value) {
    addFormRef.value.resetFields();
  }
  // 再次确保数据被重置
  Object.assign(addForm.value, {
    id: null, title: '', parent_id: '', category_id: '', tags: [],
    m3u8: '', cover: '', preview: '15秒', vip: false, coin: 0
  });
}

async function submitAdd() {
  let valid = false;
  if (addFormRef.value) {
    valid = await addFormRef.value.validate();
  } else {
    // 如果没有ref，则进行手动校验
    valid = !!addForm.value.title &&
            addForm.value.parent_id !== '' &&
            addForm.value.category_id !== '' &&
            !!addForm.value.m3u8;
  }

  if (!valid) {
    ElMessage.error('请填写所有必填项');
    return;
  }
  try {
    const res = await add(addForm.value); // Store 函数已处理数据转换
    if (res && res.code === 0) {
      ElMessage.success('添加成功');
      addDialogVisible.value = false;
    } else {
      ElMessage.error(res?.msg || '添加失败');
    }
  } catch (error) {
    console.error('添加视频请求失败:', error);
    ElMessage.error('添加视频失败，请检查网络或后端服务');
  }
}

// =================== 编辑视频弹窗 ====================
const editDialogVisible = ref(false)
const editForm = ref<VideoForm>({ // 使用 VideoForm 类型
  id: null,
  title: '',
  parent_id: '',
  category_id: '',
  tags: [],
  m3u8: '', // 对应后端 m3u8
  cover: '',
  preview: '',
  vip: false, // 对应后端 vip (0/1)
  coin: 0 // 对应后端 coin
})
const editFormRef = ref<FormInstance>() // 用于表单验证

const editSubCategoryOptions = computed(() => {
  if (!editForm.value.parent_id) return [];
  return childCategories.value.filter(c => c.parent_id === Number(editForm.value.parent_id));
});

function onEditParentChange() {
  editForm.value.category_id = ''; // 主分类改变时清空子分类
}
function onEditDialogClose() {
  // 重置表单验证状态
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  // 再次确保数据被重置
  Object.assign(editForm.value, {
    id: null, title: '', parent_id: '', category_id: '', tags: [],
    m3u8: '', cover: '', preview: '', vip: false, coin: 0
  });
}

async function onEdit(row: DisplayVideoRow) { // 修正类型为 DisplayVideoRow
  try {
    const res = await fetchDetail(row.id as number); // 调用 Store 函数获取详情
    if (res && res.code === 0 && res.data) {
      // 填充表单，后端返回的 is_vip 和 gold 需要转换为前端的 vip (boolean) 和 coin (number)
      Object.assign(editForm.value, {
        id: res.data.id,
        title: res.data.title || '',
        parent_id: res.data.parent_id || '',
        category_id: res.data.category_id || '',
        tags: res.data.tags || [],
        m3u8: res.data.m3u8 || '', // 后端 m3u8 映射到前端 m3u8
        cover: res.data.cover || '',
        preview: res.data.preview || '',
        vip: res.data.is_vip === 1, // 后端 is_vip (0/1) 转前端 vip (boolean)
        coin: res.data.gold || 0, // 后端 gold 转前端 coin
      });
      editDialogVisible.value = true;
      nextTick(() => {
        if (editFormRef.value) {
          editFormRef.value.clearValidate();
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

async function submitEdit() {
  let valid = false;
  if (editFormRef.value) {
    valid = await editFormRef.value.validate();
  } else {
    valid = !!editForm.value.title &&
            editForm.value.parent_id !== '' &&
            editForm.value.category_id !== '' &&
            !!editForm.value.m3u8 &&
            editForm.value.id !== null;
  }

  if (!valid) {
    ElMessage.error('请填写所有必填项');
    return;
  }
  if (!editForm.value.id) { // 编辑时ID必须存在
      ElMessage.error('编辑失败：视频ID不存在');
      return;
  }

  try {
    const res = await update(editForm.value); // Store 函数已处理数据转换
    if (res && res.code === 0) {
      ElMessage.success('保存成功');
      editDialogVisible.value = false;
    } else {
      ElMessage.error(res?.msg || '保存失败');
    }
  } catch (error) {
    console.error('编辑视频请求失败:', error);
    ElMessage.error('编辑视频失败，请检查网络或后端服务');
  }
}

// ========== 单条视频删除 ==========
async function onDelete(row: DisplayVideoRow) { // 修正类型为 DisplayVideoRow
  await ElMessageBox.confirm(`确定删除视频 “${row.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    try {
      // 注意：这里调用的是 deleteAnimeVideo (单条删除)，不是 batchDeleteAnimeVideos
      const res = await remove(row.id as number);
      if (res && res.code === 0) {
        ElMessage.success('删除成功');
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

// ========== 搜索/重置 ==========
function onSearch() {
  searchForm.value.page = 1
  fetchList(searchForm.value)
}
function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', parent_id: '', category_id: '', tags: [] }
  fetchList(searchForm.value)
}

// ========== 标题 tooltip 控制 ==========
const visibleTitleIndex = ref<number | null>(null)
function showTitle(index: number) {
  visibleTitleIndex.value = index
}
function hideTitle() {
  visibleTitleIndex.value = null
}
</script>

<style scoped>
.anime-video-manage-page { /* 修正类名 */
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
