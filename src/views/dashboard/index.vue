<template>
  <div class="dashboard-container p-6 bg-gray-50 min-h-screen font-inter">
    <!-- 一、筛选区 -->
    <div class="filter-bar bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap items-center space-x-4">
      <div class="date-picker-group flex items-center space-x-2">
        <span class="text-gray-700 text-sm">日期范围:</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          size="default"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />
      </div>
      <div class="domain-selector-group flex items-center space-x-2">
        <span class="text-gray-700 text-sm">业务域名:</span>
        <el-select
          v-model="selectedDomains"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择域名"
          style="width: 240px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="all" />
          <el-option
            v-for="domain in domainOptions"
            :key="domain"
            :label="domain"
            :value="domain"
          />
        </el-select>
      </div>
      <div class="button-group flex items-center space-x-4 ml-auto">
        <el-button type="primary" :icon="Search" @click="applyFilters">查询</el-button>
        <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 二、数据总览区 -->
    <div class="data-card-row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <DataCard
        v-for="card in dataCards"
        :key="card.label"
        :label="card.label"
        :value="formatMetricValue(card.value, card.format)"
        :comparison="card.comparison"
        :trend="card.trend"
        :loading="cardsLoading"
      />
    </div>

    <!-- 三、快捷订单卡片区 -->
    <div class="quick-order-row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <div
        v-for="item in quickOrderCards"
        :key="item.label"
        class="quick-order-card p-4 rounded-lg text-white flex flex-col items-start"
        :style="{ background: item.bg }"
      >
        <div class="text-lg font-bold mb-1">{{ item.label }}</div>
        <div class="text-2xl font-bold mb-2">{{ item.value }}</div>
        <div class="text-sm opacity-80">{{ item.desc }}</div>
      </div>
    </div>

    <!-- 四、趋势分析+域名排行榜 -->
    <div class="bottom-row grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 趋势分析 -->
      <div class="trend-chart-row bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">业务趋势分析</h2>
          <el-radio-group v-model="trendPeriod" @change="fetchTrendData" size="default">
            <el-radio-button label="7days">近7天</el-radio-button>
            <el-radio-button label="30days">近30天</el-radio-button>
          </el-radio-group>
        </div>
        <div v-loading="trendLoading" class="chart-container" style="height: 350px;">
          <!-- ECharts 容器，实际项目中会在这里初始化图表 -->
          <div ref="trendChartRef" style="width: 100%; height: 100%;">
            <p v-if="!trendLoading && trendChartData.length === 0" class="text-center text-gray-500 mt-20">暂无趋势数据</p>
            <!-- 模拟的趋势图，实际使用 ECharts 等库 -->
            <svg v-if="!trendLoading && trendChartData.length > 0" width="100%" height="100%" viewBox="0 0 800 350">
              <rect x="0" y="0" width="800" height="350" fill="#f8f8f8" rx="8" ry="8" />
              <text x="20" y="30" fill="#333" font-size="16">业务趋势</text>
              <line x1="50" y1="300" x2="750" y2="300" stroke="#ccc" />
              <line x1="50" y1="50" x2="50" y2="300" stroke="#ccc" />
              <g v-for="(point, index) in trendChartData" :key="index">
                <circle
                  :cx="50 + index * (700 / (trendChartData.length - 1))"
                  :cy="300 - point.value"
                  r="4"
                  fill="#409EFF"
                />
                <text
                  :x="50 + index * (700 / (trendChartData.length - 1)) - 15"
                  :y="300 - point.value - 10"
                  fill="#333"
                  font-size="12"
                >
                  {{ point.value }}
                </text>
                <text
                  :x="50 + index * (700 / (trendChartData.length - 1)) - 15"
                  y="315"
                  fill="#666"
                  font-size="10"
                >
                  {{ point.date }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
      <!-- 域名排行榜 -->
      <div class="domain-rank-row bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">域名排行榜</h2>
        <el-table
          :data="domainRankData"
          style="width: 100%"
          size="small"
          border
        >
          <el-table-column prop="rank" label="排名" width="60" />
          <el-table-column prop="domain" label="域名" />
          <el-table-column prop="pv" label="访问量(PV)" />
          <el-table-column prop="uv" label="访客数(UV)" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import { Search, RefreshRight, Download } from '@element-plus/icons-vue';
import DataCard from './components/DataCard.vue';

// --- Mock API Service (模拟后端数据，实际项目中替换为真实接口调用) ---
const mockApiService = {
  fetchSummaryData: (startDate, endDate, domains) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const onlineUser = Math.floor(Math.random() * 5000) + 1000;
        const register = Math.floor(Math.random() * 500);
        const vipOpen = Math.floor(Math.random() * 100);
        const coinRecharge = parseFloat((Math.random() * 10000).toFixed(2));
        const pv = Math.floor(Math.random() * 1000000);
        const uv = Math.floor(Math.random() * 500000);

        // 模拟昨日数据，用于对比
        const yesterdayRegister = Math.floor(Math.random() * 500);
        const yesterdayVipOpen = Math.floor(Math.random() * 100);
        const yesterdayCoinRecharge = parseFloat((Math.random() * 10000).toFixed(2));
        const yesterdayPv = Math.floor(Math.random() * 1000000);
        const yesterdayUv = Math.floor(Math.random() * 500000);

        const calculateTrend = (current, previous) => {
          if (previous === 0) return 0; // Avoid division by zero
          return ((current - previous) / previous * 100).toFixed(2);
        };

        resolve({
          onlineUser: onlineUser,
          register: register,
          vipOpen: vipOpen,
          coinRecharge: coinRecharge,
          pv: pv,
          uv: uv,
          // 模拟对比数据
          registerComparison: calculateTrend(register, yesterdayRegister),
          vipOpenComparison: calculateTrend(vipOpen, yesterdayVipOpen),
          coinRechargeComparison: calculateTrend(coinRecharge, yesterdayCoinRecharge),
          pvComparison: calculateTrend(pv, yesterdayPv),
          uvComparison: calculateTrend(uv, yesterdayUv),
        });
      }, 800);
    });
  },

  fetchTrendData: (period, startDate, endDate, domains) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [];
        const numDays = period === '7days' ? 7 : 30;
        for (let i = 0; i < numDays; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (numDays - 1 - i));
          data.push({
            date: date.toISOString().slice(5, 10), // MM-DD
            pv: Math.floor(Math.random() * 800000) + 100000,
            uv: Math.floor(Math.random() * 400000) + 50000,
            register: Math.floor(Math.random() * 400) + 50,
            vipOpen: Math.floor(Math.random() * 80) + 10,
            coinRecharge: parseFloat((Math.random() * 8000).toFixed(2)),
          });
        }
        resolve(data);
      }, 1000);
    });
  },

  fetchDetailTableData: (page, pageSize, startDate, endDate, domains) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockDomains = ['domainA.com', 'domainB.net', 'domainC.org'];
        const totalItems = 100;
        const data = Array.from({ length: totalItems }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + Math.floor(Math.random() * 30)); // Random date within ~30 days
          return {
            id: i,
            domain: mockDomains[Math.floor(Math.random() * mockDomains.length)],
            date: date.toISOString().slice(0, 10),
            register: Math.floor(Math.random() * 300),
            vipOpen: Math.floor(Math.random() * 50),
            coinRecharge: parseFloat((Math.random() * 5000).toFixed(2)),
            pv: Math.floor(Math.random() * 500000),
            uv: Math.floor(Math.random() * 200000),
            onlineUser: Math.floor(Math.random() * 2000),
          };
        });

        // Apply basic filtering for demonstration
        let filteredData = data;
        if (startDate && endDate) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
          });
        }
        if (domains && domains.length > 0 && !domains.includes('all')) {
          filteredData = filteredData.filter(item => domains.includes(item.domain));
        }

        const start = (page - 1) * pageSize;
        const paginatedData = filteredData.slice(start, start + pageSize);

        resolve({
          list: paginatedData,
          total: filteredData.length,
        });
      }, 1200);
    });
  },
  // 模拟获取域名列表
  fetchDomainList: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['domain1.com', 'domain2.net', 'domain3.org', 'domain4.io', 'domain5.cn']);
      }, 300);
    });
  }
};
// --- End Mock API Service ---


// --- 响应式数据 ---
// 筛选条件
const quickDateOptions = [
  { label: '今日', value: 'today' },
  { label: '昨日', value: 'yesterday' },
  { label: '近7天', value: '7days' },
  { label: '近30天', value: '30days' }
];
const activeQuickDate = ref('7days'); // 默认近7天
const dateRange = ref(getQuickDateRange('7days'));
const selectedDomains = ref(['all']); // 默认全部域名
const domainOptions = ref([]);

// 数据总览卡片
const cardsLoading = ref(false);
const dataCards = reactive([
  { label: '实时在线用户数', value: 0, comparison: '', trend: 0, format: 'number' },
  { label: '今日注册数', value: 0, comparison: '', trend: 0, format: 'number' },
  { label: '今日开通VIP数', value: 0, comparison: '', trend: 0, format: 'number' },
  { label: '今日充值金币数', value: 0, comparison: '', trend: 0, format: 'currency' },
  { label: '今日浏览量(PV)', value: 0, comparison: '', trend: 0, format: 'number' },
  { label: '今日访客数(UV)', value: 0, comparison: '', trend: 0, format: 'number' },
]);

// 趋势分析
const trendLoading = ref(false);
const trendPeriod = ref('7days'); // 默认近7天
const trendChartData = ref([]); // 格式: [{ date: 'MM-DD', value: N }] - 简化示例
const trendChartRef = ref(null); // ECharts 容器引用

// 明细表
const tableLoading = ref(false);
const detailTableData = ref([]);
const totalDetailData = ref(0);
const detailCurrentPage = ref(1);
const detailPageSize = ref(10);

// 快捷订单卡片
const quickOrderCards = [
  { label: '待支付订单', value: 60, desc: '金额：7500元', bg: 'linear-gradient(90deg,#6a8eff,#8fd3f4)' },
  { label: '单日支付单', value: 78, desc: '金额：7500元', bg: 'linear-gradient(90deg,#ff7e5f,#feb47b)' },
  { label: '待审核订单', value: 4, desc: '金额：7500元', bg: 'linear-gradient(90deg,#43cea2,#185a9d)' }
]; // ← 注意这里没有逗号

// 域名排行榜模拟数据
const domainRankData = ref([
  { rank: 1, domain: 'domain1.com', pv: 123456, uv: 45678 },
  { rank: 2, domain: 'domain2.net', pv: 112233, uv: 42345 },
  { rank: 3, domain: 'domain3.org', pv: 99887, uv: 39876 },
  { rank: 4, domain: 'domain4.io', pv: 87654, uv: 34567 },
  { rank: 5, domain: 'domain5.cn', pv: 76543, uv: 29876 }
]);

// --- 日期快捷选项 ---
const dateShortcuts = [
  {
    text: '今日',
    value: () => {
      const end = new Date();
      const start = new Date();
      return [start, end];
    },
  },
  {
    text: '昨日',
    value: () => {
      const end = new Date();
      end.setDate(end.getDate() - 1);
      const start = new Date();
      start.setDate(start.getDate() - 1);
      return [start, end];
    },
  },
  {
    text: '近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
  {
    text: '近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return [start, end];
    },
  },
];

function getQuickDateRange(type) {
  const today = new Date();
  let start, end;
  switch (type) {
    case 'today':
      start = end = today;
      break;
    case 'yesterday':
      start = end = new Date(today.setDate(today.getDate() - 1));
      break;
    case '7days':
      end = today;
      start = new Date();
      start.setDate(end.getDate() - 6);
      break;
    case '30days':
      end = today;
      start = new Date();
      start.setDate(end.getDate() - 29);
      break;
    default:
      start = end = today;
  }
  return [start, end];
}

// 快捷按钮点击
function handleQuickDate(type) {
  activeQuickDate.value = type;
  dateRange.value = getQuickDateRange(type);
  applyFilters();
}

// 日期选择器变化
function handleDateChange(val) {
  activeQuickDate.value = ''; // 取消高亮
}

// --- 格式化函数 ---
const formatMetricValue = (value, formatType) => {
  if (value === null || value === undefined) return '-';
  if (formatType === 'currency') {
    return `¥${value.toFixed(2)}`;
  }
  return value.toLocaleString(); // 默认数字格式化
};

const getFormattedDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- 数据获取逻辑 ---
const fetchAllData = async () => {
  const startDate = dateRange.value && dateRange.value[0] ? getFormattedDate(dateRange.value[0]) : null;
  const endDate = dateRange.value && dateRange.value[1] ? getFormattedDate(dateRange.value[1]) : null;

  // 同时加载所有数据，并设置各自的loading状态
  cardsLoading.value = true;
  trendLoading.value = true;
  tableLoading.value = true;

  try {
    const [summaryRes, trendRes, detailRes] = await Promise.all([
      mockApiService.fetchSummaryData(startDate, endDate, selectedDomains.value),
      mockApiService.fetchTrendData(trendPeriod.value, startDate, endDate, selectedDomains.value),
      mockApiService.fetchDetailTableData(detailCurrentPage.value, detailPageSize.value, startDate, endDate, selectedDomains.value)
    ]);

    // 更新数据总览卡片
    dataCards[0].value = summaryRes.onlineUser;
    dataCards[1].value = summaryRes.register;
    dataCards[1].comparison = summaryRes.registerComparison;
    dataCards[1].trend = summaryRes.registerComparison > 0 ? 1 : (summaryRes.registerComparison < 0 ? -1 : 0);

    dataCards[2].value = summaryRes.vipOpen;
    dataCards[2].comparison = summaryRes.vipOpenComparison;
    dataCards[2].trend = summaryRes.vipOpenComparison > 0 ? 1 : (summaryRes.vipOpenComparison < 0 ? -1 : 0);

    dataCards[3].value = summaryRes.coinRecharge;
    dataCards[3].comparison = summaryRes.coinRechargeComparison;
    dataCards[3].trend = summaryRes.coinRechargeComparison > 0 ? 1 : (summaryRes.coinRechargeComparison < 0 ? -1 : 0);

    dataCards[4].value = summaryRes.pv;
    dataCards[4].comparison = summaryRes.pvComparison;
    dataCards[4].trend = summaryRes.pvComparison > 0 ? 1 : (summaryRes.pvComparison < 0 ? -1 : 0);

    dataCards[5].value = summaryRes.uv;
    dataCards[5].comparison = summaryRes.uvComparison;
    dataCards[5].trend = summaryRes.uvComparison > 0 ? 1 : (summaryRes.uvComparison < 0 ? -1 : 0);

    // 更新趋势图数据 (这里简化只用 PV 为例)
    trendChartData.value = trendRes.map(item => ({ date: item.date, value: item.pv })); // 示例：显示PV趋势

    // 更新明细表数据
    detailTableData.value = detailRes.list;
    totalDetailData.value = detailRes.total;

  } catch (error) {
    ElMessage.error('数据加载失败: ' + error.message);
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    cardsLoading.value = false;
    trendLoading.value = false;
    tableLoading.value = false;
  }
};

// 仅获取趋势数据（当趋势周期切换时）
const fetchTrendData = async () => {
  trendLoading.value = true;
  const startDate = dateRange.value && dateRange.value[0] ? getFormattedDate(dateRange.value[0]) : null;
  const endDate = dateRange.value && dateRange.value[1] ? getFormattedDate(dateRange.value[1]) : null;

  try {
    const res = await mockApiService.fetchTrendData(trendPeriod.value, startDate, endDate, selectedDomains.value);
    trendChartData.value = res.map(item => ({ date: item.date, value: item.pv })); // 示例：显示PV趋势
  } catch (error) {
    ElMessage.error('趋势数据加载失败: ' + error.message);
    console.error('Failed to fetch trend data:', error);
  } finally {
    trendLoading.value = false;
  }
};

// 仅获取明细表数据（当分页变化时）
const fetchDetailTableData = async () => {
  tableLoading.value = true;
  const startDate = dateRange.value && dateRange.value[0] ? getFormattedDate(dateRange.value[0]) : null;
  const endDate = dateRange.value && dateRange.value[1] ? getFormattedDate(dateRange.value[1]) : null;

  try {
    const res = await mockApiService.fetchDetailTableData(detailCurrentPage.value, detailPageSize.value, startDate, endDate, selectedDomains.value);
    detailTableData.value = res.list;
    totalDetailData.value = res.total;
  } catch (error) {
    ElMessage.error('明细表数据加载失败: ' + error.message);
    console.error('Failed to fetch detail table data:', error);
  } finally {
    tableLoading.value = false;
  }
};

// 获取域名列表
const fetchDomainOptions = async () => {
  try {
    const res = await mockApiService.fetchDomainList();
    domainOptions.value = res;
  } catch (error) {
    ElMessage.error('获取域名列表失败: ' + error.message);
    console.error('Failed to fetch domain options:', error);
  }
};


// --- 交互逻辑 ---
// 筛选条件变化时，不立即触发查询，等待点击“查询”
const handleFilterChange = () => {
  // 可以添加一些去抖或节流，防止频繁刷新
};

const applyFilters = () => {
  detailCurrentPage.value = 1; // 筛选条件变化时重置分页
  fetchAllData();
};

const resetFilters = () => {
  activeQuickDate.value = '7days';
  dateRange.value = getQuickDateRange('7days');
  selectedDomains.value = ['all'];
  trendPeriod.value = '7days';
  detailCurrentPage.value = 1;
  detailPageSize.value = 10;
  fetchAllData();
};

// 明细表分页变化
const handleDetailPageChange = (page) => {
  detailCurrentPage.value = page;
  fetchDetailTableData();
};
const handleDetailPageSizeChange = (size) => {
  detailPageSize.value = size;
  detailCurrentPage.value = 1; // 修改每页大小后重置到第一页
  fetchDetailTableData();
};

// 导出明细数据 (模拟)
const exportDetailData = () => {
  ElMessage.success('数据导出功能待实现...');
  console.log('导出数据', detailTableData.value);
  // 实际项目中，会调用后端接口进行数据导出，或在前端生成 CSV/Excel
};

// --- 初始化 ---
onMounted(() => {
  // 设置默认日期为今日
  const today = new Date();
  dateRange.value = [today, today];
  fetchDomainOptions(); // 先加载域名选项
  fetchAllData(); // 首次加载所有数据
});
</script>

<style scoped>
.dashboard-container {
  background-color: #f5f7fa;
}

/* 筛选区 */
.filter-bar {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 数据总览区 */
.data-card-row {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* 响应式卡片布局 */
}

/* 快捷订单卡片区 */
.quick-order-row .quick-order-card {
  min-height: 100px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}
.quick-order-row .quick-order-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.10);
}

/* 趋势分析区 */
.trend-chart-row {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 域名排行榜区 */
.domain-rank-row {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.domain-rank-row .el-table {
  font-size: 14px;
}

/* 明细表区 */
.detail-table-section {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.el-button {
  border-radius: 8px;
  transition: all 0.2s ease;
}
.el-button:hover {
  transform: translateY(-1px);
}

.el-date-picker,
.el-select,
.el-input {
  border-radius: 8px;
}

/* Element Plus 表格基础样式调整 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}

.el-table th.el-table__cell {
  background-color: #f7f9fa;
  color: #333;
  font-weight: 600;
  padding: 12px 0;
}

.el-table td.el-table__cell {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

/* DataCard 组件的样式（请在 DataCard.vue 中定义更详细的样式） */
.data-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.data-card .value {
  font-size: 2.2em; /* 大号字体 */
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
  display: inline-block;
  margin-left: 5px;
  font-size: 0.9em;
}

.trend-arrow.up {
  color: #67c23a; /* 绿色 */
}

.trend-arrow.down {
  color: #f56c6c; /* 红色 */
}

.trend-arrow.flat {
  color: #909399; /* 灰色 */
}

/* Loading 骨架屏效果（Element Plus v-loading 默认已提供，此处为自定义补充） */
.chart-container {
  min-height: 200px; /* 保证loading时有高度 */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>