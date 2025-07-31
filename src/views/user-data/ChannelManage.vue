<template>
  <div class="channel-management">
    <h1>渠道管理</h1>

    <el-card class="filter-card">
      <el-form :inline="true" :model="channelFilter" class="filter-form">
        <el-form-item label="渠道名称">
          <el-input v-model="channelFilter.channel_name" placeholder="请输入渠道名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="渠道域名">
          <el-input v-model="channelFilter.channel_domain" placeholder="请输入渠道域名" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="channelFilter.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="channel-list-card">
      <template #header>
        <div class="card-header">
          <span>现有渠道列表</span>
          <el-button type="primary" @click="handleAddChannel">新增渠道</el-button>
        </div>
      </template>

      <el-table :data="channelList" v-loading="channelLoading" border style="width: 100%">
        <el-table-column prop="channel_id" label="渠道ID" width="120"></el-table-column>
        <el-table-column prop="channel_name" label="渠道名称" width="150"></el-table-column>
        <el-table-column prop="channel_domain" label="渠道域名" min-width="200"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEditChannel(row)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              :style="{ color: row.status === 1 ? '#E6A23C' : '#67C23A' }"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="text" size="small" @click="handleDeleteChannel(row.channel_id)" style="color: #F56C6C;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="channelFilter.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="channelFilter.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="channelTotal"
        ></el-pagination>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增渠道' : '编辑渠道'"
      width="500px"
      @close="handleDialogClose"
      destroy-on-close
    >
      <el-form :model="currentChannel" :rules="channelFormRules" ref="channelFormRef" label-width="100px">
        <el-form-item label="渠道ID" prop="channel_id" v-if="dialogType === 'add'">
          <el-input v-model="currentChannel.channel_id" placeholder="请输入渠道ID（唯一标识）"></el-input>
        </el-form-item>
        <el-form-item label="渠道ID" v-else>
          <el-input v-model="currentChannel.channel_id" disabled></el-input>
        </el-form-item>

        <el-form-item label="渠道名称" prop="channel_name">
          <el-input v-model="currentChannel.channel_name" placeholder="请输入渠道名称"></el-input>
        </el-form-item>
        <el-form-item label="渠道域名" prop="channel_domain">
          <el-input v-model="currentChannel.channel_domain" placeholder="例如：https://channel.example.com"></el-input>
          <div class="form-item-tip">
            请填写完整的域名（包含http/https），用户通过此域名访问时将被识别为本渠道用户。
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentChannel.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm" :loading="isSubmitting">
            {{ dialogType === 'add' ? '创建' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, watch } from 'vue';
import { useChannelStore } from '@/store/modules/useChannelStore';
import { storeToRefs } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';

const channelStore = useChannelStore();

const {
  channelList,
  channelTotal,
  channelLoading,
  channelFilter,
  dialogVisible,
  dialogType,
  currentChannel,
  isSubmitting,
} = storeToRefs(channelStore);

const channelFormRef = ref(null);

// 表单验证规则
const channelFormRules = reactive({
  // 渠道ID：在新增时必须，并且可以添加更具体的格式要求（如字母数字组合）
  channel_id: [
    { required: true, message: '请输入渠道ID', trigger: 'blur', v_if: 'dialogType === "add"' },
    { pattern: /^[a-zA-Z0-9_-]{3,20}$/, message: '渠道ID需为3-20位字母、数字、下划线或短横线', trigger: 'blur', v_if: 'dialogType === "add"' }
  ],
  channel_name: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  channel_domain: [
    { required: true, message: '请输入渠道域名', trigger: 'blur' },
    // 允许 http:// 或 https:// 开头，后面跟有效域名格式
    { pattern: /^(https?:\/\/)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(\S)*$/, message: '请输入有效的域名，例如：https://example.com', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择渠道状态', trigger: 'change' }
  ]
});

// 查询数据 (保持不变)
const handleQuery = () => {
  channelStore.setChannelFilter({ page: 1 });
  channelStore.fetchChannelList();
};

// 重置筛选条件 (保持不变)
const handleReset = () => {
  channelStore.resetChannelFilter();
  channelStore.fetchChannelList();
};

// 分页大小改变 (保持不变)
const handleSizeChange = (val) => {
  channelStore.setChannelFilter({ page_size: val, page: 1 });
  channelStore.fetchChannelList();
};

// 当前页改变 (保持不变)
const handleCurrentChange = (val) => {
  channelStore.setChannelFilter({ page: val });
  channelStore.fetchChannelList();
};

// 打开新增渠道弹窗
const handleAddChannel = () => {
  channelStore.dialogType = 'add';
  channelStore.resetCurrentChannel(); // 确保表单是空的，channel_id 为 null
  channelStore.dialogVisible = true;
};

// 打开编辑渠道弹窗 (保持不变)
const handleEditChannel = (row) => {
  channelStore.dialogType = 'edit';
  channelStore.setCurrentChannel({ ...row });
  channelStore.dialogVisible = true;
};

// 提交新增/编辑表单
const handleSubmitForm = () => {
  channelFormRef.value.validate(async (valid) => {
    if (valid) {
      if (channelStore.dialogType === 'add') {
        // 新增时，currentChannel 中已经有手动输入的 channel_id
        await channelStore.addChannel();
      } else {
        // 编辑时，currentChannel 中已经有原始的 channel_id
        await channelStore.updateChannel();
      }
    } else {
      console.log('表单验证失败！');
      return false;
    }
  });
};

// 处理弹窗关闭
const handleDialogClose = () => {
  channelStore.dialogVisible = false;
  if (channelFormRef.value) {
    channelFormRef.value.resetFields(); // 重置所有表单项的验证状态
  }
  channelStore.resetCurrentChannel(); // 重置 store 中的表单数据，包括 channel_id
};


// 删除渠道 (保持不变)
const handleDeleteChannel = async (channel_id) => {
  await channelStore.deleteChannel(channel_id);
};

// 禁用/启用渠道 (保持不变)
const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(`确定要${actionText}渠道 "${row.channel_name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const success = await channelStore.updateChannel({
      channel_id: row.channel_id,
      channel_name: row.channel_name,
      channel_domain: row.channel_domain,
      status: newStatus,
    });

    if (success) {
      ElMessage.success(`${actionText}成功！`);
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info(`已取消${actionText}操作`);
    } else {
      ElMessage.error(`${actionText}失败，请稍后再试`);
      console.error('切换渠道状态失败:', error);
    }
  }
};

// 组件挂载时加载渠道列表 (保持不变)
onMounted(() => {
  console.log('onMounted 调用 fetchChannelList');
  channelStore.fetchChannelList();
});

// 监视 channelList 的变化
watch(channelList, (val) => {
  console.log('页面拿到的 channelList:', val)
}, { immediate: true });
</script>

<style scoped>
/* 样式保持不变，新增一个提示文本的样式 */
.channel-management {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.filter-card, .channel-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 新增的提示文本样式 */
.form-item-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 5px;
}
</style>