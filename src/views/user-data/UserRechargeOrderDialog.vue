<template>
  <el-dialog
    :model-value="visible"
    :title="`用户充值订单 - ID: ${userId} 昵称: ${nickname}`"
    width="800px"
    @close="handleClose"
    destroy-on-close
  >
    <!-- 修复：直接使用 userOrderList -->
    <el-table :data="userOrderList" v-loading="userOrderLoading" border style="width: 100%">
      <el-table-column prop="order_id" label="订单号" width="180"></el-table-column>
      <el-table-column prop="amount" label="金额" width="100"></el-table-column>
      <el-table-column prop="pay_time" label="支付时间" width="180"></el-table-column>
      <el-table-column prop="pay_status" label="订单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.pay_status === '已支付' ? 'success' : 'info'">{{ row.pay_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="120"></el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userOrderDialogFilter.page"
        :page-sizes="[5, 10, 20]"
        :page-size="userOrderDialogFilter.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userOrderTotal"
      ></el-pagination>
    </div>
  </el-dialog>
</template>

<script setup>
import { watch } from 'vue';
import { useChannelStatsStore } from '@/store/modules/channelStats'
import { storeToRefs } from 'pinia';

const props = defineProps({
  visible: { type: Boolean, default: false },
  userId: { type: [String, Number], default: null },
  nickname: { type: String, default: '' },
  statisticDate: { type: String, default: '' }
});

const emit = defineEmits(['update:visible']);
const channelStatsStore = useChannelStatsStore();

const {
  userOrderList,
  userOrderTotal,
  userOrderLoading,
  userOrderDialogFilter,
} = storeToRefs(channelStatsStore);

// 获取订单数据
function fetchOrderData() {
  channelStatsStore.fetchUserRechargeOrders();
}

// 监听弹窗打开，自动加载数据
watch(
  () => [props.visible, props.userId, props.statisticDate],
  ([visible, userId, statisticDate], [oldVisible]) => {
    if (visible && userId) {
      channelStatsStore.setUserOrderDialogFilter({
        user_id: userId,
        statistic_date: statisticDate,
        page: 1,
      });
      fetchOrderData();
    } else if (!visible && oldVisible) {
      channelStatsStore.resetUserOrderDialogFilter();
    }
  }
);

function handleClose() {
  emit('update:visible', false);
}

function handleSizeChange(val) {
  channelStatsStore.setUserOrderDialogFilter({
    page_size: val,
    page: 1,
  });
  fetchOrderData();
}

function handleCurrentChange(val) {
  channelStatsStore.setUserOrderDialogFilter({
    page: val,
  });
  fetchOrderData();
}
</script>

<style scoped>
/* 样式与之前相同 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>