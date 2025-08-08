<template>
  <div class="content-manage">
    <div class="top-bar">
      <div class="tab-list">
        <span class="tab-item active">OnlyFans内容管理</span>
      </div>
      <div class="status-indicator">
        <i class="el-icon-info"></i> 内容列表状态
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="博主">
          <el-select v-model="searchForm.creator_id" placeholder="全部博主" filterable clearable>
            <el-option 
              v-for="creator in creatorStore.creatorOptions" 
              :key="creator.value" 
              :label="creator.label" 
              :value="creator.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category_id" placeholder="全部分类" clearable>
            <el-option 
              v-for="category in categoryStore.categoryOptions" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.media_type" placeholder="全部类型" clearable>
            <el-option label="视频" value="video"></el-option>
            <el-option label="图片集" value="image_set"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
      <!-- 视频管理 -->
      <el-tab-pane label="视频管理" name="videos">
        <div class="content-toolbar" style="margin-bottom: 15px;">
          <el-button type="success" @click="handleAddVideo">新增视频</el-button>
          <el-button type="danger" @click="handleBatchDeleteVideos" :disabled="selectedVideos.length === 0">批量删除</el-button>
          <el-button @click="handleBatchSetVIP('video')" :disabled="selectedVideos.length === 0">批量设为VIP</el-button>
          <el-button @click="handleBatchCancelVIP('video')" :disabled="selectedVideos.length === 0">批量取消VIP</el-button>
          <el-button @click="fetchVideoList">刷新列表</el-button>
        </div>
        
        <el-table
          :data="mediaStore.mediaList.filter(item => item.media_type === 'video')"
          style="width: 100%"
          border
          @selection-change="handleVideoSelectionChange"
          v-loading="mediaStore.loading"
          :empty-text="'暂无视频数据'"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="编号" width="80"></el-table-column>
          <el-table-column label="封面" width="120">
            <template #default="scope">
              <img v-if="scope.row.cover_url" :src="scope.row.cover_url" alt="封面" class="content-cover" />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="视频标题" width="200"></el-table-column>
          <el-table-column label="所属博主" width="150">
            <template #default="scope">
              {{ getCreatorName(scope.row.creator_id) }}
            </template>
          </el-table-column>
          <el-table-column label="时长" width="100">
            <template #default="scope">
              {{ formatDuration(scope.row.duration) }}
            </template>
          </el-table-column>
          <el-table-column label="文件大小" width="100">
            <template #default="scope">
              {{ formatFileSize(scope.row.file_size) }}
            </template>
          </el-table-column>
          <el-table-column label="观看次数" width="100">
            <template #default="scope">
              {{ scope.row.view_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="VIP" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.is_vip" type="warning">VIP</el-tag>
              <span v-else>普通</span>
            </template>
          </el-table-column>
          <el-table-column label="金币" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.coin > 0" type="success">{{ scope.row.coin }}</el-tag>
              <span v-else>免费</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditVideo(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="handlePreviewVideo(scope.row)">预览</el-button>
              <el-button size="small" type="danger" @click="handleDeleteVideo(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 图片集管理 -->
      <el-tab-pane label="图片集管理" name="image_sets">
        <div class="content-toolbar" style="margin-bottom: 15px;">
          <el-button type="success" @click="handleAddImageSet">新增图片集</el-button>
          <el-button type="danger" @click="handleBatchDeleteImageSets" :disabled="selectedImageSets.length === 0">批量删除</el-button>
          <el-button @click="handleBatchSetVIP('image_set')" :disabled="selectedImageSets.length === 0">批量设为VIP</el-button>
          <el-button @click="handleBatchCancelVIP('image_set')" :disabled="selectedImageSets.length === 0">批量取消VIP</el-button>
          <el-button @click="fetchImageSetList">刷新列表</el-button>
        </div>
        
        <el-table
          :data="mediaStore.mediaList.filter(item => item.media_type === 'image_set')"
          style="width: 100%"
          border
          @selection-change="handleImageSetSelectionChange"
          v-loading="mediaStore.loading"
          :empty-text="'暂无图片集数据'"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="编号" width="80"></el-table-column>
          <el-table-column label="封面" width="120">
            <template #default="scope">
              <img v-if="scope.row.cover_url" :src="scope.row.cover_url" alt="封面" class="content-cover" />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="图片集标题" width="200"></el-table-column>
          <el-table-column label="所属博主" width="150">
            <template #default="scope">
              {{ getCreatorName(scope.row.creator_id) }}
            </template>
          </el-table-column>
          <el-table-column label="图片数量" width="100">
            <template #default="scope">
              <el-tag type="info">{{ scope.row.image_count || 0 }}张</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总大小" width="100">
            <template #default="scope">
              {{ formatFileSize(scope.row.total_size) }}
            </template>
          </el-table-column>
          <el-table-column label="浏览次数" width="100">
            <template #default="scope">
              {{ scope.row.view_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="VIP" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.is_vip" type="warning">VIP</el-tag>
              <span v-else>普通</span>
            </template>
          </el-table-column>
          <el-table-column label="金币" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.coin > 0" type="success">{{ scope.row.coin }}</el-tag>
              <span v-else>免费</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="350" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditImageSet(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="handleViewImages(scope.row)">查看图片</el-button>
              <el-button size="small" type="info" @click="handleManageImages(scope.row)">管理图片</el-button>
              <el-button size="small" type="danger" @click="handleDeleteImageSet(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 分页 -->
    <div class="pagination-area">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="mediaStore.pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="mediaStore.pagination.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="mediaStore.pagination.total"
      ></el-pagination>
    </div>

    <!-- 视频编辑弹窗 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="videoDialogTitle"
      width="60%"
      destroy-on-close
    >
      <el-form :model="currentVideo" ref="videoFormRef" :rules="videoFormRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频标题" prop="title">
              <el-input v-model="currentVideo.title"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属博主" prop="creator_id">
              <el-select v-model="currentVideo.creator_id" placeholder="请选择博主" style="width: 100%">
                <el-option 
                  v-for="creator in creatorStore.creatorOptions" 
                  :key="creator.value" 
                  :label="creator.label" 
                  :value="creator.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="视频文件URL" prop="video_url">
          <el-input v-model="currentVideo.video_url" placeholder="请输入视频文件URL"></el-input>
        </el-form-item>

        <el-form-item label="封面图URL" prop="cover_url">
          <el-input v-model="currentVideo.cover_url" placeholder="请输入封面图URL"></el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="时长(秒)" prop="duration">
              <el-input-number v-model="currentVideo.duration" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文件大小(MB)" prop="file_size">
              <el-input-number v-model="currentVideo.file_size" :min="0" :precision="2" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="金币" prop="coin">
              <el-input-number v-model="currentVideo.coin" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="VIP内容" prop="is_vip">
              <el-switch v-model="currentVideo.is_vip" :active-value="1" :inactive-value="0"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="currentVideo.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="currentVideo.description" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVideoForm" :loading="mediaStore.loading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片集编辑弹窗 -->
    <el-dialog
      v-model="imageSetDialogVisible"
      :title="imageSetDialogTitle"
      width="70%"
      destroy-on-close
    >
      <el-form :model="currentImageSet" ref="imageSetFormRef" :rules="imageSetFormRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图片集标题" prop="title">
              <el-input v-model="currentImageSet.title"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属博主" prop="creator_id">
              <el-select v-model="currentImageSet.creator_id" placeholder="请选择博主" style="width: 100%">
                <el-option 
                  v-for="creator in creatorStore.creatorOptions" 
                  :key="creator.value" 
                  :label="creator.label" 
                  :value="creator.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图URL" prop="cover_url">
          <el-input v-model="currentImageSet.cover_url" placeholder="请输入封面图URL"></el-input>
        </el-form-item>

        <!-- ✅ 新增：图片URL列表管理 -->
        <el-form-item label="图片列表">
          <div class="image-urls-container">
            <div v-for="(imageUrl, index) in currentImageSet.image_urls" :key="index" class="image-url-item">
              <el-input 
                v-model="currentImageSet.image_urls[index]" 
                :placeholder="`请输入第${index + 1}张图片URL`"
                style="width: calc(100% - 80px); margin-right: 10px;"
              ></el-input>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeImageUrl(index)"
                :disabled="currentImageSet.image_urls.length <= 1"
              >删除</el-button>
            </div>
            <div class="add-image-url">
              <el-button type="primary" size="small" @click="addImageUrl" icon="Plus">添加图片URL</el-button>
              <span class="tip">* 至少需要添加一张图片</span>
            </div>
          </div>
        </el-form-item>

        <!-- ✅ 图片预览区域 -->
        <el-form-item label="图片预览" v-if="currentImageSet.image_urls && currentImageSet.image_urls.some(url => url)">
          <div class="image-preview-grid">
            <div 
              v-for="(imageUrl, index) in currentImageSet.image_urls" 
              :key="index" 
              class="preview-item"
              v-show="imageUrl"
            >
              <img :src="imageUrl" :alt="`图片${index + 1}`" @error="handleImageError(index)" />
              <div class="preview-overlay">
                <span>图片 {{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="金币" prop="coin">
              <el-input-number v-model="currentImageSet.coin" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="VIP内容" prop="is_vip">
              <el-switch v-model="currentImageSet.is_vip" :active-value="1" :inactive-value="0"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="currentImageSet.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="currentImageSet.description" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imageSetDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImageSetForm" :loading="mediaStore.loading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片管理弹窗 -->
    <el-dialog
      v-model="imageManageDialogVisible"
      :title="imageManageDialogTitle"
      width="90%"
      destroy-on-close
    >
      <div class="image-manage-content">
        <div class="image-upload-area" style="margin-bottom: 20px;">
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :data="{ image_set_id: currentImageSetId }"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
            :file-list="[]"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 格式，单个文件不超过 10MB，可批量上传
              </div>
            </template>
          </el-upload>
        </div>

        <div class="image-list" v-if="currentImageSetImages.length > 0">
          <el-row :gutter="16">
            <el-col :span="6" v-for="(image, index) in currentImageSetImages" :key="image.id">
              <div class="image-item">
                <div class="image-preview">
                  <img :src="image.url" :alt="image.name" @click="previewImage(image)" />
                  <div class="image-overlay">
                    <el-button size="small" @click="previewImage(image)">预览</el-button>
                    <el-button size="small" type="danger" @click="deleteImage(image.id)">删除</el-button>
                  </div>
                </div>
                <div class="image-info">
                  <p>{{ image.name }}</p>
                  <p>{{ formatFileSize(image.size) }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-else class="empty-images">
          <el-empty description="暂无图片，请上传图片"></el-empty>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览弹窗 -->
    <el-dialog
      v-model="imagePreviewDialogVisible"
      title="图片预览"
      width="80%"
      destroy-on-close
    >
      <div class="image-preview-content" v-if="currentPreviewImage">
        <img :src="currentPreviewImage.url" :alt="currentPreviewImage.name" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
      </div>
    </el-dialog>

    <!-- 视频预览弹窗 -->
    <el-dialog
      v-model="videoPreviewDialogVisible"
      title="视频预览"
      width="80%"
      destroy-on-close
    >
      <div class="video-preview-content" v-if="currentPreviewVideo">
        <video :src="currentPreviewVideo.video_url" controls style="width: 100%; height: auto;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useOnlyfansMediaStore } from '@/store/modules/onlyfansMedia'
import { useOnlyfansCreatorStore } from '@/store/modules/onlyfansCreator'
import { useOnlyfansCategoryStore } from '@/store/modules/onlyfansCategory'

// Store 实例
const mediaStore = useOnlyfansMediaStore()
const creatorStore = useOnlyfansCreatorStore()
const categoryStore = useOnlyfansCategoryStore()

// 响应式数据
const activeTab = ref('videos')
const searchForm = ref({
  creator_id: undefined as number | undefined,
  category_id: undefined as number | undefined,
  media_type: undefined as string | undefined,
  status: undefined as number | undefined
})

// 选中项
const selectedVideos = ref([])
const selectedImageSets = ref([])

// 弹窗控制
const videoDialogVisible = ref(false)
const videoDialogTitle = ref('')
const imageSetDialogVisible = ref(false)
const imageSetDialogTitle = ref('')
const imageManageDialogVisible = ref(false)
const imageManageDialogTitle = ref('')
const imagePreviewDialogVisible = ref(false)
const videoPreviewDialogVisible = ref(false)

// 表单数据
const currentVideo = ref({
  id: undefined,
  title: '',
  creator_id: undefined,
  video_url: '',
  cover_url: '',
  duration: 0,
  file_size: 0,
  coin: 0,
  is_vip: 0,
  status: 1,
  description: '',
  media_type: 'video'
})

const currentImageSet = ref({
  id: undefined,
  title: '',
  creator_id: undefined,
  cover_url: '',
  image_urls: [''], // 图片URL数组
  coin: 0,
  is_vip: 0,
  status: 1,
  description: '',
  media_type: 'image_set'
})

// 图片管理相关
const currentImageSetId = ref(null)
const currentImageSetImages = ref([])
const currentPreviewImage = ref(null)
const currentPreviewVideo = ref(null)

// 上传配置
const uploadUrl = '/api/upload/images'
const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

// 表单验证规则
const videoFormRules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  creator_id: [{ required: true, message: '请选择博主', trigger: 'change' }],
  video_url: [{ required: true, message: '请输入视频URL', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const imageSetFormRules = {
  title: [{ required: true, message: '请输入图片集标题', trigger: 'blur' }],
  creator_id: [{ required: true, message: '请选择博主', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 表单引用
const videoFormRef = ref()
const imageSetFormRef = ref()
const uploadRef = ref()

// ✅ 图片URL管理方法
const addImageUrl = () => {
  currentImageSet.value.image_urls.push('')
}

const removeImageUrl = (index: number) => {
  if (currentImageSet.value.image_urls.length > 1) {
    currentImageSet.value.image_urls.splice(index, 1)
  }
}

const handleImageError = (index: number) => {
  ElMessage.warning(`第${index + 1}张图片加载失败，请检查URL是否正确`)
}

// 获取博主名称
const getCreatorName = (creatorId: number) => {
  const creator = creatorStore.creatorOptions.find(c => c.value === creatorId)
  return creator?.label || '未知博主'
}

// 格式化时长
const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (!size) return '0B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)}${units[index]}`
}

// 搜索和重置
const handleSearch = () => {
  mediaStore.setPagination(1)
  fetchDataForActiveTab()
}

const resetSearch = () => {
  searchForm.value = {
    creator_id: undefined,
    category_id: undefined,
    media_type: undefined,
    status: undefined
  }
  handleSearch()
}

// Tab切换
const handleTabChange = () => {
  fetchDataForActiveTab()
}

// 获取数据
const fetchDataForActiveTab = () => {
  const params = { ...searchForm.value }
  if (activeTab.value === 'videos') {
    params.media_type = 'video'
  } else if (activeTab.value === 'image_sets') {
    params.media_type = 'image_set'
  }
  mediaStore.fetchMediaList(params)
}

const fetchVideoList = () => {
  mediaStore.fetchMediaList({ ...searchForm.value, media_type: 'video' })
}

const fetchImageSetList = () => {
  mediaStore.fetchMediaList({ ...searchForm.value, media_type: 'image_set' })
}

// 选择变化
const handleVideoSelectionChange = (selection: any[]) => {
  selectedVideos.value = selection
}

const handleImageSetSelectionChange = (selection: any[]) => {
  selectedImageSets.value = selection
}

// 视频相关操作
const handleAddVideo = () => {
  videoDialogTitle.value = '新增视频'
  currentVideo.value = {
    id: undefined,
    title: '',
    creator_id: undefined,
    video_url: '',
    cover_url: '',
    duration: 0,
    file_size: 0,
    coin: 0,
    is_vip: 0,
    status: 1,
    description: '',
    media_type: 'video'
  }
  videoDialogVisible.value = true
}

const handleEditVideo = (row: any) => {
  videoDialogTitle.value = '编辑视频'
  currentVideo.value = { ...row }
  videoDialogVisible.value = true
}

const submitVideoForm = () => {
  videoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (currentVideo.value.id) {
          await mediaStore.updateMedia(currentVideo.value)
          ElMessage.success('视频更新成功！')
        } else {
          await mediaStore.addMedia(currentVideo.value)
          ElMessage.success('视频新增成功！')
        }
        videoDialogVisible.value = false
        fetchVideoList()
      } catch (error: any) {
        ElMessage.error('操作失败：' + (error.message || '未知错误'))
      }
    } else {
      ElMessage.error('请检查表单填写是否完整和正确！')
    }
  })
}

const handleDeleteVideo = async (id: number) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该视频, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await mediaStore.deleteMedia(id)
    ElMessage.success('视频删除成功!')
    fetchVideoList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

const handleBatchDeleteVideos = async () => {
  if (selectedVideos.value.length === 0) {
    ElMessage.warning('请至少选择一个视频进行删除！')
    return
  }
  
  try {
    await ElMessageBox.confirm('此操作将永久删除选中的视频, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = selectedVideos.value.map((item: any) => item.id)
    await mediaStore.batchDeleteMedia(ids)
    ElMessage.success('批量删除成功!')
    selectedVideos.value = []
    fetchVideoList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
    }
  }
}

const handlePreviewVideo = (row: any) => {
  currentPreviewVideo.value = row
  videoPreviewDialogVisible.value = true
}

// 图片集相关操作
const handleAddImageSet = () => {
  imageSetDialogTitle.value = '新增图片集'
  currentImageSet.value = {
    id: undefined,
    title: '',
    creator_id: undefined,
    cover_url: '',
    image_urls: [''], // 重置为默认一个空URL
    coin: 0,
    is_vip: 0,
    status: 1,
    description: '',
    media_type: 'image_set'
  }
  imageSetDialogVisible.value = true
}

// ✅ 修正：只保留一个 handleEditImageSet 方法
const handleEditImageSet = async (row: any) => {
  imageSetDialogTitle.value = '编辑图片集'
  
  try {
    // 尝试从 onlyfans_images 表获取图片URL列表
    let imageUrls = ['']
    
    // 如果 mediaStore 有相关方法，则使用
    if (mediaStore.getImagesByMediaId && typeof mediaStore.getImagesByMediaId === 'function') {
      try {
        const images = await mediaStore.getImagesByMediaId(row.id)
        imageUrls = images.length > 0 ? images.map(img => img.url) : ['']
      } catch (error) {
        console.log('从数据库获取图片失败，使用默认值:', error)
        // 如果数据库获取失败，尝试从行数据解析
        if (row.image_urls) {
          if (typeof row.image_urls === 'string') {
            try {
              imageUrls = JSON.parse(row.image_urls)
            } catch {
              imageUrls = [row.image_urls]
            }
          } else if (Array.isArray(row.image_urls)) {
            imageUrls = row.image_urls
          }
        }
      }
    } else {
      // 如果没有相关方法，从行数据解析
      if (row.image_urls) {
        if (typeof row.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(row.image_urls)
          } catch {
            imageUrls = [row.image_urls]
          }
        } else if (Array.isArray(row.image_urls)) {
          imageUrls = row.image_urls
        }
      }
    }
    
    currentImageSet.value = { 
      ...row,
      cover_url: row.cover_url || row.cover, // 兼容不同字段名
      image_urls: imageUrls
    }
    imageSetDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('获取图片信息失败：' + (error.message || '未知错误'))
    // 如果获取失败，使用默认值
    currentImageSet.value = { 
      ...row,
      cover_url: row.cover_url || row.cover,
      image_urls: ['']
    }
    imageSetDialogVisible.value = true
  }
}

const submitImageSetForm = () => {
  imageSetFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // 验证图片URL
      const validImageUrls = currentImageSet.value.image_urls.filter(url => url.trim() !== '')
      if (validImageUrls.length === 0) {
        ElMessage.error('请至少添加一张图片URL！')
        return
      }
      
      try {
        // 处理提交数据
        const submitData = {
          ...currentImageSet.value,
          image_count: validImageUrls.length,
          cover: currentImageSet.value.cover_url || validImageUrls[0], // 使用 cover 字段
          type: 'image' // 确保类型正确
        }
        
        let mediaId
        if (currentImageSet.value.id) {
          await mediaStore.updateMedia(submitData)
          mediaId = currentImageSet.value.id
          ElMessage.success('图片集更新成功！')
        } else {
          const result = await mediaStore.addMedia(submitData)
          mediaId = result.id || result.data?.id // 兼容不同的返回格式
          ElMessage.success('图片集新增成功！')
        }
        
        // 如果有保存图片URL的方法，则调用
        if (mediaId && mediaStore.saveImageUrls && typeof mediaStore.saveImageUrls === 'function') {
          try {
            await mediaStore.saveImageUrls(mediaId, validImageUrls)
          } catch (error) {
            console.warn('保存图片URL失败，但主数据已保存:', error)
          }
        }
        
        imageSetDialogVisible.value = false
        fetchImageSetList()
      } catch (error: any) {
        ElMessage.error('操作失败：' + (error.message || '未知错误'))
      }
    } else {
      ElMessage.error('请检查表单填写是否完整和正确！')
    }
  })
}

const handleDeleteImageSet = async (id: number) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该图片集及其所有图片, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await mediaStore.deleteMedia(id)
    ElMessage.success('图片集删除成功!')
    fetchImageSetList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

const handleBatchDeleteImageSets = async () => {
  if (selectedImageSets.value.length === 0) {
    ElMessage.warning('请至少选择一个图片集进行删除！')
    return
  }
  
  try {
    await ElMessageBox.confirm('此操作将永久删除选中的图片集及其所有图片, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = selectedImageSets.value.map((item: any) => item.id)
    await mediaStore.batchDeleteMedia(ids)
    ElMessage.success('批量删除成功!')
    selectedImageSets.value = []
    fetchImageSetList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
    }
  }
}

const handleViewImages = (row: any) => {
  // 查看图片集的所有图片（只读模式）
  ElMessage.info(`查看图片集：${row.title}`)
}

const handleManageImages = async (row: any) => {
  // 管理图片集中的图片（可增删改）
  imageManageDialogTitle.value = `管理图片集：${row.title}`
  currentImageSetId.value = row.id
  
  try {
    // 获取图片集中的所有图片
    if (mediaStore.getImagesByMediaId && typeof mediaStore.getImagesByMediaId === 'function') {
      const images = await mediaStore.getImagesByMediaId(row.id)
      currentImageSetImages.value = images || []
    } else {
      currentImageSetImages.value = []
    }
    imageManageDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('获取图片列表失败：' + (error.message || '未知错误'))
    currentImageSetImages.value = []
    imageManageDialogVisible.value = true
  }
}

// 批量VIP操作
const handleBatchSetVIP = async (type: string) => {
  const selected = type === 'video' ? selectedVideos.value : selectedImageSets.value
  if (selected.length === 0) {
    ElMessage.warning('请至少选择一项进行操作！')
    return
  }
  
  try {
    const ids = selected.map((item: any) => item.id)
    await mediaStore.batchSetVip(ids, 1)
    ElMessage.success('批量设为VIP成功！')
    fetchDataForActiveTab()
  } catch (error: any) {
    ElMessage.error('操作失败：' + (error.message || '未知错误'))
  }
}

const handleBatchCancelVIP = async (type: string) => {
  const selected = type === 'video' ? selectedVideos.value : selectedImageSets.value
  if (selected.length === 0) {
    ElMessage.warning('请至少选择一项进行操作！')
    return
  }
  
  try {
    const ids = selected.map((item: any) => item.id)
    await mediaStore.batchSetVip(ids, 0)
    ElMessage.success('批量取消VIP成功！')
    fetchDataForActiveTab()
  } catch (error: any) {
    ElMessage.error('操作失败：' + (error.message || '未知错误'))
  }
}

// 图片上传相关
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any, file: File) => {
  if (response.code === 0) {
    ElMessage.success('图片上传成功!')
    // 刷新图片列表
    if (currentImageSetId.value) {
      handleManageImages({ id: currentImageSetId.value })
    }
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

const handleUploadError = (error: any) => {
  ElMessage.error('上传失败：' + error.message)
}

const previewImage = (image: any) => {
  currentPreviewImage.value = image
  imagePreviewDialogVisible.value = true
}

const deleteImage = async (imageId: number) => {
  try {
    await ElMessageBox.confirm('确定删除这张图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (mediaStore.deleteImage && typeof mediaStore.deleteImage === 'function') {
      await mediaStore.deleteImage(imageId)
      ElMessage.success('图片删除成功!')
      // 刷新图片列表
      if (currentImageSetId.value) {
        handleManageImages({ id: currentImageSetId.value })
      }
    } else {
      ElMessage.warning('删除功能暂未实现')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 分页
const handleSizeChange = (val: number) => {
  mediaStore.setPagination(1, val)
  fetchDataForActiveTab()
}

const handleCurrentChange = (val: number) => {
  mediaStore.setPagination(val)
  fetchDataForActiveTab()
}

// 初始化
onMounted(async () => {
  try {
    await Promise.all([
      creatorStore.fetchCreatorList(),
      categoryStore.fetchCategoryList()
    ])
    fetchDataForActiveTab()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.content-manage {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.tab-list {
  display: flex;
}

.tab-item {
  padding: 8px 15px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.tab-item.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.status-indicator {
  color: #67c23a;
  font-size: 14px;
}

.search-filter-area {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form .el-form-item {
  margin-bottom: 0 !important;
  margin-right: 15px;
}

.content-cover {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination-area {
  margin-top: 20px;
  text-align: right;
}

.content-toolbar {
  margin-bottom: 15px;
}

.image-manage-content {
  min-height: 400px;
}

.image-upload-area {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
}

.image-list {
  margin-top: 20px;
}

.image-item {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
}

.image-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay .el-button {
  margin: 0 5px;
}

.image-info {
  padding: 10px;
  background-color: #f8f9fa;
}

.image-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.empty-images {
  text-align: center;
  padding: 40px;
}

.dialog-footer {
  text-align: right;
}

.el-table th {
  background-color: #fafafa !important;
}

.image-urls-container {
  margin-top: 10px;
}

.image-url-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.add-image-url {
  margin-top: 10px;
}

.tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-item:hover .preview-overlay {
  opacity: 1;
}
</style>