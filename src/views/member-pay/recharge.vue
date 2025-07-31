<template>
  <div class="recharge-order-list-container">
    <h2>充值订单管理</h2>

    <!-- 筛选条件区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="store.filter" class="filter-form">
        <el-form-item label="充值日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
            clearable
            style="width: 260px;"
          />
        </el-form-item>

        <el-form-item label="域名">
          <el-select
            v-model="store.filter.domain"
            placeholder="请选择域名"
            multiple
            collapse-tags
            clearable
            filterable
          >
            <el-option v-if="store.domainOptions.length === 0" disabled>
              <span style="color: #999">无可用域名</span>
            </el-option>
            <el-option
              v-for="item in store.domainOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="渠道">
          <el-select
            v-model="store.filter.channel"
            placeholder="请选择渠道"
            multiple
            collapse-tags
            clearable
            filterable
          >
            <el-option v-if="store.channelOptions.length === 0" disabled>
              <span style="color: #999">无可用渠道</span>
            </el-option>
            <el-option
              v-for="item in store.channelOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="充值类型">
          <el-select
            v-model="store.filter.type"
            placeholder="请选择类型"
            clearable
            @change="handleFilterChange"
            style="width: 120px;"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="首充" value="首充"></el-option>
            <el-option label="复充" value="复充"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="store.filter.status"
            placeholder="请选择状态"
            clearable
            @change="handleFilterChange"
            style="width: 120px;"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="未支付" value="未支付"></el-option>
            <el-option label="已支付" value="已支付"></el-option>
            <el-option label="已确认" value="已确认"></el-option>
            <el-option label="已删除" value="已删除"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID/用户名">
          <el-input
            v-model="store.filter.keyword"
            placeholder="输入用户ID/用户名"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px;"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 充值记录表格 -->
    <el-card class="table-card">
      <el-table
        :data="store.orderList"
        v-loading="store.loading"
        border
        stripe
        class="recharge-table"
      >
        <el-table-column prop="order_no" label="订单号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="user_uuid" label="用户ID" min-width="100" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="amount" label="充值金额" width="120">
          <template #default="{ row }">
            <span style="color: #67c23a;">¥{{ Number(row.amount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_type" label="产品类型" min-width="120">
          <template #default="{ row }">
            <!-- VIP卡 -->
            <el-tag
              v-if="row.product_type === 'vip'"
              type="warning"
              effect="dark"
            >
              {{ row.package_name }}{{ row.duration }}{{ row.duration_unit === 'DAY' ? '天' : row.duration_unit === 'MONTH' ? '月' : row.duration_unit === 'YEAR' ? '年' : '' }}
            </el-tag>
            <!-- 金币套餐 -->
            <el-tag
              v-else-if="row.product_type === 'coin'"
              type="primary"
              effect="dark"
            >
              {{ row.package_name }}（{{ row.amount }}金币）
            </el-tag>
            <!-- 其他类型 -->
            <el-tag v-else type="info" effect="dark">
              {{ row.product_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="充值类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '首充' ? 'success' : 'info'" effect="light">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 下面是剩余字段，顺序随意 -->
        <el-table-column prop="register_time" label="注册时间" min-width="160" />
        <el-table-column prop="pay_time" label="充值时间" min-width="160" />
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :disabled="row.status === '已确认' || row.status === '已删除'"
              @click="handleConfirm(row.order_no)"
            >
              确认到账
            </el-button>
            <el-button
              type="danger"
              link
              :disabled="row.status === '已删除'"
              @click="handleDelete(row.order_no)"
            >
              删除订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="store.setPageSize"
          @current-change="store.setPage"
          :current-page="store.pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="store.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="store.pagination.total"
          background
        />
      </div>
    </el-card>

    <!-- 新建订单按钮 -->
    <el-form-item>
      <el-button type="primary" @click="openCreateDialog">新建订单</el-button>
    </el-form-item>

    <!-- 新建订单对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建充值订单" width="500px">
      <el-form :model="createForm" label-width="100px" ref="createFormRef">
        <el-form-item label="订单号" prop="order_id" required>
          <el-input v-model="createForm.order_id" placeholder="唯一订单号"></el-input>
        </el-form-item>
        <el-form-item label="用户ID" prop="user_uuid" required>
          <el-input v-model="createForm.user_uuid" placeholder="用户唯一ID"></el-input>
        </el-form-item>
        <el-form-item label="金额" prop="amount" required>
          <el-input v-model="createForm.amount" type="number" placeholder="充值金额"></el-input>
        </el-form-item>
        <el-form-item label="产品类型" prop="product_type" required>
          <el-select v-model="createForm.product_type" placeholder="请选择">
            <el-option label="VIP卡" value="vip"></el-option>
            <el-option label="金币" value="coin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="套餐ID" prop="product_id" required>
          <el-input v-model="createForm.product_id" type="number" placeholder="VIP卡或金币套餐ID"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateOrder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRechargeOrderStore } from '@/store/rechargeOrder.store';
import { createRechargeOrder } from '@/api/rechargeOrder.api';
import { ElMessage, ElMessageBox } from 'element-plus';

// 使用 Pinia Store
const store = useRechargeOrderStore();
// 调试用，把 store 挂到 window，便于控制台访问
// @ts-ignore
window.store = store;

// 用于日期选择器的本地状态，因为它处理的是一个数组
const dateRange = ref<[string, string]>(['', '']);

// 新建订单对话框的可见性
const createDialogVisible = ref(false);

// 新建订单表单的模型
const createForm = ref({
  order_id: '',
  user_uuid: '',
  amount: 0,
  product_type: 'vip',
  product_id: 0,
});

// 表单验证引用
const createFormRef = ref(null);

// 计算属性，用于将 store.filter.start_time 和 end_time 映射到 dateRange
// 确保在 store.filter 更新时 dateRange 也能同步
const updateDateRange = () => {
  if (store.filter.start_time && store.filter.end_time) {
    dateRange.value = [store.filter.start_time, store.filter.end_time];
  } else {
    dateRange.value = ['', ''];
  }
};

// 监听 store.filter 的变化，同步 dateRange
watch(() => [store.filter.start_time, store.filter.end_time], updateDateRange, { immediate: true });


// 处理日期范围选择器变化
const handleDateRangeChange = (val: [string, string] | null) => {
  if (val && val.length === 2) {
    store.setFilter({
      start_time: val[0],
      end_time: val[1],
    });
  } else {
    store.setFilter({
      start_time: '',
      end_time: '',
    });
  }
};

// 处理其他筛选条件变化（例如下拉选择、输入框回车）
const handleFilterChange = () => {
  store.setFilter({
    domain: store.filter.domain,
    channel: store.filter.channel,
    type: store.filter.type,
    status: store.filter.status,
    keyword: store.filter.keyword,
  });
};

// 点击查询按钮
const handleSearch = () => {
  store.setFilter({
    domain: store.filter.domain,
    channel: store.filter.channel,
    type: store.filter.type,
    status: store.filter.status,
    keyword: store.filter.keyword,
    start_time: dateRange.value[0],
    end_time: dateRange.value[1],
  });
};

// 点击重置按钮
const handleReset = () => {
  store.resetAllFilters();
  dateRange.value = ['', '']; // 重置本地日期范围状态
};

// 订单状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case '未支付': return 'info';
    case '已支付': return 'primary';
    case '已确认': return 'success';
    case '已删除': return 'danger';
    default: return undefined; // 不要返回空字符串
  }
};

// 确认到账操作
const handleConfirm = (orderId: string) => {
  ElMessageBox.confirm(`确定要确认订单号为 "${orderId}" 的充值已到账吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await store.confirmOrder(orderId);
  }).catch(() => {
    // 用户取消
  });
};

// 删除订单操作
const handleDelete = (orderId: string) => {
  ElMessageBox.confirm(`确定要删除订单号为 "${orderId}" 的充值订单吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await store.deleteOrder(orderId); // 只需调用store方法
  }).catch(() => {});
};

// 提交新建订单
const submitCreateOrder = async () => {
  // 表单验证
  const form = createForm.value;
  if (!form.order_id || !form.user_uuid || !form.amount || !form.product_type || !form.product_id) {
    ElMessage.warning('请填写所有必填字段');
    return;
  }

  try {
    // 调用接口创建订单
    const res = await createRechargeOrder({
      order_id: form.order_id,
      user_uuid: form.user_uuid,
      amount: form.amount,
      product_type: form.product_type,
      product_id: form.product_id,
    });

    if (res.code === 0) {
      ElMessage.success('订单创建成功');
      createDialogVisible.value = false;
      store.fetchList(); // 重新获取订单列表
    } else {
      ElMessage.error(res.msg || '创建订单失败');
    }
  } catch (error) {
    console.error('创建订单异常:', error);
    ElMessage.error('创建订单异常');
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  console.log('onMounted 执行');
  store.fetchList();
  store.fetchDomainsAndChannelsOptions();
});
</script>

<style scoped>
.recharge-order-list-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px); /* 假设头部高度为50px */
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.filter-card, .table-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-bottom: 15px; /* 增加一些垂直间距 */
  margin-right: 20px;
}

/* 调整表头样式 */
.recharge-table >>> .el-table__header-wrapper th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

/* 调整表格行高 */
.recharge-table .el-table__cell {
  padding: 10px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 优化 El-Tag 的样式 */
.el-tag {
  height: 24px; /* 统一标签高度 */
  line-height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>