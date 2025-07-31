<template>
  <div class="banner-management-container p-4 bg-gray-100 min-h-screen">
    <!-- Top Area -->
    <div class="header-section flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
      <h1 class="text-2xl font-semibold text-gray-800">轮播广告管理</h1>
      <el-button type="primary" @click="openAddDialog">新增广告</el-button>
    </div>

    <!-- Ad List Table -->
    <div class="table-section bg-white p-4 rounded-lg shadow-sm">
      <el-table
        :data="banners"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        class="banner-table"
      >
        <el-table-column prop="id" label="序号/ID" width="90"></el-table-column>
        <el-table-column label="广告图片" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.image_url"
              fit="cover"
              class="w-20 h-20 rounded-md border border-gray-200"
              :preview-src-list="[scope.row.image_url]"
              :initial-index="0"
            >
              <template #error>
                <div class="image-slot flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-sm">
                  <el-icon><Picture /></el-icon>
                  <span>无图</span>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="广告标题" show-overflow-tooltip></el-table-column>
        <el-table-column prop="link" label="跳转链接" show-overflow-tooltip>
          <template #default="scope">
            <a :href="scope.row.link" target="_blank" class="text-blue-500 hover:underline">
              {{ scope.row.link }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100">
          <template #default="scope">
            <el-input
              v-model.number="scope.row.sort_order"
              @change="onUpdateBannerSort(scope.row)"
              class="w-20"
              size="small"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="onUpdateBannerStatus(scope.row)"
              active-text="启用"
              inactive-text="禁用"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper mt-4 flex justify-end">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="totalBanners"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>

    <!-- Add/Edit Ad Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑广告' : '新增广告'"
      width="600px"
      :before-close="handleDialogClose"
      destroy-on-close
    >
      <el-form
        :model="currentBanner"
        :rules="formRules"
        ref="bannerForm"
        label-width="100px"
        class="banner-form"
      >
        <el-form-item label="图片地址" prop="image_url">
          <el-input v-model="currentBanner.image_url" placeholder="可填写图片URL或上传图片"></el-input>
          <div class="el-upload__tip mt-2 text-sm text-gray-500">
            优先使用此处的图片URL，如果未填写则使用下方上传的图片。
          </div>
        </el-form-item>

        <el-form-item label="图片上传">
          <el-upload
            class="avatar-uploader rounded-md border border-dashed border-gray-300 hover:border-blue-400"
            action=""
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="uploadImage"
          >
            <!-- Prioritize displaying the image from image_url, otherwise display the upload icon -->
            <img v-if="currentBanner.image_url" :src="currentBanner.image_url" class="w-32 h-32 object-cover rounded-md" alt="Banner Image" />
            <el-icon v-else class="avatar-uploader-icon w-32 h-32 flex items-center justify-center text-gray-400 text-4xl"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip mt-2 text-sm text-gray-500">
            请上传 JPG/PNG 格式的图片，最大 2MB。上传会覆盖图片地址。
          </div>
        </el-form-item>

        <el-form-item label="广告标题" prop="title">
          <el-input v-model="currentBanner.title" placeholder="请输入广告标题"></el-input>
        </el-form-item>

        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="currentBanner.link" placeholder="请输入跳转链接（URL）"></el-input>
          <div class="el-form-item__extra text-xs text-gray-500 mt-1">
            支持外链和站内链接。例如: `https://www.example.com` 或 `/detail?id=123`
          </div>
        </el-form-item>

        <el-form-item label="排序号" prop="sort_order">
          <el-input-number v-model.number="currentBanner.sort_order" :min="1" :max="99999" controls-position="right"></el-input-number>
          <div class="el-form-item__extra text-xs text-gray-500 mt-1">
            数字越小，排序越靠前。
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentBanner.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="submitBannerForm">
            {{ isEditMode ? '保存' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture, Plus } from '@element-plus/icons-vue'; // Import Element Plus icons

// 从 store 模块导入响应式数据和操作
import {
  banners,
  totalBanners,
  loading,
  fetchBannerList,
  addBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
  updateBannerStatus,
  updateBannerSort
} from '@/store/modules/banner.store';

// Table data (不再需要单独的ref，直接使用store的banners和totalBanners)
const currentPage = ref(1);
const pageSize = ref(10);

// Dialog state
const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentBanner = ref({
  id: null,
  image_url: '', // Image URL
  title: '',
  link: '',
  sort_order: 1, // Default sort order
  status: 1, // Default to enabled
});

const bannerForm = ref(null); // Form reference

// Form validation rules
const formRules = reactive({
  // image_url field is no longer required, only validated for type and format if present
  image_url: [
    {
      validator: (rule, value, callback) => {
        // If a value is provided, validate if it's a valid URL format
        if (value && typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value); // Try to create a URL object, if it fails, it's not a valid URL
            callback();
          } catch (e) {
            callback(new Error('请输入有效的图片URL地址'));
          }
        } else {
          callback(); // If no value, pass validation (not required)
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
  title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
  link: [{ required: true, message: '请输入跳转链接', trigger: 'blur' }],
  sort_order: [{ required: true, type: 'number', message: '请输入有效排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// Fetch banner list
const getBanners = async () => {
  const result = await fetchBannerList({ page: currentPage.value, pageSize: pageSize.value });
  if (!result.success) {
    ElMessage.error(result.message);
  }
};

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page;
  getBanners();
};

// Open add dialog
const openAddDialog = () => {
  isEditMode.value = false;
  currentBanner.value = {
    id: null,
    image_url: '', // Clear image URL for new item
    title: '',
    link: '',
    sort_order: 1,
    status: 1,
  };
  dialogVisible.value = true;
  nextTick(() => {
    bannerForm.value?.clearValidate();
  });
};

// Open edit dialog
const openEditDialog = (row) => {
  isEditMode.value = true;
  currentBanner.value = { ...row }; // Deep copy to avoid direct modification of table data
  dialogVisible.value = true;
  nextTick(() => {
    bannerForm.value?.clearValidate();
  });
};

// Close dialog
const handleDialogClose = () => {
  dialogVisible.value = false;
  bannerForm.value?.resetFields(); // Reset form fields
};

// Submit add/edit form
const submitBannerForm = async () => {
  await bannerForm.value.validate(async (valid) => {
    if (valid) {
      let result;
      if (isEditMode.value) {
        result = await updateBanner(currentBanner.value);
      } else {
        result = await addBanner(currentBanner.value);
      }
      
      if (result.success) {
        ElMessage.success(result.message);
        dialogVisible.value = false;
        getBanners(); // Reload list
      } else {
        ElMessage.error(result.message);
      }
    } else {
      ElMessage.warning('请检查表单填写是否完整和正确！');
    }
  });
};

// Confirm delete banner
const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条广告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const result = await deleteBanner(id);
      if (result.success) {
        ElMessage.success(result.message);
        getBanners(); // Reload list
      } else {
        ElMessage.error(result.message);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// Update banner status
const onUpdateBannerStatus = async (row) => {
  const originalStatus = row.status === 1 ? 0 : 1; // 记录原始状态
  const result = await updateBannerStatus(row.id, row.status);
  if (result.success) {
    ElMessage.success(result.message);
  } else {
    ElMessage.error(result.message);
    row.status = originalStatus; // 恢复原始状态
  }
};

// Update banner sort order
const onUpdateBannerSort = async (row) => {
  const result = await updateBannerSort(row.id, row.sort_order);
  if (result.success) {
    ElMessage.success(result.message);
    getBanners(); // 重新获取列表以反映新的排序
  } else {
    ElMessage.error(result.message);
  }
};

// Image upload pre-check
const beforeImageUpload = (rawFile) => {
  const isJPGPNG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPGPNG) {
    ElMessage.error('图片只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// Custom image upload
const uploadImage = async (options) => {
  const result = await uploadBannerImage(options.file);
  if (result.success) {
    currentBanner.value.image_url = result.url; // Update image_url field after successful upload
    bannerForm.value?.validateField('image_url'); // Trigger form image validation
  } else {
    ElMessage.error(result.message);
  }
};

// Load data when component is mounted
onMounted(() => {
  getBanners();
});
</script>

<style scoped>
.banner-management-container {
  font-family: 'Inter', sans-serif;
}

/* Element Plus default style overrides and customizations */
.el-button {
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Button shadow */
  transition: all 0.2s ease-in-out;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.el-table {
  border-radius: 8px;
  overflow: hidden; /* Ensure rounded corners take effect */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Table overall shadow */
}

/* Mimic grid effect from the image with white background */
.el-table th.el-table__cell,
.el-table td.el-table__cell {
  border-bottom: 1px solid #f0f0f0; /* Finer bottom border */
  border-right: 1px solid #f0f0f0; /* Right border to form grid */
}

.el-table th.el-table__cell:last-child,
.el-table td.el-table__cell:last-child {
  border-right: none; /* No right border for the last column */
}

.el-table__header-wrapper th {
  background-color: #f7f9fa; /* Table header background color */
  color: #333; /* Table header font color */
  font-weight: 600;
}

.el-table__row:nth-child(even) {
  background-color: #fcfcfc; /* Alternating row background color */
}

.el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.el-dialog__header {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
  font-weight: bold;
}

.el-form-item {
  margin-bottom: 20px;
}

/* Uploader component styles */
.avatar-uploader .el-upload {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.image-slot {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>
