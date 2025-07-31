<template>
  <div v-if="memberStore.statistics">
    <div class="statistics-panel">
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">总会员数</div>
          <div class="statistic-value">{{ memberStore.statistics.totalMembers ?? 0 }}</div>
        </div>
      </el-card>
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">正常会员</div>
          <div class="statistic-value">{{ memberStore.statistics.normalMembers ?? 0 }}</div>
        </div>
      </el-card>
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">金币总数</div>
          <div class="statistic-value">{{ memberStore.statistics.totalGoldCoins ?? 0 }}</div>
        </div>
      </el-card>
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">已过期会员</div>
          <div class="statistic-value">{{ memberStore.statistics.expiredMembers ?? 0 }}</div>
        </div>
      </el-card>
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">已支付订单</div>
          <div class="statistic-value">{{ memberStore.statistics.paidOrders ?? 0 }}</div>
        </div>
      </el-card>
      <el-card class="statistic-card" shadow="hover">
        <div class="statistic-item">
          <div class="statistic-label">待支付订单</div>
          <div class="statistic-value">{{ memberStore.statistics.pendingOrders ?? 0 }}</div>
        </div>
      </el-card>
    </div>

    <div class="search-filter-area">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="关键词:">
            <el-input v-model="searchParams.keyword" placeholder="昵称/手机号/邮箱/ID" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="会员卡:">
            <el-select v-model="searchParams.vip_card_id" placeholder="全部会员卡" clearable>
              <el-option value="" label="全部会员卡" />
              <el-option :value="'NO_CARD'" label="普通用户（未购卡）" />
              <el-option
                v-for="opt in vipCardOptionsFiltered"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="会员状态:">
            <el-select v-model="searchParams.memberStatus" placeholder="全部状态">
              <el-option label="全部状态" value=""></el-option>
              <el-option label="正常" value="NORMAL"></el-option>
              <el-option label="禁用" value="DISABLED"></el-option>
              <el-option label="已过期" value="EXPIRED"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="到期时间:">
            <el-date-picker
              v-model="searchParams.expirationTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="金币筛选:">
            <el-select v-model="searchParams.coin_status" placeholder="全选">
              <el-option label="全选" value=""></el-option>
              <el-option label="金币用户" value="HAS"></el-option>
              <el-option label="无金币" value="ZERO"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="action-buttons">
        <el-button type="primary" @click="searchMembers">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="success" @click="openMemberModal('add')">新增会员</el-button>
        
        <el-dropdown @command="handleBatchCommand">
          <el-button>
            批量操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="batchDisable">批量禁用</el-dropdown-item>
              <el-dropdown-item command="batchEnable">批量启用</el-dropdown-item>
              <el-dropdown-item command="batchDelete">批量删除</el-dropdown-item>
              <el-dropdown-item command="exportCurrent">导出当前筛选</el-dropdown-item>
              <el-dropdown-item command="exportSelected" :disabled="selectedMembers.length === 0">导出选中</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-table
      :data="memberList"
      :loading="loading"
      border
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="用户ID" width="45"></el-table-column>
      <el-table-column label="头像" width="80">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar || defaultAvatar" size="small"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="账号"></el-table-column>
      <el-table-column prop="nickname" label="昵称"></el-table-column>
      <el-table-column prop="mobile" label="手机号"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="vip_card_name" label="会员卡" width="140" />
      <el-table-column
  prop="can_view_vip_video"
  label="会员视频权限"
  width="120"
>
  <template #default="{ row }">
    <el-tag :type="row.can_view_vip_video == 1 ? 'success' : 'info'">
      {{ row.can_view_vip_video == 1 ? '可观看VIP' : '不可看VIP' }}
    </el-tag>
  </template>
</el-table-column>

      <el-table-column
        prop="can_watch_coin"
        label="金币视频权限"
        width="120"
      >
        <template #default="{ row }">
          <el-tag :type="row.can_watch_coin == 1 ? 'success' : 'info'">
            {{ row.can_watch_coin == 1 ? '能免费观看' : '需花金币' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="goldCoins" label="金币数" width="100"></el-table-column>
      <el-table-column prop="points" label="积分" width="80" />
      <el-table-column prop="memberStatus" label="会员状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.memberStatus) as 'primary' | 'success' | 'warning' | 'info' | 'danger'">
            {{ getStatusText(scope.row.memberStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="expirationTime" label="到期时间" width="120"></el-table-column>
      <el-table-column prop="registrationTime" label="注册时间" width="160"></el-table-column>
      <el-table-column prop="lastLoginTime" label="最近登录时间" width="160"></el-table-column>
      <el-table-column prop="uuid" label="唯一ID" width="140"></el-table-column>
      <el-table-column prop="invite_code" label="邀请码" width="120"></el-table-column>
      <el-table-column label="观看次数" width="220">
        <template #default="{ row }">
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span>长视频：{{ row.watchCount.long_video_left }}/{{ row.watchCount.long_video_max }}</span>
            <span>抖音：{{ row.watchCount.dy_video_left }}/{{ row.watchCount.dy_video_max }}</span>
            <span>积分：{{ row.points ?? 0 }}</span>
          </div>
        </template>
      </el-table-column>



      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="viewMemberDetails(scope.row.id)">详情</el-button>
          <el-button link type="primary" @click="openMemberModal('edit', scope.row.id)">编辑</el-button>
          <el-button
  link
  :type="scope.row.memberStatus === 'NORMAL' ? 'danger' : 'success'"
  @click="toggleMemberStatus(scope.row)"
>
  {{ scope.row.memberStatus === 'NORMAL' ? '禁用' : '启用' }}
</el-button>

          <el-popconfirm
            title="确定删除此会员吗？(建议软删除，实际一般用禁用)"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="pagination && pagination.currentPage !== undefined"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      layout="total, sizes, prev, pager, next, jumper"
      background
      style="margin-top: 20px; text-align: right;"
    ></el-pagination>

    <el-dialog
      v-model="memberModalVisible"
      :title="dialogTitle"
      :width="memberModalMode === 'view' ? '80%' : '50%'"
      @close="handleModalClose"
      top="5vh"
      destroy-on-close
    >
      <el-tabs v-model="activeTab" v-loading="modalLoading">
        <el-tab-pane label="基础信息" name="basicInfo">
          <el-form :model="memberForm" :rules="rules" ref="memberFormRef" label-width="120px" :disabled="memberModalMode === 'view'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="会员ID:" v-if="memberModalMode !== 'add'">
                  <el-input v-model="memberForm.id" disabled></el-input>
                </el-form-item>
                
                <el-form-item label="账号:" prop="account">
                  <el-input v-model="memberForm.account" placeholder="请输入账号" :disabled="memberModalMode !== 'add'"></el-input>
                </el-form-item>
                
                <el-form-item 
                  :label="memberModalMode === 'add' ? '初始密码:' : '新密码:'" 
                  prop="password"
                >
                  <el-input 
                    type="password" 
                    v-model="memberForm.password" 
                    show-password 
                    :placeholder="memberModalMode === 'add' 
                      ? '请输入初始密码' 
                      : '如需重置密码，请填写（不填则不修改）'"
                  ></el-input>
                </el-form-item>
                
                <el-form-item label="昵称:" prop="nickname">
                  <el-input v-model="memberForm.nickname" placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="手机号:" prop="mobile">
                  <el-input v-model="memberForm.mobile" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item label="邮箱:" prop="email">
                  <el-input v-model="memberForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="会员卡:" prop="vip_card_id">
                  <el-select
                    v-model="memberForm.vip_card_id"
                    placeholder="请选择会员卡"
                    clearable
                  >
                    <el-option :value="'NO_CARD'" label="普通用户" />
                    <el-option
                      v-for="opt in vipCardOptionsFiltered"
                      :key="opt.id"
                      :label="opt.name"
                      :value="opt.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="金币数:" prop="goldCoins">
                  <el-input-number v-model="memberForm.goldCoins" :min="0" :max="99999999" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="头像:">
                  <el-upload
  class="avatar-uploader"
  action="/your-upload-api"
  :show-file-list="false"
  :on-success="handleAvatarSuccess"
  :before-upload="beforeAvatarUpload"
  :disabled="memberModalMode === 'view'"
>
  <img :src="memberForm.avatar || defaultAvatar" class="avatar" />
</el-upload>
                </el-form-item>

                <el-form-item label="会员状态:" v-if="memberModalMode !== 'add'">
                  <el-tag :type="getStatusTagType(memberForm.memberStatus) as 'primary' | 'success' | 'warning' | 'info' | 'danger'">
                    {{ getStatusText(memberForm.memberStatus) }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="到期时间:" prop="expirationTime">
                  <el-date-picker
                    v-model="memberForm.expirationTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    format="YYYY-MM-DD HH:mm:ss"
                    :disabled="true"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item label="注册时间:" v-if="memberModalMode !== 'add'">
                  <el-input v-model="memberForm.registrationTime" disabled></el-input>
                </el-form-item>
                <el-form-item label="最近登录:" v-if="memberModalMode !== 'add'">
                  <el-input v-model="memberForm.lastLoginTime" disabled></el-input>
                </el-form-item>
                <el-form-item label="后台备注:" prop="remark">
                  <el-input type="textarea" v-model="memberForm.remark" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="积分:" prop="points">
                  <el-input-number v-model="memberForm.points" :min="0" :max="99999999" controls-position="right" :disabled="memberModalMode === 'view'" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div class="dialog-footer" v-if="memberModalMode !== 'view'">
            <el-button @click="handleModalClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit">{{ memberModalMode === 'add' ? '新增' : '保存' }}</el-button>
          </div>
          <div class="dialog-footer" v-else>
            <el-button type="primary" @click="openMemberModal('edit', currentMemberId)">编辑</el-button>
            <el-button @click="handleResetPassword">重置密码</el-button>
            <el-button
              :type="memberForm.memberStatus === 'NORMAL' ? 'warning' : 'success'"
              @click="handleToggleStatus"
            >
              {{ memberForm.memberStatus === 'NORMAL' ? '禁用会员' : '启用会员' }}
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="订单管理" name="orderManagement" v-if="memberModalMode === 'view'">
          <div class="order-summary">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover">
                  <div class="statistic-item">
                    <div class="statistic-label">已支付订单数</div>
                    <div class="statistic-value">{{ memberForm.paidOrdersSummary?.count ?? 0 }} 单</div>
                    <div class="statistic-sub-value">总金额: {{ memberForm.paidOrdersSummary?.totalAmount ?? '0.00' }} 元</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="hover">
                  <div class="statistic-item">
                    <div class="statistic-label">待支付订单数</div>
                    <div class="statistic-value">{{ memberForm.pendingOrdersSummary?.count ?? 0 }} 单</div>
                    <div class="statistic-sub-value">总金额: {{ memberForm.pendingOrdersSummary?.totalAmount ?? '0.00' }} 元</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <h3>已支付订单</h3>
          <el-table :data="memberForm.paidOrders" border style="width: 100%">
            <el-table-column prop="orderId" label="订单ID" width="180"></el-table-column>
            <el-table-column prop="item" label="商品/服务"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
            <el-table-column prop="payTime" label="支付时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
          </el-table>

          <h3 style="margin-top: 20px;">待支付订单</h3>
          <el-table :data="memberForm.pendingOrders" border style="width: 100%">
            <el-table-column prop="orderId" label="订单ID" width="180"></el-table-column>
            <el-table-column prop="item" label="商品/服务"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
          </el-table>

          <h3 style="margin-top: 20px;">金币消费记录</h3> <el-table :data="memberForm.goldCoinTransactions" border style="width: 100%">
            <el-table-column prop="transactionId" label="交易ID" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="100"></el-table-column>
            <el-table-column prop="amount" label="金币变化" width="100"></el-table-column>
            <el-table-column prop="balance" label="当前余额" width="100"></el-table-column>
            <el-table-column prop="time" label="时间" width="180"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="消费记录" name="consumptionRecords" v-if="memberModalMode === 'view' && memberForm.consumptionRecords && memberForm.consumptionRecords.length > 0">
          <el-table :data="memberForm.consumptionRecords" border style="width: 100%">
            <el-table-column prop="orderId" label="订单ID" width="180"></el-table-column>
            <el-table-column prop="item" label="商品/服务"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
            <el-table-column prop="time" label="时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="operationLogs" v-if="memberModalMode === 'view'">
          <el-table :data="memberForm.historyOperations" border style="width: 100%">
            <el-table-column prop="opId" label="ID" width="80"></el-table-column>
            <el-table-column prop="type" label="操作类型" width="120"></el-table-column>
            <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
            <el-table-column prop="detail" label="详情"></el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="登录日志" name="loginLogs" v-if="memberModalMode === 'view'">
          <el-table :data="memberForm.loginLogs" border style="width: 100%">
            <el-table-column prop="logId" label="ID" width="80"></el-table-column>
            <el-table-column prop="loginTime" label="登录时间" width="180"></el-table-column>
            <el-table-column prop="ip" label="IP地址" width="120"></el-table-column>
            <el-table-column prop="device" label="设备" width="200"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
  <div v-else>
    <el-empty description="加载中..." />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, InfoFilled } from '@element-plus/icons-vue'
import { useMemberAdminStore } from '@/store/modules/userAdmin.store'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/images/666.webp'


import {
  fetchUserList, addUser, updateUser, deleteUser,
  fetchUserStats, fetchUserDetail, batchUpdateUser,
  fetchCoinStats, fetchOrderStats,
} from '@/api/user';


const memberStore = useMemberAdminStore()
const { memberList, loading, pagination, statistics, cardOptions: memberStoreCardOptions } = storeToRefs(memberStore)

const searchParams = reactive({
  keyword: '',
  vip_card_id: '',
  memberStatus: '',
  expirationTimeRange: [] as [string, string] | [],
  coin_status: ''
})


// 计算属性，用于过滤掉名为“普通用户”的会员卡选项，作为弹窗内的 cardOptions
const vipCardOptionsFiltered = computed(() => {
  return memberStoreCardOptions.value;
});

watch(memberList, (val) => {
  console.log('页面拿到的 memberList:', val)
}, { immediate: true })


interface MemberRow {
  id: number | string;
  [key: string]: any;
}
const selectedMembers = ref<MemberRow[]>([])
const memberModalVisible = ref(false)
const memberModalMode = ref('view')
const currentMemberId = ref<number | null>(null)
const activeTab = ref('basicInfo')
const modalLoading = ref(false)
const memberFormRef = ref<any>(null)
const memberForm = reactive({
  id: null,  
  account: '',
  nickname: '',
  mobile: '',
  email: '',
  avatar: '',
  vip_card_id: '',
  goldCoins: 0,
  points: 0, // 新增积分字段
  memberStatus: 'NORMAL',
  expirationTime: '',
  registrationTime: '',
  lastLoginTime: '',
  remark: '',
  password: '',
  paidOrders: [],
  pendingOrders: [],
  paidOrdersSummary: { count: 0, totalAmount: '0.00' },
  pendingOrdersSummary: { count: 0, totalAmount: '0.00' },
  goldCoinTransactions: [],
  consumptionRecords: [],
  historyOperations: [],
  loginLogs: [],
  watchCount: {
    long_video_used: 0,
    long_video_max: 0,
    dy_video_used: 0,
    dy_video_max: 0,
  },
})

const dialogTitle = computed(() => {
  if (memberModalMode.value === 'add') return '新增会员'
  if (memberModalMode.value === 'edit') return '编辑会员'
  return '会员详情'
})

const rules = computed(() => {
  const baseRules: any = {
    account: [
      // 不要 required，只做格式校验
      { 
        pattern: /^[a-zA-Z0-9_.\-@]{6,}$/, 
        message: '账号必须6位及以上，仅限字母、数字、_ . - @', 
        trigger: 'blur' 
      }
    ],
    nickname: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' },
    ],
    vip_card_id: [
      { required: false, message: '请选择会员卡', trigger: 'change' }
    ],
    goldCoins: [
      {
        validator: (rule: any, value: any, callback: (arg0?: Error | undefined) => void) => {
          if (value === '' || value === null || value === undefined) {
            callback();
          } else if (typeof value === 'number' && value >= 0 && value <= 99999999) {
            callback();
          } else {
            callback(new Error('金币数必须是0到99999999之间的数字'));
          }
        },
        trigger: 'change',
      },
    ],
    expirationTime: [
      {
        validator: (rule: any, value: any, callback: (arg0?: Error | undefined) => void) => {
          // 直接改为只校验 expirationTime 是否必填，不要再判断 memberLevel
          if (memberModalMode.value === 'add' && memberForm.vip_card_id && !value) {
            callback(new Error('到期时间未能自动生成，请检查会员卡信息或联系管理员'));
          } else {
            callback();
          }
        },
        trigger: ['change', 'blur'],
      },
    ],
    mobile: [ // 统一手机号和邮箱的验证规则
      {
        validator: (rule: any, value: any, callback: (arg0?: Error | undefined) => void) => {
          if (!value) {
            callback();
          } else if (!/^1[3-9]\d{9}$/.test(value)) {
            callback(new Error('请输入有效的手机号'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    email: [ // 统一手机号和邮箱的验证规则
      {
        validator: (rule: any, value: any, callback: (arg0?: Error | undefined) => void) => {
          if (!value) {
            callback();
          } else if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
            callback(new Error('请输入有效的邮箱地址'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  };

  if (memberModalMode.value === 'add') {
    baseRules.password = [
  { required: true, message: '请输入初始密码', trigger: 'blur' },
  { 
    pattern: /^[a-zA-Z0-9_.\-@]{6,}$/, 
    message: '密码必须6位及以上，仅限字母、数字、_ . - @', 
    trigger: 'blur' 
  }
];
    // 移除 baseRules.confirmPassword
  } else { // 编辑模式下密码可选，但不为空时需校验
    baseRules.password = [
  { 
    pattern: /^[a-zA-Z0-9_.\-@]{6,}$/, 
    message: '密码必须6位及以上，仅限字母、数字、_ . - @', 
    trigger: 'blur' 
  }
];
  }

  return baseRules;
});

// 状态映射常量
const STATUS_MAPPING = {
  NORMAL: { value: 1, text: '禁用' },
  DISABLED: { value: 0, text: '启用' },
  EXPIRED: { value: 0, text: '启用' }
};

// 表格行操作按钮
const toggleMemberStatus = async (row) => {
  // 用 memberStatus 判断
  const newStatus = row.memberStatus === 'NORMAL' ? 0 : 1;
  const confirmText = newStatus === 0
    ? `确定要禁用用户 ${row.nickname} 吗？`
    : `确定要启用用户 ${row.nickname} 吗？`;
  const successText = newStatus === 0 ? '用户已禁用！' : '用户已启用！';

  try {
    await ElMessageBox.confirm(confirmText, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const success = await memberStore.updateMemberStatus(row.id, newStatus);
    if (success) {
      await fetchMembers();
      ElMessage.success(successText);
    } else {
      ElMessage.error('操作失败: ' + (memberStore.errorMsg || '未知错误'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态变更失败:', error);
      ElMessage.error('状态变更失败');
    }
  }
};

// 详情弹窗内按钮（同步修正）
const handleToggleStatus = () => {
  toggleMemberStatus({
    ...memberForm,
    id: memberForm.id,  
    memberStatus: memberForm.memberStatus
  });
};

// 拉取会员列表
const fetchMembers = async () => {
  await memberStore.fetchMemberList({ ...searchParams });
};

// 拉取统计数据
const fetchStatisticsData = () => memberStore.fetchStatistics();

// 搜索
const searchMembers = () => {
  pagination.value.currentPage = 1;
  memberStore.fetchMemberList({ ...searchParams }); // 一定要传递参数
};

// 重置筛选器
const resetFilters = () => {
  searchParams.keyword = '';
  searchParams.vip_card_id = ''; // 这里必须是空字符串，类型为 string
  searchParams.memberStatus = '';
  searchParams.expirationTimeRange = [];
  searchParams.coin_status = '';
  pagination.value.currentPage = 1;
  fetchMembers();
};

// 分页
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val;
  fetchMembers();
};
const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val;
  fetchMembers();
};

// handleAdd 和 handleEdit 不再直接被 handleSubmit 调用，而是handleSubmit中直接构建参数
const handleAdd = async (data: any) => {
  // 此处逻辑已合并到 handleSubmit
};

// 编辑
const handleEdit = async (data: any) => {
  // 此处逻辑已合并到 handleSubmit
};
const handleDelete = async (id: number) => {  
  try {
    await ElMessageBox.confirm('确定删除此会员吗？(建议软删除)', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const success = await memberStore.deleteMember(id);
    if (success) {
      ElMessage.success('会员删除成功！');
      await fetchMembers();
    } else {
      ElMessage.error(memberStore.errorMsg || '会员删除失败！');
    }
  } catch (error) {
    // 处理用户取消删除的情况，或者其他错误
  }
};

// 批量操作
function handleBatchCommand(command: string) {
  if (selectedMembers.value.length === 0 && command !== 'exportCurrent') {
    ElMessage.warning('请先选择要操作的会员！');
    return;
  }
  let memberUuids = selectedMembers.value.map(m => Number(m.id));  

  try {
    switch (command) {
      case 'batchDisable':
        ElMessageBox.confirm('确定要批量禁用选中的会员吗？', '提示', { type: 'warning' })
          .then(async () => {
            const success = await memberStore.batchUpdateMembers('disable', memberUuids);
            if (success) {
              ElMessage.success('批量禁用成功！');
              fetchMembers();
            } else {
              ElMessage.error(memberStore.errorMsg || '批量禁用失败！');
            }
          }).catch(() => { });
        break;
      case 'batchEnable':
        ElMessageBox.confirm('确定要批量启用选中的会员吗？', '提示', { type: 'warning' })
          .then(async () => {
            const success = await memberStore.batchUpdateMembers('enable', memberUuids);
            if (success) {
              ElMessage.success('批量启用成功！');
              fetchMembers();
            } else {
              ElMessage.error(memberStore.errorMsg || '批量启用失败！');
            }
          }).catch(() => { });
        break;
      case 'batchDelete':
        ElMessageBox.confirm('确定要批量删除选中的会员吗？(建议后台实现软删除)', '提示', { type: 'warning' })
          .then(async () => {
            const success = await memberStore.batchUpdateMembers('delete', memberUuids);
            if (success) {
              ElMessage.success('批量删除成功！');
              fetchMembers();
            } else {
              ElMessage.error(memberStore.errorMsg || '批量删除失败！');
            }
          }).catch(() => { });
        break;
      case 'exportCurrent':
        ElMessage.success('正在导出当前筛选数据...');
        break;
      case 'exportSelected':
        ElMessage.success('正在导出选中数据...');
        break;
      default:
        break;
    }
    selectedMembers.value = [];
  } catch (error: any) {
    console.error('批量操作失败:', error);
    ElMessage.error(error.message || '批量操作失败！');
  }
}

function handleSelectionChange(selection: any[]) {
  selectedMembers.value = selection
  console.log('当前多选：', selection)
}

function handleModalClose() {
  memberModalVisible.value = false
  Object.assign(memberForm, {
    id: null,  
    account: '',
    nickname: '',
    mobile: '',
    email: '',
    avatar: '',
    vip_card_id: null,
    goldCoins: 0,
    points: 0, // 重置积分
    memberStatus: 'NORMAL',
    expirationTime: '',
    registrationTime: '',
    lastLoginTime: '',
    remark: '',
    password: '', // 重置时清空密码
    paidOrders: [],
    paidOrdersSummary: { count: 0, totalAmount: '0.00' },
    pendingOrders: [],
    pendingOrdersSummary: { count: 0, totalAmount: '0.00' },
    goldCoinTransactions: [],
    consumptionRecords: [],
    historyOperations: [],
    loginLogs: [],
  });
  activeTab.value = 'basicInfo';
  if (memberFormRef.value) {
    memberFormRef.value.resetFields();
  }
}

const openMemberModal = async (mode: 'add' | 'edit' | 'view', id: number | null = null) => {  
  // 确保加载会员卡选项
  await memberStore.fetchCardOptions();

  memberModalMode.value = mode;
  currentMemberId.value = id;  
  memberModalVisible.value = true;
  activeTab.value = 'basicInfo';

  if (mode !== 'add' && id !== null) {
    modalLoading.value = true;
    try {
      await memberStore.fetchMemberDetail(id);

      if (!memberStore.memberDetail) {
        ElMessage.error(memberStore.errorMsg || '获取会员详情失败');
        return;
      }

      // 映射 coin 字段到 goldCoins
      const { password: currentPassword, confirmPassword: currentConfirmPassword, coin, ...restDetail } = memberStore.memberDetail;
      Object.assign(memberForm, restDetail);
      memberForm.goldCoins = memberStore.memberDetail.goldCoins ?? 0;
      memberForm.points = memberStore.memberDetail.points ?? 0;
      memberForm.watchCount = memberStore.memberDetail.watchCount ?? {
        long_video_used: 0,
        long_video_max: 0,
        dy_video_used: 0,
        dy_video_max: 0,
      };
      memberForm.password = '';

      // 修改日期处理部分
      const expTimeStr = memberStore.memberDetail.expirationTime;
      if (expTimeStr && expTimeStr !== '-' && dayjs(expTimeStr).isValid()) {
        memberForm.expirationTime = expTimeStr; // 保持字符串格式
      } else {
        memberForm.expirationTime = '';
      }

    } catch (err: any) {
      console.error('加载会员详情失败', err);
      ElMessage.error('获取会员详情异常');
      return;
    } finally {
      modalLoading.value = false;
    }
  } else {
    // 新增模式，重置表单
    Object.assign(memberForm, {
      id: null,  
      account: '',
      nickname: '',
      mobile: '',
      email: '',
      avatar: '',
      vip_card_id: null,
      goldCoins: 0,
      points: 0, 
      memberStatus: 'NORMAL',
      expirationTime: '',
      registrationTime: '',
      lastLoginTime: '',
      remark: '',
      password: '', // 确保新增模式下密码字段为空
      paidOrders: [],
      pendingOrders: [],
      paidOrdersSummary: { count: 0, totalAmount: '0.00' },
      pendingOrdersSummary: { count: 0, totalAmount: '0.00' },
      goldCoinTransactions: [],
      consumptionRecords: [],
      historyOperations: [],
      loginLogs: [],
    });
    memberFormRef.value?.resetFields();
  }
};


const handleSubmit = async () => {
  if (!memberFormRef.value) return;
  modalLoading.value = true;
  try {
    await memberFormRef.value.validate();
    const submitData: any = { ...memberForm };

    // 字段映射修正
    if (submitData.expirationTime) {
      submitData.vip_expire_time = submitData.expirationTime; // 保证有值
    }
    // 不要 delete submitData.expirationTime; // 保留，后端返回时会用

    submitData.points = memberForm.points ?? 0;

    // 删除所有和会员卡名/level相关的字段
    delete submitData.memberLevel;
    delete submitData.vip_card;
    delete submitData.vip_card_name;
    delete submitData.memberStatus;
    delete submitData.registrationTime;
    delete submitData.lastLoginTime;
    delete submitData.paidOrders;
    delete submitData.pendingOrders;
    delete submitData.paidOrdersSummary;
    delete submitData.pendingOrdersSummary;
    delete submitData.goldCoinTransactions;
    delete submitData.consumptionRecords;
    delete submitData.historyOperations;
    delete submitData.loginLogs;

    if (!submitData.avatar) {
      delete submitData.avatar;
    }
    if (memberModalMode.value === 'edit') {
      submitData.uuid = memberForm.id;
      if (!memberForm.password) {
        delete submitData.password;
      }
      console.log('最终提交数据:', submitData);
      await memberStore.updateMember(submitData);
      ElMessage.success('会员信息更新成功！');
    } else {
      submitData.password = memberForm.password;
      console.log('新增会员提交数据:', submitData);
      await memberStore.addMember(submitData);  
      ElMessage.success('会员新增成功！');
    }
    memberModalVisible.value = false;
    fetchMembers();
  } catch (error: any) {
    ElMessage.error('提交失败！');
  } finally {
    modalLoading.value = false;
  }
};

const viewMemberDetails = (id: number) => {  
  openMemberModal('view', id);
};


const handleAvatarSuccess = (response: any, uploadFile: any) => {
  if (response.code === 0 && response.data && response.data.url) {
    memberForm.avatar = response.data.url;
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error('头像上传失败: ' + (response.msg || '未知错误'));
  }
};
const beforeAvatarUpload = (rawFile: File) => {
  // 常见图片格式
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  const isImage = allowedTypes.includes(rawFile.type);
  const isLt1M = rawFile.size / 1024 / 1024 < 1;

  if (!isImage) {
    ElMessage.error('仅支持图片格式: JPG, PNG, GIF, WEBP, BMP, SVG!');
  }
  if (!isLt1M) {
    ElMessage.error('头像图片大小不能超过 1MB!');
  }
  return isImage && isLt1M;
};

const handleResetPassword = async () => {
  try {
    const { value: newPassword } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'password',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度需在6到20个字符之间',
    });
    // 调用更新接口，只传递 password 字段
    const success = await memberStore.updateMember({ id: currentMemberId.value, password: newPassword });  
    if (success) {
      ElMessage.success('密码重置成功！');
      // 重置密码后，清空弹窗内的密码字段
      memberForm.password = '';
    } else {
      ElMessage.error('密码重置失败: ' + (memberStore.errorMsg || '未知错误'));
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('密码重置异常:', error);
      ElMessage.error('密码重置失败或已取消。');
    }
  }
};

onMounted(() => {
  fetchStatisticsData()
  fetchMembers()
  memberStore.fetchCardOptions() // 确保调用以加载会员卡选项
})

watch(
  () => memberForm.vip_card_id,
  (newId) => {
    if (memberModalMode.value !== 'view' && newId) {
      const card = vipCardOptionsFiltered.value.find(opt => String(opt.id) === String(newId));
      if (card && card.duration && card.durationUnit) {
        memberForm.expirationTime = dayjs()
          .add(card.duration, card.durationUnit.toLowerCase() as dayjs.ManipulateType)
          .format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }
);

function getStatusTagType(status: string) {
  let type = '';
  switch (status) {
    case 'NORMAL':
      type = 'success';
      break;
    case 'DISABLED':
      type = 'danger';
      break;
    case 'EXPIRED':
      type = 'info';
      break;
    default:
      type = '';
  }
  const legalTypes = ['primary', 'success', 'info', 'warning', 'danger'];
  return legalTypes.includes(type) ? type : 'info';
}

function getStatusText(status: string) {
  switch (status) {
    case 'NORMAL':
      return '正常'
    case 'DISABLED':
      return '禁用'
    case 'EXPIRED':
      return '已过期'
    default:
      return status || '未知'
  }
}
</script>

<style scoped>
.member-list-page {
  padding: 20px;
}

.statistics-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
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
.statistic-sub-value {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.search-filter-area {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-filter-area .el-row {
  margin-bottom: 15px;
}

.search-filter-area .el-form-item {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

.search-filter-area .el-form-item :deep(.el-form-item__label) {
  flex-shrink: 0;
  width: 70px !important;
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

.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
}

.el-form-item {
  margin-bottom: 18px;
}

.order-summary {
  margin-bottom: 20px;
}
.order-summary .el-card {
  background-color: #f9f9f9;
}
.order-summary .statistic-value {
  font-size: 24px;
}
.watch-count-panel .statistic-value {
  font-size: 20px;
  font-weight: bold;
}

</style>