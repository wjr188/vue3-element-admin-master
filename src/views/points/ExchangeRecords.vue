<template>
  <div class="exchange-records-page">
    <el-card>
      <div class="flex items-center mb-3">
        <el-input
          v-model="params.uuid"
          placeholder="用户UUID"
          size="small"
          style="width:180px;margin-right:10px"
          clearable
        />
        <el-input
          v-model="params.exchange_id"
          placeholder="兑换商品ID"
          size="small"
          style="width:160px;margin-right:10px"
          clearable
        />
        <el-button type="primary" size="small" @click="onSearch">查询</el-button>
        <el-button size="small" @click="onReset" style="margin-left:10px">重置</el-button>
      </div>

      <el-table
        :data="recordList"
        v-loading="recordLoading"
        style="width:100%"
        border
      >
        <el-table-column prop="id" label="ID" width="70"/>
        <el-table-column prop="uuid" label="用户UUID" min-width="160"/>
        <el-table-column prop="exchange_id" label="商品ID" width="90"/>
        <el-table-column prop="exchange_name" label="商品名称" min-width="120"/>
        <el-table-column prop="cost" label="消耗积分" width="90"/>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'info'">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column prop="create_time" label="兑换时间" min-width="160"/>
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :total="recordTotal"
          :page-size="params.pageSize"
          :current-page="params.page"
          @current-change="onPageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAdminPointsExchangeStore } from '@/store/adminPointsExchange';

const store = useAdminPointsExchangeStore();

const params = reactive({
  page: 1,
  pageSize: 20,
  uuid: '',
  exchange_id: '',
});

const recordList = computed(() => store.recordList);
const recordLoading = computed(() => store.recordLoading);
const recordTotal = computed(() => store.recordTotal);

const statusText = (status: number) => {
  if (status === 1) return '成功';
  if (status === 2) return '失败';
  return '待处理';
};

// 查询
function onSearch() {
  params.page = 1;
  store.fetchRecordList({ ...params });
}

// 重置
function onReset() {
  params.page = 1;
  params.pageSize = 20;
  params.uuid = '';
  params.exchange_id = '';
  store.fetchRecordList({ ...params });
}

// 分页
function onPageChange(page: number) {
  params.page = page;
  store.fetchRecordList({ ...params });
}

// 初始化加载
onMounted(() => {
  store.fetchRecordList({ ...params });
});
</script>

<style scoped>
.exchange-records-page {
  padding: 20px;
}
</style>
