import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

export interface DouyinCategory {
  id: number
  name: string
  parent_id: number
  sort: number
  status: number
  tags?: string[]
  videoCount?: number
  create_time?: string
  update_time?: string
  [key: string]: any // 允许其他任意属性，以支持 type 字段
}

export const douyinCategoryParents = ref<DouyinCategory[]>([])
export const douyinCategoryChildren = ref<DouyinCategory[]>([])
export const douyinCategories = ref<DouyinCategory[]>([])

/**
 * 获取分类列表
 */
export async function fetchCategoryList() {
  try {
    const res = await service.get('douyin/categories/list')
    console.log('fetchCategoryList 返回:', res)
    douyinCategoryParents.value = Array.isArray(res.parents) ? res.parents : []
    douyinCategoryChildren.value = Array.isArray(res.children) ? res.children : []
    douyinCategories.value = [
      // 注意：这里手动添加 type 字段，确保前端树形结构可以正确识别
      ...douyinCategoryParents.value.map(parent => ({ ...parent, type: 'parent' })),
      ...douyinCategoryChildren.value.map(child => ({ ...child, type: 'child' }))
    ]
    return res
  } catch (error) {
    resetCategoryData()
    ElMessage.error('请求抖音分类列表失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 内部函数：新增主分类 (供兼容性 addCategory 调用，或直接调用)
 */
async function addMainCategory(data: { name: string; [key: string]: any }) {
  try {
    const res = await service.post('douyin/categories/add-parent', data)
    console.log('addMainCategory 返回:', res)
    await fetchCategoryList()
    ElMessage.success('新增主分类成功')
    return res
  } catch (error) {
    console.error('addMainCategory error:', error)
    ElMessage.error('请求新增主分类失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 内部函数：新增子分类 (供兼容性 addCategory 调用，或直接调用)
 */
async function _addChildCategory(data: Omit<DouyinCategory, 'id' | 'videoCount' | 'create_time' | 'update_time'>) {
  try {
    const res = await service.post('douyin/categories/add-child', data)
    console.log('addChildCategory 返回:', res)
    await fetchCategoryList()
    ElMessage.success('新增子分类成功')
    return res
  } catch (error) {
    console.error('addChildCategory error:', error)
    ElMessage.error('请求新增子分类失败，请检查网络或后端服务。')
    throw error
  }
}


/**
 * 【兼容性函数】新增分类（主分类或子分类）。
 * 此函数会根据传入的 data.type 字段（'parent' 或 'child'）来调用不同的后端接口。
 * 这样你的 index.vue 无需修改，可继续调用此函数。
 */
export async function addCategory(data: { name: string; type?: 'parent' | 'child'; parent_id?: number; [key: string]: any }) {
  if (data.type === 'parent') {
    return addMainCategory(data); // 调用新增主分类的内部函数
  } else if (data.type === 'child') {
    // 确保子分类有 parent_id
    if (typeof data.parent_id === 'undefined' || data.parent_id === null || data.parent_id === 0) {
      console.warn("Attempted to add child category without a valid parent_id. Falling back to parent category logic or erroring out.");
      // 如果子分类没有父ID，可以根据业务逻辑选择：
      // 1. 强制报错
      // throw new Error("子分类必须指定 parent_id");
      // 2. 依然当作主分类处理 (不推荐，但为兼容性保留)
      // return addMainCategory(data);
      // 3. 提示并返回错误
      ElMessage.error('新增子分类缺少主分类ID。');
      return { code: 1, msg: '新增子分类缺少主分类ID。' }; // 返回一个失败的响应
    }
    return _addChildCategory(data as Omit<DouyinCategory, 'id' | 'videoCount' | 'create_time' | 'update_time'>); // 调用新增子分类的内部函数
  } else {
    // 如果 type 字段缺失或不是 'parent'/'child'，可以根据业务逻辑处理
    // 这里默认作为主分类处理，或者也可以强制报错
    console.warn("Missing or invalid 'type' field for addCategory. Defaulting to parent category or consider erroring out.");
    return addMainCategory(data); // 默认当作主分类处理，以避免未知错误
  }
}


/**
 * 编辑分类
 */
export async function updateCategory(data: DouyinCategory) {
  try {
    const res = await service.post('douyin/categories/update', data)
    console.log('updateCategory 返回:', res)
    await fetchCategoryList()
    ElMessage.success('编辑分类成功')
    return res
  } catch (error) {
    console.error('updateCategory error:', error)
    ElMessage.error('请求编辑分类失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 删除单个分类
 */
export async function deleteCategory(id: number) {
  try {
    const res = await service.post('douyin/categories/delete', { id })
    console.log('deleteCategory 返回:', res)
    await fetchCategoryList()
    ElMessage.success('删除分类成功')
    return res
  } catch (error) {
    console.error('deleteCategory error:', error)
    ElMessage.error('请求删除分类失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 批量删除分类
 */
export async function batchDeleteCategories(ids: number[]) {
  try {
    const res = await service.post('douyin/categories/batch-delete', { ids })
    console.log('batchDeleteCategories 返回:', res)
    await fetchCategoryList()
    ElMessage.success('批量删除分类成功')
    return res
  } catch (error) {
    console.error('batchDeleteCategories error:', error)
    ElMessage.error('请求批量删除分类失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 批量保存分类排序
 */
export async function saveCategorySort(list: { id: number, sort: number }[]) {
  try {
    const res = await service.post('douyin/categories/batch-update-sort', { list })
    console.log('saveCategorySort 返回:', res)
    await fetchCategoryList()
    ElMessage.success('分类排序保存成功')
    return res
  } catch (error) {
    console.error('saveCategorySort error:', error)
    ElMessage.error('请求保存分类排序失败，请检查网络或后端服务。')
    throw error
  }
}

/**
 * 清空数据
 */
function resetCategoryData() {
  douyinCategoryParents.value = []
  douyinCategoryChildren.value = []
  douyinCategories.value = []
}