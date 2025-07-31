<template>
  <div class="tag-manage">
    <div class="top-bar">
      <div class="tab-list">
        <span class="tab-item active">标签管理</span>
      </div>
      <div class="status-indicator">
        <i class="el-icon-price-tag"></i> 标签状态
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名">
          <el-input v-model="searchForm.name" placeholder="请输入标签名" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAddTag">新增标签</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedTags.length === 0">批量删除</el-button>
          <el-button @click="fetchTagList">刷新列表</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-list-area">
      <el-table
        :data="store.tagList"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        v-loading="loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :empty-text="emptyTableText"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column prop="name" label="标签名" width="200"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="store.pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="store.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="store.pagination.total"
        ></el-pagination>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
      destroy-on-close
    >
      <el-form :model="currentTag" ref="tagForm" :rules="formRules" label-width="80px">
        <el-form-item label="标签名" prop="name">
          <el-input v-model="currentTag.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitTagForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useTagStore } from '@/store/tag.store'; // 严格按你的要求修改

export default defineComponent({
  name: 'TagManage',
  setup() {
    const store = useTagStore(); // 使用 Pinia 的标签管理 store
    const searchForm = reactive({
      name: '',
    });
    const selectedTags = ref([]);
    const loading = ref(false);
    const emptyTableText = ref('暂无数据');

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const currentTag = reactive({
      id: null, name: '',
    });
    const formRules = {
      name: [
        { required: true, message: '请输入标签名', trigger: 'blur' },
        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
      ],
    };
    const tagForm = ref(null);

    const fetchTagList = async () => {
      loading.value = true;
      emptyTableText.value = '加载中...';
      try {
        const params = {
          name: searchForm.name,
          currentPage: store.pagination.currentPage,
          pageSize: store.pagination.pageSize,
        };
        await store.getList(params);
        ElMessage.success('标签列表获取成功！');
      } catch (error) {
        console.error('获取标签列表失败:', error);
        ElMessage.error('获取标签列表失败，请稍后再试！');
        store.tagList = [];
        store.pagination.total = 0;
      } finally {
        loading.value = false;
        if (store.tagList.length === 0) {
            emptyTableText.value = '暂无数据';
        }
      }
    };

    const handleSearch = () => {
      store.pagination.currentPage = 1;
      fetchTagList();
    };

    const resetSearch = () => {
      searchForm.name = '';
      handleSearch();
    };

    const handleSelectionChange = (selection) => {
      selectedTags.value = selection;
    };

    const handleAddTag = () => {
      dialogTitle.value = '新增标签';
      currentTag.id = null;
      currentTag.name = '';
      dialogVisible.value = true;
      if (tagForm.value) {
        tagForm.value.clearValidate();
      }
    };

    const handleEdit = (row) => {
      dialogTitle.value = '编辑标签';
      Object.assign(currentTag, row);
      dialogVisible.value = true;
      if (tagForm.value) {
        tagForm.value.clearValidate();
      }
    };

    const submitTagForm = () => {
      tagForm.value.validate(async valid => {
        if (valid) {
          if (currentTag.id) {
            ElMessageBox.confirm('确定保存对该标签的修改吗？', '提示', {
              confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(async () => {
              try {
                await store.update(currentTag.id, { name: currentTag.name });
                ElMessage.success('标签信息更新成功！');
                dialogVisible.value = false;
                fetchTagList();
              } catch (error) {
                console.error('更新标签失败:', error);
                ElMessage.error('更新标签失败，请稍后再试！');
              }
            }).catch(() => {
              ElMessage.info('已取消修改');
            });
          } else {
            ElMessageBox.confirm('确定新增该标签吗？', '提示', {
              confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(async () => {
              try {
                await store.create({ name: currentTag.name });
                ElMessage.success('标签新增成功！');
                dialogVisible.value = false;
                fetchTagList();
              } catch (error) {
                console.error('新增标签失败:', error);
                ElMessage.error('新增标签失败，请稍后再试！');
              }
            }).catch(() => {
              ElMessage.info('已取消新增');
            });
          }
        } else {
          ElMessage.error('请检查表单填写是否完整和正确！');
          return false;
        }
      });
    };

    const handleDelete = (id) => {
      ElMessageBox.confirm('此操作将永久删除该标签, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        try {
          await store.remove(id);
          ElMessage.success('删除成功!');
          fetchTagList();
        } catch (error) {
          console.error('删除标签失败:', error);
          ElMessage.error('删除标签失败，请稍后再试！');
        }
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    };

    const handleBatchDelete = () => {
      if (selectedTags.value.length === 0) {
        ElMessage.warning('请至少选择一个标签进行删除！');
        return;
      }
      ElMessageBox.confirm('此操作将永久删除选中的标签, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        try {
          const idsToDelete = selectedTags.value.map(item => item.id);
          await store.batchRemove(idsToDelete);
          selectedTags.value = [];
          ElMessage.success('批量删除成功!');
          fetchTagList();
        } catch (error) {
          console.error('批量删除标签失败:', error);
          ElMessage.error('批量删除标签失败，请稍后再试！');
        }
      }).catch(() => {
        ElMessage.info('已取消批量删除');
      });
    };

    const handleSizeChange = (val) => {
      store.pagination.pageSize = val;
      store.pagination.currentPage = 1;
      fetchTagList();
    };

    const handleCurrentChange = (val) => {
      store.pagination.currentPage = val;
      fetchTagList();
    };

    onMounted(() => {
      fetchTagList();
    });

    return {
      store,
      searchForm,
      selectedTags,
      loading,
      emptyTableText,
      dialogVisible,
      dialogTitle,
      currentTag,
      formRules,
      tagForm,
      fetchTagList,
      handleSearch,
      resetSearch,
      handleSelectionChange,
      handleAddTag,
      handleEdit,
      submitTagForm,
      handleDelete,
      handleBatchDelete,
      handleSizeChange,
      handleCurrentChange,
    };
  },
});
</script>

<style scoped>
.tag-manage {
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

.status-indicator .el-icon-price-tag {
  margin-right: 5px;
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

.pagination-area {
  margin-top: 20px;
  text-align: right;
}
</style>