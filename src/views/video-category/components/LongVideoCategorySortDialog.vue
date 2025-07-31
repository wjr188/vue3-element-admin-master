<!-- 文件路径: src/views/longvideo-category/components/SortManagementDialog.vue -->
<template>
  <el-dialog v-model="internalVisible" title="排序管理" width="480px" @close="handleClose">
    <el-form :model="sortForm" label-width="80px">
      <el-form-item label="主分类">
        <el-select
          v-model="sortForm.parentId"
          placeholder="请选择主分类"
          style="width: 100%"
          @change="onParentChange"
          clearable
        >
          <el-option
            v-for="item in parentCategoriesOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <div v-if="sortForm.childList.length">
        <el-form-item
          v-for="item in sortForm.childList"
          :key="item.id"
          :label="item.name"
          style="margin-bottom: 6px"
        >
          <el-input-number
            v-model="item.sort"
            :min="1"
            style="width: 100px"
          />
        </el-form-item>
      </div>
      <div v-else style="text-align:center;color:#aaa;padding:24px 0">请选择主分类</div>
    </el-form>
    <template #footer>
      <el-button @click="internalVisible = false">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 定义组件的 Props
interface Props {
  modelValue: boolean; // 控制弹窗可见性
  parentCategories: { id: number; name: string }[]; // 所有主分类选项
  childCategories: { id: number; name: string; parent_id: number; sort: number }[]; // 所有子分类选项
}

// 定义组件的 Emits (事件)
interface Emits {
  (event: 'update:modelValue', value: boolean): void; // 更新可见性
  (event: 'save', data: { id: number; sort: number }[]): void; // 保存排序时触发
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const internalVisible = ref(props.modelValue); // 内部控制弹窗可见性
watch(() => props.modelValue, (val) => {
  internalVisible.value = val;
});
watch(internalVisible, (val) => {
  emits('update:modelValue', val);
});

// 排序表单数据
const sortForm = reactive({
  parentId: null as number | null,
  childList: [] as { id: number; name: string; parent_id: number; sort: number }[]
});

// 监听弹窗打开，清空并重置数据
watch(internalVisible, (val) => {
  if (val) {
    sortForm.parentId = null;
    sortForm.childList = [];
  }
});

// 主分类选项
const parentCategoriesOptions = computed(() => props.parentCategories);

// 当主分类选择改变时
const onParentChange = (id: number) => {
  sortForm.childList = props.childCategories
    .filter(c => c.parent_id === id)
    .map(c => ({ ...c })); // 创建副本以允许直接编辑 sort 值
};

// 保存排序
const onSave = () => {
  if (!sortForm.childList.length) {
    ElMessage.warning('没有可保存排序的子分类');
    return;
  }
  const listToSave = sortForm.childList.map(item => ({
    id: item.id,
    sort: item.sort || 0 // 确保 sort 是数字，默认为 0
  }));
  emits('save', listToSave); // 触发 save 事件
  internalVisible.value = false; // 关闭弹窗
};

// 关闭弹窗时重置数据
const handleClose = () => {
  sortForm.parentId = null;
  sortForm.childList = [];
};
</script>

<style scoped>
/* 这里可以放置组件特有的样式 */
/* 一般来说，Element Plus 弹窗和表单样式会继承全局，除非有特殊定制 */
</style>
