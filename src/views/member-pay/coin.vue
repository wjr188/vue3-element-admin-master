<template>
  <div class="coin-recharge-manage-page">
    <el-card shadow="always" class="header-card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">金币充值套餐管理</h2>
        <div class="space-x-2">
          <el-button type="success" @click="onAdd" size="small">+ 添加套餐</el-button>
          <el-button type="warning" @click="onBatchSetStatus(1)" size="small" :disabled="selectedPackages.length === 0">批量上架</el-button>
          <el-button type="info" @click="onBatchSetStatus(0)" size="small" :disabled="selectedPackages.length === 0">批量下架</el-button>
          <el-button type="danger" @click="onBatchDelete" size="small" :disabled="selectedPackages.length === 0">批量删除</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="套餐名称/ID" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px;">
            <el-option label="全部" value="" />
            <el-option label="已上架" :value="1" />
            <el-option label="已下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset" size="small">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="always" class="table-card">
      <el-table
        :data="packageList"
        v-loading="packageLoading"
        border
        stripe
        class="custom-table"
        style="width: 100%;"
        header-cell-class-name="header-cell"
        cell-class-name="body-cell"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="套餐名称" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="price" label="售价(元)" width="90" align="center">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金币数" width="90" align="center">
          <template #default="scope">
            <el-tag type="warning" size="small">{{ scope.row.amount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gift_coins" label="赠送金币" width="90" align="center">
          <template #default="scope">
            <el-tag type="success" size="small" v-if="scope.row.gift_coins > 0">{{ scope.row.gift_coins }}</el-tag>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="标签" width="100" align="center">
          <template #default="scope">
            <el-tag type="danger" size="small" v-if="scope.row.tag">{{ scope.row.tag }}</el-tag>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="create_time" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" fixed="right" width="180" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="primary" @click="onEdit(scope.row)">编辑</el-button>
              <el-button size="small" :type="scope.row.status === 1 ? 'info' : 'success'" @click="onChangeStatus(scope.row)">
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button size="small" type="danger" @click="onDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="packageTotal"
        @size-change="onSearch"
        @current-change="onSearch"
        background
        style="margin-top: 20px; justify-content: flex-end;"
      ></el-pagination>
    </el-card>

    <!-- 添加/编辑套餐弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="formTitle" width="500px" @close="onFormDialogClose">
      <el-form :model="packageForm" label-width="100px" size="default" ref="packageFormRef" :rules="formRules">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="packageForm.name" placeholder="请输入套餐名称" clearable />
        </el-form-item>
        <el-form-item label="金币数" prop="amount">
          <el-input-number v-model="packageForm.amount" :min="1" :max="99999" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="售价(元)" prop="price">
          <el-input-number v-model="packageForm.price" :min="0" :max="9999999" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="赠送金币" prop="gift_coins">
          <el-input-number v-model="packageForm.gift_coins" :min="0" :max="99999" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-input v-model="packageForm.tag" placeholder="如：推荐、热门 (可选)" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="packageForm.sort" :min="0" :max="99999" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="packageForm.status"
            active-text="上架"
            inactive-text="下架"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPackageForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { storeToRefs } from 'pinia';

// 导入 Pinia store 定义和 API 接口定义
import { useCoinPackageStore } from '@/store/modules/coinPackage.store';
import { CoinPackageListItem, CoinPackageFormParams } from '@/api/coin-package';


// 初始化 Pinia store
const coinPackageStore = useCoinPackageStore();

// 使用 storeToRefs 解构 store 中的响应式状态，保持其响应性
const { packageList, packageTotal, packageLoading } = storeToRefs(coinPackageStore);

// 解构 store 中的 actions，直接使用
const { fetchList, add, update, remove, changeStatus, fetchDetail } = coinPackageStore;

// --- 页面响应式数据 ---
const searchForm = reactive({
  page: 1,
  pageSize: 10,
  keyword: '', // 套餐名称/ID (PHP后端列表接口目前不支持 keyword 搜索)
  status: '' as '' | 0 | 1, // 上架状态，对应 0:下架, 1:上架, '':全部
});

const selectedPackages = ref<CoinPackageListItem[]>([]); // 表格多选

const formDialogVisible = ref(false); // 添加/编辑弹窗
const formTitle = ref('添加新套餐'); // 弹窗标题

// 表单数据，与 CoinPackageFormParams 接口一致
const packageForm = reactive<CoinPackageFormParams & { id?: number }>({
  id: undefined, // 用于区分新增和编辑
  name: '',
  price: 0,
  amount: 1, // 金币数默认至少为1，对应后端字段 'amount'
  gift_coins: 0,
  tag: '',
  status: 1, // 默认上架 (1)
  sort: 0, // 默认排序为0
});

const packageFormRef = ref<FormInstance>();
const formRules = reactive<FormRules<typeof packageForm>>({
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  amount: [{ required: true, type: 'number', min: 1, message: '金币数必须大于0的正整数', trigger: 'blur' }],
  price: [{ required: true, type: 'number', min: 0, message: '售价不能小于0', trigger: 'blur' }],
  // tag 和 sort 可以根据需要添加验证规则
});

// ===================== 数据加载函数 =====================
async function loadPackages() {
  // 调用 store 中的 fetchList 方法
  await fetchList({
    page: searchForm.page,
    pageSize: searchForm.pageSize,
    keyword: searchForm.keyword, // 后端列表接口目前不支持 keyword 搜索，但前端保留
    status: searchForm.status === '' ? undefined : searchForm.status,
  });
  console.log("套餐数据已从store加载:", packageList.value);
}

// ===================== 搜索与重置 =====================
function onSearch() {
  searchForm.page = 1; // 搜索时重置页码到第一页
  loadPackages();
}

function onReset() {
  Object.assign(searchForm, {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: '',
  });
  loadPackages();
}

// ===================== 表格选择 =====================
function handleSelectionChange(rows: CoinPackageListItem[]) {
  selectedPackages.value = rows;
}

// ===================== 添加/编辑套餐 =====================
function onAdd() {
  formTitle.value = '添加新套餐';
  // 重置表单为添加模式的默认值
  Object.assign(packageForm, {
    id: undefined, // 确保是新增模式
    name: '',
    price: 0,
    amount: 1, // 对应后端字段 'amount'
    gift_coins: 0,
    tag: '',
    status: 1, // 默认上架 (1)
    sort: 0,
  });
  // 确保重置表单的验证状态
  packageFormRef.value?.resetFields();
  formDialogVisible.value = true;
}

async function onEdit(row: CoinPackageListItem) {
  formTitle.value = '编辑套餐';
  try {
    // PHP控制器中没有单独的fetchDetail，列表接口已返回所有字段。
    // 所以这里直接使用传入的row数据来填充表单。
    Object.assign(packageForm, {
      id: row.id,
      name: row.name,
      price: row.price,
      amount: row.amount, // 对应后端的 amount 字段
      gift_coins: row.gift_coins,
      tag: row.tag,
      status: row.status,
      sort: row.sort,
    });
    packageFormRef.value?.clearValidate(); // 清除旧的验证信息
    formDialogVisible.value = true;

  } catch (error) {
    console.error('获取套餐详情失败:', error);
    ElMessage.error('获取套餐详情失败，请检查网络或服务');
  }
}

async function submitPackageForm() {
  if (!packageFormRef.value) return;
  const isValid = await packageFormRef.value.validate();
  if (!isValid) return;

  try {
    let res;
    // 准备提交数据，确保字段名与 PHP 控制器期望的完全匹配
    const submitData: CoinPackageFormParams = {
      id: packageForm.id,
      name: packageForm.name,
      price: packageForm.price,
      amount: packageForm.amount, // 对应后端的 amount 字段
      gift_coins: packageForm.gift_coins,
      tag: packageForm.tag,
      status: packageForm.status,
      sort: packageForm.sort,
    };

    if (submitData.id) { // 编辑现有套餐
      res = await update(submitData); // 调用 store.update
    } else { // 添加新套餐
      res = await add(submitData); // 调用 store.add
    }

    if (res && res.code === 0) { // 假设 store 的方法返回 { code: 0, message: ..., data: ... }
      ElMessage.success(res.message);
      formDialogVisible.value = false;
      // 列表刷新已由 store 中的 add/update action 处理
    } else {
      ElMessage.error(res?.message || (submitData.id ? '保存失败' : '添加失败'));
    }
  } catch (error) {
    console.error('提交套餐表单失败:', error);
    ElMessage.error(packageForm.id ? '保存失败，请检查网络或服务' : '添加失败，请检查网络或服务');
  }
}

function onFormDialogClose() {
  // 重置表单状态，移除 ID
  Object.assign(packageForm, {
    id: undefined,
    name: '',
    price: 0,
    amount: 1, // 对应后端字段 'amount'
    gift_coins: 0,
    tag: '',
    status: 1,
    sort: 0,
  });
  packageFormRef.value?.resetFields();
}

// ===================== 删除操作 =====================
function onDelete(row: CoinPackageListItem) {
  ElMessageBox.confirm(`确定删除套餐 “${row.name}” 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        // 后端delete接口支持ids数组，也支持单个id。为了统一，这里仍传数组。
        const res = await remove([row.id]); // 调用 store.remove，以数组形式传递单个ID
        if (res && res.code === 0) {
          ElMessage.success(res.message);
          // 列表刷新已由 store 中的 remove action 处理
        } else {
          ElMessage.error(res?.message || '删除失败');
        }
      } catch (error) {
        console.error('删除套餐失败:', error);
        ElMessage.error('删除失败，请检查网络或服务');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// ===================== 批量操作 =====================

async function onBatchSetStatus(status: 0 | 1) {
  if (selectedPackages.value.length === 0) {
    ElMessage.warning('请选择要操作的套餐');
    return;
  }
  const actionText = status === 1 ? '上架' : '下架';
  const confirmMsg = `确定批量${actionText}已选套餐吗？`;

  ElMessageBox.confirm(confirmMsg, '警告', { type: 'warning' })
    .then(async () => {
      const idsToUpdate = selectedPackages.value.map(pkg => pkg.id);
      try {
        const res = await changeStatus(idsToUpdate, status); // 调用 store.changeStatus
        if (res && res.code === 0) {
          ElMessage.success(res.message);
          selectedPackages.value = []; // 清空选中
          // 列表刷新已由 store 中的 changeStatus action 处理
        } else {
          ElMessage.error(res?.message || `批量${actionText}失败`);
        }
      } catch (error) {
        console.error(`批量${actionText}失败:`, error);
        ElMessage.error(`批量${actionText}失败，请检查网络或服务`);
      }
    })
    .catch(() => {
      ElMessage.info(`已取消批量${actionText}`);
    });
}

async function onChangeStatus(row: CoinPackageListItem) {
  const newStatus = row.status === 1 ? 0 : 1; // 切换状态
  const actionText = newStatus === 1 ? '上架' : '下架';
  const confirmMsg = `确定${actionText}套餐 “${row.name}” 吗？`;

  ElMessageBox.confirm(confirmMsg, '提示', { type: 'warning' })
    .then(async () => {
      try {
        const res = await changeStatus([row.id], newStatus); // 调用 store.changeStatus
        if (res && res.code === 0) {
          ElMessage.success(res.message);
          // 列表刷新已由 store 中的 changeStatus action 处理
        } else {
          ElMessage.error(res?.message || `${actionText}失败`);
        }
      } catch (error) {
        console.error(`${actionText}失败:`, error);
        ElMessage.error(`${actionText}失败，请检查网络或服务`);
      }
    })
    .catch(() => {
      ElMessage.info(`已取消${actionText}`);
    });
}


async function onBatchDelete() {
  if (selectedPackages.value.length === 0) {
    ElMessage.warning('请选择要删除的套餐');
    return;
  }
  ElMessageBox.confirm('确定批量删除已选套餐吗？', '警告', { type: 'warning' })
    .then(async () => {
      const idsToDelete = selectedPackages.value.map(pkg => pkg.id);
      try {
        const res = await remove(idsToDelete); // 调用 store.remove
        if (res && res.code === 0) {
          ElMessage.success(res.message);
          selectedPackages.value = [];
          // 列表刷新已由 store 中的 remove action 处理
        } else {
          ElMessage.error(res?.message || '批量删除操作失败');
        }
      } catch (error) {
        console.error('批量删除操作失败:', error);
        ElMessage.error('批量删除失败，请检查网络或后端服务');
      }
    })
    .catch(() => {
      ElMessage.info('已取消批量删除');
    });
}


// 组件挂载时加载数据
onMounted(async () => {
  await loadPackages(); // 加载充值套餐数据
});
</script>

<style scoped>
.coin-recharge-manage-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px); /* 假设顶部导航50px */
}

.header-card,
.table-card {
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-card {
  padding: 20px;
}

.search-form .el-form-item {
  margin-right: 15px;
  margin-bottom: 15px;
}

.custom-table {
  font-size: 13px;
  border-radius: 8px;
  overflow: hidden; /* 确保圆角生效 */
}

.header-cell {
  background-color: #eef1f6 !important;
  color: #333 !important;
  font-weight: bold;
  padding: 10px 0 !important;
  border-right: 1px solid #ebeef5 !important;
}

.body-cell {
  padding: 8px 0 !important;
  border-right: 1px solid #ebeef5 !important;
}

/* 移除最后一列的右边框 */
.el-table th:last-child,
.el-table td:last-child {
  border-right: none !important;
}

.action-group {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}

/* Element Plus 按钮微调 */
.el-button {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
  min-width: 60px;
}

.el-pagination {
  justify-content: flex-end;
  margin-top: 20px;
}

/* flex布局工具类 */
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.mb-4 {
  margin-bottom: 1rem;
}
.text-xl {
  font-size: 1.25rem;
}
.font-bold {
  font-weight: 700;
}
.space-x-2 > *:not(:first-child) {
  margin-left: 0.5rem;
}
</style>
