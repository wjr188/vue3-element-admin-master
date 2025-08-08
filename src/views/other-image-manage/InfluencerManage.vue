<template>
  <div class="influencer-manage">
    <div class="top-bar">
      <div class="tab-list">
        <span class="tab-item active">OnlyFans博主管理</span>
      </div>
      <div class="status-indicator">
        <i class="el-icon-success"></i> 列表状态
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="博主名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category_id" placeholder="全部分类" clearable>
            <el-option 
              v-for="category in categoryStore.categoryList" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="searchForm.country" placeholder="请输入国家" clearable></el-input>
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
          <el-button type="success" @click="handleAddCreator">新增博主</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedCreators.length === 0">批量删除</el-button>
          <el-button @click="refreshList">刷新页面</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-list-area">
      <el-table
        :data="creatorStore.creatorList"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        v-loading="creatorStore.loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :empty-text="emptyTableText"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <img v-if="scope.row?.avatar" :src="scope.row.avatar" alt="头像" class="influencer-avatar" />
            <el-avatar v-else :size="40">
              {{ scope.row?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="博主名称" width="150"></el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="scope">
            <el-tag v-if="getCategoryName(scope.row?.category_id)" size="small">
              {{ getCategoryName(scope.row.category_id) }}
            </el-tag>
            <span v-else>未分类</span>
          </template>
        </el-table-column>
        
        <el-table-column label="国家" width="80">
          <template #default="scope">
            {{ scope.row?.country || '未知' }}
          </template>
        </el-table-column>
        
        <el-table-column label="身高" width="80">
          <template #default="scope">
            <span v-if="scope.row?.height">{{ scope.row.height }}cm</span>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        
        <!-- ✅ 新增罩杯字段 -->
        <el-table-column label="罩杯" width="60">
          <template #default="scope">
            {{ scope.row?.cup_size || '未知' }}
          </template>
        </el-table-column>
        
        <!-- ✅ 新增三围字段 -->
        <el-table-column label="三围" width="100">
          <template #default="scope">
            {{ scope.row?.measurements || '未知' }}
          </template>
        </el-table-column>
        
        <el-table-column label="生日" width="100">
          <template #default="scope">
            {{ scope.row?.birth_date || '未知' }}
          </template>
        </el-table-column>
        
        <el-table-column label="影片数量" width="80">
          <template #default="scope">
            {{ scope.row?.video_count || 0 }}
          </template>
        </el-table-column>
        
        <!-- ✅ 新增访客数字段 -->
        <el-table-column label="访客数" width="100">
          <template #default="scope">
            {{ formatCount(scope.row?.visitor_count || 0) }}
          </template>
        </el-table-column>
        
        <!-- ✅ 新增点赞数字段 -->
        <el-table-column label="点赞数" width="100">
          <template #default="scope">
            {{ formatCount(scope.row?.like_count || 0) }}
          </template>
        </el-table-column>
        
        <el-table-column label="粉丝数" width="100">
          <template #default="scope">
            {{ formatFansCount(scope.row?.fans_count || 0) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="intro" label="个人简介" show-overflow-tooltip min-width="200"></el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row?.status === 1 ? 'success' : 'danger'">
              {{ scope.row?.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <template v-if="scope.row">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
              <el-button size="small" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button size="small" @click="handleViewMedia(scope.row)">查看内容</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="creatorStore.pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="creatorStore.pagination.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="creatorStore.pagination.total"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增/编辑博主弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      @close="resetForm"
      destroy-on-close
    >
      <el-form :model="currentCreator" ref="creatorFormRef" :rules="formRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="博主名称" prop="name">
              <el-input v-model="currentCreator.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="currentCreator.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option 
                  v-for="category in categoryStore.categoryList" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <!-- ✅ 国家改为输入框 -->
            <el-form-item label="国家" prop="country">
              <el-input v-model="currentCreator.country" placeholder="请输入国家"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身高(cm)" prop="height">
              <el-input-number v-model="currentCreator.height" :min="140" :max="220" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <!-- ✅ 新增罩杯字段 -->
            <el-form-item label="罩杯" prop="cup_size">
              <el-select v-model="currentCreator.cup_size" placeholder="请选择罩杯" style="width: 100%">
                <el-option label="A" value="A"></el-option>
                <el-option label="B" value="B"></el-option>
                <el-option label="C" value="C"></el-option>
                <el-option label="D" value="D"></el-option>
                <el-option label="E" value="E"></el-option>
                <el-option label="F" value="F"></el-option>
                <el-option label="G" value="G"></el-option>
                <el-option label="H" value="H"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- ✅ 新增三围字段 -->
            <el-form-item label="三围" prop="measurements">
              <el-input v-model="currentCreator.measurements" placeholder="例如：90-60-90"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生日" prop="birth_date">
              <el-date-picker 
                v-model="currentCreator.birth_date" 
                type="date" 
                placeholder="选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="粉丝数" prop="fans_count">
              <el-input-number v-model="currentCreator.fans_count" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="影片数量" prop="video_count">
              <el-input-number v-model="currentCreator.video_count" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- ✅ 新增访客数字段 -->
            <el-form-item label="访客数" prop="visitor_count">
              <el-input-number v-model="currentCreator.visitor_count" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <!-- ✅ 新增点赞数字段 -->
            <el-form-item label="点赞数" prop="like_count">
              <el-input-number v-model="currentCreator.like_count" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sort">
              <el-input-number v-model="currentCreator.sort" :min="0" style="width: 100%"></el-input-number>
              <div class="form-tip">数值越小排序越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="头像URL" prop="avatar">
          <el-input v-model="currentCreator.avatar" placeholder="请输入头像URL"></el-input>
        </el-form-item>

        <el-form-item label="个人简介" prop="intro">
          <el-input type="textarea" v-model="currentCreator.intro" :rows="4" placeholder="请输入个人简介"></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentCreator.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitCreatorForm" :loading="creatorStore.loading">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 博主详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedCreatorForDetail" class="creator-detail">
        <div class="detail-header">
          <el-avatar :src="selectedCreatorForDetail.avatar" :size="100">
            {{ selectedCreatorForDetail.name?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
          <div class="detail-info">
            <h3>{{ selectedCreatorForDetail.name }}</h3>
            <p>分类：{{ getCategoryName(selectedCreatorForDetail.category_id) }}</p>
            <p>粉丝数：{{ formatFansCount(selectedCreatorForDetail.fans_count || 0) }}</p>
            <p>影片数量：{{ selectedCreatorForDetail.video_count || 0 }}</p>
          </div>
        </div>
        <div class="detail-content">
          <el-descriptions title="详细信息" :column="3" border>
            <el-descriptions-item label="ID">{{ selectedCreatorForDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="国家">{{ selectedCreatorForDetail.country || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="身高">
              <span v-if="selectedCreatorForDetail.height">{{ selectedCreatorForDetail.height }}cm</span>
              <span v-else>未知</span>
            </el-descriptions-item>
            <!-- ✅ 新增罩杯和三围显示 -->
            <el-descriptions-item label="罩杯">{{ selectedCreatorForDetail.cup_size || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="三围">{{ selectedCreatorForDetail.measurements || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="生日">{{ selectedCreatorForDetail.birth_date || '未知' }}</el-descriptions-item>
            <!-- ✅ 新增访客数和点赞数显示 -->
            <el-descriptions-item label="访客数">{{ formatCount(selectedCreatorForDetail.visitor_count || 0) }}</el-descriptions-item>
            <el-descriptions-item label="点赞数">{{ formatCount(selectedCreatorForDetail.like_count || 0) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="selectedCreatorForDetail.status === 1 ? 'success' : 'danger'">
                {{ selectedCreatorForDetail.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="影片数量">{{ selectedCreatorForDetail.video_count || 0 }}</el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ selectedCreatorForDetail.sort || 0 }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedCreatorForDetail.create_time }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="3">{{ selectedCreatorForDetail.update_time }}</el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="3">
              {{ selectedCreatorForDetail.intro || '暂无简介' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOnlyfansCategoryStore } from '@/store/modules/onlyfansCategory'
import { useOnlyfansCreatorStore } from '@/store/modules/onlyfansCreator'

// Store 实例
const categoryStore = useOnlyfansCategoryStore()
const creatorStore = useOnlyfansCreatorStore()
const router = useRouter()

// 响应式数据
const searchForm = ref({
  keyword: '',
  category_id: undefined as number | undefined,
  country: undefined as string | undefined,
  status: undefined as number | undefined
})

const selectedCreators = ref([])
const emptyTableText = ref('暂无数据')

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentCreator = ref({
  name: '',
  avatar: '',
  category_id: undefined,
  country: '',
  height: undefined,
  cup_size: '', // ✅ 新增罩杯字段
  measurements: '', // ✅ 新增三围字段
  birth_date: '',
  intro: '',
  fans_count: 0,
  video_count: 0,
  visitor_count: 0, // ✅ 新增访客数字段
  like_count: 0, // ✅ 新增点赞数字段
  sort: 0,
  status: 1
})
const creatorFormRef = ref(null)

const detailDialogVisible = ref(false)
const detailDialogTitle = ref('博主详情')
const selectedCreatorForDetail = ref(null)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入博主名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  country: [
    { required: false, message: '请输入国家', trigger: 'blur' }
  ],
  height: [
    { type: 'number', min: 140, max: 220, message: '身高范围在 140-220cm', trigger: 'blur' }
  ],
  cup_size: [
    { required: false, message: '请选择罩杯', trigger: 'change' }
  ],
  measurements: [
    { required: false, message: '请输入三围', trigger: 'blur' },
    { pattern: /^\d+-\d+-\d+$/, message: '请输入正确格式，例如：90-60-90', trigger: 'blur' }
  ],
  birth_date: [
    { required: false, message: '请选择生日', trigger: 'change' }
  ],
  intro: [
    { max: 1000, message: '长度不能超过 1000 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择博主状态', trigger: 'change' }
  ]
}

// 计算属性 - 获取分类名称
const getCategoryName = (categoryId: number) => {
  if (!categoryId) return '未分类'
  const category = categoryStore.categoryList?.find(c => c.id === categoryId)
  return category?.name || '未分类'
}

// 格式化粉丝数
const formatFansCount = (num: number) => {
  if (!num || isNaN(num)) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// ✅ 格式化通用数字（访客数、点赞数等）
const formatCount = (num: number) => {
  if (!num || isNaN(num)) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 获取博主列表
const fetchCreatorList = async () => {
  const params = {
    ...searchForm.value,
    page: creatorStore.pagination.page,
    pageSize: creatorStore.pagination.page_size
  }
  await creatorStore.fetchCreatorList(params)
}

// 搜索
const handleSearch = () => {
  creatorStore.setPagination(1)
  fetchCreatorList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    category_id: undefined,
    country: undefined,
    status: undefined
  }
  handleSearch()
}

// 刷新列表
const refreshList = () => {
  fetchCreatorList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCreators.value = selection
}

// 新增博主
const handleAddCreator = () => {
  dialogTitle.value = '新增博主'
  currentCreator.value = {
    name: '',
    avatar: '',
    category_id: undefined,
    country: '',
    height: undefined,
    cup_size: '',
    measurements: '',
    birth_date: '',
    intro: '',
    fans_count: 0,
    video_count: 0,
    visitor_count: 0,
    like_count: 0,
    sort: 0,
    status: 1
  }
  dialogVisible.value = true
}

// 编辑博主
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑博主'
  currentCreator.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const submitCreatorForm = () => {
  if (!creatorFormRef.value) return
  
  ;(creatorFormRef.value as any).validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (currentCreator.value.id) {
          await creatorStore.updateCreator(currentCreator.value)
          ElMessage.success('博主更新成功！')
        } else {
          await creatorStore.addCreator(currentCreator.value)
          ElMessage.success('博主新增成功！')
        }
        dialogVisible.value = false
        fetchCreatorList()
      } catch (error: any) {
        ElMessage.error('操作失败：' + (error.message || '未知错误'))
      }
    } else {
      ElMessage.error('请检查表单填写是否完整和正确！')
      return false
    }
  })
}

// 删除博主
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该博主, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await creatorStore.deleteCreator(id)
      ElMessage.success('删除成功！')
      fetchCreatorList()
    } catch (error: any) {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedCreators.value.length === 0) {
    ElMessage.warning('请至少选择一位博主进行删除！')
    return
  }
  
  ElMessageBox.confirm('此操作将永久删除选中的博主, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const idsToDelete = selectedCreators.value.map((item: any) => item.id)
      await creatorStore.batchDeleteCreator(idsToDelete)
      ElMessage.success('批量删除成功！')
      selectedCreators.value = []
      fetchCreatorList()
    } catch (error: any) {
      ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除')
  })
}

// 查看详情
const handleViewDetail = async (row: any) => {
  try {
    await creatorStore.fetchCreatorDetail(row.id)
    selectedCreatorForDetail.value = creatorStore.creatorDetail
    detailDialogTitle.value = `博主详情 - ${row.name}`
    detailDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('获取详情失败：' + (error.message || '未知错误'))
  }
}

// 查看内容
const handleViewMedia = (row: any) => {
  router.push({
    name: 'OnlyFansMediaManage',
    query: { 
      creator_id: row.id, 
      creator_name: row.name 
    }
  })
  ElMessage.info(`跳转到内容管理并筛选博主：${row.name}`)
}

// 重置表单
const resetForm = () => {
  if (creatorFormRef.value) {
    ;(creatorFormRef.value as any).resetFields()
  }
  currentCreator.value = {
    name: '',
    avatar: '',
    category_id: undefined,
    country: '',
    height: undefined,
    cup_size: '',
    measurements: '',
    birth_date: '',
    intro: '',
    fans_count: 0,
    video_count: 0,
    visitor_count: 0,
    like_count: 0,
    sort: 0,
    status: 1
  }
}

// 分页相关
const handleSizeChange = (val: number) => {
  creatorStore.setPagination(1, val)
  fetchCreatorList()
}

const handleCurrentChange = (val: number) => {
  creatorStore.setPagination(val)
  fetchCreatorList()
}

// 初始化
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategoryList(),
    fetchCreatorList()
  ])
})
</script>

<style scoped>
/* 保持原有样式 */
.influencer-manage {
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

.data-list-area {
  margin-top: 20px;
}

.influencer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  vertical-align: middle;
}

.pagination-area {
  margin-top: 20px;
  text-align: right;
}

.creator-detail .detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.creator-detail .detail-info {
  margin-left: 20px;
}

.creator-detail .detail-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.creator-detail .detail-info p {
  margin: 5px 0;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.el-table th {
  background-color: #fafafa !important;
}

.el-descriptions {
  margin-top: 20px;
}
</style>