<template>
  <el-dialog v-model="visible" title="动漫分类排序管理" width="480px" @close="handleClose" append-to-body>
    <el-form>
      <el-form-item label="选择主分类">
        <el-select v-model="selectedParentId" placeholder="请选择主分类" style="width: 100%" @change="onParentSelect">
          <el-option
            v-for="item in parentCategories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <template v-if="selectedParentId">
        <div v-if="childCategoriesForSort.length">
          <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
            直接修改排序值以调整顺序。排序值越小越靠前。
          </el-alert>
          <el-form-item
            v-for="item in childCategoriesForSort"
            :key="item.id"
            :label="item.name"
            style="margin-bottom: 6px"
          >
            <el-input-number
              v-model="item.sort"
              :min="1"
              controls-position="right"
              style="width: 100px"
            />
          </el-form-item>
        </div>
        <div v-else style="text-align:center;color:#aaa;padding:24px 0">该主分类下暂无子分类</div>
      </template>
      <div v-else style="text-align:center;color:#aaa;padding:24px 0">请先选择主分类</div>

    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义组件的 props
const props = defineProps<{
  modelValue: boolean; // 用于控制弹窗显示隐藏 (v-model)
  parentCategories: Array<{ id: number; name: string }>; // 父分类列表
  childCategories: Array<{ id: number; name: string; parent_id: number; sort: number }>; // 子分类列表
}>();

// 定义组件的 emits，'save' 事件将排序后的数据传递给父组件
const emit = defineEmits(['update:modelValue', 'save']);

// 内部状态，用于控制弹窗显示隐藏
const visible = ref(props.modelValue);
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    // 弹窗打开时重置内部状态
    selectedParentId.value = null; // 确保每次打开都重置选择
    childCategoriesForSort.value = []; // 清空之前的排序数据
  }
});
watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

// 内部用于排序选择的主分类ID
const selectedParentId = ref<number | null>(null);
// 内部用于显示和编辑的子分类列表
const childCategoriesForSort = ref<Array<{ id: number; name: string; parent_id: number; sort: number }>>([]);

// 当选择的主分类变化时，更新子分类列表
function onParentSelect(parentId: number | null) {
  if (parentId !== null) {
    // 过滤出当前主分类下的子分类，并进行深拷贝，以便在组件内部修改排序值而不影响原始数据
    childCategoriesForSort.value = props.childCategories
      .filter(c => c.parent_id === parentId)
      .map(c => ({ ...c })) // 复制一份，避免直接修改 props
      .sort((a, b) => (a.sort || 0) - (b.sort || 0)); // 默认按当前排序值排序
  } else {
    childCategoriesForSort.value = [];
  }
}

// 保存排序，将数据发射给父组件处理
function onSave() {
  if (!selectedParentId.value) {
    ElMessage.warning('请选择一个主分类进行排序。');
    return;
  }
  if (!childCategoriesForSort.value.length) {
    ElMessage.warning('当前主分类下没有子分类可以保存排序。');
    return;
  }

  // 提取需要保存的 id 和 sort
  const payload = childCategoriesForSort.value.map(item => ({
    id: item.id,
    sort: item.sort || 0 // 确保 sort 是数字，有默认值
  }));

  // 发射 save 事件，父组件会负责调用 Store 的更新函数
  emit('save', payload);
  handleClose(); // 保存后关闭弹窗
}

// 处理弹窗关闭
function handleClose() {
  visible.value = false;
  // 重置内部状态
  selectedParentId.value = null;
  childCategoriesForSort.value = [];
}
</script>

<style scoped>
/* 此处可以添加此弹窗组件特有的样式，保持简洁 */
</style>
