<template>
  <div class="data-card bg-white p-5 rounded-lg shadow-sm flex flex-col justify-between" :class="{ 'is-loading': loading }">
    <div class="flex items-center justify-between mb-3">
      <span class="label text-gray-600 text-sm font-medium">{{ label }}</span>
      <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
    </div>
    <div class="value text-3xl font-bold text-gray-900 mb-2">
      <span v-if="loading"><el-skeleton-item variant="text" style="width: 80px;" /></span>
      <span v-else>{{ value }}</span>
    </div>
    <div class="comparison text-sm text-gray-500 flex items-center">
      <span v-if="loading"><el-skeleton-item variant="text" style="width: 60px;" /></span>
      <template v-else>
        <span v-if="comparison !== undefined && comparison !== null && comparison !== ''">
          {{ comparison > 0 ? '环比增长' : (comparison < 0 ? '环比下降' : '与昨日持平') }}
          <span :class="{ 'text-green-500': trend > 0, 'text-red-500': trend < 0, 'text-gray-500': trend === 0 }">
            {{ Math.abs(comparison) }}%
            <el-icon v-if="trend > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="trend < 0"><ArrowDown /></el-icon>
            <el-icon v-else><Minus /></el-icon>
          </span>
        </span>
        <span v-else>暂无对比数据</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { ElIcon, ElSkeletonItem } from 'element-plus';
import { ArrowUp, ArrowDown, Minus, Loading } from '@element-plus/icons-vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    default: 0,
  },
  comparison: {
    type: [Number, String],
    default: null,
  },
  trend: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.data-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  min-height: 120px;
  justify-content: space-between;
}

.data-card.is-loading {
  opacity: 0.8;
}

.data-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.data-card .value {
  font-size: 2.2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.data-card .label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.data-card .comparison {
  font-size: 0.8em;
  color: #999;
}

.data-card .trend-arrow {
  display: inline-flex;
  align-items: center;
  margin-left: 5px;
  font-size: 0.9em;
}

.trend-arrow.up {
  color: #67c23a;
}

.trend-arrow.down {
  color: #f56c6c;
}

.trend-arrow.flat {
  color: #909399;
}
</style>