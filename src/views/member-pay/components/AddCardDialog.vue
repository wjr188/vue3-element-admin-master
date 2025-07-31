<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增会员卡类型"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" ref="cardFormRef" :rules="rules" label-width="100px">
      <el-form-item label="卡片名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入卡片名称"></el-input>
      </el-form-item>
      <el-form-item label="卡片类型" prop="type">
        <el-input v-model="form.type" placeholder="请输入卡片类型（唯一标识符）"></el-input>
      </el-form-item>
      <el-form-item label="卡片描述" prop="desc">
        <el-input
          type="textarea"
          v-model="form.desc"
          placeholder="请输入卡片描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request'; // 确保路径和导入方式正确

const dialogVisible = ref(false);
const cardFormRef = ref(null); // 用于表单校验的ref

const form = reactive({
  name: '',
  type: '',
  desc: ''
});

// 表单校验规则
const rules = reactive({
  name: [
    { required: true, message: '请输入卡片名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请输入卡片类型', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    // 假设类型是英文或数字组合，可以添加更严格的正则
    // { pattern: /^[a-zA-Z0-9_]+$/, message: '类型只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  desc: [], // 描述可以为空，或根据需要添加规则
});

// 打开弹窗的方法
const open = () => {
  dialogVisible.value = true;
  // 重置表单，清除上次的校验信息
  if (cardFormRef.value) {
    cardFormRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!cardFormRef.value) return;
  cardFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request.post('/api/admin/card/add', form);
        if (res.code === 0) {
          ElMessage.success('新增会员卡类型成功');
          dialogVisible.value = false; // 关闭弹窗
          // 通知父组件刷新列表（假设父组件会监听一个事件来刷新）
          // 例如，如果您在父组件中定义了emit，可以使用 emit('refreshCardList');
        } else {
          ElMessage.error(res.msg || '新增失败');
        }
      } catch (error) {
        console.error('新增会员卡类型失败:', error);
        ElMessage.error('系统出错，请稍后再试');
      }
    } else {
      ElMessage.error('请检查表单填写');
      return false;
    }
  });
};

// 弹窗关闭前的处理，例如重置表单
const handleClose = () => {
  if (cardFormRef.value) {
    cardFormRef.value.resetFields();
  }
};

// 暴露 open 方法给父组件调用
defineExpose({
  open
});
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>