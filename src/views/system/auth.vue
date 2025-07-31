<template>
  <div class="account-management-container">
    <h2>账号管理</h2>

    <div>
      isAdmin: {{ store.isAdmin ? '是管理员' : '不是管理员' }}，
      当前ID: {{ safeCurrentUserId }}
    </div>

    <el-card class="action-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchKeyword"
            placeholder="账号/昵称"
            clearable
            @keyup.enter="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
        <el-form-item>
          <!-- 新建账号 -->
          <el-button
            type="success"
            @click="openCreateDialog"
            v-if="store.currentUser?.role === 'admin' && store.currentUser?.permissions?.includes('system:auth')"
          >
            新建账号
          </el-button>

          <!-- 修改我的密码 -->
          <el-button type="info" @click="openChangeMyPasswordDialog">修改我的密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" v-if="store.userList && store.userList.length">
      <el-table :data="store.userList" v-loading="store.loading" border stripe class="account-table">
        <el-table-column prop="account" label="账号" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" effect="light">
              {{ row.role === 'admin' ? '管理员' : '只读账号' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_time" label="上次登录" min-width="160"></el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <!-- 编辑 -->
            <el-button
              type="primary"
              link
              @click="openEditDialog(row)"
              v-if="store.currentUser?.role === 'admin'"
            >
              编辑
            </el-button>

            <!-- 重置密码 -->
            <el-button
              type="warning"
              link
              @click="openResetPasswordDialog(row)"
              v-if="store.currentUser?.role === 'admin'"
            >
              重置密码
            </el-button>

            <!-- 删除 -->
            <el-button
              type="danger"
              link
              @click="handleDelete(row.id)"
              v-if="store.currentUser?.role === 'admin'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="store.setPageSize"
          @current-change="store.setPage"
          :current-page="store.pagination.current"
          :page-sizes="[10, 20, 50]"
          :page-size="store.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="store.pagination.total"
          background
        ></el-pagination>
      </div>
    </el-card>
    <el-empty v-else description="暂无数据" :image-size="200"></el-empty>

    <el-dialog
      v-model="accountFormDialogVisible"
      :title="isEditMode ? '编辑账号' : '新建账号'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="accountForm.account" :disabled="isEditMode" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditMode">
          <el-input type="password" v-model="accountForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="accountForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="角色类型" prop="role" v-if="store.isAdmin">
          <el-select v-model="accountForm.role" placeholder="请选择角色类型">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="只读账号" value="viewer"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEditMode && store.isAdmin">
          <el-select v-model="accountForm.status" placeholder="请选择状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="禁用" value="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限分配" prop="permissions">
          <el-tree
            ref="permissionTreeRef"
            :data="store.allPermissions"
            show-checkbox
            node-key="value"
            :default-checked-keys="accountForm.permissions"
            @check="onPermissionCheck"
            :props="{ label: 'label', children: 'children' }"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="accountFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAccountForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="changeMyPasswordDialogVisible"
      title="修改我的密码"
      width="400px"
      destroy-on-close
    >
      <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="old_password">
          <el-input type="password" v-model="changePasswordForm.old_password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input type="password" v-model="changePasswordForm.new_password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input type="password" v-model="changePasswordForm.confirm_password" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changeMyPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangeMyPasswordForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resetPasswordDialogVisible"
      :title="`重置账号 ${currentResetAccount?.account} 的密码`"
      width="400px"
      destroy-on-close
    >
      <el-form :model="resetPasswordForm" :rules="resetPasswordRules" ref="resetPasswordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="new_password">
          <el-input type="password" v-model="resetPasswordForm.new_password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input type="password" v-model="resetPasswordForm.confirm_password" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPasswordForm">保存</el-button>
        </span>
      </template>gan
    </el-dialog>

    <div>
      当前登录账号：{{ store.currentUser?.account }}，ID：{{ store.currentUser?.id }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox, ElForm, ElTree } from 'element-plus';
import { useUserStore } from '@/store/user.store';

const store = useUserStore();

// 搜索关键词
const searchKeyword = ref('');

// 账号表单弹窗相关
const accountFormDialogVisible = ref(false);
const isEditMode = ref(false); // true: 编辑模式, false: 新建模式
const accountForm = ref({
  id: null as number | null,
  account: '',
  password: '', // 新建时使用
  nickname: '',
  role: 'viewer' as UserRole,
  status: '正常' as UserStatus, // 编辑时使用
  permissions: [] as string[], // 新增：存储勾选的权限点
});
const accountFormRef = ref<InstanceType<typeof ElForm>>();
const permissionTreeRef = ref<InstanceType<typeof ElTree>>(); // 新增：el-tree 引用

const accountRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少需要 6 位', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择账号状态', trigger: 'change' }],
  // permissions 的校验可以根据需要添加，例如至少选择一个权限
};

// 修改我的密码弹窗相关
const changeMyPasswordDialogVisible = ref(false);
const changePasswordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
});
const changePasswordFormRef = ref<InstanceType<typeof ElForm>>();
const changePasswordRules = {
  old_password: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少需要 6 位', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== changePasswordForm.value.new_password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 重置其他账号密码弹窗相关
const resetPasswordDialogVisible = ref(false);
const currentResetAccount = ref<UserItem | null>(null); // 当前正在重置密码的账号信息
const resetPasswordForm = ref({
  new_password: '',
  confirm_password: '',
});
const resetPasswordFormRef = ref<InstanceType<typeof ElForm>>();
const resetPasswordRules = {
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少需要 6 位', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== resetPasswordForm.value.new_password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 安全访问 currentUserId
const safeCurrentUserId = computed(() => store.currentUserId);

// --- 权限树勾选事件 ---
const onPermissionCheck = (checkedNodes: any, checkedInfo: { checkedKeys: string[], halfCheckedKeys: string[] }) => {
  // checkedKeys 包含所有选中和半选中的节点的 key
  // 我们需要的是所有被勾选的叶子节点的 key
  const checkedLeafKeys = permissionTreeRef.value?.getCheckedKeys(true) || [];
  accountForm.value.permissions = checkedLeafKeys;
};

// --- 生命周期钩子 ---
onMounted(async () => {
  await store.getUserInfo(); // 这行很关键
  await store.fetchUserList();
  await store.fetchAllPermissions();
});

// --- 搜索/重置 ---
const handleSearch = () => {
  store.setFilterKeyword(searchKeyword.value);
};

const resetSearch = () => {
  searchKeyword.value = '';
  store.setFilterKeyword('');
};

// --- 新建/编辑账号弹窗操作 ---
const openCreateDialog = () => {
  isEditMode.value = false;
  accountForm.value = {
    id: null,
    account: '',
    password: '',
    nickname: '',
    role: 'viewer', // 默认新建只读账号
    status: '正常',
    permissions: [], // 新建时清空权限
  };
  accountFormDialogVisible.value = true;
  nextTick(() => {
    accountFormRef.value?.clearValidate();
    permissionTreeRef.value?.setCheckedKeys([], false); // 清空权限树选中
  });
};

const openEditDialog = (row: UserItem) => {
  isEditMode.value = true;
  accountForm.value = {
    id: row.id,
    account: row.account,
    password: '', // 编辑时不显示密码，也不需要传密码
    nickname: row.nickname,
    role: row.role,
    status: row.status,
    permissions: row.permissions || [], // 回显权限
  };
  accountFormDialogVisible.value = true;
  nextTick(() => {
    accountFormRef.value?.clearValidate();
    // 设置权限树的选中状态
    if (accountForm.value.permissions.length > 0) {
      permissionTreeRef.value?.setCheckedKeys(accountForm.value.permissions, false);
    } else {
      permissionTreeRef.value?.setCheckedKeys([], false);
    }
  });
};

const submitAccountForm = async () => {
  try {
    await accountFormRef.value?.validate();
    let success = false;
    if (isEditMode.value) {
      // 编辑模式，只传可编辑的字段和权限
      success = await store.editUser({
        id: accountForm.value.id!,
        nickname: accountForm.value.nickname,
        role: accountForm.value.role,
        status: accountForm.value.status,
        permissions: accountForm.value.permissions, // 传递权限
      });
    } else {
      // 新建模式，密码必填，并传递权限
      success = await store.createUser({
        account: accountForm.value.account,
        password: accountForm.value.password,
        nickname: accountForm.value.nickname,
        role: accountForm.value.role,
        permissions: accountForm.value.permissions, // 传递权限
      });
    }
    if (success) {
      accountFormDialogVisible.value = false;
    }
  } catch (error) {
    console.error('提交账号表单失败:', error);
  }
};

// --- 删除账号 ---
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除该账号吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await store.deleteUser(id);
  }).catch(() => {
    // 用户取消
  });
};

// --- 修改我的密码弹窗操作 ---
const openChangeMyPasswordDialog = () => {
  changePasswordForm.value = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };
  changeMyPasswordDialogVisible.value = true;
  nextTick(() => {
    changePasswordFormRef.value?.clearValidate();
  });
};

const submitChangeMyPasswordForm = async () => {
  try {
    await changePasswordFormRef.value?.validate();
    const success = await store.changePassword(
      changePasswordForm.value.old_password,
      changePasswordForm.value.new_password
    );
    if (success) {
      changeMyPasswordDialogVisible.value = false;
    }
  } catch (error) {
    console.error('修改我的密码失败:', error);
  }
};

// --- 重置其他账号密码弹窗操作 ---
const openResetPasswordDialog = (row: UserItem) => {
  currentResetAccount.value = row;
  resetPasswordForm.value = {
    new_password: '',
    confirm_password: '',
  };
  resetPasswordDialogVisible.value = true;
  nextTick(() => {
    resetPasswordFormRef.value?.clearValidate();
  });
};

const submitResetPasswordForm = async () => {
  try {
    await resetPasswordFormRef.value?.validate();
    if (currentResetAccount.value?.id) {
      const success = await store.resetPassword(
        currentResetAccount.value.id,
        resetPasswordForm.value.new_password
      );
      if (success) {
        resetPasswordDialogVisible.value = false;
      }
    } else {
      ElMessage.error('无法获取当前重置账号ID。');
    }
  } catch (error) {
    console.error('重置密码失败:', error);
  }
};

// --- 权限控制 ---
// 监听当前登录用户，如果发生变化，重新获取列表（例如登录/退出）
watch(() => store.currentUser, (newVal, oldVal) => {
  if ((!oldVal && newVal) || (oldVal && !newVal)) { // 登录状态变化
    store.fetchUserList();
  }
});

// 监听 accountForm.role，如果角色变为管理员，则清空权限勾选
watch(() => accountForm.value.role, (newRole) => {
  if (newRole === 'admin') {
    accountForm.value.permissions = [];
    nextTick(() => {
      permissionTreeRef.value?.setCheckedKeys([], false);
    });
  }
});

watch(() => store.allPermissions, (val) => {
  console.log('权限树数据变化', val);
}, { immediate: true });
</script>

<style scoped>
.account-management-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 50px);
}

h2 {
  color: #303133;
  margin-bottom: 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
}

.action-card, .table-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

/* 美化按钮 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
}
.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 美化表格 */
.account-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.account-table :deep(.el-table__header-wrapper th) {
  background-color: #f0f5ff;
  color: #1e3a8a;
  font-weight: 600;
  padding: 12px 0;
  font-size: 14px;
}

.account-table :deep(.el-table__row) {
  transition: all 0.2s;
}
.account-table :deep(.el-table__row:hover) {
  background-color: #f0f7ff !important;
}

/* 权限树样式 */
.permission-tree {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fdfdfd;
}
</style>