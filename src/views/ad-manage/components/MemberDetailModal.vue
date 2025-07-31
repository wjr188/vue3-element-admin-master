<template>
  <el-dialog v-model="visible" title="会员详情" width="60%">
    <div>
      <p>这是一个会员详情弹窗。</p>
      <p>会员ID: {{ memberData.id }}</p>
      <p>昵称: {{ memberData.nickname }}</p>
      </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="saveChanges">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';

const visible = ref(false); // 控制弹窗显示隐藏
const memberData = reactive({}); // 用于接收父组件传递的会员数据

// 暴露方法给父组件调用，用于打开弹窗并传入数据
const open = (data) => {
  Object.assign(memberData, data);
  visible.value = true;
};

const saveChanges = () => {
  // 保存逻辑，例如调用API更新会员信息
  console.log('保存会员信息:', memberData);
  visible.value = false;
  // 可以在这里触发一个事件通知父组件数据已更新
  // emit('updated');
};

// 如果要让父组件能够通过ref调用open方法，需要用defineExpose暴露
defineExpose({
  open
});
</script>

<style scoped>
/* 样式可以根据您的UI设计添加 */
</style>