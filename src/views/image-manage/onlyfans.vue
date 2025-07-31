<template>
  <div class="onlyfans-media-manage-page">
    <!-- Top Filter/Batch Operation Area -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/标签" clearable />
        </el-form-item>
        <el-form-item label="创作者">
          <el-select v-model="searchForm.creatorId" placeholder="全部创作者" clearable style="width: 120px;">
            <el-option label="全部创作者" value="" />
            <!-- Bind to onlyfansParentCategories (as creator list) -->
            <el-option v-for="item in creatorList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容系列">
          <el-select v-model="searchForm.seriesId" placeholder="全部内容系列" clearable style="width: 120px;">
            <el-option label="全部内容系列" value="" />
            <!-- Bind to onlyfansParentCategories -->
            <el-option v-for="item in onlyfansParentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容合集">
          <el-select v-model="searchForm.collectionId" placeholder="全部内容合集" clearable style="width: 120px;">
            <el-option label="全部内容合集" value="" />
            <!-- Bind to onlyfansChildCategories -->
            <el-option v-for="item in onlyfansChildCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable style="width: 120px;">
            <el-option label="全部标签" value="" />
            <!-- Bind to onlyfansTags -->
            <el-option v-for="t in onlyfansTags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加媒体专辑</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchSetGold" size="small" :disabled="selectedRows.length === 0">批量设置金币</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="onBatchVip" size="small" :disabled="selectedRows.length === 0">批量设置VIP</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="onBatchSetStatus" size="small" :disabled="selectedRows.length === 0">批量设置上架</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Area -->
    <el-card class="table-card">
      <el-table
        :data="onlyfansMedia"
        v-loading="onlyfansMediaLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="id" label="#编号" width="55" align="center" />
        <el-table-column prop="cover" label="封面" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.cover_url" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover_url"/>
            <div v-else style="width:52px; height:52px; background-color:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="100" align="center" />
        <el-table-column prop="tags" label="标签" min-width="80" align="center">
          <template #default="scope">
            <el-tag v-for="t in scope.row.tags" :key="t" size="small" type="danger" style="margin:1px;">{{ t }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="创作者" min-width="80" align="center" />
        <el-table-column prop="parentName" label="内容系列" min-width="90" align="center" />
        <el-table-column prop="categoryName" label="内容合集" min-width="90" align="center" />
        <el-table-column prop="count" label="媒体数" width="60" align="center" />
        <el-table-column prop="vip" label="VIP" width="48" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.vip" type="warning" size="small">VIP</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coin" label="金币" width="56" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.coin && scope.row.coin > 0" type="warning" size="small">{{ scope.row.coin }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="60" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="upload_time" label="上传" min-width="96" align="center" />
        <el-table-column label="操作" fixed="right" width="140" align="center">
          <template #default="scope">
            <el-button size="small" type="warning" @click="onEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="onPreview(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination component -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="onlyfansMediaTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- Add/Edit Album Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加媒体专辑':'编辑媒体专辑'" width="480px">
      <el-form :model="dialogForm" label-width="82px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="dialogForm.title" placeholder="请输入专辑标题" clearable />
        </el-form-item>
        <el-form-item label="创作者" required>
          <el-select v-model="dialogForm.creatorId" placeholder="请选择创作者" style="width:100%">
            <!-- Bind to onlyfansParentCategories -->
            <el-option v-for="item in creatorList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容系列" required>
          <el-select v-model="dialogForm.seriesId" placeholder="请选择内容系列" style="width:100%">
            <!-- Bind to onlyfansParentCategories -->
            <el-option v-for="item in onlyfansParentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容合集" required>
          <el-select v-model="dialogForm.collectionId" placeholder="请选择内容合集" style="width:100%">
            <!-- Bind to onlyfansChildCategories -->
            <el-option v-for="item in onlyfansChildCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="dialogForm.tags" multiple clearable collapse-tags style="width:100%">
            <!-- Bind to onlyfansTags -->
            <el-option v-for="t in onlyfansTags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="dialogForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币">
          <el-input-number v-model="dialogForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="上传媒体">
          <el-upload
            action="YOUR_UPLOAD_API_URL" <!-- This needs to be replaced with your actual media upload API URL -->
            list-type="picture-card"
            :file-list="dialogForm.images"
            :on-remove="handleRemoveImage"
            :on-preview="handlePreviewImage"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUploadImage"
            multiple
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" active-text="上架" inactive-text="下架" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDialog" :loading="dialogLoading">{{ dialogType==='add'?'确定':'保存' }}</el-button>
          <el-button @click="dialogVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Preview Large Media Dialog -->
    <el-dialog v-model="previewVisible" title="媒体预览" width="780px">
      <div class="preview-img-list">
        <img v-for="img in previewImages" :key="img.url" :src="img.url" style="max-width:220px;max-height:180px;margin:4px;border-radius:7px;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Import OnlyFans Media Store
import {
  onlyfansMedia,
  onlyfansMediaTotal,
  onlyfansMediaLoading,
  fetchOnlyFansMedia,
  addOnlyFansMedia,
  updateOnlyFansMedia,
  deleteOnlyFansMedia,
  batchDeleteOnlyFansMedia,
  batchSetOnlyFansMediaVip,
  batchSetOnlyFansMediaGold,
  batchSetOnlyFansMediaStatus,
  fetchOnlyFansMediaDetail
} from '@/store/modules/onlyfans-media.store';

// Import OnlyFans Category Store
import {
  onlyfansParentCategories,
  onlyfansChildCategories,
  fetchOnlyFansCategories
} from '@/store/modules/onlyfans-categories.store';

// Import OnlyFans Tag Store
import {
  onlyfansTags,
  fetchOnlyFansTags
} from '@/store/modules/onlyfans-tags.store';

// ======================= Variables/API Area =======================

// creatorList now bound to onlyfansParentCategories
const creatorList = computed(() => onlyfansParentCategories.value); // Assume creators are the top-level categories in onlyfansParentCategories

// Initialize data loading
onMounted(() => {
  fetchOnlyFansMedia(searchForm.value); // Load media list
  fetchOnlyFansCategories(); // Load categories for filtering and form
  fetchOnlyFansTags(); // Load tags for filtering and form
})

// ===================== Form/Table =====================

const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  creatorId: '',
  seriesId: '',
  collectionId: '',
  tag: ''
})

const selectedRows = ref<any[]>([])

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// Batch Delete
async function onBatchDelete() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选要删除的媒体专辑');
  }
  await ElMessageBox.confirm('确定批量删除已选媒体专辑吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchDeleteOnlyFansMedia(ids);
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = []; // Clear selection
      onSearch(); // Refresh table data
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

// Batch Set Gold
async function onBatchSetGold() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选媒体专辑');
  }
  ElMessageBox.prompt('请输入要设置的金币数量', '批量设置金币', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '金币数量必须是数字'
  }).then(async ({ value }) => {
    const gold = parseInt(value);
    if (isNaN(gold) || gold < 0) {
      return ElMessage.error('金币数量无效');
    }
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetOnlyFansMediaGold(ids, gold);
    if (res && res.code === 0) {
      ElMessage.success('批量设置金币成功');
      selectedRows.value = [];
      onSearch(); // Refresh table data
    } else {
      ElMessage.error(res?.msg || '批量设置金币失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置金币');
  });
}

// Batch Set VIP
async function onBatchVip() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选媒体专辑');
  }
  ElMessageBox.confirm('确定批量设置已选专辑为VIP吗？', '提示', {
    confirmButtonText: '设为VIP',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => { // Click "Set as VIP"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetOnlyFansMediaVip(ids, true);
    if (res && res.code === 0) {
      ElMessage.success('批量设置VIP成功');
      selectedRows.value = [];
      onSearch(); // Refresh table data
    } else {
      ElMessage.error(res?.msg || '批量设置VIP失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置VIP');
  });
}

// Batch Set Online/Offline Status
async function onBatchSetStatus() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选媒体专辑');
  }
  ElMessageBox.confirm('确定批量设置已选专辑为上架状态吗？', '提示', {
    confirmButtonText: '设为上架',
    cancelButtonText: '设为下架',
    distinguishCancelAndClose: true, // Distinguish cancel and close
    type: 'warning'
  }).then(async () => { // Click "Set as Online"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetOnlyFansMediaStatus(ids, 1);
    if (res && res.code === 0) {
      ElMessage.success('批量设置上架成功');
      selectedRows.value = [];
      onSearch(); // Refresh table data
    } else {
      ElMessage.error(res?.msg || '批量设置上架失败');
    }
  }).catch(action => { // Click "Set as Offline" or close dialog
    if (action === 'cancel') {
      ElMessageBox.confirm('确定批量设置已选专辑为下架状态吗？', '提示', {
        confirmButtonText: '设为下架',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await batchSetOnlyFansMediaStatus(ids, 0);
        if (res && res.code === 0) {
          ElMessage.success('批量设置下架成功');
          selectedRows.value = [];
          onSearch(); // Refresh table data
        } else {
          ElMessage.error(res?.msg || '批量设置下架失败');
        }
      }).catch(() => {
        ElMessage.info('已取消设置状态');
      });
    } else {
      ElMessage.info('已取消设置状态');
    }
  });
}


// ===================== Single Operation =====================
const dialogLoading = ref(false); // Control save button loading state in dialog

async function onEdit(row: any) {
  dialogType.value = 'edit';
  // Call fetchOnlyFansMediaDetail to get full details, then populate dialogForm
  const res = await fetchOnlyFansMediaDetail(row.id);
  if (res && res.code === 0 && res.data) {
    // Ensure images field is an array in el-upload file-list format
    const imagesForUpload = (res.data.image_urls || []).map((url: string) => ({
      name: url.substring(url.lastIndexOf('/') + 1), // Extract filename from URL
      url: url,
      status: 'success', // Mark as successfully uploaded
      uid: Math.random() // Generate a unique uid for each image
    }));

    // Merge existing data and full data from backend
    Object.assign(dialogForm.value, {
      ...res.data,
      vip: res.data.is_vip === 1, // Backend is_vip 1/0 to frontend true/false
      coin: res.data.gold,        // Backend gold to frontend coin
      tags: res.data.tags || [], // Ensure tags is an array
      images: imagesForUpload, // Update image list
      creatorId: res.data.creator_id || '',
      seriesId: res.data.series_id || '',
      collectionId: res.data.collection_id || '',
    });
    dialogVisible.value = true;
  } else {
    ElMessage.error('获取媒体专辑详情失败: ' + (res?.msg || '未知错误'));
  }
}

function onPreview(row: any) {
  // Preview large media, usually display all media
  // Here assuming row.images is an array containing all media URLs
  previewImages.value = (row.images || []).map((url: string) => ({ url }));
  previewVisible.value = true
}

async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除媒体专辑 “${row.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteOnlyFansMedia(row.id);
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
      onSearch(); // Refresh table data
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// =================== Add/Edit Dialog ====================
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  title: '',
  creatorId: '',
  seriesId: '',
  collectionId: '',
  tags: [], // Tags stored as array
  vip: false, // Boolean
  coin: 0,
  images: [], // File list for el-upload [{name: 'xxx', url: 'xxx', uid: 'xxx'}]
  status: 1
})

function onAdd() {
  dialogType.value = 'add'
  // Reset form
  dialogForm.value = {
    id: null, title: '', creatorId: '', seriesId: '', collectionId: '', tags: [],
    vip: false, coin: 0, images: [], status: 1
  }
  dialogVisible.value = true
}

async function submitDialog() {
  if (!dialogForm.value.title) return ElMessage.error('标题必填');
  if (!dialogForm.value.creatorId) return ElMessage.error('请选择创作者');
  if (!dialogForm.value.seriesId) return ElMessage.error('请选择内容系列');
  if (!dialogForm.value.collectionId) return ElMessage.error('请选择内容合集');
  // Optional: Check if media is uploaded
  if (dialogForm.value.images.length === 0) return ElMessage.error('请至少上传一张媒体文件');

  dialogLoading.value = true; // Start loading
  try {
    // Collect media URLs
    const mediaUrls = dialogForm.value.images.map((f: any) => f.url || f.response?.data?.url).filter(Boolean);
    // Extract cover, assume first media as cover
    const coverUrl = mediaUrls.length > 0 ? mediaUrls[0] : '';

    // Build data to submit to backend
    const submitData = {
      ...dialogForm.value,
      images: mediaUrls, // Submit media URL array
      cover_url: coverUrl, // Submit cover URL
      is_vip: dialogForm.value.vip ? 1 : 0, // vip boolean to integer
      gold: dialogForm.value.coin,          // coin转gold
      // Map frontend fields to backend expected fields
      creator_id: dialogForm.value.creatorId,
      series_id: dialogForm.value.seriesId,
      collection_id: dialogForm.value.collectionId,
    };
    // Remove frontend-specific fields
    delete submitData.vip;
    delete submitData.coin;
    delete submitData.creatorId;
    delete submitData.seriesId;
    delete submitData.collectionId;
    delete submitData.id; // If adding, no need for id

    let res;
    if (dialogType.value === 'add') {
      res = await addOnlyFansMedia(submitData);
    } else {
      // Pass id when editing
      submitData.id = dialogForm.value.id;
      res = await updateOnlyFansMedia(submitData);
    }

    if (res && res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
      dialogVisible.value = false;
      onSearch(); // Reload list
    } else {
      ElMessage.error(res?.msg || '操作失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查网络或后端服务');
    console.error('Submit Dialog Error:', error);
  } finally {
    dialogLoading.value = false; // End loading
  }
}

// ================== Media Upload/Preview =====================
function handleRemoveImage(file: any, fileList: any) {
  dialogForm.value.images = fileList;
  // Update cover (if cover is removed)
  if (dialogForm.value.images.length > 0) {
    dialogForm.value.cover_url = dialogForm.value.images[0].url;
  } else {
    dialogForm.value.cover_url = '';
  }
}

function handlePreviewImage(file: any) {
  previewImages.value = [{ url: file.url || file.response?.url }];
  previewVisible.value = true;
}

function handleUploadSuccess(response: any, file: any, fileList: any) {
  // Assuming backend upload success returns data containing full URL, e.g., response.data.url
  if (response && response.code === 0 && response.data && response.data.url) {
    // Add new uploaded media to dialogForm.images list, ElUpload will update fileList itself
    // We need to ensure full URL is stored
    file.url = response.data.url; // Update file object's url
    dialogForm.value.images = fileList;

    // Automatically set the first media as cover
    if (dialogForm.value.images.length === 1) {
      dialogForm.value.cover_url = response.data.url;
    }
    ElMessage.success('媒体上传成功！');
  } else {
    ElMessage.error('媒体上传失败：' + (response?.msg || '未知错误'));
  }
}

function beforeUploadImage(file: File) {
  const isJPGPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGPNG) {
    ElMessage.error('上传媒体文件只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传媒体文件大小不能超过 2MB!');
  }
  return isJPGPNG && isLt2M;
}

// ============== Search/Reset ==============
function onSearch() {
  searchForm.value.page = 1; // Reset to first page when searching
  fetchOnlyFansMedia(searchForm.value);
}

function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', creatorId: '', seriesId: '', collectionId: '', tag: '' }
  fetchOnlyFansMedia(); // Reload data after reset
}

// ============= Preview Media ===============
const previewVisible = ref(false)
const previewImages = ref<any[]>([])
</script>

<style scoped>
.onlyfans-media-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; margin-bottom: 15px; } /* Adjust form item spacing */
.custom-table { font-size: 12px; border-radius: 9px; }
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
.preview-img-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 6px;
}
/* Adjust el-upload style */
.el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
.el-upload-list__item {
  width: 100px;
  height: 100px;
}
</style>

