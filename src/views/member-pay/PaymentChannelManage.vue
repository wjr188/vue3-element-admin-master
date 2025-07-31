<template>
  <div class="payment-channel-manage">
    <div class="top-bar">
      <div class="title">支付通道管理</div>
      <div class="refresh-status">
        <span v-if="paymentChannelStore.loading">列表加载中...</span>
        <span v-else>列表获取成功</span>
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" class="search-form">
        <el-form-item label="通道名称">
          <el-input
            v-model="paymentChannelStore.searchParams.name"
            placeholder="请输入通道名称"
            clearable
            @keyup.enter="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="通道类型">
          <el-select v-model="paymentChannelStore.searchParams.type" placeholder="选择类型" clearable>
            <el-option label="支付宝" value="支付宝"></el-option>
            <el-option label="微信" value="微信"></el-option>
            <el-option label="其他" value="其他"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            range-separator="至"
            clearable
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAddChannel">新建通道</el-button>
          <el-button @click="paymentChannelStore.fetchList">刷新列表</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-list-area">
      <el-table
        :data="paymentChannelStore.list"
        style="width: 100%"
        border
        v-loading="paymentChannelStore.loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :empty-text="paymentChannelStore.loading ? '加载中...' : '暂无数据'"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="名称" width="150"></el-table-column>
        <el-table-column prop="type" label="类型" width="100"></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80"></el-table-column>
        <el-table-column label="本期收款" prop="today_amount" width="120">
          <template #default="{ row }">
            ￥{{ parseFloat(row.today_amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="累计收款" prop="total_amount" width="120">
          <template #default="{ row }">
            ￥{{ parseFloat(row.total_amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id!)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="paymentChannelStore.searchParams.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="paymentChannelStore.searchParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="paymentChannelStore.total"
        ></el-pagination>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="40%"
      destroy-on-close
    >
      <el-form
        :model="currentChannel"
        ref="channelFormRef"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="通道名称" prop="name">
          <el-input v-model="currentChannel.name" placeholder="例如：支付宝A"></el-input>
        </el-form-item>
        <el-form-item label="通道类型" prop="type">
          <el-input v-model="currentChannel.type" placeholder="例如：支付宝/微信/其他"></el-input>
          </el-form-item>
        <el-form-item label="API请求地址" prop="api_url">
          <el-input v-model="currentChannel.api_url" placeholder="第三方支付接口地址"></el-input>
        </el-form-item>
        <el-form-item label="跳转/备用链接" prop="link_url">
          <el-input v-model="currentChannel.link_url" placeholder="可选，http(s)://"></el-input>
        </el-form-item>
        <el-form-item label="App ID" prop="appid">
          <el-input v-model="currentChannel.appid" placeholder="可选，第三方支付分配的AppID"></el-input>
        </el-form-item>
        <el-form-item label="商户号(Mch ID)" prop="mchid">
          <el-input v-model="currentChannel.mchid" placeholder="可选，第三方支付分配的商户号"></el-input>
        </el-form-item>
        <el-form-item label="API密钥(Key)" prop="api_key">
          <el-input v-model="currentChannel.api_key" type="password" show-password placeholder="可选，第三方支付API密钥"></el-input>
        </el-form-item>
        <el-form-item label="回调通知URL" prop="pay_notify_url">
          <el-input v-model="currentChannel.pay_notify_url" placeholder="可选，支付成功后的异步通知地址"></el-input>
        </el-form-item>
        <el-form-item label="请求方法" prop="pay_method">
          <el-radio-group v-model="currentChannel.pay_method">
            <el-radio-button label="POST"></el-radio-button>
            <el-radio-button label="GET"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="currentChannel.sort" :min="0" :max="9999" controls-position="right"></el-input-number>
          <span class="sort-tip">数字越小越靠前</span>
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input type="textarea" v-model="currentChannel.remark" :rows="3" placeholder="可选"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="currentChannel.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          ></el-switch>
        </el-form-item>
        <el-form-item label="支付标识/方式码" prop="code">
          <el-input v-model="currentChannel.code" placeholder="如 alipay_a、wx_b、unionpay"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitChannelForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElForm, ElInputNumber, ElDatePicker, ElSelect, ElOption, ElRadioGroup, ElRadioButton } from 'element-plus';
import { usePaymentChannelStore } from '@/store/paymentChannel.store';
import type { PaymentChannel } from '@/api/paymentChannel.api';

const paymentChannelStore = usePaymentChannelStore();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentChannel = ref<Partial<PaymentChannel>>({
  code: '',
  name: '',
  type: '',
  api_url: '',
  link_url: '',
  appid: '',
  mchid: '',
  api_key: '',
  pay_notify_url: '',
  pay_method: 'POST', // 默认 POST
  sort: 0,
  status: 1, // 默认为启用
  remark: '',
});
const channelFormRef = ref<InstanceType<typeof ElForm> | null>(null);

// 日期范围选择器
const dateRange = ref<[string, string] | null>(null);

const formRules = reactive({
  code: [{ required: true, message: '请输入英文支付标识', trigger: 'blur' }],
  name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入支付类型', trigger: 'blur' }],
  api_url: [
    { required: true, message: '请输入API请求地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: ['blur', 'change'] },
  ],
  link_url: [
    { type: 'url', message: '请输入有效的URL', trigger: ['blur', 'change'], transform: (value: string) => value || undefined },
  ],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur', type: 'number' }],
  pay_notify_url: [
    { type: 'url', message: '请输入有效的回调URL', trigger: ['blur', 'change'], transform: (value: string) => value || undefined },
  ],
});

// 处理日期范围变化
const handleDateRangeChange = (val: [string, string] | null) => {
  if (val && val.length === 2) {
    paymentChannelStore.setDateRange(val[0], val[1]);
  } else {
    paymentChannelStore.setDateRange(undefined, undefined);
  }
};

const handleSearch = () => {
  paymentChannelStore.searchParams.page = 1; // 搜索时重置到第一页
  paymentChannelStore.fetchList();
};

const resetSearch = () => {
  paymentChannelStore.resetSearchParams();
  dateRange.value = null; // 重置日期选择器
  paymentChannelStore.fetchList();
};

const handleAddChannel = () => {
  dialogTitle.value = '新建支付通道';
  currentChannel.value = {
    code: '',
    name: '',
    type: '',
    api_url: '',
    link_url: '',
    appid: '',
    mchid: '',
    api_key: '',
    pay_notify_url: '',
    pay_method: 'POST',
    sort: 0,
    status: 1,
    remark: '',
  };
  dialogVisible.value = true;
  nextTick(() => {
    channelFormRef.value?.clearValidate();
  });
};

const handleEdit = (row: PaymentChannel) => {
  dialogTitle.value = '编辑支付通道';
  // 确保复制所有字段，包括可能为 undefined 的字段
  currentChannel.value = { ...row };
  dialogVisible.value = true;
  nextTick(() => {
    channelFormRef.value?.clearValidate();
  });
};

const submitChannelForm = () => {
  channelFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let res;
        // 过滤掉统计字段，因为这些是后端生成的
        const { id, total_amount, today_amount, create_time, update_time, ...dataToSave } = currentChannel.value;

        if (id) {
          // 编辑操作
          res = await paymentChannelStore.update(id, dataToSave);
        } else {
          // 新增操作
          res = await paymentChannelStore.create(dataToSave as Omit<PaymentChannel, 'id' | 'create_time' | 'update_time' | 'total_amount' | 'today_amount'>);
        }

        if (res.code === 0) {
          ElMessage.success(id ? '更新成功！' : '新建成功！');
          dialogVisible.value = false;
          // Pinia action 中已包含刷新列表，此处无需重复调用
        } else {
          ElMessage.error(res.msg || '操作失败！');
        }
      } catch (error: any) {
        ElMessage.error('请求失败：' + (error.message || '未知错误'));
      }
    } else {
      ElMessage.error('请检查表单填写是否完整和正确！');
    }
  });
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该支付通道，是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await paymentChannelStore.remove(id);
        if (res.code === 0) {
          ElMessage.success('删除成功！');
        } else {
          ElMessage.error(res.msg || '删除失败！');
        }
      } catch (error: any) {
        ElMessage.error('请求失败：' + (error.message || '未知错误'));
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

const handleStatusChange = async (row: PaymentChannel) => {
  try {
    // 假设 row.id 总是存在，因为这是列表项
    const res = await paymentChannelStore.toggleStatus(row.id!, row.status);
    if (res.code === 0) {
      ElMessage.success(`通道状态已切换为 ${row.status === 1 ? '启用' : '禁用'}！`);
    } else {
      ElMessage.error(res.msg || '状态切换失败！');
      row.status = row.status === 1 ? 0 : 1; // 还原状态
    }
  } catch (error: any) {
    ElMessage.error('请求失败：' + (error.message || '未知错误'));
    row.status = row.status === 1 ? 0 : 1; // 还原状态
  }
};

const handleSizeChange = (val: number) => {
  paymentChannelStore.setPageSize(val);
  paymentChannelStore.fetchList();
};

const handleCurrentChange = (val: number) => {
  paymentChannelStore.setPage(val);
  paymentChannelStore.fetchList();
};

onMounted(() => {
  paymentChannelStore.fetchList();
});
</script>

<style scoped>
.payment-channel-manage {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px); /* 确保页面高度足够 */
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
  color: #67c23a; /* 成功绿色 */
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

.data-list-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.pagination-area {
  margin-top: 20px;
  text-align: right;
}

.sort-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>