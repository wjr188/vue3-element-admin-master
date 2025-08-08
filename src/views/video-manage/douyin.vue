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
          <el-button type="primary" @click="() => onSearch()" size="small">搜索</el-button>
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
          <el-button type="danger" @click="onBatchUnVip" size="small" :disabled="selectedRows.length === 0">批量取消VIP</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchSortAsc" size="small" :disabled="selectedRows.length === 0">升序置顶</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchPreviewTime" size="small" :disabled="selectedRows.length === 0">批量设置试看时长</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetGold" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetLikes" size="small" :disabled="selectedRows.length === 0">批量设置点赞</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetCollect" size="small" :disabled="selectedRows.length === 0">批量设置收藏</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetPlay" size="small" :disabled="selectedRows.length === 0">批量设置播放数</el-button>
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
        <el-table-column prop="likes" label="点赞" min-width="44" align="center">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.likes || scope.row.like_count || '0' }}</el-tag>
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

    <!-- 添加视频弹窗 -->
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

    <!-- 编辑视频弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑视频信息"
      width="750px"
      :close-on-click-modal="false"
      @close="onEditDialogClose"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="90px" size="small" :rules="editFormRules" ref="editFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频标题" prop="title" required>
              <el-input 
                v-model="editForm.title" 
                placeholder="请输入视频标题"
                clearable 
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视频ID" disabled>
              <el-input :value="editForm.id" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主分类" prop="parent_id" required>
              <el-select
                v-model="editForm.parent_id"
                placeholder="请选择主分类"
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="子分类" prop="category_id" required>
              <el-select 
                v-model="editForm.category_id" 
                placeholder="请先选择主分类"
                style="width:100%"
                :disabled="!editForm.parent_id"
              >
                <el-option
                  v-for="item in editSubCategoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="视频标签">
          <el-select
            v-model="editForm.tags"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择视频标签"
            style="width:100%"
            :max-collapse-tags="3"
          >
            <el-option
              v-for="tag in douyinTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="视频地址" prop="url" required>
          <div style="display: flex; width: 100%; align-items: center; gap: 10px;">
            <el-input 
              v-model="editForm.url" 
              placeholder="请输入或上传视频URL地址"
              clearable 
              style="flex: 1;"
            />
            <el-upload
              class="upload-demo"
              action="http://localhost:8000/api/upload/video"
              :show-file-list="false"
              :on-success="handleVideoUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeVideoUpload"
              accept="video/mp4,video/webm,video/quicktime,application/x-mpegURL,application/octet-stream"
            >
              <el-button type="primary" size="small" icon="Upload">
                <span>上传视频</span>
              </el-button>
            </el-upload>
          </div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            支持格式：MP4、WEBM、MOV、M3U8，文件大小不超过500MB
          </div>
        </el-form-item>

        <el-form-item label="封面图片">
          <div style="display: flex; width: 100%; align-items: flex-start; gap: 10px;">
            <div style="flex: 1;">
              <el-input 
                v-model="editForm.cover" 
                placeholder="请输入或上传封面图片URL地址" 
                clearable 
                style="width: 100%;"
              />
              <div style="font-size: 12px; color: #999; margin-top: 4px;">
                支持格式：JPG、PNG、GIF、WEBP，文件大小不超过5MB
              </div>
            </div>
            <el-upload
              class="upload-demo"
              action="/api/upload/image"
              :show-file-list="false"
              :on-success="handleImageUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeImageUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <el-button type="primary" size="small" icon="Upload">
                <span>上传封面</span>
              </el-button>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="封面预览" v-if="editForm.cover">
          <div class="cover-preview">
            <img 
              :src="editForm.cover" 
              style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: cover; border: 1px solid #dcdfe6;"
              @error="handleImageError"
            />
            <el-button 
              size="small" 
              type="danger" 
              link 
              @click="editForm.cover = ''"
              style="margin-left: 10px; vertical-align: top;"
            >
              删除封面
            </el-button>
          </div>
        </el-form-item>

        <el-divider content-position="left">视频属性设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="点赞数量">
              <el-input-number 
                v-model="editForm.likes" 
                :min="0" 
                :max="999999999"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="VIP专享">
              <el-switch 
                v-model="editForm.vip" 
                active-text="VIP" 
                inactive-text="普通"
                active-color="#f56c6c"
                inactive-color="#909399"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="金币数量">
              <el-input-number 
                v-model="editForm.coin" 
                :min="0" 
                :max="999999"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item style="margin-top: 20px;">
          <el-button type="primary" @click="submitEdit" :loading="submitLoading">
            <span>保存修改</span>
          </el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="info" @click="resetEditForm" v-if="editForm.id">重置</el-button>
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

    <!-- 批量设置点赞弹窗 -->
    <el-dialog v-model="batchLikesDialogVisible" title="批量设置点赞" width="350px">
      <el-form>
        <el-form-item label="点赞数量">
          <el-input-number v-model="batchLikesValue" :min="0" style="width: 120px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchLikesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchLikes">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置收藏弹窗 -->
    <el-dialog v-model="batchCollectDialogVisible" title="批量设置收藏" width="350px">
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

    <!-- 批量设置试看时长弹窗 -->
    <el-dialog v-model="batchPreviewDialogVisible" title="批量设置试看时长" width="350px">
      <el-form>
        <el-form-item label="试看时长">
          <el-select v-model="batchPreviewValue" placeholder="请选择试看时长" style="width: 200px">
            <el-option label="5秒" value="5秒" />
            <el-option label="10秒" value="10秒" />
            <el-option label="15秒" value="15秒" />
            <el-option label="30秒" value="30秒" />
            <el-option label="60秒" value="60秒" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchPreviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchPreviewTime">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'

// 导入抖音分类 Store
import { douyinCategoryParents, douyinCategoryChildren, fetchCategoryList as fetchDouyinCategories } from '@/store/modules/douyin-category.store'

// 导入抖音视频 Store
import {
  douyinVideos,
  douyinVideoTotal,
  douyinVideoLoading,
  fetchVideoList,
  addVideo,
  updateVideo,
  deleteVideo,
  batchDeleteVideos,
  batchSetVip,
  batchSetDuration,
  batchSetGold,
  fetchVideoDetail,
  batchSortAsc,
  batchSetLikes,
  batchSetCollect,
  batchSetPlay
} from '@/store/modules/douyin-video.store'

// 导入抖音标签 Store
import { douyinTags, fetchTagList as fetchDouyinTags } from '@/store/modules/douyin-tag.store'

// ======================= 类型定义 =======================
interface VideoRow {
  id: number
  title: string
  tags: string[]
  parent_id: number
  category_id: number
  m3u8?: string
  cover?: string
  vip: boolean
  coin: number
  status: string
  play: number
  collect: number
  upload_time: string
  parentName?: string
  categoryName?: string
  url?: string
  is_vip?: number
  gold?: number
  likes: number
  like_count?: number
}

interface SearchForm {
  page: number
  pageSize: number
  keyword: string
  parent_id: string
  category_id: string
  tags: number[]
}

interface VideoForm {
  id?: number | null
  title: string
  parent_id: string
  category_id: string
  tags: string[]
  url: string
  cover: string
  preview?: string
  vip: boolean
  coin: number
  likes?: number  // 前端显示用，提交时会转换为 like_count
}

// ======================= 响应式数据 =======================
// 搜索表单
const searchForm = ref<SearchForm>({
  page: 1,
  pageSize: 10,
  keyword: '',
  parent_id: '',
  category_id: '',
  tags: []
})

// 表格选中行
const selectedRows = ref<VideoRow[]>([])

// 标题 tooltip 控制
const visibleTitleIndex = ref<number | null>(null)

// 弹窗状态管理
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const batchGoldDialogVisible = ref(false)
const batchLikesDialogVisible = ref(false)
const batchCollectDialogVisible = ref(false)
const batchPlayDialogVisible = ref(false)
const batchPreviewDialogVisible = ref(false)

// 表单数据
const addForm = ref<VideoForm>({
  title: '',
  parent_id: '',
  category_id: '',
  tags: [],
  url: '',
  cover: '',
  preview: '15秒',
  vip: false,
  coin: 0
})

const editForm = ref<VideoForm>({
  id: null,
  title: '',
  parent_id: '',
  category_id: '',
  tags: [],
  url: '',
  cover: '',
  preview: '',
  vip: false,
  coin: 0,
  likes: 0
})

// 批量操作数据
const batchGoldValue = ref(0)
const batchLikesValue = ref(0)
const batchCollectValue = ref(0)
const batchPlayValue = ref(0)
const batchPreviewValue = ref('15秒')

// 表单引用和加载状态
const editFormRef = ref()
const submitLoading = ref(false)

// 表单验证规则
const editFormRules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100字符之间', trigger: 'blur' }
  ],
  parent_id: [
    { required: true, message: '请选择主分类', trigger: 'change' }
  ],
  category_id: [
    { required: true, message: '请选择子分类', trigger: 'change' }
  ],
  url: [
    { required: true, message: '请输入视频地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入有效的视频URL地址', 
      trigger: 'blur' 
    }
  ]
}

// ======================= 计算属性 =======================
const subCategoryOptions = computed(() => {
  if (!searchForm.value.parent_id) return douyinCategoryChildren.value
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(searchForm.value.parent_id))
})

const addSubCategoryOptions = computed(() => {
  if (!addForm.value.parent_id) return []
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(addForm.value.parent_id))
})

const editSubCategoryOptions = computed(() => {
  if (!editForm.value.parent_id) return []
  return douyinCategoryChildren.value.filter(c => c.parent_id === Number(editForm.value.parent_id))
})

// ======================= 初始化 =======================
onMounted(async () => {
  try {
    await Promise.all([
      fetchVideoList(searchForm.value),
      fetchDouyinCategories(),
      fetchDouyinTags()
    ])
  } catch (error) {
    console.error('初始化数据加载失败:', error)
  }
})

// ======================= 工具函数 =======================
function checkSelection(): boolean {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先勾选需要操作的视频')
    return false
  }
  return true
}

// ======================= 表格操作 =======================
function handleSelectionChange(rows: VideoRow[]) {
  selectedRows.value = rows
}

function showTitle(index: number) {
  visibleTitleIndex.value = index
}

function hideTitle() {
  visibleTitleIndex.value = null
}

function onCopyLink(row: VideoRow) {
  const linkToCopy = row.url || row.m3u8
  if (!linkToCopy) {
    ElMessage.warning('没有视频链接可复制')
    return
  }

  navigator.clipboard.writeText(linkToCopy)
    .then(() => {
      ElMessage.success('链接已复制')
    })
    .catch(err => {
      console.error('复制失败：', err)
      ElMessage.error('复制链接失败')
    })
}

// ======================= 搜索相关 =======================
function onSearch(page?: number) {
  if (typeof page === 'number') {
    searchForm.value.page = page
  } else {
    searchForm.value.page = 1
  }
  fetchVideoList(searchForm.value)
}

function onReset() {
  Object.assign(searchForm.value, {
    page: 1,
    pageSize: 10,
    keyword: '',
    parent_id: '',
    category_id: '',
    tags: []
  })
  fetchVideoList(searchForm.value)
}

// ======================= 添加视频 =======================
function onAdd() {
  addDialogVisible.value = true
  resetAddForm()
}

function resetAddForm() {
  Object.assign(addForm.value, {
    title: '',
    parent_id: '',
    category_id: '',
    tags: [],
    url: '',
    cover: '',
    preview: '15秒',
    vip: false,
    coin: 0
  })
}

function onAddDialogClose() {
  resetAddForm()
}

function onParentChange() {
  addForm.value.category_id = ''
}

async function submitAdd() {
  if (!addForm.value.title || !addForm.value.parent_id || 
      !addForm.value.category_id || !addForm.value.url) {
    ElMessage.error('请填写完整的标题、主分类、子分类、视频URL地址')
    return
  }

  try {
    const submitData = {
      ...addForm.value,
      is_vip: addForm.value.vip ? 1 : 0,
      gold: addForm.value.coin,
      tags: addForm.value.tags
    }
    delete (submitData as any).vip
    delete (submitData as any).coin

    const res = await addVideo(submitData)
    if (res) {
      ElMessage.success('添加成功')
      addDialogVisible.value = false
      fetchVideoList(searchForm.value)
    }
  } catch (error) {
    console.error('添加视频失败:', error)
  }
}

// ======================= 编辑视频 =======================
async function onEdit(row: VideoRow) {
  try {
    // 先直接显示弹窗，不依赖API调用
    editDialogVisible.value = true
    
    // 预设一些默认值
    Object.assign(editForm.value, {
      id: row.id,
      title: row.title || '',
      parent_id: row.parent_id?.toString() || '',
      category_id: row.category_id?.toString() || '',
      tags: row.tags || [],
      url: row.url || row.m3u8 || '',
      cover: row.cover || '',
      vip: row.vip || (row.is_vip === 1),
      coin: row.coin || row.gold || 0,
      likes: row.likes || row.like_count || 0
    })
    
    // 异步获取详细数据
    const response = await fetchVideoDetail(row.id)
    
    if (response?.data) {
      const detailData = response.data
      Object.assign(editForm.value, {
        ...detailData,
        vip: detailData.is_vip === 1,
        coin: detailData.gold,
        tags: detailData.tags || [],
        url: detailData.url || '',
        likes: detailData.likes || detailData.like_count || 0
      })
    }
  } catch (error) {
    console.error('获取视频详情失败:', error)
    ElMessage.error('获取视频详情失败')
    // 即使API失败，也保持弹窗打开状态
  }
}

function onEditParentChange() {
  editForm.value.category_id = ''
}

function onEditDialogClose() {
  Object.assign(editForm.value, {
    id: null,
    title: '',
    parent_id: '',
    category_id: '',
    tags: [],
    url: '',
    cover: '',
    preview: '',
    vip: false,
    coin: 0,
    likes: 0
  })
  // 重置表单验证状态
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

function resetEditForm() {
  if (editForm.value.id) {
    // 重新获取视频详情
    onEdit({ id: editForm.value.id } as VideoRow)
  }
}

function handleImageError() {
  ElMessage.warning('图片加载失败，请检查图片地址是否正确')
}

async function submitEdit() {
  // 表单验证
  if (editFormRef.value) {
    try {
      await editFormRef.value.validate()
    } catch (error) {
      ElMessage.error('请检查表单填写是否正确')
      return
    }
  }

  if (!editForm.value.id) {
    ElMessage.error('编辑失败：视频ID不存在')
    return
  }

  submitLoading.value = true
  
  try {
    const submitData = {
      ...editForm.value,
      is_vip: editForm.value.vip ? 1 : 0,
      gold: editForm.value.coin,
      tags: editForm.value.tags,
      id: editForm.value.id,
      like_count: editForm.value.likes || 0  // 将 likes 映射到 like_count
    }
    delete (submitData as any).vip
    delete (submitData as any).coin
    delete (submitData as any).likes  // 删除 likes 字段

    const res = await updateVideo(submitData)
    if (res) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      fetchVideoList(searchForm.value)
    }
  } catch (error) {
    console.error('更新视频失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// ======================= 批量操作 =======================
async function onBatchDelete() {
  if (!checkSelection()) return
  
  try {
    await ElMessageBox.confirm('确定批量删除已选视频吗？', '警告', { type: 'warning' })
    const ids = selectedRows.value.map(v => v.id)
    await batchDeleteVideos(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

async function onBatchVip() {
  if (!checkSelection()) return
  
  try {
    await ElMessageBox.confirm('确定批量设置已选视频为VIP吗？', '提示', { type: 'warning' })
    const ids = selectedRows.value.map(v => v.id)
    await batchSetVip(ids, true)
    ElMessage.success('批量设置VIP成功！')
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量设置VIP失败:', error)
    }
  }
}

async function onBatchUnVip() {
  if (!checkSelection()) return
  
  try {
    await ElMessageBox.confirm('确定批量取消已选视频的VIP状态吗？', '提示', { type: 'warning' })
    const ids = selectedRows.value.map(v => v.id)
    await batchSetVip(ids, false)
    ElMessage.success('批量取消VIP成功！')
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量取消VIP失败:', error)
    }
  }
}

async function onBatchSortAsc() {
  if (!checkSelection()) return
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSortAsc(ids)
    ElMessage.success('批量升序置顶成功！')
    selectedRows.value = []
    searchForm.value.page = 1
    await nextTick()
    fetchVideoList({ ...searchForm.value })
  } catch (error) {
    console.error('批量升序置顶失败:', error)
  }
}

// ======================= 批量设置弹窗操作 =======================
function onBatchSetLikes() {
  if (!checkSelection()) return
  batchLikesDialogVisible.value = true
}

async function submitBatchLikes() {
  if (batchLikesValue.value < 0) {
    ElMessage.warning('点赞数量不能小于0')
    return
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSetLikes(ids, batchLikesValue.value)
    ElMessage.success('点赞设置成功！')
    batchLikesDialogVisible.value = false
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    console.error('批量设置点赞失败:', error)
  }
}

function onBatchSetGold() {
  if (!checkSelection()) return
  batchGoldDialogVisible.value = true
}

async function submitBatchGold() {
  if (batchGoldValue.value < 0) {
    ElMessage.warning('金币数量不能小于0')
    return
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSetGold(ids, batchGoldValue.value)
    ElMessage.success('金币设置成功！')
    batchGoldDialogVisible.value = false
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    console.error('批量设置金币失败:', error)
  }
}

function onBatchSetCollect() {
  if (!checkSelection()) return
  batchCollectDialogVisible.value = true
}

async function submitBatchCollect() {
  if (batchCollectValue.value < 0) {
    ElMessage.warning('收藏数量不能小于0')
    return
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSetCollect(ids, batchCollectValue.value)
    ElMessage.success('收藏设置成功！')
    batchCollectDialogVisible.value = false
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    console.error('批量设置收藏失败:', error)
  }
}

function onBatchSetPlay() {
  if (!checkSelection()) return
  batchPlayDialogVisible.value = true
}

async function submitBatchPlay() {
  if (batchPlayValue.value < 0) {
    ElMessage.warning('播放数量不能小于0')
    return
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSetPlay(ids, batchPlayValue.value)
    ElMessage.success('播放数设置成功！')
    batchPlayDialogVisible.value = false
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    console.error('批量设置播放数失败:', error)
  }
}

function onBatchPreviewTime() {
  if (!checkSelection()) return
  batchPreviewDialogVisible.value = true
}

async function submitBatchPreviewTime() {
  if (!batchPreviewValue.value) {
    ElMessage.warning('请设置试看时长')
    return
  }
  
  try {
    const ids = selectedRows.value.map(v => v.id)
    await batchSetDuration(ids, batchPreviewValue.value)
    ElMessage.success('试看时长设置成功！')
    batchPreviewDialogVisible.value = false
    selectedRows.value = []
    fetchVideoList(searchForm.value)
  } catch (error) {
    console.error('批量设置试看时长失败:', error)
  }
}

// ======================= 文件上传 =======================
const handleImageUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 0 && response.data && response.data.url) {
    editForm.value.cover = response.data.url
    ElMessage.success('封面图上传成功！')
  } else {
    ElMessage.error(response.msg || '封面图上传失败！')
  }
}

const handleVideoUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 0 && response.data && response.data.url) {
    editForm.value.url = response.data.url
    ElMessage.success('视频上传成功！')
  } else {
    ElMessage.error(response.msg || '视频上传失败！')
  }
}

const handleUploadError: UploadProps['onError'] = (error, uploadFile, uploadFiles) => {
  ElMessage.error('文件上传失败，请重试！')
  console.error('Upload Error:', error)
}

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isAllowedType = allowedTypes.includes(rawFile.type)
  const isLt5M = rawFile.size / 1024 / 1024 < 5

  if (!isAllowedType) {
    ElMessage.error('封面图片只能是 JPG/PNG/GIF/WEBP 格式!')
  }
  if (!isLt5M) {
    ElMessage.error('封面图片大小不能超过 5MB!')
  }
  return isAllowedType && isLt5M
}

const beforeVideoUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'application/x-mpegURL', 'application/octet-stream']
  const isAllowedType = allowedTypes.includes(rawFile.type)
  const isLt500M = rawFile.size / 1024 / 1024 < 500

  if (!isAllowedType) {
    ElMessage.error('视频文件只能是 MP4/WEBM/MOV/M3U8 格式!')
  }
  if (!isLt500M) {
    ElMessage.error('视频文件大小不能超过 500MB!')
  }
  return isAllowedType && isLt500M
}
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
  margin-bottom: 15px;
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
.el-form-item .el-upload {
  margin-left: 10px;
  display: inline-flex;
  align-items: center;
}
.edit-dialog .el-dialog__body {
  padding: 20px;
}
.cover-preview {
  display: flex;
  align-items: flex-start;
}
.cover-preview img {
  transition: all 0.3s ease;
}
.cover-preview img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.el-divider {
  margin: 20px 0 15px 0;
}
.el-divider .el-divider__text {
  font-weight: 600;
  color: #409eff;
}
</style>
