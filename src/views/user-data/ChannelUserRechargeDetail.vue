<template>
  <div class="channel-user-recharge-detail">
    <el-breadcrumb separator="/" class="breadcrumb-nav">
      <el-breadcrumb-item :to="{ path: '/user-data/channel-stats' }">渠道每日效果统计</el-breadcrumb-item>
      <el-breadcrumb-item>注册用户明细</el-breadcrumb-item>
    </el-breadcrumb>

    <h1>注册用户明细</h1>
    <p v-if="channelInfo.channel_domain && channelInfo.statistic_date" class="channel-info">
      当前渠道: <strong>{{ channelInfo.channel_name || channelInfo.channel_domain }}</strong>,
      统计日期: <strong>{{ channelInfo.statistic_date }}</strong>
    </p>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户ID">
          <el-input v-model="filterForm.uuid" placeholder="请输入用户ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="filterForm.nickname" placeholder="请输入用户昵称" clearable></el-input>
        </el-form-item>
        <el-form-item label="充值类型">
          <el-select v-model="filterForm.recharge_type" placeholder="请选择" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="首充" value="first"></el-option>
            <el-option label="复充" value="repeat"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="userRechargeDetailList" v-loading="userRechargeDetailLoading" border style="width: 100%; min-height: 100px;">
        <el-table-column prop="uuid" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120"></el-table-column>
        <el-table-column prop="register_time" label="注册时间" width="160"></el-table-column>
        <el-table-column prop="channel_domain" label="渠道域名" width="180"></el-table-column>
        <el-table-column prop="channel_name" label="渠道名称" width="120"></el-table-column>
        <el-table-column prop="first_recharge_amount" label="首充金额" width="120"></el-table-column>
        <el-table-column prop="first_recharge_time" label="首充时间" width="160"></el-table-column>
        <el-table-column prop="repeat_recharge_amount" label="复充金额" width="120"></el-table-column>
        <el-table-column prop="repeat_recharge_count" label="复充次数" width="100"></el-table-column>
        <el-table-column prop="last_recharge_time" label="最后充值时间" width="160"></el-table-column>
        <el-table-column prop="recharge_type" label="充值类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.recharge_type === '首充' ? 'success' : 'info'">{{ row.recharge_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="viewOrders(row)">查看订单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="userRechargeDetailFilter.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="userRechargeDetailFilter.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="userRechargeDetailTotal"
        ></el-pagination>
      </div>
    </el-card>

    <UserRechargeOrderDialog
      v-model:visible="orderDialogVisible"
      :userId="currentUserId"
      :nickname="currentUserNickname"
      :statisticDate="channelInfo.statistic_date"
    />
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useChannelStatsStore } from '@/store/modules/channelStats';
import { storeToRefs } from 'pinia';
import UserRechargeOrderDialog from './UserRechargeOrderDialog.vue';

const route = useRoute();
const channelStatsStore = useChannelStatsStore();

const {
  userRechargeDetailList,
  userRechargeDetailTotal,
  userRechargeDetailLoading,
  userRechargeDetailFilter,
} = storeToRefs(channelStatsStore);

const filterForm = reactive({
  uuid: '',
  nickname: '',
  recharge_type: '',
});

const channelInfo = reactive({
  channel_domain: route.query.channel_domain || '',
  statistic_date: route.query.statistic_date || '',
  channel_name: route.query.channel_name || '',
});

const orderDialogVisible = ref(false);
const currentUserId = ref(null);
const currentUserNickname = ref('');

const queryData = () => {
  const params = {
    ...userRechargeDetailFilter.value, // 使用 store 中的筛选条件
    channel_domain: channelInfo.channel_domain,
    statistic_date: channelInfo.statistic_date,
  };

  // 添加额外筛选条件
  if (filterForm.uuid) params.uuid = filterForm.uuid;
  if (filterForm.nickname) params.nickname = filterForm.nickname;
  if (filterForm.recharge_type) params.recharge_type = filterForm.recharge_type;

  channelStatsStore.setUserRechargeDetailFilter(params);
  channelStatsStore.fetchUserRechargeDetail();
};

const handleQuery = () => {
  queryData();
};

const handleReset = () => {
  channelStatsStore.resetUserRechargeDetailFilter();
  Object.assign(filterForm, userRechargeDetailFilter.value);
  queryData();
};

const viewOrders = (user) => {
  currentUserId.value = user.uuid;
  currentUserNickname.value = user.nickname;
  orderDialogVisible.value = true;
};

const handleSizeChange = (val) => {
  userRechargeDetailFilter.value.page_size = val;
  userRechargeDetailFilter.value.page = 1;
  queryData();
};

const handleCurrentChange = (val) => {
  userRechargeDetailFilter.value.page = val;
  queryData();
};

watch(
  () => route.query,
  (newQuery) => {
    channelInfo.channel_domain = newQuery.channel_domain || '';
    channelInfo.statistic_date = newQuery.statistic_date || '';
    channelInfo.channel_name = newQuery.channel_name || '';

    // 更新筛选条件中的关键参数
    userRechargeDetailFilter.value.channel_domain = channelInfo.channel_domain;
    userRechargeDetailFilter.value.statistic_date = channelInfo.statistic_date;

    queryData();
  },
  { immediate: true, deep: true }
);

watch(
  () => userRechargeDetailList.value,
  (val) => {
    console.log('userRechargeDetailList.value:', val);
  },
  { immediate: true }
);

onMounted(() => {
  console.log('route.query', route.query);
  // queryData(); // ← 这一行注释或删除
});
</script>

<style scoped>
.channel-user-recharge-detail {
  padding: 20px;
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
}

.channel-info {
  margin-bottom: 20px;
  font-size: 16px;
  color: #555;
}

.filter-card, .table-card {
  margin-bottom: 20px;
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
</style>