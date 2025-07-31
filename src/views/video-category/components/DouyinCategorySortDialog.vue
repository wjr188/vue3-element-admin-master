<template>
  <el-dialog v-model="visible" title="抖音分类排序管理" width="480px" @close="emit('close')">
    <el-form>
      <el-form-item label="主分类">
        <el-select v-model="sortParentId" placeholder="请选择主分类" style="width: 100%" @change="onSortParentChange">
          <el-option
            v-for="item in parentCategories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <div v-if="sortChildList.length">
        <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
          直接修改排序值以调整顺序。排序值越小越靠前。
        </el-alert>
        <el-form-item
          v-for="item in sortChildList"
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
      <div v-else style="text-align:center;color:#aaa;padding:24px 0">请选择主分类或该主分类下暂无子分类</div>
    </el-form>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onSaveSort">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  douyinCategoryParents as parentCategories, // 导入主分类
  douyinCategoryChildren as childCategories, // 导入子分类
  fetchCategoryList, // 导入刷新分类列表的函数
  saveCategorySort // 导入保存排序的函数
} from '@/store/modules/douyin-category.store'

// 定义组件的 props 和 emits
const props = defineProps<{
  modelValue: boolean // 用于控制弹窗显示隐藏
}>()
const emit = defineEmits(['update:modelValue', 'close']) // 定义 emits 事件

// 将 props.modelValue 映射到内部的 ref，方便 v-model 使用
const visible = ref(props.modelValue)
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    // 弹窗打开时重置状态
    sortParentId.value = null
    sortChildList.value = []
  }
})
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 排序管理弹窗内部的数据和逻辑
const sortParentId = ref<number | null>(null) // 选中的主分类ID
const sortChildList = ref<any[]>([]) // 选中的主分类下的子分类列表

// 当选择的主分类变化时，过滤出对应的子分类
function onSortParentChange(id: number) {
  if (id) {
    sortChildList.value = childCategories.value
      .filter((c: any) => c.parent_id === id)
      .map((c: any) => ({ ...c })) // 复制一份，避免直接修改 store 中的原始数据
      .sort((a, b) => (a.sort || 0) - (b.sort || 0)) // 确保按当前排序显示
  } else {
    sortChildList.value = []
  }
}

// 保存排序顺序
async function onSaveSort() {
  if (!sortChildList.value.length) {
    ElMessage.warning('没有子分类需要保存排序。')
    return
  }
  const payload = sortChildList.value.map(item => ({
    id: item.id,
    sort: item.sort || 0 // 确保 sort 是数字
  }))

  try {
    const res = await saveCategorySort(payload) // 调用 Store 中的保存排序函数
    if (res && res.code === 0) {
      ElMessage.success('分类排序保存成功！')
      // 成功后刷新主分类列表，确保数据同步
      await fetchCategoryList()
      emit('close') // 关闭弹窗
    } else {
      ElMessage.error(res?.msg || '分类排序保存失败！')
    }
  } catch (error) {
    ElMessage.error('请求保存分类排序失败，请检查网络或后端服务。')
    console.error('Save Sort Error:', error)
  }
}

// 确保在组件加载时，如果 Store 中的分类数据已经存在，可以初始化选中第一个主分类
// 但这里不强制，因为用户需要手动选择主分类来触发子分类列表
// 可以在父组件中控制是否默认打开并选择一个分类
</script>

<style scoped>
/* 可以在这里添加此弹窗组件特有的样式 */
</style>
