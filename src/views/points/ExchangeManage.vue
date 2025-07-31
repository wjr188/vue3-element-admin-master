<template>
  <div class="points-exchange-manage">
    <el-card shadow="never">
      <div class="header">
        <el-button type="primary" @click="openAddModal">新增兑换项目</el-button>
      </div>
      <el-table :data="list" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="兑换名称" />
        <el-table-column prop="cost" label="所需积分" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag>{{ row.type === 'vip' ? 'VIP' : '金币' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="兑换内容">
          <template #default="{ row }">
            <span v-if="row.type === 'vip'">
              {{
                vipCardMap[row.value]
                  ? vipCardMap[row.value].name + '（' + (vipCardMap[row.value].duration === -1 ? '永久' : vipCardMap[row.value].duration + '天') + '）'
                  : 'ID:' + row.value
              }}
            </span>
            <span v-else>{{ row.value + '金币' }}</span>
          </template>
        </el-table-column>
        <!-- 新增: 图标列 -->
        <el-table-column label="图标">
          <template #default="{ row }">
            <i :class="`van-icon van-icon-${row.icon}`"></i>
            <span style="margin-left:6px;">{{ row.icon || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.status === 1">启用</el-tag>
            <el-tag type="info" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openEditModal(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="form.id ? '编辑兑换项目' : '新增兑换项目'"
      v-model="dialogVisible"
      width="400px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="form.cost" :min="1" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择">
            <el-option label="VIP" value="vip" />
            <el-option label="金币" value="coin" />
          </el-select>
        </el-form-item>
        <!-- 动态输入内容 -->
        <el-form-item v-if="form.type === 'coin'" label="金币数量">
          <el-input-number v-model="form.value" :min="1" />
        </el-form-item>
        <el-form-item v-if="form.type === 'vip'" label="选择会员卡">
          <el-select v-model="form.value" placeholder="请选择会员卡">
            <el-option
              v-for="card in vipCardList"
              :key="card.id"
              :label="card.name + '（' + (card.duration === -1 ? '永久' : card.duration + '天') + '）'"
              :value="card.id"
            />
          </el-select>
        </el-form-item>
        <!-- 新增: 图标配置 -->
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="如：diamond-o" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="选填，如：会员卡兑换" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getExchangeList,
  createExchangeItem,
  updateExchangeItem,
  deleteExchangeItem,
} from "@/api/adminPointsExchange";
import { vipCardService, VipCard } from "@/api/vipCardService";

interface ExchangeItem {
  id?: number;
  name: string;
  cost: number;
  type: string; // 'vip' | 'coin'
  value: string | number;
  description?: string;
  sort?: number;
  status?: number;
  create_time?: string;
  icon?: string; // 新增字段
}

const list = ref<ExchangeItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const form = ref<ExchangeItem>({
  name: "",
  cost: 0,
  type: "vip",
  value: "",
  description: "",
  icon: "", // 新增
});

const vipCardList = ref<VipCard[]>([]);
const vipCardMap = ref<Record<number, VipCard>>({});

async function loadData() {
  loading.value = true;
  try {
    const res = await getExchangeList();
    if (res.code === 0 && Array.isArray(res.data)) {
      list.value = res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      list.value = res.data.data;
    } else {
      list.value = [];
      ElMessage.error("加载数据失败：返回格式不正确");
    }
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function loadVipCards() {
  try {
    const res = await vipCardService.getVipCards({ page: 1, pageSize: 100 });
    vipCardList.value = res.list || [];
    vipCardMap.value = Object.fromEntries(vipCardList.value.map(c => [c.id, c]));
  } catch {
    ElMessage.error("加载会员卡失败");
  }
}

function openAddModal() {
  form.value = {
    name: "",
    cost: 0,
    type: "vip",
    value: "",
    description: "",
    icon: "",
  };
  dialogVisible.value = true;
}

function openEditModal(item: ExchangeItem) {
  form.value = { ...item };
  dialogVisible.value = true;
}

async function save() {
  const isEdit = !!form.value.id;
  const api = isEdit
    ? (data: ExchangeItem) => updateExchangeItem(form.value!.id!, data)
    : createExchangeItem;

  const submitData = { ...form.value };
  if (!isEdit) delete submitData.id;

  const res = await api(submitData);
  const result = res.data ?? res;

  if (result.code === 0) {
    ElMessage.success(result.msg || "操作成功");
    dialogVisible.value = false;
    loadData();
  } else {
    ElMessage.error(result.msg || "操作失败");
  }
}

function handleDelete(item: ExchangeItem) {
  ElMessageBox.confirm(`确定删除【${item.name}】吗？`, "提示", {
    type: "warning",
  }).then(async () => {
    const res = await deleteExchangeItem(item.id!);
    const result = res.data ?? res;

    if (result.code === 0) {
      ElMessage.success(result.msg || "删除成功");
      loadData();
    } else {
      ElMessage.error(result.msg || "删除失败");
    }
  });
}

onMounted(() => {
  loadData();
  loadVipCards();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
