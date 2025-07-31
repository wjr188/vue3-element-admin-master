<template>
  <div class="ad-management-page">
    <h2>插屏广告管理</h2>

    <div class="statistics-panel">
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">总广告数</div>
          <div class="statistic-value">{{ statistics.totalAds }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">启用中</div>
          <div class="statistic-value">{{ statistics.activeAds }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">已停用</div>
          <div class="statistic-value">{{ statistics.inactiveAds }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">待审核</div>
          <div class="statistic-value">{{ statistics.pendingAuditAds }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">总曝光</div>
          <div class="statistic-value">{{ statistics.totalExposures }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="statistic-card">
        <div class="statistic-item">
          <div class="statistic-label">总点击</div>
          <div class="statistic-value">{{ statistics.totalClicks }}</div>
        </div>
      </el-card>
      </div>

    <div class="search-filter-area">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="广告名/ID:">
            <el-input v-model="searchParams.keyword" placeholder="广告名称/ID" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="投放位置:">
            <el-select v-model="searchParams.position" placeholder="全部位置">
              <el-option label="全部位置" value=""></el-option>
              <el-option v-for="pos in positionOptions" :key="pos.value" :label="pos.label" :value="pos.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="投放平台:">
            <el-select v-model="searchParams.platform" placeholder="全部平台">
              <el-option label="全部平台" value=""></el-option>
              <el-option v-for="plat in platformOptions" :key="plat.value" :label="plat.label" :value="plat.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="广告状态:">
            <el-select v-model="searchParams.status" placeholder="全部状态">
              <el-option label="全部状态" value=""></el-option>
              <el-option v-for="stat in adStatusOptions" :key="stat.value" :label="stat.label" :value="stat.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="生效时间:">
            <el-date-picker
              v-model="searchParams.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="敏感内容:">
            <el-select v-model="searchParams.nsfw_flag" placeholder="全部">
              <el-option label="全部" value=""></el-option>
              <el-option label="是" :value="1"></el-option>
              <el-option label="否" :value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="action-buttons">
        <el-button type="primary" @click="searchAds">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="success" @click="openAdModal('add')">新增广告</el-button>

        <el-dropdown @command="handleBatchCommand">
          <el-button>
            批量操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="batchEnable">批量启用</el-dropdown-item>
              <el-dropdown-item command="batchDisable">批量停用</el-dropdown-item>
              <el-dropdown-item command="batchDelete">批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="exportAdData">导出统计</el-button>
      </div>
    </div>

    <el-table
      :data="adList"
      v-loading="loading"
      border
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="封面" width="100">
        <template #default="scope">
          <div @click="openPreviewModal(scope.row)" style="cursor: pointer;">
            <div v-if="scope.row.media_type === 'image' || scope.row.media_type === 'gif'">
              <el-image style="width: 80px; height: 60px; object-fit: cover;" :src="scope.row.cover_url || scope.row.ad_url" fit="cover"></el-image>
            </div>
            <div v-else-if="scope.row.media_type === 'video'">
              <video style="width: 80px; height: 60px; object-fit: cover;" :src="scope.row.ad_url" muted></video>
            </div>
            <div v-else>无封面</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="广告名称"></el-table-column>
      <el-table-column label="投放位置" width="120">
        <template #default="scope">
          {{ getPositionLabel(scope.row.position) }}
        </template>
      </el-table-column>
      <el-table-column label="投放平台" width="120">
        <template #default="scope">
          {{ getPlatformLabel(scope.row.platform) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getAdStatusTagType(scope.row.status)">
            {{ getAdStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="敏感内容" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.nsfw_flag ? 'danger' : 'success'">
            {{ scope.row.nsfw_flag ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="expose_count" label="曝光次数" width="100"></el-table-column>
      <el-table-column prop="click_count" label="点击次数" width="100"></el-table-column>
      <el-table-column label="点击率(CTR)" width="120">
        <template #default="scope">
          {{ calculateCTR(scope.row.expose_count, scope.row.click_count) }}%
        </template>
      </el-table-column>
      <el-table-column label="投放时间段" width="200">
        <template #default="scope">
          {{ scope.row.start_time }} 至 {{ scope.row.end_time }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openAdModal('edit', scope.row.id)">编辑</el-button>
          <el-button
            link
            :type="scope.row.status === 'enabled' ? 'warning' : 'success'"
            @click="toggleAdStatus(scope.row)"
          >
            {{ scope.row.status === 'enabled' ? '停用' : '启用' }}
          </el-button>
          <el-popconfirm
            title="确定删除此广告吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="deleteAd(scope.row.id)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
          <el-button link type="info" @click="openPreviewModal(scope.row)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      background
      style="margin-top: 20px; text-align: right;"
    ></el-pagination>

    <el-dialog
      v-model="adModalVisible"
      :title="adModalTitle"
      width="60%"
      @close="handleAdModalClose"
      top="5vh"
      destroy-on-close
    >
      <el-form :model="adForm" :rules="rules" ref="adFormRef" label-width="120px" v-loading="modalLoading">
        <el-form-item label="广告名称:" prop="name">
          <el-input v-model="adForm.name"></el-input>
        </el-form-item>

        <el-form-item label="广告媒体:" prop="media_type">
          <el-radio-group v-model="adForm.media_type">
            <el-radio-button label="image">图片</el-radio-button>
            <el-radio-button label="gif">GIF</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="getMediaUploadLabel" prop="ad_url">
          <el-upload
            class="media-uploader"
            action="/your-upload-api" :show-file-list="false"
            :on-success="handleAdMediaUploadSuccess"
            :before-upload="beforeAdMediaUpload"
          >
            <div v-if="adForm.ad_url" class="media-preview-container">
              <el-image v-if="adForm.media_type === 'image' || adForm.media_type === 'gif'" :src="adForm.ad_url" fit="contain"></el-image>
              <video v-else-if="adForm.media_type === 'video'" :src="adForm.ad_url" controls muted></video>
              <el-icon class="upload-change-icon"><Edit /></el-icon>
            </div>
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-input v-model="adForm.ad_url" placeholder="或填写外部链接" style="margin-left: 10px; flex: 1;"></el-input>
        </el-form-item>

        <el-form-item label="封面图(可选):" prop="cover_url" v-if="adForm.media_type === 'video'">
          <el-upload
            class="media-uploader"
            action="/your-upload-api" :show-file-list="false"
            :on-success="handleCoverUploadSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="adForm.cover_url" :src="adForm.cover_url" class="media-preview-img" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-input v-model="adForm.cover_url" placeholder="或填写外部链接" style="margin-left: 10px; flex: 1;"></el-input>
        </el-form-item>


        <el-form-item label="投放位置:" prop="position">
          <el-select v-model="adForm.position" placeholder="请选择投放位置" multiple>
            <el-option v-for="pos in positionOptions" :key="pos.value" :label="pos.label" :value="pos.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="投放平台:" prop="platform">
          <el-select v-model="adForm.platform" placeholder="请选择投放平台" multiple>
            <el-option v-for="plat in platformOptions" :key="plat.value" :label="plat.label" :value="plat.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="定向地区:">
          <el-select v-model="adForm.target_area" placeholder="全部国家/地区" multiple>
            <el-option label="全部" value="all"></el-option>
            <el-option label="中国大陆" value="CN"></el-option>
            <el-option label="泰国" value="TH"></el-option>
            <el-option label="美国" value="US"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="跳转类型:" prop="link_type">
          <el-select v-model="adForm.link_type" placeholder="请选择跳转类型">
            <el-option v-for="link in linkTypeOptions" :key="link.value" :label="link.label" :value="link.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="跳转链接:" prop="link_url">
          <el-input v-model="adForm.link_url" placeholder="请填写跳转目标URL"></el-input>
        </el-form-item>

        <el-form-item label="展示频率:">
          <el-col :span="11">
            <el-form-item prop="max_per_day">
              <el-input-number v-model="adForm.max_per_day" :min="0" :max="999" placeholder="每天最多弹几次"></el-input-number>
              <span style="margin-left: 10px;">每天最多弹几次</span>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="min_interval">
              <el-input-number v-model="adForm.min_interval" :min="0" :max="9999" placeholder="每次页面最小间隔秒数"></el-input-number>
              <span style="margin-left: 10px;">每次页面最小间隔秒数</span>
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="投放时间段:" prop="time_range">
          <el-date-picker
            v-model="adForm.time_range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="生效时间"
            end-placeholder="失效时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="敏感内容(NSFW):" prop="nsfw_flag">
          <el-switch v-model="adForm.nsfw_flag" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否"></el-switch>
          <span style="margin-left: 10px; color: #F56C6C;" v-if="adForm.nsfw_flag">请谨慎投放敏感内容广告!</span>
        </el-form-item>

        <el-form-item label="广告标签:" prop="tags">
          <el-select v-model="adForm.tags" placeholder="请选择广告标签" multiple>
            <el-option v-for="tag in adTagsOptions" :key="tag.value" :label="tag.label" :value="tag.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="审核状态:" prop="audit_status" v-if="adModalMode === 'edit'">
          <el-radio-group v-model="adForm.audit_status">
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="approved">审核通过</el-radio-button>
            <el-radio-button label="rejected">拒绝</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="广告预览:">
          <el-button @click="showAdPreview" type="info" size="small">预览广告样式</el-button>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleAdModalClose">取消</el-button>
          <el-button type="primary" @click="submitAdForm">{{ adModalMode === 'add' ? '新增' : '保存' }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="previewModalVisible"
      title="广告样式预览"
      width="40%"
      top="10vh"
      destroy-on-close
      class="ad-preview-dialog"
    >
      <div class="ad-preview-content">
        <div v-if="currentPreviewAd.media_type === 'image' || currentPreviewAd.media_type === 'gif'" class="ad-media-wrapper">
          <img :src="currentPreviewAd.ad_url" alt="Ad Preview" style="max-width: 100%; max-height: 400px; object-fit: contain;">
        </div>
        <div v-else-if="currentPreviewAd.media_type === 'video'" class="ad-media-wrapper">
          <video :src="currentPreviewAd.ad_url" controls autoplay muted style="max-width: 100%; max-height: 400px;"></video>
        </div>
        <div v-else>
          <p>无广告媒体可预览或格式不支持。</p>
        </div>
        <el-button v-if="currentPreviewAd.link_url" type="primary" style="margin-top: 20px;" @click="goToSimulatedLink">点击跳转 (模拟)</el-button>
        <p v-if="currentPreviewAd.link_url" class="preview-link-info">跳转链接: <a :href="currentPreviewAd.link_url" target="_blank">{{ currentPreviewAd.link_url }}</a></p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, ArrowDown, Edit } from '@element-plus/icons-vue'; // 引入所需的图标

// --- 常量/选项定义 ---
const positionOptions = [
  { label: '首页', value: 'homepage' },
  { label: '分类页', value: 'category_page' },
  { label: '播放页', value: 'player_page' },
  { label: '弹窗/浮层', value: 'popup_overlay' },
  { label: '底部浮层', value: 'bottom_overlay' },
  { label: '全屏', value: 'fullscreen' },
  { label: '详情页', value: 'detail_page' },
];
const positionMap = new Map(positionOptions.map(item => [item.value, item.label]));

const platformOptions = [
  { label: 'PC端', value: 'pc' },
  { label: 'H5页面', value: 'h5' },
  { label: 'App', value: 'app' },
  { label: '全部', value: 'all' },
];
const platformMap = new Map(platformOptions.map(item => [item.value, item.label]));

const adStatusOptions = [
  { label: '启用中', value: 'enabled' },
  { label: '已停用', value: 'disabled' },
  { label: '待审核', value: 'pending' },
  { label: '审核通过', value: 'approved' },
  { label: '拒绝', value: 'rejected' },
];
const adStatusMap = new Map(adStatusOptions.map(item => [item.value, item.label]));

const linkTypeOptions = [
  { label: '外部链接', value: 'external' },
  { label: '站内跳转', value: 'internal' },
  { label: 'H5唤起App', value: 'h5_app_wakeup' },
  { label: '原生App下载', value: 'native_app_download' },
  { label: '微信小程序', value: 'wechat_mini_program' },
  { label: 'Telegram群', value: 'telegram_group' },
  { label: '短视频App', value: 'short_video_app' },
];
const linkTypeMap = new Map(linkTypeOptions.map(item => [item.value, item.label]));

const adTagsOptions = [
  { label: '会员付费', value: 'member_pay' },
  { label: '引流推广', value: 'traffic_drainage' },
  { label: '约会交友', value: 'dating_social' },
  { label: '虚拟币', value: 'virtual_currency' },
  { label: 'VPN推广', value: 'vpn_promotion' },
  { label: '短视频/直播', value: 'short_video_live' },
  { label: '博彩', value: 'gambling' },
  { label: '成人内容', value: 'adult_content' },
];
const adTagsMap = new Map(adTagsOptions.map(item => [item.value, item.label]));


// --- 列表页状态变量 ---
const loading = ref(false); // 列表加载状态
const adList = ref([]); // 广告列表数据
const selectedAds = ref([]); // 选中的广告，用于批量操作

const searchParams = reactive({
  keyword: '',
  position: '',
  platform: '',
  status: '',
  timeRange: [], // 生效时间段 [start_time, end_time]
  nsfw_flag: '',
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// --- 顶部统计区域状态变量 ---
const statistics = reactive({
  totalAds: 0,
  activeAds: 0,
  inactiveAds: 0,
  pendingAuditAds: 0,
  totalExposures: 0,
  totalClicks: 0,
  // 已移除 avgCTR: '0.00',
});

// --- 广告新增/编辑弹窗状态变量 ---
const adModalVisible = ref(false); // 控制弹窗显示隐藏
const adModalMode = ref('add'); // 弹窗模式：'add', 'edit'
const currentAdId = ref(null); // 当前操作的广告ID

const modalLoading = ref(false); // 弹窗内数据加载状态
const adFormRef = ref(null); // 用于弹窗表单验证的引用

const adForm = reactive({
  id: null,
  name: '',
  media_type: 'image', // 默认图片
  ad_url: '', // 广告媒体文件URL
  cover_url: '', // 视频封面图URL (可选)
  link_type: 'external',
  link_url: '',
  platform: ['all'], // 默认全部平台
  position: [], // 默认不选
  target_area: ['all'], // 默认全部地区
  nsfw_flag: 0, // 默认非敏感
  status: 'pending', // 默认待审核
  start_time: '',
  end_time: '',
  max_per_day: 0, // 默认无限制
  min_interval: 0, // 默认无限制
  audit_status: 'pending', // 默认待审核
  tags: [], // 默认无标签
  time_range: [], // 用于日期选择器绑定
});

const adModalTitle = computed(() => {
  return adModalMode.value === 'add' ? '新增广告' : '编辑广告';
});

const getMediaUploadLabel = computed(() => {
  if (adForm.media_type === 'image') return '上传图片:';
  if (adForm.media_type === 'gif') return '上传GIF:';
  if (adForm.media_type === 'video') return '上传视频:';
  return '上传文件:';
});

// 表单验证规则
const rules = reactive({
  name: [{ required: true, message: '请输入广告名称', trigger: 'blur' }],
  media_type: [{ required: true, message: '请选择广告媒体类型', trigger: 'change' }],
  ad_url: [{ required: true, message: '请上传广告媒体或填写链接', trigger: 'blur' }],
  link_type: [{ required: true, message: '请选择跳转类型', trigger: 'change' }],
  link_url: [{ required: true, message: '请填写跳转链接', trigger: 'blur' }],
  platform: [{ type: 'array', required: true, message: '请选择投放平台', trigger: 'change' }],
  position: [{ type: 'array', required: true, message: '请选择投放位置', trigger: 'change' }],
  time_range: [{ type: 'array', required: true, message: '请选择投放时间段', trigger: 'change' }],
});

// --- 广告预览弹窗状态变量 ---
const previewModalVisible = ref(false);
const currentPreviewAd = reactive({}); // 用于预览的广告数据

// --- 列表页相关方法 ---

// 获取顶部统计数据
const fetchStatistics = async () => {
  // !!! 请替换成您的实际API调用获取统计数据 !!!
  // 示例: const response = await api.get('/api/admin/interstitial/stats/summary');
  // 这里使用模拟数据
  const mockStats = {
    totalAds: 100,
    activeAds: 60,
    inactiveAds: 30,
    pendingAuditAds: 10,
    totalExposures: 1234567,
    totalClicks: 24680,
  };
  statistics.totalAds = mockStats.totalAds;
  statistics.activeAds = mockStats.activeAds;
  statistics.inactiveAds = mockStats.inactiveAds;
  statistics.pendingAuditAds = mockStats.pendingAuditAds;
  statistics.totalExposures = mockStats.totalExposures;
  statistics.totalClicks = mockStats.totalClicks;
  // 已移除 statistics.avgCTR = calculateCTR(mockStats.totalExposures, mockStats.totalClicks);
  // --- 模拟API调用结束 ---
};

// 获取广告列表
const fetchAdList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchParams.keyword,
      position: searchParams.position,
      platform: searchParams.platform,
      status: searchParams.status,
      nsfw_flag: searchParams.nsfw_flag,
      ...(searchParams.timeRange && searchParams.timeRange.length === 2 && {
        start_time: searchParams.timeRange[0],
        end_time: searchParams.timeRange[1],
      }),
    };

    // !!! 请替换成您的实际API调用获取广告列表 !!!
    // 示例: const response = await api.get('/api/admin/interstitial/list', { params });
    // 这里使用模拟数据
    const mockData = generateMockAds(pagination.pageSize, pagination.currentPage);
    const response = {
      data: {
        list: mockData,
        total: 100,
      },
      code: 200,
    };
    // --- 模拟API调用结束 ---

    if (response.code === 200) {
      adList.value = response.data.list;
      pagination.total = response.data.total;
    } else {
      ElMessage.error('获取广告列表失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取广告列表异常:', error);
    ElMessage.error('获取广告列表异常');
  } finally {
    loading.value = false;
  }
};

// 搜索广告
const searchAds = () => {
  pagination.currentPage = 1;
  fetchAdList();
};

// 重置筛选条件
const resetFilters = () => {
  searchParams.keyword = '';
  searchParams.position = '';
  searchParams.platform = '';
  searchParams.status = '';
  searchParams.timeRange = [];
  searchParams.nsfw_flag = '';
  pagination.currentPage = 1;
  fetchAdList();
};

// 切换广告状态 (启用/停用)
const toggleAdStatus = async (ad) => {
  const newStatus = ad.status === 'enabled' ? 'disabled' : 'enabled';
  const actionText = newStatus === 'enabled' ? '启用' : '停用';
  try {
    await ElMessageBox.confirm(`确定要${actionText}广告 [${ad.name}] 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // !!! 请替换成您的实际API调用 !!!
    // 示例: const response = await api.post('/api/admin/interstitial/status', { id: ad.id, status: newStatus });
    const response = { code: 200 }; // 模拟成功
    // --- 模拟API调用结束 ---

    if (response.code === 200) {
      ElMessage.success(`${actionText}成功!`);
      fetchAdList(); // 刷新列表
      fetchStatistics(); // 刷新统计
    } else {
      ElMessage.error(`${actionText}失败: ` + (response.message || '未知错误'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`切换广告状态异常:`, error);
      ElMessage.error(`${actionText}广告异常`);
    }
  }
};

// 删除广告
const deleteAd = async (adId) => {
  try {
    await ElMessageBox.confirm('确定删除此广告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    // !!! 请替换成您的实际API调用 !!!
    // 示例: const response = await api.post('/api/admin/interstitial/delete', { ids: [adId] });
    const response = { code: 200 }; // 模拟成功
    // --- 模拟API调用结束 ---

    if (response.code === 200) {
      ElMessage.success('删除成功!');
      fetchAdList(); // 刷新列表
      fetchStatistics(); // 刷新统计
    } else {
      ElMessage.error('删除失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除广告异常:', error);
      ElMessage.error('删除广告异常');
    }
  }
};

// 处理批量操作
const handleBatchCommand = async (command) => {
  if (selectedAds.value.length === 0) {
    ElMessage.warning('请先选择要操作的广告！');
    return;
  }

  const adIds = selectedAds.value.map(ad => ad.id);
  let actionText = '';
  let newStatus = '';
  let confirmMessage = '';

  switch (command) {
    case 'batchEnable':
      actionText = '批量启用';
      newStatus = 'enabled';
      confirmMessage = '确定要批量启用选中的广告吗？';
      break;
    case 'batchDisable':
      actionText = '批量停用';
      newStatus = 'disabled';
      confirmMessage = '确定要批量停用选中的广告吗？';
      break;
    case 'batchDelete':
      actionText = '批量删除';
      confirmMessage = '确定要批量删除选中的广告吗？此操作不可恢复！';
      break;
    default:
      return;
  }

  try {
    await ElMessageBox.confirm(confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    let response;
    if (command === 'batchDelete') {
      // !!! API call: await api.post('/api/admin/interstitial/delete', { ids: adIds });
      response = { code: 200 }; // 模拟成功
    } else {
      // !!! API call: await api.post('/api/admin/interstitial/status', { ids: adIds, status: newStatus });
      response = { code: 200 }; // 模拟成功
    }

    if (response.code === 200) {
      ElMessage.success(`${actionText}成功！`);
      fetchAdList();
      fetchStatistics();
      selectedAds.value = []; // 清空选择
    } else {
      ElMessage.error(`${actionText}失败: ` + (response.message || '未知错误'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作异常:', error);
      ElMessage.error(`${actionText}异常`);
    }
  }
};

// 导出广告数据 (统计)
const exportAdData = async () => {
  // !!! 请替换成您的实际API调用导出数据 !!!
  // 示例: window.open(`/api/admin/interstitial/export?${new URLSearchParams(searchParams).toString()}`);
  ElMessage.success('正在导出广告统计数据...');
};

// 处理表格行选择变化
const handleSelectionChange = (selection) => {
  selectedAds.value = selection;
};

// 分页大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  fetchAdList();
};

// 当前页变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  fetchAdList();
};

// --- 广告新增/编辑弹窗相关方法 ---

// 打开广告弹窗
const openAdModal = async (mode, adId = null) => {
  adModalMode.value = mode;
  currentAdId.value = adId;
  adModalVisible.value = true;
  adFormRef.value?.resetFields(); // 重置表单验证状态

  if (mode === 'edit' && adId) {
    modalLoading.value = true;
    try {
      // !!! 请替换成您的实际API调用获取广告详情 !!!
      // 示例: const response = await api.get(`/api/admin/interstitial/detail?id=${adId}`);
      // 这里使用模拟数据
      const mockAd = findMockAdById(adId);
      const response = {
        data: mockAd,
        code: 200,
      };
      // --- 模拟API调用结束 ---

      if (response.code === 200 && response.data) {
        Object.assign(adForm, response.data);
        adForm.time_range = [adForm.start_time, adForm.end_time]; // 绑定到日期选择器
      } else {
        ElMessage.error('获取广告详情失败: ' + (response.message || '未知错误'));
        handleAdModalClose();
      }
    } catch (error) {
      console.error('获取广告详情异常:', error);
      ElMessage.error('获取广告详情异常');
      handleAdModalClose();
    } finally {
      modalLoading.value = false;
    }
  } else {
    // 新增模式，重置表单
    Object.assign(adForm, {
      id: null, name: '', media_type: 'image', ad_url: '', cover_url: '',
      link_type: 'external', link_url: '', platform: ['all'], position: [],
      target_area: ['all'], nsfw_flag: 0, status: 'pending',
      start_time: '', end_time: '', max_per_day: 0, min_interval: 0,
      audit_status: 'pending', tags: [], time_range: [],
    });
  }
};

// 提交广告表单 (新增或编辑)
const submitAdForm = async () => {
  if (!adFormRef.value) return;

  await adFormRef.value.validate(async (valid) => {
    if (valid) {
      modalLoading.value = true;
      try {
        let apiResponse;
        const dataToSubmit = { ...adForm };
        // 从time_range解构start_time和end_time
        if (dataToSubmit.time_range && dataToSubmit.time_range.length === 2) {
          dataToSubmit.start_time = dataToSubmit.time_range[0];
          dataToSubmit.end_time = dataToSubmit.time_range[1];
        } else {
          dataToSubmit.start_time = '';
          dataToSubmit.end_time = '';
        }
        delete dataToSubmit.time_range; // 移除辅助字段

        if (adModalMode.value === 'add') {
          // !!! 请替换成您的实际API调用 (新增广告) !!!
          // apiResponse = await api.post('/api/admin/interstitial/add', dataToSubmit);
          apiResponse = { code: 200, message: '新增成功' }; // 模拟成功
        } else {
          // !!! 请替换成您的实际API调用 (编辑广告) !!!
          // apiResponse = await api.post('/api/admin/interstitial/edit', dataToSubmit);
          apiResponse = { code: 200, message: '保存成功' }; // 模拟成功
        }

        if (apiResponse.code === 200) {
          ElMessage.success(apiResponse.message);
          handleAdModalClose();
          fetchAdList();
          fetchStatistics();
        } else {
          ElMessage.error(apiResponse.message || '操作失败');
        }
      } catch (error) {
        console.error('提交广告表单异常:', error);
        ElMessage.error('操作异常');
      } finally {
        modalLoading.value = false;
      }
    } else {
      ElMessage.error('请检查表单填写项！');
    }
  });
};

// 处理广告媒体文件上传成功
const handleAdMediaUploadSuccess = (response, uploadFile) => {
  if (response.code === 200 && response.data && response.data.url) {
    adForm.ad_url = response.data.url; // 假设API返回图片的URL
    ElMessage.success('媒体文件上传成功');
  } else {
    adForm.ad_url = URL.createObjectURL(uploadFile.raw); // 本地预览
    ElMessage.warning('媒体文件上传成功，但未获取到后端URL，请检查API响应。已使用本地预览URL。');
  }
};

// 上传广告媒体文件前的校验
const beforeAdMediaUpload = (rawFile) => {
  const isImage = rawFile.type.includes('image/');
  const isVideo = rawFile.type.includes('video/');
  const isLt50M = rawFile.size / 1024 / 1024 < 50; // 假设最大50MB

  if (adForm.media_type === 'image' && !isImage) {
    ElMessage.error('请上传图片文件!');
    return false;
  }
  if (adForm.media_type === 'gif' && rawFile.type !== 'image/gif') {
    ElMessage.error('请上传GIF文件!');
    return false;
  }
  if (adForm.media_type === 'video' && !isVideo) {
    ElMessage.error('请上传视频文件!');
    return false;
  }
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB!');
    return false;
  }
  return true;
};

// 处理封面图上传成功
const handleCoverUploadSuccess = (response, uploadFile) => {
  if (response.code === 200 && response.data && response.data.url) {
    adForm.cover_url = response.data.url;
    ElMessage.success('封面图上传成功');
  } else {
    adForm.cover_url = URL.createObjectURL(uploadFile.raw); // 本地预览
    ElMessage.warning('封面图上传成功，但未获取到后端URL。已使用本地预览URL。');
  }
};

// 上传封面图前的校验
const beforeCoverUpload = (rawFile) => {
  const isImage = rawFile.type.includes('image/');
  const isLt2M = rawFile.size / 1024 / 1024 < 2; // 封面图较小，限制2MB

  if (!isImage) {
    ElMessage.error('封面图只能是图片格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('封面图大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 关闭广告弹窗
const handleAdModalClose = () => {
  adModalVisible.value = false;
  adFormRef.value?.resetFields(); // 重置表单，清除校验状态
  // 清空表单数据
  Object.assign(adForm, {
    id: null, name: '', media_type: 'image', ad_url: '', cover_url: '',
    link_type: 'external', link_url: '', platform: ['all'], position: [],
    target_area: ['all'], nsfw_flag: 0, status: 'pending',
    start_time: '', end_time: '', max_per_day: 0, min_interval: 0,
    audit_status: 'pending', tags: [], time_range: [],
  });
};

// --- 广告预览弹窗相关方法 ---
const openPreviewModal = (adData) => {
  Object.assign(currentPreviewAd, adData);
  previewModalVisible.value = true;
};

// 模拟点击跳转 (预览弹窗中)
const goToSimulatedLink = () => {
  if (currentPreviewAd.link_url) {
    window.open(currentPreviewAd.link_url, '_blank');
  } else {
    ElMessage.warning('没有有效的跳转链接！');
  }
};

// --- 辅助函数 ---
// 根据投放位置值获取中文标签
const getPositionLabel = (value) => {
  if (Array.isArray(value)) {
    return value.map(v => positionMap.get(v)).filter(Boolean).join('，');
  }
  return positionMap.get(value) || value;
};

// 根据投放平台值获取中文标签
const getPlatformLabel = (value) => {
  if (Array.isArray(value)) {
    return value.map(v => platformMap.get(v)).filter(Boolean).join('，');
  }
  return platformMap.get(value) || value;
};

// 根据广告状态值获取中文标签
const getAdStatusLabel = (value) => {
  return adStatusMap.get(value) || value;
};

// 根据广告状态获取tag类型
const getAdStatusTagType = (status) => {
  switch (status) {
    case 'enabled': return 'success';
    case 'disabled': return 'info';
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    default: return '';
  }
};

// 计算点击率 (CTR)
const calculateCTR = (exposure, click) => {
  if (exposure > 0) {
    return ((click / exposure) * 100).toFixed(2);
  }
  return '0.00';
};

// 显示广告预览 (用于新增/编辑弹窗内部的预览按钮)
const showAdPreview = () => {
  // 校验表单，但只在编辑/新增模式下进行完整校验
  adFormRef.value?.validateField(['ad_url'], (isValid) => {
    if (isValid || adForm.ad_url) { // 如果链接有效或者已存在链接，就允许预览
      openPreviewModal(adForm);
    } else {
      ElMessage.warning('请先上传广告媒体或填写广告链接！');
    }
  });
};


// --- 模拟数据生成 (请在实际项目中替换为API调用) ---
const generateMockAds = (count, page) => {
  const ads = [];
  const startId = (page - 1) * count + 1;
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomMultiple = (arr) => {
    const num = Math.floor(Math.random() * arr.length);
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num > 0 ? num : 1); // 至少选择一个
  };
  const mockMediaTypes = ['image', 'gif', 'video'];
  const mockLinkTypes = ['external', 'h5_app_wakeup', 'native_app_download', 'telegram_group'];
  const mockPlatforms = platformOptions.map(p => p.value).filter(v => v !== 'all');
  const mockPositions = positionOptions.map(p => p.value);
  const mockStatuses = ['enabled', 'disabled', 'pending', 'approved', 'rejected'];
  const mockTags = adTagsOptions.map(t => t.value);

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const mediaType = getRandom(mockMediaTypes);
    const adUrl = mediaType === 'image' || mediaType === 'gif'
      ? `https://picsum.photos/id/${id}/300/200`
      : `https://www.w3schools.com/html/mov_bbb.mp4`; // 示例视频
    const coverUrl = mediaType === 'video' ? `https://picsum.photos/id/${id + 100}/160/90` : '';

    const expose_count = Math.floor(Math.random() * 100000);
    const click_count = Math.floor(Math.random() * (expose_count * 0.05)); // 5% CTR

    ads.push({
      id: id,
      name: `广告名称_${id}`,
      cover_url: coverUrl,
      media_type: mediaType,
      ad_url: adUrl,
      link_type: getRandom(mockLinkTypes),
      link_url: `https://example.com/ad/${id}`,
      platform: getRandomMultiple(mockPlatforms),
      position: getRandomMultiple(mockPositions),
      target_area: getRandomMultiple(['CN', 'TH', 'US']),
      nsfw_flag: Math.random() > 0.7 ? 1 : 0, // 30%概率为敏感
      status: getRandom(mockStatuses),
      start_time: `2024-01-01 00:00:00`,
      end_time: `2025-12-31 23:59:59`,
      max_per_day: Math.floor(Math.random() * 5) + 1,
      min_interval: Math.floor(Math.random() * 60) + 10,
      expose_count: expose_count,
      click_count: click_count,
      audit_status: getRandom(['pending', 'approved', 'rejected']),
      tags: getRandomMultiple(mockTags),
      create_time: `2024-01-01 00:00:00`,
      update_time: `2024-06-21 12:00:00`,
    });
  }
  return ads;
};

const findMockAdById = (id) => {
    const allMockAds = generateMockAds(pagination.total > 0 ? pagination.total : 100, 1);
    return allMockAds.find(ad => ad.id === id);
};


// --- 生命周期钩子 ---
onMounted(() => {
  fetchStatistics(); // 组件挂载时获取统计数据
  fetchAdList(); // 组件挂载时获取广告列表
});
</script>

<style scoped>
.ad-management-page {
  padding: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #333;
}

/* 顶部统计区域样式 */
.statistics-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* 响应式网格布局 */
  gap: 20px; /* 卡片之间的间距 */
  margin-bottom: 25px;
}

.statistic-card {
  text-align: center;
  background-color: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.statistic-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.statistic-item {
  padding: 15px 0;
}

.statistic-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.statistic-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

/* 搜索筛选区域样式 */
.search-filter-area {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-filter-area .el-row {
  margin-bottom: 15px; /* 行间距 */
}

.search-filter-area .el-form-item {
  margin-bottom: 0; /* 移除表单项默认的下边距，由el-row控制 */
  display: flex;
  align-items: center;
}

.search-filter-area .el-form-item :deep(.el-form-item__label) {
  flex-shrink: 0; /* 防止label被压缩 */
  width: 90px !important; /* 统一label宽度 */
  text-align: right;
  padding-right: 12px;
}

.search-filter-area .el-input,
.search-filter-area .el-select,
.search-filter-area .el-date-picker {
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* Element Plus 表格基础样式 */
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

/* 媒体上传预览样式 */
.media-uploader {
  width: 180px; /* 调整上传区域宽度 */
  height: 100px; /* 调整上传区域高度 */
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.media-preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-preview-container img, .media-preview-container video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.upload-change-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 18px;
  color: #fff;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
}

/* 预览弹窗样式 */
.ad-preview-dialog .el-dialog__body {
  text-align: center;
  padding-bottom: 20px;
}
.ad-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ad-media-wrapper {
  max-width: 100%;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.preview-link-info {
  font-size: 14px;
  color: #606266;
  margin-top: 10px;
  word-break: break-all; /* 防止长链接溢出 */
}
</style>