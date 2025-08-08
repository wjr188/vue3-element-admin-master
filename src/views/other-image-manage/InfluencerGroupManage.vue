<template>
  <div class="influencer-manage">
    <div class="top-bar">
      <div class="title">OnlyFans博主管理</div>
      <div class="refresh-status">
        <span v-if="categoryStore.loading || creatorStore.loading">列表加载中...</span>
        <span v-else>列表获取成功</span>
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchKeyword"
            placeholder="博主名称/简介"
            clearable
            @keyup.enter="handleSearch"
          ></el-input>
        </el-form-item>
        <!-- ✅ 添加排序选择器 -->
        <el-form-item label="排序方式">
          <el-select v-model="sortType" @change="handleSortChange" placeholder="请选择排序" style="width: 150px">
            <el-option label="默认排序" value="default" />
            <el-option label="粉丝数升序" value="fans_asc" />
            <el-option label="粉丝数降序" value="fans_desc" />
            <el-option label="创建时间升序" value="time_asc" />
            <el-option label="创建时间降序" value="time_desc" />
            <el-option label="名称A-Z" value="name_asc" />
            <el-option label="名称Z-A" value="name_desc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAddCategory">新增分类</el-button>
          <el-button @click="fetchData">刷新页面</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="group-tabs-and-content">
      <el-tabs v-model="currentCategoryId" @tab-change="handleTabChange" class="group-tabs">
        <el-tab-pane label="全部" name=""></el-tab-pane>
        <el-tab-pane
          v-for="category in safeCategories"
          :key="category.id"
          :label="category.name"
          :name="String(category.id)"
        >
          <template #label>
            <span class="custom-tab-label">
              {{ category.name }}
              <el-dropdown trigger="click" @command="handleCategoryCommand($event, category)" placement="bottom-start">
                <span class="el-dropdown-link">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                    <!-- ✅ 添加分类排序功能 -->
                    <el-dropdown-item command="sort-up" :disabled="!canMoveUp(category)">上移</el-dropdown-item>
                    <el-dropdown-item command="sort-down" :disabled="!canMoveDown(category)">下移</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div v-loading="creatorStore.loading" class="influencer-list-container">
        <!-- ✅ 显示排序后的创作者 -->
        <el-row v-if="sortedCreators.length > 0" :gutter="20" class="influencer-grid">
          <el-col
            v-for="creator in sortedCreators"
            :key="creator.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <el-card class="influencer-card">
              <div class="card-header">
                <el-avatar :src="creator.avatar" :size="60" class="avatar">
                  {{ creator.name?.charAt(0)?.toUpperCase() || 'U' }}
                </el-avatar>
                <div class="info">
                  <div class="nickname">{{ creator.name || '未命名' }}</div>
                  <div class="group-name">
                    <el-tag size="small">{{ getCategoryName(creator.category_id) }}</el-tag>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="fans-count">
                  粉丝：<span class="count">{{ formatFansCount(creator.fans_count || 0) }}</span>
                </div>
                <div class="description">{{ creator.intro || '暂无简介' }}</div>
              </div>
              <div class="card-footer">
                <el-button type="text" size="small" @click="handleViewDetail(creator)">查看详情</el-button>
                <el-button type="text" size="small" @click="handleEditCreator(creator)">编辑</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-else description="暂无数据"></el-empty>
      </div>
    </div>

    <!-- 分类管理弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="30%"
      destroy-on-close
    >
      <el-form :model="currentCategory" ref="categoryFormRef" :rules="categoryFormRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="currentCategory.name"></el-input>
        </el-form-item>
        <el-form-item label="分类简介" prop="intro">
          <el-input v-model="currentCategory.intro" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <!-- ✅ 添加排序字段 -->
        <el-form-item label="排序权重" prop="sort">
          <el-input-number v-model="currentCategory.sort" :min="0" :max="9999" controls-position="right" />
          <div class="form-tip">数值越小排序越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitCategoryForm" :loading="categoryStore.loading">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 博主详情弹窗 -->
    <el-dialog
      v-model="creatorDetailVisible"
      title="博主详情"
      width="50%"
      destroy-on-close
    >
      <div v-if="currentCreatorDetail" class="creator-detail">
        <div class="detail-header">
          <el-avatar :src="currentCreatorDetail.avatar" :size="80">
            {{ currentCreatorDetail.name?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
          <div class="detail-info">
            <h3>{{ currentCreatorDetail.name }}</h3>
            <p>分类：{{ getCategoryName(currentCreatorDetail.category_id) }}</p>
            <p>粉丝数：{{ formatFansCount(currentCreatorDetail.fans_count || 0) }}</p>
          </div>
        </div>
        <div class="detail-content">
          <el-descriptions title="详细信息" :column="2">
            <el-descriptions-item label="ID">{{ currentCreatorDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentCreatorDetail.status === 1 ? 'success' : 'danger'">
                {{ currentCreatorDetail.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentCreatorDetail.create_time }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentCreatorDetail.update_time }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">
              {{ currentCreatorDetail.intro || '暂无简介' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="creatorDetailVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import { useOnlyfansCategoryStore } from '@/store/modules/onlyfansCategory';
import { useOnlyfansCreatorStore } from '@/store/modules/onlyfansCreator';

// Store 实例
const categoryStore = useOnlyfansCategoryStore();
const creatorStore = useOnlyfansCreatorStore();

// 搜索相关
const searchKeyword = ref('');
const currentCategoryId = ref('');
// ✅ 添加排序相关状态
const sortType = ref('default');

// ✅ 修正：使用正确的 Store 属性名，并按排序权重排序
const safeCategories = computed(() => {
  const categories = categoryStore.categoryList || [];
  return categories.sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

const safeCreators = computed(() => {
  return creatorStore.creatorList || [];
});

// ✅ 添加排序后的创作者计算属性
const sortedCreators = computed(() => {
  const creators = [...safeCreators.value];
  
  switch (sortType.value) {
    case 'fans_asc':
      return creators.sort((a, b) => (a.fans_count || 0) - (b.fans_count || 0));
    case 'fans_desc':
      return creators.sort((a, b) => (b.fans_count || 0) - (a.fans_count || 0));
    case 'time_asc':
      return creators.sort((a, b) => new Date(a.create_time || '').getTime() - new Date(b.create_time || '').getTime());
    case 'time_desc':
      return creators.sort((a, b) => new Date(b.create_time || '').getTime() - new Date(a.create_time || '').getTime());
    case 'name_asc':
      return creators.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc':
      return creators.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    default:
      return creators.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
});

// ✅ 分类排序相关方法
const canMoveUp = (category: any) => {
  const categories = safeCategories.value;
  const index = categories.findIndex(c => c.id === category.id);
  return index > 0;
};

const canMoveDown = (category: any) => {
  const categories = safeCategories.value;
  const index = categories.findIndex(c => c.id === category.id);
  return index < categories.length - 1;
};

// 搜索和 Tab 切换相关
const handleSearch = async () => {
  try {
    const params = {
      keyword: searchKeyword.value,
      category_id: currentCategoryId.value ? parseInt(currentCategoryId.value) : undefined,
      page: 1,
      pageSize: 50
    };
    await creatorStore.fetchCreatorList(params);
  } catch (error: any) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败：' + (error.message || '未知错误'));
  }
};

// ✅ 添加排序变化处理
const handleSortChange = () => {
  // 排序是前端处理，不需要重新请求数据
  console.log('排序方式改变:', sortType.value);
};

const resetSearch = () => {
  searchKeyword.value = '';
  currentCategoryId.value = '';
  sortType.value = 'default';
  handleSearch();
};

const handleTabChange = (name: string) => {
  currentCategoryId.value = name;
  handleSearch();
};

// 格式化粉丝数的函数
const formatFansCount = (num: number) => {
  if (!num || isNaN(num)) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

// 获取分类名称 - 添加安全检查
const getCategoryName = (categoryId: number) => {
  if (!categoryId || !safeCategories.value.length) return '未分类';
  const category = safeCategories.value.find(c => c.id === categoryId);
  return category?.name || '未分类';
};

// 分类管理弹窗相关
const categoryDialogVisible = ref(false);
const categoryDialogTitle = ref('');
const currentCategory = ref<any>({ name: '', intro: '', sort: 0 });
const categoryFormRef = ref<any>(null);
const categoryFormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  intro: [
    { max: 200, message: '简介不能超过 200 个字符', trigger: 'blur' }
  ],
  sort: [
    { type: 'number', message: '排序权重必须是数字', trigger: 'blur' }
  ]
};

const handleAddCategory = () => {
  categoryDialogTitle.value = '新增分类';
  currentCategory.value = { name: '', intro: '', sort: 0 };
  categoryDialogVisible.value = true;
  nextTick(() => {
    if (categoryFormRef.value) {
      categoryFormRef.value.clearValidate();
    }
  });
};

// ✅ 修复分类移动方法
const handleCategoryMove = async (category: any, direction: 'up' | 'down') => {
  try {
    const categories = [...safeCategories.value]; // 创建副本
    const currentIndex = categories.findIndex(c => c.id === category.id);
    
    console.log('当前分类:', category.name, '当前索引:', currentIndex);
    console.log('移动方向:', direction);
    
    if (direction === 'up' && currentIndex > 0) {
      // 上移：与前一个分类交换
      const prevCategory = categories[currentIndex - 1];
      console.log('与前一个分类交换:', prevCategory.name);
      
      // ✅ 重新计算排序值，确保有明显差异
      const newSort = prevCategory.sort - 1;
      
      // 更新当前分类的排序
      await categoryStore.updateCategory({
        ...category,
        sort: newSort
      });
      
      console.log(`${category.name} 排序更新为: ${newSort}`);
      
    } else if (direction === 'down' && currentIndex < categories.length - 1) {
      // 下移：与后一个分类交换
      const nextCategory = categories[currentIndex + 1];
      console.log('与后一个分类交换:', nextCategory.name);
      
      // ✅ 重新计算排序值，确保有明显差异
      const newSort = nextCategory.sort + 1;
      
      // 更新当前分类的排序
      await categoryStore.updateCategory({
        ...category,
        sort: newSort
      });
      
      console.log(`${category.name} 排序更新为: ${newSort}`);
    }
    
    // ✅ 等待一点时间再刷新，确保后端更新完成
    setTimeout(async () => {
      await fetchData();
      ElMessage.success(`分类${direction === 'up' ? '上移' : '下移'}成功`);
    }, 200);
    
  } catch (error: any) {
    console.error('分类移动失败:', error);
    ElMessage.error('分类移动失败：' + (error.message || '未知错误'));
  }
};

const handleCategoryCommand = async (command: string, category: any) => {
  console.log('分类操作:', command, category.name);
  
  if (command === 'edit') {
    categoryDialogTitle.value = '编辑分类';
    currentCategory.value = { ...category };
    categoryDialogVisible.value = true;
    nextTick(() => {
      if (categoryFormRef.value) {
        categoryFormRef.value.clearValidate();
      }
    });
  } else if (command === 'delete') {
    handleDeleteCategory(category.id);
  } else if (command === 'sort-up') {
    await handleCategoryMove(category, 'up');
  } else if (command === 'sort-down') {
    await handleCategoryMove(category, 'down');
  }
};

const submitCategoryForm = () => {
  if (!categoryFormRef.value) return;
  
  categoryFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (currentCategory.value.id) {
          await categoryStore.updateCategory(currentCategory.value);
          ElMessage.success('分类更新成功！');
        } else {
          await categoryStore.addCategory(currentCategory.value);
          ElMessage.success('分类新增成功！');
        }
        categoryDialogVisible.value = false;
        await fetchData();
      } catch (error: any) {
        console.error('分类操作失败:', error);
        ElMessage.error('操作失败：' + (error.message || '未知错误'));
      }
    } else {
      ElMessage.error('请检查表单填写！');
      return false;
    }
  });
};

const handleDeleteCategory = (id: number) => {
  ElMessageBox.confirm('确定永久删除该分类吗？此操作不可逆！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    try {
      await categoryStore.deleteCategory(id);
      ElMessage.success('分类删除成功！');
      await fetchData(); // 刷新数据
    } catch (error: any) {
      console.error('删除分类失败:', error);
      ElMessage.error('删除失败：' + (error.message || '未知错误'));
    }
  })
  .catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 博主详情相关
const creatorDetailVisible = ref(false);
const currentCreatorDetail = ref<any>(null);

const handleViewDetail = async (creator: any) => {
  try {
    // ✅ 使用正确的方法名
    const detail = await creatorStore.fetchCreatorDetail(creator.id);
    if (detail && detail.code === 0) {
      currentCreatorDetail.value = creatorStore.creatorDetail;
      creatorDetailVisible.value = true;
    } else {
      ElMessage.error('获取博主详情失败');
    }
  } catch (error: any) {
    console.error('获取博主详情失败:', error);
    ElMessage.error('获取博主详情失败：' + (error.message || '未知错误'));
  }
};

const handleEditCreator = (creator: any) => {
  // 这里可以跳转到博主编辑页面或打开编辑弹窗
  ElMessage.info('博主编辑功能待实现');
};

// ✅ 修正数据加载函数，使用正确的方法名
const fetchData = async () => {
  try {
    console.log('开始刷新数据...');
    
    // 先清空当前数据，强制重新渲染
    categoryStore.$patch({ categoryList: [] });
    
    // 重新加载分类数据
    await categoryStore.fetchCategoryList();
    console.log('分类数据刷新完成:', categoryStore.categoryList?.length);
    
    // 重新加载创作者数据
    await creatorStore.fetchCreatorList({ 
      page: 1, 
      pageSize: 50,
      category_id: currentCategoryId.value ? parseInt(currentCategoryId.value) : undefined
    });
    console.log('创作者数据刷新完成:', creatorStore.creatorList?.length);
    
  } catch (error: any) {
    console.error('数据加载异常:', error);
    ElMessage.error('数据加载失败：' + (error.message || '未知错误'));
  }
};

onMounted(() => {
  // 延迟加载，确保 Store 完全初始化
  nextTick(() => {
    fetchData();
  });
});
</script>

<style scoped>
.influencer-manage {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.top-bar .title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.top-bar .refresh-status {
  font-size: 14px;
  color: #67c23a;
}

.search-filter-area {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-form .el-form-item {
  margin-bottom: 0 !important;
  margin-right: 15px;
}

.group-tabs-and-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 20px 20px;
}

.group-tabs {
  margin-bottom: 20px;
}

.group-tabs .el-tabs__header {
  margin-bottom: 0;
}

.group-tabs .el-tabs__item {
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}

.group-tabs .el-tabs__nav-wrap::after {
  height: 0px;
}

.custom-tab-label {
  display: flex;
  align-items: center;
}

.custom-tab-label .el-dropdown-link {
  margin-left: 5px;
  cursor: pointer;
  color: #909399;
}

.influencer-list-container {
  min-height: 300px;
}

.influencer-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -10px;
}

.el-col {
  padding: 10px !important;
}

.influencer-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.influencer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.card-header .avatar {
  flex-shrink: 0;
  margin-right: 15px;
  border: 2px solid #409eff;
}

.card-header .info {
  flex-grow: 1;
}

.card-header .nickname {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header .group-name .el-tag {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #d9ecff;
}

.card-body {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-body .fans-count {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.card-body .fans-count .count {
  font-weight: bold;
  color: #606266;
}

.card-body .description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .influencer-manage {
    padding: 10px;
  }
  .el-col {
    padding: 5px !important;
  }
  .influencer-card {
    margin-bottom: 10px;
  }
  .group-tabs .el-tabs__item {
    padding: 0 10px;
    font-size: 14px;
  }
}
</style>