<template>
  <div class="weimiquan-image-manage-page">
    <!-- 顶部筛选/批量操作区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题/编号/标签" clearable />
        </el-form-item>
        <el-form-item label="博主">
          <el-select v-model="searchForm.author_id" placeholder="全部博主" clearable style="width: 120px;">
            <el-option label="全部博主" value="" />
            <!-- 绑定到 weimiParentCategories (一级分类即博主) -->
            <el-option v-for="item in authorList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主分类">
          <el-select v-model="searchForm.parent_id" placeholder="全部主分类" clearable style="width: 120px;">
            <el-option label="全部主分类" value="" />
            <!-- 绑定到 weimiParentCategories -->
            <el-option v-for="item in weimiParentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类">
          <el-select v-model="searchForm.category_id" placeholder="全部子分类" clearable style="width: 120px;">
            <el-option label="全部子分类" value="" />
            <!-- 绑定到 weimiChildCategories -->
            <el-option v-for="item in weimiChildCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部标签" clearable style="width: 120px;">
            <el-option label="全部标签" value="" />
            <!-- 绑定到 weimiTags -->
            <el-option v-for="t in weimiTags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onAdd" size="small">+ 添加图片专辑</el-button>
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

    <!-- 表格区 -->
    <el-card class="table-card">
      <el-table
        :data="weimiImages"
        v-loading="weimiImageLoading"
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
            <img :src="scope.row.cover" alt="封面" style="width:52px; height:52px; border-radius:8px; object-fit:cover;" v-if="scope.row.cover"/>
            <div v-else style="width:52px; height:52px; background-color:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999;">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="100" align="center" />
        <el-table-column prop="tags" label="标签" min-width="80" align="center">
          <template #default="scope">
            <el-tag v-for="t in scope.row.tags" :key="t" size="small" type="danger" style="margin:1px;">{{ t }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="博主" min-width="80" align="center" />
        <el-table-column prop="parentName" label="主分类" min-width="90" align="center" />
        <el-table-column prop="categoryName" label="子分类" min-width="90" align="center" />
        <el-table-column prop="count" label="图片数" width="60" align="center" />
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
      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="weimiImageTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 添加/编辑专辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'添加图片专辑':'编辑图片专辑'" width="480px">
      <el-form :model="dialogForm" label-width="82px" size="small">
        <el-form-item label="标题" required>
          <el-input v-model="dialogForm.title" placeholder="请输入专辑标题" clearable />
        </el-form-item>
        <el-form-item label="博主" required>
          <el-select v-model="dialogForm.author_id" placeholder="请选择博主" style="width:100%">
            <!-- 绑定到 weimiParentCategories -->
            <el-option v-for="item in authorList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主分类" required>
          <el-select v-model="dialogForm.parent_id" placeholder="请选择主分类" style="width:100%">
            <!-- 绑定到 weimiParentCategories -->
            <el-option v-for="item in weimiParentCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类" required>
          <el-select v-model="dialogForm.category_id" placeholder="请选择子分类" style="width:100%">
            <!-- 绑定到 weimiChildCategories -->
            <el-option v-for="item in weimiChildCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="dialogForm.tags" multiple clearable collapse-tags style="width:100%">
            <!-- 绑定到 weimiTags -->
            <el-option v-for="t in weimiTags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP">
          <el-switch v-model="dialogForm.vip" active-text="VIP" inactive-text="无" />
        </el-form-item>
        <el-form-item label="金币">
          <el-input-number v-model="dialogForm.coin" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            action="YOUR_UPLOAD_API_URL" <!-- 这里需要替换为你的实际图片上传API地址 -->
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

    <!-- 预览大图弹窗 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="780px">
      <div class="preview-img-list">
        <img v-for="img in previewImages" :key="img.url" :src="img.url" style="max-width:220px;max-height:180px;margin:4px;border-radius:7px;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入微密圈图片Store
import {
  weimiImages,
  weimiImageTotal,
  weimiImageLoading,
  fetchWeimiImages,
  addWeimiImage,
  updateWeimiImage,
  deleteWeimiImage,        // 新增导入
  batchDeleteWeimiImages,
  batchSetWeimiImageVip,   // 新增导入
  batchSetWeimiImageGold,  // 新增导入
  batchSetWeimiImageStatus, // 新增导入
  fetchWeimiImageDetail // 暂时没用到，但保持导入
} from '@/store/modules/weimi-images.store';

// 导入微密圈分类Store
import {
  weimiParentCategories,
  weimiChildCategories,
  fetchWeimiCategories
} from '@/store/modules/weimi-categories.store';

// 导入微密圈标签Store
import {
  weimiTags,
  fetchWeimiTags
} from '@/store/modules/weimi-tags.store';

// ======================= 变量/接口区域 =======================

// authorList 现在通过 computed 绑定到 weimiParentCategories
const authorList = computed(() => weimiParentCategories.value);

// 初始化加载数据
onMounted(() => {
  fetchWeimiImages(searchForm.value); // 加载图片列表
  fetchWeimiCategories(); // 加载分类用于筛选和表单
  fetchWeimiTags(); // 加载标签用于筛选和表单
})

// ===================== 表单/表格 =====================

const searchForm = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  author_id: '',
  parent_id: '',
  category_id: '',
  tag: ''
})

// 表格数据直接从 store 获取
// const tableData = ref<any[]>([]) // 移除此行，直接使用 weimiImages

const selectedRows = ref<any[]>([])

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// 批量删除
async function onBatchDelete() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选要删除的图片专辑');
  }
  await ElMessageBox.confirm('确定批量删除已选图片专辑吗？', '警告', { type: 'warning' }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchDeleteWeimiImages(ids); // 调用 Store 函数
    if (res && res.code === 0) {
      ElMessage.success('批量删除成功');
      selectedRows.value = []; // 清空选中
    } else {
      ElMessage.error(res?.msg || '批量删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除');
  });
}

// 批量设置金币
async function onBatchSetGold() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选图片专辑');
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
    const res = await batchSetWeimiImageGold(ids, gold); // 调用 Store 函数
    if (res && res.code === 0) {
      ElMessage.success('批量设置金币成功');
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || '批量设置金币失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置金币');
  });
}

// 批量设置VIP
async function onBatchVip() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选图片专辑');
  }
  ElMessageBox.confirm('确定批量设置已选专辑为VIP吗？', '提示', {
    confirmButtonText: '设为VIP',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetWeimiImageVip(ids, true); // 调用 Store 函数，设为VIP
    if (res && res.code === 0) {
      ElMessage.success('批量设置VIP成功');
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || '批量设置VIP失败');
    }
  }).catch(() => {
    ElMessage.info('已取消设置VIP');
  });
}

// 批量设置上架/下架状态
async function onBatchSetStatus() {
  if (!selectedRows.value.length) {
    return ElMessage.warning('请先勾选图片专辑');
  }
  ElMessageBox.confirm('确定批量设置已选专辑为上架状态吗？', '提示', {
    confirmButtonText: '设为上架',
    cancelButtonText: '设为下架',
    distinguishCancelAndClose: true, // 区分取消和关闭
    type: 'warning'
  }).then(async () => { // 点击 "设为上架"
    const ids = selectedRows.value.map(row => row.id);
    const res = await batchSetWeimiImageStatus(ids, 1); // 调用 Store 函数，设为上架
    if (res && res.code === 0) {
      ElMessage.success('批量设置上架成功');
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || '批量设置上架失败');
    }
  }).catch(action => { // 点击 "设为下架" 或 关闭弹窗
    if (action === 'cancel') {
      ElMessageBox.confirm('确定批量设置已选专辑为下架状态吗？', '提示', {
        confirmButtonText: '设为下架',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = selectedRows.value.map(row => row.id);
        const res = await batchSetWeimiImageStatus(ids, 0); // 调用 Store 函数，设为下架
        if (res && res.code === 0) {
          ElMessage.success('批量设置下架成功');
          selectedRows.value = [];
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


// ===================== 单条操作 =====================
const dialogLoading = ref(false); // 控制弹窗内保存按钮的加载状态

async function onEdit(row: any) {
  dialogType.value = 'edit';
  // 在这里调用 fetchWeimiImageDetail 来获取完整详情，然后填充 dialogForm
  // 考虑到你的后端 fetchWeimiImageDetail 接口已经返回了格式化的数据
  const res = await fetchWeimiImageDetail(row.id); // 从Store获取详情
  if (res && res.code === 0 && res.data) {
    // 确保 images 字段是符合 el-upload file-list 格式的数组
    // 后端可能返回的是一个图片URL字符串数组，或者单个封面URL
    // 需要根据后端实际返回的图片数据结构进行转换
    // 假设后端返回的 data.images 已经是[{url: '...', name: '...'}]格式 或 data.image_urls:['url1', 'url2']
    const imagesForUpload = (res.data.image_urls || []).map((url: string) => ({
      name: url.substring(url.lastIndexOf('/') + 1), // 从URL提取文件名
      url: url,
      status: 'success', // 标记为已上传成功
      uid: Math.random() // 为每个图片生成一个唯一的uid
    }));

    // 合并现有数据和从后端获取的完整数据
    Object.assign(dialogForm.value, {
      ...res.data,
      vip: res.data.is_vip === 1, // 后端 is_vip 1/0 转前端 true/false
      coin: res.data.gold,       // 后端 gold 转前端 coin
      tags: res.data.tags || [], // 确保标签是数组
      images: imagesForUpload, // 更新图片列表
      author_id: res.data.author_id || '', // 确保有默认值
      parent_id: res.data.parent_id || '',
      category_id: res.data.category_id || '',
    });
    dialogVisible.value = true;
  } else {
    ElMessage.error('获取图片专辑详情失败: ' + (res?.msg || '未知错误'));
  }
}

function onPreview(row: any) {
  // 预览大图，通常显示所有图片
  // 这里假设 row.images 是一个包含所有图片URL的数组
  previewImages.value = (row.images || []).map((url: string) => ({ url }));
  previewVisible.value = true
}

async function onDelete(row: any) {
  await ElMessageBox.confirm(`确定删除图片专辑 “${row.title}” 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteWeimiImage(row.id); // 调用 Store 函数
    if (res && res.code === 0) {
      ElMessage.success('删除成功');
    } else {
      ElMessage.error(res?.msg || '删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// =================== 添加/编辑弹窗 ====================
const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const dialogForm = ref<any>({
  id: null,
  title: '',
  author_id: '',
  parent_id: '',
  category_id: '',
  tags: [], // 标签存数组
  vip: false, // 布尔值
  coin: 0,
  images: [], // 用于el-upload的文件列表 [{name: 'xxx', url: 'xxx', uid: 'xxx'}]
  status: 1
})

function onAdd() {
  dialogType.value = 'add'
  // 重置表单
  dialogForm.value = {
    id: null, title: '', author_id: '', parent_id: '', category_id: '', tags: [],
    vip: false, coin: 0, images: [], status: 1
  }
  dialogVisible.value = true
}

async function submitDialog() {
  if (!dialogForm.value.title) return ElMessage.error('标题必填');
  if (!dialogForm.value.author_id) return ElMessage.error('请选择博主');
  if (!dialogForm.value.parent_id) return ElMessage.error('请选择主分类');
  if (!dialogForm.value.category_id) return ElMessage.error('请选择子分类');
  // 可选：检查图片是否上传
  if (dialogForm.value.images.length === 0) return ElMessage.error('请至少上传一张图片');

  dialogLoading.value = true; // 开始加载
  try {
    // 收集图片URL
    const imageUrls = dialogForm.value.images.map((f: any) => f.url || f.response?.data?.url).filter(Boolean);
    // 提取封面图，假设第一张图片作为封面
    const coverUrl = imageUrls.length > 0 ? imageUrls[0] : '';

    // 构建提交到后端的数据
    const submitData = {
      ...dialogForm.value,
      images: imageUrls, // 提交图片URL数组
      cover_url: coverUrl, // 提交封面URL
      is_vip: dialogForm.value.vip ? 1 : 0, // vip布尔值转整数
      gold: dialogForm.value.coin,         // coin转gold
    };
    // 移除前端特有的字段
    delete submitData.vip;
    delete submitData.coin;
    delete submitData.id; // 如果是新增，不需要id

    let res;
    if (dialogType.value === 'add') {
      res = await addWeimiImage(submitData); // 调用 Store 的新增函数
    } else {
      // 编辑时需要传入 id
      submitData.id = dialogForm.value.id;
      res = await updateWeimiImage(submitData); // 调用 Store 的编辑函数
    }

    if (res && res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功');
      dialogVisible.value = false;
      onSearch(); // 重新加载列表
    } else {
      ElMessage.error(res?.msg || '操作失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查网络或后端服务');
    console.error('Submit Dialog Error:', error);
  } finally {
    dialogLoading.value = false; // 结束加载
  }
}

// ================== 图片上传/预览 =====================
function handleRemoveImage(file: any, fileList: any) {
  dialogForm.value.images = fileList;
  // 更新封面 (如果被删除的是封面)
  if (dialogForm.value.images.length > 0) {
    dialogForm.value.cover = dialogForm.value.images[0].url;
  } else {
    dialogForm.value.cover = '';
  }
}

function handlePreviewImage(file: any) {
  previewImages.value = [{ url: file.url || file.response?.url }];
  previewVisible.value = true;
}

function handleUploadSuccess(response: any, file: any, fileList: any) {
  // 假设后端上传成功后返回的数据中包含图片的完整 URL，例如 response.data.url
  if (response && response.code === 0 && response.data && response.data.url) {
    // 将新上传的图片添加到 dialogForm.images 列表中，ElUpload会自行更新fileList
    // 我们需要确保存储的是完整的URL
    file.url = response.data.url; // 更新 file 对象的 url
    dialogForm.value.images = fileList;

    // 自动设置第一张图片为封面
    if (dialogForm.value.images.length === 1) {
      dialogForm.value.cover = response.data.url;
    }
    ElMessage.success('图片上传成功！');
  } else {
    ElMessage.error('图片上传失败：' + (response?.msg || '未知错误'));
  }
}

function beforeUploadImage(file: File) {
  const isJPGPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGPNG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJPGPNG && isLt2M;
}

// ============== 搜索/重置 ==============
function onSearch() {
  searchForm.value.page = 1; // 搜索时重置回第一页
  fetchWeimiImages(searchForm.value);
}

function onReset() {
  searchForm.value = { page: 1, pageSize: 10, keyword: '', author_id: '', parent_id: '', category_id: '', tag: '' }
  fetchWeimiImages(); // 重置后重新加载数据
}

// ============= 预览图片 ===============
const previewVisible = ref(false)
const previewImages = ref<any[]>([])
</script>

<style scoped>
.weimiquan-image-manage-page { padding: 18px; }
.search-card, .table-card {
  border-radius: 9px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  border: 1px solid #ebeef5;
}
.search-form { padding: 7px 2px 0 2px; }
.el-form-item { margin-right: 7px; margin-bottom: 15px; } /* 调整表单项间距 */
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
/* 调整 el-upload 样式 */
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
