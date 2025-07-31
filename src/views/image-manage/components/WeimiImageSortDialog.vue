<template>
  <div class="weimi-image-sort-dialog">
    <el-form :inline="true">
      <el-form-item label="选择博主">
        <el-select v-model="selectedBloggerId" placeholder="请选择一个博主" @change="onBloggerChange">
          <el-option
            v-for="blogger in weimiParentCategories"
            :key="blogger.id"
            :label="blogger.name"
            :value="blogger.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <div v-if="selectedBloggerId && bloggerImages.length > 0">
      <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
        拖拽图片或直接修改排序值以调整顺序。排序值越小越靠前。
      </el-alert>

      <!-- 拖拽排序表格 (这里为了简化，暂时使用普通表格和手动排序输入框) -->
      <!-- 如果需要拖拽功能，你需要引入第三方库如 vue-draggable-next 并在这里实现 -->
      <el-table :data="bloggerImages" border stripe row-key="id" v-loading="sortLoading">
        <el-table-column prop="image_url" label="图片" width="100">
          <template #default="scope">
            <el-image style="width: 80px; height: 80px" :src="scope.row.image_url" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="sort" label="排序值" width="120">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" @change="markAsChanged(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="当前索引" width="100">
          <template #default="scope">
            {{ bloggerImages.indexOf(scope.row) + 1 }}
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px; text-align: right;">
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="saveSortOrder" :loading="sortLoading">保存排序</el-button>
      </div>
    </div>
    <el-empty v-else-if="selectedBloggerId" description="该博主暂无图片" />
    <el-empty v-else description="请先选择博主" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  weimiParentCategories,
  fetchWeimiCategories // 确保分类数据已加载
} from '@/store/modules/weimi-categories.store'
import {
  fetchWeimiImages,      // 用于获取特定博主下的图片
  updateWeimiImageSort   // 用于提交排序更改
} from '@/store/modules/weimi-images.store'

const emit = defineEmits(['close'])

const selectedBloggerId = ref('') // 当前选中的博主ID
const bloggerImages = ref<any[]>([]) // 当前博主下的图片列表
const sortLoading = ref(false) // 排序加载状态

// 监听博主分类数据，确保已加载
watch(weimiParentCategories, (newVal) => {
  if (newVal.length > 0 && !selectedBloggerId.value) {
    // 默认选中第一个博主
    selectedBloggerId.value = newVal[0].id
    onBloggerChange(selectedBloggerId.value)
  }
}, { immediate: true }); // immediate: true 确保组件挂载时立即运行一次

onMounted(() => {
  // 确保分类数据已加载，以便选择博主
  if (weimiParentCategories.value.length === 0) {
    fetchWeimiCategories();
  }
});

// 当选择的博主变化时，加载该博主下的图片
const onBloggerChange = async (bloggerId: string | number) => {
  if (!bloggerId) {
    bloggerImages.value = []
    return
  }
  sortLoading.value = true
  // 调用 Store 中的 fetchWeimiImages，并传入 categoryId 和排序参数
  // pageSize 设置一个非常大的值，以确保获取该博主下的所有图片
  const res = await fetchWeimiImages({ categoryId: bloggerId, orderBy: 'sort', orderDirection: 'asc', pageSize: 99999 });
  
  // fetchWeimiImages 返回的是 Promise<any>，需要检查 res.data
  if (res && res.code === 0 && res.data && res.data.list) {
    // 确保返回的图片按照 sort 值进行排序（尽管后端已经排了，前端也再排一次确保）
    bloggerImages.value = res.data.list.sort((a: any, b: any) => a.sort - b.sort);
  } else {
    bloggerImages.value = []
    ElMessage.error('加载博主图片失败：' + (res ? res.msg : '未知错误'))
  }
  sortLoading.value = false
}

// 标记图片排序值被手动修改 (如果需要记录哪些图片被修改，用于优化保存请求)
const markAsChanged = (image: any) => {
  // 实际项目中，如果你只提交被修改的图片，这里可以维护一个 Set 或 Map 来记录
  // 当前我们简化为提交所有显示的图片
  console.log('图片ID:', image.id, '排序值被修改为:', image.sort);
}

// 保存排序顺序
const saveSortOrder = async () => {
  if (!selectedBloggerId.value) {
    ElMessage.warning('请先选择博主才能保存排序。');
    return;
  }
  if (bloggerImages.value.length === 0) {
    ElMessage.warning('没有图片可供排序。');
    return;
  }

  // 整理要提交的数据：只包含 id 和当前的 sort 值
  const updateList = bloggerImages.value.map(img => ({
    id: img.id,
    sort: img.sort // 使用表格中当前显示的 sort 值
  }));

  sortLoading.value = true
  // 调用 Store 中的更新排序接口
  const res = await updateWeimiImageSort(updateList)
  if (res && res.code === 0) {
    ElMessage.success('图片排序保存成功！')
    // 保存成功后，重新加载当前博主图片，确保显示最新顺序
    onBloggerChange(selectedBloggerId.value)
    emit('close') // 保存成功后关闭弹窗
  } else {
    ElMessage.error('图片排序保存失败！' + (res ? res.msg : '未知错误'))
  }
  sortLoading.value = false
}
</script>

<style scoped>
.weimi-image-sort-dialog {
  padding: 20px;
}
/* 可根据需要添加更多样式 */
</style>