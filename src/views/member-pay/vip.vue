<template>
  <div class="vip-card-management">
    <el-card shadow="never" class="mb-4">
      <el-row :gutter="20" class="align-items-center">
        <el-col :span="12">
          <h3>VIP卡片管理</h3>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="primary" :icon="Plus" @click="openCardModal('add')">
            新建VIP卡
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="vipCardStore.loading"
        :data="vipCardStore.vipCards"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="tag" label="顶部标签/类型名" min-width="120" align="center" />
        <el-table-column prop="name" label="名称" min-width="120" align="center" />
        <el-table-column label="原价" width="100" align="center">
          <template #default="scope">
            <span style="text-decoration: line-through;">
              {{ (scope.row.oldPrice / 100).toFixed(2) }} 元
            </span>
          </template>
        </el-table-column>
        <el-table-column label="现价" width="100" align="center">
          <template #default="scope">
            <span style="color: #F56C6C; font-weight: bold;">
              {{ (scope.row.price / 100).toFixed(2) }} 元
            </span>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="80" align="center">
          <template #default="scope">
            <span>
              {{ scope.row.duration === -1 ? '永久' : `${scope.row.duration} 天` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="220" align="center" />
        <el-table-column label="权益" min-width="100" align="center">
          <template #default="scope">
            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span
                v-for="key in scope.row.benefitKeys"
                :key="key"
                style="margin-right: 6px; color: #606266;"
              >
                {{ allBenefits[key]?.label || '未知权益' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'danger'">
              {{ scope.row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
  prop="can_view_vip_video"
  label="VIP视频权限"
  width="120"
  align="center"
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
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.can_watch_coin == 1 ? 'success' : 'info'">
              {{ row.can_watch_coin == 1 ? '能免费观看' : '需花金币' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openCardModal('edit', scope.row)">
              编辑
            </el-button>
            <el-button
              link
              :type="scope.row.status === 'ENABLED' ? 'danger' : 'success'"
              size="small"
              @click="toggleCardStatus(scope.row)"
            >
              {{ scope.row.status === 'ENABLED' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="deleteCard(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="vipCardStore.total"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="vipCardStore.currentPage"
          v-model:page-size="vipCardStore.pageSize"
          @size-change="vipCardStore.setPageSize"
          @current-change="vipCardStore.setCurrentPage"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="cardModalVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @closed="handleModalClose"
    >
      <el-form
        ref="cardFormRef"
        :model="cardForm"
        :rules="rules"
        label-width="100px"
        v-loading="modalLoading"
      >
        <el-form-item label="顶部标签" prop="tag">
          <el-input v-model="cardForm.tag" placeholder="如：全网月通卡会员" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="cardForm.name" placeholder="请输入VIP卡片名称" />
        </el-form-item>
        <el-form-item label="能否免费观看金币视频" label-width="180px">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 12px; color: #909399;">需花金币</span>
            <el-switch
              v-model="cardForm.can_watch_coin"
              :active-value="1"
              :inactive-value="0"
              style="margin: 0 8px;"
            />
            <span style="margin-left: 12px; color: #67C23A;">能免费观看</span>
          </div>
        </el-form-item>
        <el-form-item label="能否观看VIP视频" prop="can_view_vip_video">
          <el-switch
            v-model="cardForm.can_view_vip_video"
            :active-value="1"
            :inactive-value="0"
            active-text="能看"
            inactive-text="不能看"
          />
        </el-form-item>
        <el-form-item label="原价（元）" prop="oldPrice">
          <el-input-number
            v-model="cardForm.oldPrice"
            :min="0"
            :precision="2"
            :step="1.0"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="现价（元）" prop="price">
          <el-input-number
            v-model="cardForm.price"
            :min="0"
            :precision="2"
            :step="1.0"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="时长" prop="duration_value">
          <el-input-number
            v-model="cardForm.duration_value"
            :min="0"
            :max="99999"
            :step="1"
            :disabled="cardForm.duration_type === 'PERMANENT'"
            controls-position="right"
            style="width: 150px; margin-right: 10px;"
          />
          <el-select
            v-model="cardForm.duration_type"
            placeholder="选择时长单位"
            style="width: 120px;"
          >
            <el-option label="天" value="DAYS" />
            <el-option label="永久" value="PERMANENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            type="textarea"
            v-model="cardForm.desc"
            :rows="3"
            placeholder="请输入VIP卡片描述"
          />
        </el-form-item>
        <el-form-item label="权益" prop="benefitKeys">
          <el-checkbox-group v-model="cardForm.benefitKeys">
            <el-checkbox
              v-for="(item, key) in allBenefits"
              :key="key"
              :label="key"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
       <!-- 👇👇👇 加在这里（表单项后、footer前）👇👇👇 -->
    <el-alert
      v-if="cardForm.can_view_vip_video || cardForm.can_watch_coin"
      type="info"
      show-icon
      :closable="false"
      style="margin: 10px 0 0"
    >
      <template #title>
        权益预览：
        <span v-if="cardForm.can_view_vip_video" style="color: #67C23A;">可观看VIP视频</span>
        <span v-if="cardForm.can_watch_coin" style="color: #67C23A; margin-left: 12px;">金币视频可免费观看</span>
        <span v-if="!cardForm.can_view_vip_video && !cardForm.can_watch_coin" style="color: #F56C6C;">无额外视频权限</span>
      </template>
    </el-alert>
    <!-- 👆👆👆 -->
  </el-form>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="cardModalVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ cardModalMode === 'add' ? '新增' : '保存' }}
      </el-button>
    </span>
  </template>
</el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { allBenefits } from '@/constants/vipCardBenefits';
import { useVipCardStore } from '@/store/modules/vipCardService.store';
import { vipCardService, VipCard } from '@/api/vipCardService';

const vipCardStore = useVipCardStore();

const cardModalVisible = ref(false);
const cardModalMode = ref<'add' | 'edit'>('add');
const cardFormRef = ref<FormInstance>();
const modalLoading = ref(false);

interface CardForm extends Omit<VipCard, 'oldPrice' | 'price' | 'duration' | 'status'> {
  oldPrice: number;
  price: number;
  duration_value: number;
  duration_type: 'DAYS' | 'PERMANENT';
  benefitKeys: string[];
}

const cardForm = reactive<CardForm>({
  id: undefined,
  tag: '',
  name: '',
  oldPrice: 0,
  price: 0,
  duration_value: 0,
  duration_type: 'DAYS',
  desc: '',
  can_view_vip_video: 0,
  can_watch_coin: 0,
  benefitKeys: [],
});

watch(() => cardForm.duration_type, (newType) => {
  if (newType === 'PERMANENT') cardForm.duration_value = 0;
});

const dialogTitle = computed(() => cardModalMode.value === 'add' ? '新建VIP卡片' : '编辑VIP卡片');

const rules = reactive<FormRules<CardForm>>({
  tag: [{ required: true, message: '请输入顶部标签/类型名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入VIP卡片名称', trigger: 'blur' }],
});

const openCardModal = (mode: 'add' | 'edit', card?: VipCard) => {
  cardModalMode.value = mode;
  if (mode === 'add') {
    Object.assign(cardForm, {
      id: undefined,
      tag: '',
      name: '',
      oldPrice: 0,
      price: 0,
      duration_value: 0,
      duration_type: 'DAYS',
      desc: '',
      can_view_vip_video: 0,
      can_watch_coin: 0,
      benefitKeys: [],
    });
  } else if (mode === 'edit' && card) {
    const latest = vipCardStore.vipCards.find(v => v.id === card.id);
    if (latest) {
      Object.assign(cardForm, {
        id: latest.id,
        tag: latest.tag,
        name: latest.name,
        oldPrice: latest.oldPrice / 100,
        price: latest.price / 100,
        duration_value: latest.duration === -1 ? 0 : latest.duration,
        duration_type: latest.duration === -1 ? 'PERMANENT' : 'DAYS',
        desc: latest.desc,
        can_view_vip_video: latest.can_view_vip_video,
        can_watch_coin: latest.can_watch_coin,
        benefitKeys: [...(latest.benefitKeys || [])],
      });
    }
  }
  cardModalVisible.value = true;
};

const handleSubmit = async () => {
  if (!cardFormRef.value) return;
  await cardFormRef.value.validate(async (valid) => {
    if (valid) {
      modalLoading.value = true;
      try {
        const dataToSubmit = {
          tag: cardForm.tag,
          name: cardForm.name,
          oldPrice: Math.round(cardForm.oldPrice * 100),
          price: Math.round(cardForm.price * 100),
          duration: cardForm.duration_type === 'PERMANENT' ? -1 : cardForm.duration_value,
          desc: cardForm.desc,
          can_watch_coin: cardForm.can_watch_coin,
          can_view_vip_video: cardForm.can_view_vip_video,
          benefitKeys: cardForm.benefitKeys,
        };
        if (cardModalMode.value === 'add') {
          await vipCardService.addVipCard(dataToSubmit);
        } else if (cardForm.id !== undefined) {
          await vipCardService.updateVipCard(cardForm.id, dataToSubmit);
        }
        cardModalVisible.value = false;
        vipCardStore.fetchVipCards();
      } finally {
        modalLoading.value = false;
      }
    }
  });
};

const toggleCardStatus = async (card: VipCard) => {
  const newStatus = card.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
  await ElMessageBox.confirm(`确定要${newStatus === 'ENABLED' ? '启用' : '禁用'}该卡？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  await vipCardService.toggleVipCardStatus(card.id!, newStatus);
  vipCardStore.fetchVipCards();
};

const deleteCard = async (id?: number) => {
  if (!id) return;
  await ElMessageBox.confirm('确定删除该VIP卡？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  await vipCardService.deleteVipCard(id);
  vipCardStore.fetchVipCards();
};

const handleModalClose = () => {
  cardFormRef.value?.resetFields();
};

onMounted(() => {
  vipCardStore.fetchVipCards();
});
</script>

<style scoped>
.vip-card-management {
  padding: 20px;
}
.mb-4 {
  margin-bottom: 20px;
}
.text-right {
  text-align: right;
}
.align-items-center {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
