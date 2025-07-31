<template>
  <div class="influencer-detail">
    <div v-if="false">调试信息：isEditing={{ isEditing }} - detailForm.nickname={{ detailForm.nickname }}</div>

    <el-button @click="testClick">测试按钮</el-button>

    <el-form :model="detailForm" label-width="100px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="昵称">
            <el-input v-model="detailForm.nickname" :disabled="!isEditing"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="头像">
            <img :src="detailForm.avatar" alt="头像" class="influencer-detail-avatar" v-if="detailForm.avatar"/>
            <span v-else>无头像</span>
            <el-input v-model="detailForm.avatar" v-if="isEditing" placeholder="请输入头像URL"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="国家">
                <el-input v-model="detailForm.country" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="身高">
                <el-input v-model="detailForm.height" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="生日">
                <el-input v-model="detailForm.birthday" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="罩杯">
                <el-input v-model="detailForm.cup" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="三围">
                <el-input v-model="detailForm.size" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="24">
            <el-form-item label="简介">
                <el-input type="textarea" v-model="detailForm.intro" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="状态">
                <el-input v-model="detailForm.status" :disabled="!isEditing"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="粉丝数">
                <el-input v-model="detailForm.fans" :disabled="true"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="获赞数">
                <el-input v-model="detailForm.likes" :disabled="true"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="专辑数">
                <el-input v-model="detailForm.album_count" :disabled="true"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="视频数">
                <el-input v-model="detailForm.video_count" :disabled="true"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="24">
            <el-form-item label="创建时间">
                <el-input v-model="detailForm.create_time" :disabled="true"></el-input>
            </el-form-item>
        </el-col>
      </el-row>

      <el-form-item v-if="isEditing">
        <el-button type="primary" @click="saveChanges">保存</el-button>
        <el-button @click="cancelEditing">取消</el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button type="primary" @click="startEditing">编辑资料</el-button>
        <el-button @click="navigateToContent">查看内容</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineComponent } from 'vue'; // 确保导入 defineComponent

export default defineComponent({
  name: 'InfluencerDetail',
  props: {
    influencer: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      detailForm: {},
      originalInfluencer: {}, // 用于取消编辑时恢复数据
      isEditing: false,
    };
  },
  methods: {
    testClick() {
      console.log('[DEBUG] 测试按钮被点击');
      this.isEditing = !this.isEditing; // 切换编辑模式状态
    },

    startEditing() {
      console.log('[DEBUG] 进入编辑模式');
      this.isEditing = true;
    },

    saveChanges() {
      // 实际应用中：这里应该调用API保存修改后的 detailForm 数据
      console.log('保存修改:', this.detailForm);
      // 假设保存成功后，通知父组件刷新列表
      // ElMessage.success('详情保存成功！'); // 如果需要Element Plus消息提示
      this.$emit('refresh'); // 通知父组件刷新列表
      this.isEditing = false;
    },

    cancelEditing() {
      console.log('取消编辑');
      this.detailForm = { ...this.originalInfluencer }; // 恢复原始数据
      this.isEditing = false;
    },

    navigateToContent() {
      // 假设跳转到内容管理页面，并带上博主ID进行筛选
      this.$emit('closeDetailDialogAndNavigate', {
        name: 'ContentManage', // 请确保这是您内容管理页面的路由名称
        query: { influencerId: this.detailForm.id, influencerNickname: this.detailForm.nickname }
      });
    },
  },
  watch: {
    influencer: {
      immediate: true, // 确保组件加载时立即执行一次handler
      deep: true, // 深度监听对象内部属性的变化
      handler(newVal) {
        console.log('博主数据更新 (watch 监听):', newVal);
        this.detailForm = newVal ? { ...newVal } : {}; // 使用展开运算符进行浅拷贝，确保响应性
        this.originalInfluencer = newVal ? { ...newVal } : {}; // 存储原始数据用于取消编辑
        this.isEditing = false; // 数据更新时，默认退出编辑模式
      }
    }
  },
});
</script>

<style scoped>
.influencer-detail-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  vertical-align: middle;
  margin-right: 10px;
}
/* 其他样式请根据需要添加 */
</style>