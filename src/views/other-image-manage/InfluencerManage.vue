<template>
  <div class="influencer-manage">
    <div class="top-bar">
      <div class="tab-list">
        <span class="tab-item active">博主管理</span>
      </div>
      <div class="status-indicator">
        <i class="el-icon-success"></i> 列表状态
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.nickname" placeholder="昵称" clearable></el-input>
        </el-form-item>
        <el-form-item label="国家">
          <el-select v-model="searchForm.country" placeholder="全部国家" clearable>
            <el-option v-for="country in store.countryOptions" :key="country" :label="country" :value="country"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="正常" value="正常"></el-option>
            <el-option label="禁用" value="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tagId" placeholder="全部标签" clearable>
            <el-option v-for="tag in store.tagOptions" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAddInfluencer">新增博主</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedInfluencers.length === 0">批量删除</el-button>
          <el-button @click="refreshList">刷新页面</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-list-area">
      <el-table
        :data="influencerList"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        v-loading="store.loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :empty-text="emptyTableText"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <img v-if="scope.row && scope.row.avatar" :src="scope.row.avatar" alt="头像" class="influencer-avatar" />
            <span v-else>N/A</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
        <el-table-column prop="country" label="国家" width="100"></el-table-column>
        <el-table-column prop="intro" label="简介" show-overflow-tooltip></el-table-column>
        <el-table-column label="专辑数" width="90">
          <template #default="scope">
            {{ scope.row && scope.row.album_count !== undefined ? scope.row.album_count : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="视频数" width="90">
          <template #default="scope">
            {{ scope.row && scope.row.video_count !== undefined ? scope.row.video_count : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row && scope.row.status" :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="group_name" label="分组" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.group_name">{{ scope.row.group_name }}</el-tag>
            <span v-else>未分组</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <template v-if="scope.row">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
              <el-button size="small" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button size="small" @click="handleViewContent(scope.row)">查看内容</el-button>
            </template>
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
      width="50%"
      @close="resetForm"
      destroy-on-close
    >
      <el-form :model="currentInfluencer" ref="influencerForm" :rules="formRules" label-width="100px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="currentInfluencer.nickname"></el-input>
        </el-form-item>
        <el-form-item label="头像URL" prop="avatar">
          <el-input v-model="currentInfluencer.avatar" placeholder="请输入头像URL"></el-input>
          </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-select v-model="currentInfluencer.country" placeholder="请选择国家">
            <el-option v-for="country in store.countryOptions" :key="country" :label="country" :value="country"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身高" prop="height">
          <el-input-number v-model="currentInfluencer.height" :min="0" :max="300"></el-input-number> cm
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="currentInfluencer.birthday"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="罩杯" prop="cup">
          <el-input v-model="currentInfluencer.cup" placeholder="如 C Cup"></el-input>
        </el-form-item>
        <el-form-item label="三围" prop="size">
          <el-input v-model="currentInfluencer.size" placeholder="如 90-60-90"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input type="textarea" v-model="currentInfluencer.intro"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentInfluencer.status">
            <el-radio label="正常"></el-radio>
            <el-radio label="禁用"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="currentInfluencer.tags" multiple placeholder="请选择标签">
            <el-option v-for="tag in store.tagOptions" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分组" prop="group_id">
          <el-select v-model="currentInfluencer.group_id" placeholder="请选择分组">
            <el-option
              v-for="group in store.groupOptions"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitInfluencerForm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="60%"
      destroy-on-close
    >
      <InfluencerDetail
        :influencer="selectedInfluencerForDetail"
        @refresh="refreshList"
        @closeDetailDialogAndNavigate="handleCloseDetailDialogAndNavigate"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useInfluencerStore } from '@/store/influencer.store'; // 修改这里
import { storeToRefs } from 'pinia';
import InfluencerDetail from './components/InfluencerDetail.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'InfluencerManage',
  components: {
    InfluencerDetail,
  },
  setup() { // 使用 setup 替代 data 和 methods
    const store = useInfluencerStore();
    // 使用 storeToRefs 来解构 store 中的响应式数据，保持其响应性
    const { influencerList, loading, pagination, countryOptions, tagOptions } = storeToRefs(store);

    // 组件内部状态
    const searchForm = ref({
      nickname: '',
      country: null,
      status: null,
      tagId: null,
    });
    const selectedInfluencers = ref([]);
    const emptyTableText = ref('暂无数据');

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const currentInfluencer = ref({
      id: null, avatar: '', nickname: '', country: null, height: null, birthday: null,
      cup: '', size: '', intro: '', status: '正常', fans: 0, likes: 0,
      album_count: 0, video_count: 0, create_time: '', tags: [],
      group_id: null, // 新增
    });
    const influencerForm = ref(null); // 用于引用表单组件

    const detailDialogVisible = ref(false);
    const detailDialogTitle = ref('博主详情');
    const selectedInfluencerForDetail = ref({});

    // 表单验证规则
    const formRules = {
      nickname: [
        { required: true, message: '请输入博主昵称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      avatar: [
        { required: true, message: '请输入头像URL', trigger: 'blur' }
      ],
      country: [
        { required: true, message: '请选择国家', trigger: 'change' }
      ],
      group_id: [
        { required: true, message: '请选择分组', trigger: 'change' }
      ],
      intro: [
        { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
      ],
      status: [
        { required: true, message: '请选择博主状态', trigger: 'change' }
      ],
      tags: [
        { type: 'array', message: '请选择标签', trigger: 'change' }
      ]
    };

    // 页面方法
    const fetchInfluencerList = async () => {
      const params = {
        ...searchForm.value,
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
      };
      await store.getList(params);
      // 这里打印
      console.log('influencerList.value:', influencerList.value);
    };

    const handleSearch = () => {
      store.pagination.currentPage = 1; // 直接修改 store 的分页状态
      fetchInfluencerList();
    };

    const resetSearch = () => {
      searchForm.value = {
        nickname: '',
        country: null,
        status: null,
        tagId: null,
      };
      handleSearch();
    };

    const refreshList = () => {
      fetchInfluencerList();
    };

    const handleSelectionChange = (selection) => {
      selectedInfluencers.value = selection;
    };

    const handleAddInfluencer = () => {
      dialogTitle.value = '新增博主';
      currentInfluencer.value = {
        id: null, avatar: '', nickname: '', country: null, height: null, birthday: null,
        cup: '', size: '', intro: '', status: '正常', fans: 0, likes: 0,
        album_count: 0, video_count: 0, create_time: '', tags: [],
        group_id: null, // 新增
      };
      dialogVisible.value = true;
    };

    const handleEdit = (row) => {
      dialogTitle.value = '编辑博主';
      currentInfluencer.value = JSON.parse(JSON.stringify(row));
      if (!('group_id' in currentInfluencer.value)) currentInfluencer.value.group_id = null;
      dialogVisible.value = true;
    };

    const submitInfluencerForm = () => {
      influencerForm.value.validate(async valid => {
        if (valid) {
          // 这里加 log
          console.log('提交前的 currentInfluencer:', currentInfluencer.value);

          if (currentInfluencer.value.id) {
            ElMessageBox.confirm('确定保存对该博主的修改吗？', '提示', {
              confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(async () => {
              console.log('更新博主:', currentInfluencer.value);
              // 编辑
              await store.update(currentInfluencer.value);
              dialogVisible.value = false;
              // store.update 内部会调用 getList 刷新列表，所以这里无需再次调用 fetchInfluencerList
            }).catch(() => {
              ElMessage.info('已取消修改');
            });
          } else {
            ElMessageBox.confirm('确定新增该博主吗？', '提示', {
              confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(async () => {
              console.log('新增博主:', currentInfluencer.value);
              await store.create(currentInfluencer.value);
              dialogVisible.value = false;
              // store.create 内部会调用 getList 刷新列表，所以这里无需再次调用 fetchInfluencerList
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

    const handleDelete = async (id) => {
      ElMessageBox.confirm('此操作将永久删除该博主, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        console.log('删除博主ID:', id);
        // 删除
        await store.remove({ id });
        // store.remove 内部会调用 getList 刷新列表，所以这里无需再次调用 fetchInfluencerList
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    };

    const handleBatchDelete = async () => {
      if (selectedInfluencers.value.length === 0) {
        ElMessage.warning('请至少选择一位博主进行删除！');
        return;
      }
      ElMessageBox.confirm('此操作将永久删除选中的博主, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        const idsToDelete = selectedInfluencers.value.map(item => item.id);
        console.log('批量删除博主ID:', idsToDelete);
        // 批量删除
        await store.batchRemove({ ids: idsToDelete });
        selectedInfluencers.value = []; // 清空选中
        // store.batchRemove 内部会调用 getList 刷新列表，所以这里无需再次调用 fetchInfluencerList
      }).catch(() => {
        ElMessage.info('已取消批量删除');
      });
    };

    const handleViewDetail = (row) => {
      selectedInfluencerForDetail.value = Object.assign({}, row);
      detailDialogTitle.value = `博主详情 - ${row.nickname}`;
      detailDialogVisible.value = true;
      console.log('[DEBUG] 打开详情弹窗:',
        row.nickname,
        'Visible:', detailDialogVisible.value,
        'Data:', selectedInfluencerForDetail.value
      );
    };

    const handleCloseDetailDialogAndNavigate = (routeConfig) => {
      detailDialogVisible.value = false;
      // 在 setup 中获取 router
      const router = this.$router; // 在 setup 中访问 this.$router 略有不同，但通常建议使用 useRouter
      // import { useRouter } from 'vue-router';
      // const router = useRouter();
      if (router) {
        router.push(routeConfig);
        ElMessage.info(`跳转到内容管理并筛选博主：${routeConfig.query.influencerNickname}`);
      } else {
        console.warn('Vue Router not available for navigation.');
      }
    };

    const handleViewContent = (row) => {
      const router = this.$router; // 同上，建议使用 useRouter()
      if (router) {
        router.push({
          name: 'ContentManage',
          query: { influencerId: row.id, influencerNickname: row.nickname }
        });
        ElMessage.info(`跳转到内容管理并筛选博主：${row.nickname}`);
      } else {
        console.warn('Vue Router not available for navigation.');
      }
    };

    const resetForm = () => {
      // 在 Element-Plus Dialog 的 destroy-on-close 模式下，每次关闭会销毁组件，重新打开时会重新初始化 currentInfluencer
      // 因此，通常不需要在这里手动 resetFields 或重置 currentInfluencer
      // 但为了确保逻辑完整性，保留此函数体，但实际效果可能不大
      if (influencerForm.value) {
        influencerForm.value.resetFields();
      }
      currentInfluencer.value = {
        id: null, avatar: '', nickname: '', country: null, height: null, birthday: null,
        cup: '', size: '', intro: '', status: '正常', fans: 0, likes: 0,
        album_count: 0, video_count: 0, create_time: '', tags: [],
        group_id: null, // 新增
      };
    };

    const handleSizeChange = (val) => {
      store.pagination.pageSize = val; // 直接修改 store 的分页状态
      store.pagination.currentPage = 1;
      fetchInfluencerList();
    };

    const handleCurrentChange = (val) => {
      store.pagination.currentPage = val; // 直接修改 store 的分页状态
      fetchInfluencerList();
    };

    // 生命周期钩子
    onMounted(() => {
      fetchInfluencerList();
      store.getCountryOptions();
      store.getTagOptions();
      store.getGroupOptions(); // 这里加上，确保分组选项能加载
    });

    return {
      store, // 将整个 store 实例返回，可以在模板中直接访问 store.influencerList 等
      // 或者单独返回解构后的响应式数据
      influencerList,
      loading,
      pagination,
      countryOptions: store.countryOptions, // 直接从 store 访问，它已经是响应式的
      tagOptions: store.tagOptions,         // 直接从 store 访问，它已经是响应式的

      searchForm,
      selectedInfluencers,
      emptyTableText,
      dialogVisible,
      dialogTitle,
      currentInfluencer,
      influencerForm, // 暴露给模板
      formRules,
      detailDialogVisible,
      detailDialogTitle,
      selectedInfluencerForDetail,

      // 方法
      fetchInfluencerList,
      handleSearch,
      resetSearch,
      refreshList,
      handleSelectionChange,
      handleAddInfluencer,
      handleEdit,
      submitInfluencerForm,
      handleDelete,
      handleBatchDelete,
      handleViewDetail,
      handleCloseDetailDialogAndNavigate,
      handleViewContent,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
    };
  },
});
</script>

<style scoped>
/* 整个组件的容器 */
.influencer-manage {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 顶部导航和操作区 */
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

.status-indicator .el-icon-success {
  margin-right: 5px;
}

/* 搜索和筛选区 */
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

/* 数据列表区 */
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

/* 弹窗中的头像上传样式（如果使用Element UI的Upload组件） */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>