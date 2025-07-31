<template>
  <div class="influencer-manage">
    <div class="top-bar">
      <div class="title">博主管理</div>
      <div class="refresh-status">
        <span v-if="influencerStore.loading">列表加载中...</span>
        <span v-else>列表获取成功</span>
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="influencerStore.searchKeyword"
            placeholder="昵称/简介"
            clearable
            @keyup.enter="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAddGroup">新增分组</el-button>
          <el-button @click="fetchData">刷新页面</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="group-tabs-and-content">
      <el-tabs v-model="influencerStore.currentGroupId" @tab-change="handleTabChange" class="group-tabs">
        <el-tab-pane label="全部" name=""></el-tab-pane>
        <el-tab-pane
          v-for="group in influencerStore.groupList"
          :key="group.id"
          :label="group.name"
          :name="String(group.id)"
        >
          <template #label>
            <span class="custom-tab-label">
              {{ group.name }}
              <el-dropdown trigger="click" @command="handleGroupCommand($event, group)" placement="bottom-start">
                <span class="el-dropdown-link">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div v-loading="influencerStore.loading" class="influencer-list-container">
        <el-row v-if="influencerStore.influencerList.length > 0" :gutter="20" class="influencer-grid">
          <el-col
            v-for="influencer in influencerStore.influencerList"
            :key="influencer.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <el-card class="influencer-card">
              <div class="card-header">
                <el-avatar :src="influencer.avatar" :size="60" class="avatar"></el-avatar>
                <div class="info">
                  <div class="nickname">{{ influencer.nickname }}</div>
                  <div class="group-name">
                    <el-tag size="small">{{ influencer.group_name }}</el-tag>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="fans-count">
                  粉丝：<span class="count">{{ formatFansCount(influencer.fans_count) }}</span>
                </div>
                <div class="description">{{ influencer.desc }}</div>
              </div>
              <div class="card-footer">
                <el-button type="text" size="small">查看详情</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-else description="暂无数据"></el-empty>
      </div>
    </div>

    <el-dialog
      v-model="groupDialogVisible"
      :title="groupDialogTitle"
      width="30%"
      destroy-on-close
    >
      <el-form :model="currentGroup" ref="groupFormRef" :rules="groupFormRules" label-width="80px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="currentGroup.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitGroupForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElInput, ElButton, ElTabs, ElTabPane, ElRow, ElCol, ElCard, ElAvatar, ElTag, ElEmpty, ElForm, ElFormItem, ElDialog, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue'; // 引入图标
import { useInfluencerGroupStore } from '@/store/influencerGroup.store'; // 引入您的 Pinia Store

const influencerStore = useInfluencerGroupStore();

// 搜索和 Tab 切换相关
const handleSearch = () => {
  influencerStore.fetchInfluencerList();
};

const resetSearch = () => {
  influencerStore.setSearchKeyword('');
  handleSearch();
};

const handleTabChange = (name: string) => {
  // Pinia store 中已经包含了 currentGroupId 的更新逻辑，直接触发 fetchList
  influencerStore.fetchInfluencerList();
};

// 格式化粉丝数的函数 (不再需要过滤器，直接作为方法使用)
const formatFansCount = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num;
};

// 分组管理弹窗相关
const groupDialogVisible = ref(false);
const groupDialogTitle = ref('');
const currentGroup = ref({ id: null, name: '' });
const groupFormRef = ref(null);
const groupFormRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
};

const handleAddGroup = () => {
  groupDialogTitle.value = '新增分组';
  currentGroup.value = { id: null, name: '' };
  groupDialogVisible.value = true;
  nextTick(() => {
    if (groupFormRef.value) {
      (groupFormRef.value as any).clearValidate();
    }
  });
};

const handleGroupCommand = (command: string, group: { id: number; name: string }) => {
  if (command === 'edit') {
    groupDialogTitle.value = '编辑分组';
    currentGroup.value = { ...group };
    groupDialogVisible.value = true;
    nextTick(() => {
      if (groupFormRef.value) {
        (groupFormRef.value as any).clearValidate();
      }
    });
  } else if (command === 'delete') {
    handleDeleteGroup(group.id);
  }
};

const submitGroupForm = () => {
  (groupFormRef.value as any).validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (currentGroup.value.id) {
          // 编辑分组
          await influencerStore.updateGroup(currentGroup.value.id, { name: currentGroup.value.name });
          ElMessage.success('分组更新成功！');
        } else {
          // 新增分组
          await influencerStore.addGroup({ name: currentGroup.value.name });
          ElMessage.success('分组新增成功！');
        }
        groupDialogVisible.value = false;
        fetchData(); // 刷新分组和博主列表
      } catch (error: any) {
        ElMessage.error('操作失败：' + (error.response?.data?.msg || error.message || '未知错误'));
      }
    } else {
      ElMessage.error('请检查表单填写！');
      return false;
    }
  });
};

const handleDeleteGroup = (id: number) => {
  ElMessageBox.confirm('确定永久删除该分组吗？此操作不可逆！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    try {
      await influencerStore.deleteGroup(id);
      ElMessage.success('分组删除成功！');
      fetchData(); // 刷新分组和博主列表
    } catch (error: any) {
      ElMessage.error('删除失败：' + (error.response?.data?.msg || error.message || '未知错误'));
    }
  })
  .catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 初始数据加载
const fetchData = async () => {
  await influencerStore.fetchGroupList();
  await influencerStore.fetchInfluencerList();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.influencer-manage {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.top-bar .title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.top-bar .refresh-status {
  font-size: 14px;
  color: #67c23a; /* 成功绿色 */
}

.search-filter-area {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-form .el-form-item {
  margin-bottom: 0 !important;
  margin-right: 15px;
}

.group-tabs-and-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 20px 20px; /* 调整内边距 */
}

.group-tabs {
  margin-bottom: 20px;
}

.group-tabs .el-tabs__header {
  margin-bottom: 0;
}

.group-tabs .el-tabs__item {
  padding: 0 20px; /* 调整 tab 间距 */
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}

.group-tabs .el-tabs__nav-wrap::after {
  height: 0px; /* 移除底部的灰色线条 */
}

.custom-tab-label {
  display: flex;
  align-items: center;
}

.custom-tab-label .el-dropdown-link {
  margin-left: 5px;
  cursor: pointer;
  color: #909399;
}

.influencer-list-container {
  min-height: 300px; /* 确保加载时有高度 */
}

.influencer-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -10px; /* 抵消el-col的padding */
}

.el-col {
  padding: 10px !important; /* 调整卡片间距 */
}

.influencer-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.influencer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.card-header .avatar {
  flex-shrink: 0;
  margin-right: 15px;
  border: 2px solid #409eff;
}

.card-header .info {
  flex-grow: 1;
}

.card-header .nickname {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header .group-name .el-tag {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #d9ecff;
}

.card-body {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-body .fans-count {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.card-body .fans-count .count {
  font-weight: bold;
  color: #606266;
}

.card-body .description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 限制简介显示3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  text-align: right;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .influencer-manage {
    padding: 10px;
  }
  .el-col {
    padding: 5px !important;
  }
  .influencer-card {
    margin-bottom: 10px;
  }
  .group-tabs .el-tabs__item {
    padding: 0 10px;
    font-size: 14px;
  }
}
</style>