<template>
  <div class="points-log-view">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>积分流水记录</span>
          <div>
            <el-input
              v-model="searchUuid"
              placeholder="用户UUID"
              clearable
              size="small"
              style="width: 220px; margin-right: 10px"
              @keyup.enter="doSearch"
            />
            <el-button type="primary" size="small" @click="doSearch">查询</el-button>
            <el-button size="small" @click="resetSearch">重置</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="store.logList"
        border
        v-loading="store.logLoading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="uuid" label="用户UUID" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="points" label="积分变动" />
        <el-table-column prop="balance" label="变动后余额" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="create_time" label="创建时间" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'info'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="extra_data" label="扩展数据">
          <template #default="{ row }">
            <span v-if="row.extra_data">{{ JSON.stringify(row.extra_data) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-popconfirm
              title="确定删除此记录吗？"
              @confirm="deleteLog(row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-4"
        layout="total, sizes, prev, pager, next, jumper"
        :total="store.logTotal"
        :page-size="store.logParams.pageSize"
        :current-page="store.logParams.page"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminPointsExchangeStore } from "@/store/adminPointsExchange";

const store = useAdminPointsExchangeStore();
const searchUuid = ref("");

onMounted(() => {
  store.fetchLogList();
});

function doSearch() {
  store.setLogParams({
    page: 1,
    uuid: searchUuid.value.trim(),
  });
  store.fetchLogList();
}

function resetSearch() {
  searchUuid.value = "";
  store.setLogParams({
    page: 1,
    uuid: "",
  });
  store.fetchLogList();
}

function handlePageChange(page: number) {
  store.fetchLogList({ page });
}

function handleSizeChange(size: number) {
  store.fetchLogList({ pageSize: size, page: 1 });
}

function deleteLog(id: number) {
  store.removeLog(id);
}
</script>

<style scoped>
.points-log-view {
  padding: 20px;
}
</style>
