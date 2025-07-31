<template>
  <div class="channel-recharge-stats">
    <h1>渠道每日效果统计</h1>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="渠道ID">
          <el-input v-model="filterForm.channel_id" placeholder="请输入渠道ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="渠道名称">
          <el-input v-model="filterForm.channel_name" placeholder="请输入渠道名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="渠道域名">
          <el-input v-model="filterForm.channel_domain" placeholder="请输入渠道域名" clearable></el-input>
        </el-form-item>
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="filterForm.statistic_date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="投放金额">
          <el-input v-model="filterForm.investment_amount" placeholder="请输入投放金额" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card>
          <div class="card-item">
            <div class="label">注册人数</div>
            <div class="value">{{ channelStatsSummary.total_registered_users }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-item">
            <div class="label">首充金额</div>
            <div class="value">￥{{ channelStatsSummary.total_first_recharge_amount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-item">
            <div class="label">复充金额</div>
            <div class="value">￥{{ channelStatsSummary.total_repeat_recharge_amount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-item">
            <div class="label">总充值</div>
            <div class="value">￥{{ channelStatsSummary.total_recharge }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-item">
            <div class="label">ROI</div>
            <div class="value">{{ channelStatsSummary.total_roi }}%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-table :data="channelStatsList" v-loading="channelStatsLoading" border style="width: 100%">
        <el-table-column prop="channel_id" label="渠道ID" width="100"></el-table-column>
        <el-table-column prop="channel_name" label="渠道名称" width="120"></el-table-column>
        <el-table-column prop="channel_domain" label="渠道域名" width="180"></el-table-column>
        <el-table-column prop="statistic_date" label="统计日期" width="120"></el-table-column>
        <el-table-column prop="investment_amount" label="投放金额" width="120"></el-table-column>
        <el-table-column prop="registered_users" label="注册人数" width="100"></el-table-column>
        <el-table-column prop="first_recharge_users" label="首充人数" width="100"></el-table-column>
        <el-table-column prop="first_recharge_amount" label="首充金额" width="120"></el-table-column>
        <el-table-column prop="repeat_recharge_users" label="复充人数" width="100"></el-table-column>
        <el-table-column prop="repeat_recharge_amount" label="复充金额" width="120"></el-table-column>
        <el-table-column prop="total_recharge" label="总充值" width="120"></el-table-column>
        <el-table-column prop="roi" label="ROI" width="80"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="viewDetail(row)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="channelStatsFilter.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="channelStatsFilter.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="channelStatsTotal"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChannelStatsStore } from '@/store/modules/channelStats'; // 正确路径
import { storeToRefs } from 'pinia'; // 用于解构 store 的 state

const router = useRouter();
const route = useRoute();
const channelStatsStore = useChannelStatsStore(); // 获取 Pinia store 实例

// 使用 storeToRefs 来解构 state 中的响应式属性，保持响应性
const {
  channelStatsList,
  channelStatsTotal,
  channelStatsLoading,
  channelStatsSummary,
  channelStatsFilter,
} = storeToRefs(channelStatsStore);

// 本地维护一个筛选表单的响应式对象，用于V-model绑定
// 它的值会通过 handleQuery 更新到 store 的 channelStatsFilter
const filterForm = reactive({
  channel_id: '',
  channel_name: '',
  channel_domain: '',
  statistic_date_range: [],
  investment_amount: '',
});

// 查询数据（触发 store 的 action）
const queryData = () => {
  channelStatsStore.fetchChannelStatsList();
};

const handleQuery = () => {
  // 更新 store 中的筛选条件和页码，然后触发查询
  channelStatsStore.setChannelStatsFilter({
    ...filterForm,
    page: 1, // 查询时重置回第一页
  });
  queryData();
};

// 重置筛选条件
const handleReset = () => {
  channelStatsStore.resetChannelStatsFilter(); // 调用 store 的 action 重置筛选
  // 重新设置本地筛选表单，使其与 store 同步
  Object.assign(filterForm, channelStatsFilter.value); // 注意 .value
  queryData();
};

// 查看明细，跳转到 ChannelUserRechargeDetail.vue
const viewDetail = (row) => {
  console.log('跳转参数', row.channel_domain, row.statistic_date, row.channel_name);
  router.push({
    name: 'ChannelUserRechargeDetail',
    query: {
      channel_domain: row.channel_domain,
      statistic_date: row.statistic_date,
      channel_name: row.channel_name,
    },
  });
};

// 分页大小改变
const handleSizeChange = (val) => {
  channelStatsStore.setChannelStatsFilter({
    page_size: val,
    page: 1, // 改变pageSize后通常回到第一页
  });
  queryData();
};

// 当前页改变
const handleCurrentChange = (val) => {
  channelStatsStore.setChannelStatsFilter({
    page: val,
  });
  queryData();
};

// 组件加载时初始化筛选条件并查询数据
onMounted(() => {
  // 从 store 中读取初始筛选条件，并同步到本地表单
  Object.assign(filterForm, channelStatsFilter.value);

  console.log('请求参数', {
    channel_domain: route.query.channel_domain,
    statistic_date: route.query.statistic_date,
  });
  console.log('route.query', route.query);

  queryData();
});
</script>

<style scoped>
/* 样式与之前相同 */
.channel-recharge-stats {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.filter-card, .table-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* 间距 */
}

.summary-cards {
  margin-bottom: 20px;
}

.card-item {
  text-align: center;
  padding: 10px 0;
}

.card-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.card-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>