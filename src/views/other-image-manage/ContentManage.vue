<template>
  <div class="content-manage">
    <div class="top-bar">
      <div class="tab-list">
        <span class="tab-item active">内容管理</span>
      </div>
      <div class="status-indicator">
        <i class="el-icon-info"></i> 内容列表状态
      </div>
    </div>

    <div class="search-filter-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="博主">
          <el-select v-model="searchForm.influencerId" placeholder="全部博主" filterable clearable>
            <el-option v-for="influencer in influencerOptions" :key="influencer.id" :label="influencer.nickname" :value="influencer.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tagId" placeholder="全部标签" clearable>
            <el-option v-for="tag in store.tagOptions" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="正常" value="正常"></el-option>
            <el-option label="禁用" value="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
      <el-tab-pane label="专辑列表" name="albums">
        <div class="album-toolbar" style="margin-bottom: 15px;">
          <el-button type="success" @click="handleAddAlbum">新增专辑</el-button>
          <el-button type="danger" @click="handleBatchDeleteAlbums" :disabled="selectedAlbums.length === 0">批量删除</el-button>
          <el-button @click="fetchAlbumList">刷新专辑列表</el-button>
        </div>
        <el-table
          :data="albumList"
          style="width: 100%"
          border
          @selection-change="handleAlbumSelectionChange"
          v-loading="albumLoading"
          :empty-text="albumEmptyText"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="编号" width="80"></el-table-column>
          <el-table-column label="封面" width="100">
            <template #default="scope">
              <img v-if="scope.row.cover" :src="scope.row.cover" alt="封面" class="content-cover" />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="专辑名" width="180"></el-table-column>
          <el-table-column label="所属博主" width="150">
            <template #default="scope">
              {{ getInfluencerNickname(scope.row.influencer_id) }}
            </template>
          </el-table-column>
          <el-table-column prop="video_count" label="视频数" width="90"></el-table-column>
          <el-table-column prop="intro" label="简介" show-overflow-tooltip></el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="handleEditAlbum(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteAlbum(scope.row.id)">删除</el-button>
              <el-button size="small" @click="handleViewVideosInAlbum(scope.row)">查看视频</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-area">
          <el-pagination
            @size-change="handleAlbumSizeChange"
            @current-change="handleAlbumCurrentChange"
            :current-page="store.albumPagination.currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="store.albumPagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="store.albumPagination.total"
          ></el-pagination>
        </div>
      </el-tab-pane>

      <el-tab-pane label="视频列表" name="videos">
        <div class="video-toolbar" style="margin-bottom: 15px;">
          <el-button type="success" @click="handleAddVideo">新增视频/图片</el-button>
          <el-button type="danger" @click="handleBatchDeleteVideos" :disabled="selectedVideos.length === 0">批量删除</el-button>
          <el-button @click="fetchVideoList">刷新视频列表</el-button>
          <el-button @click="handleBatchSetVIP" :disabled="selectedVideos.length === 0">批量设为VIP</el-button>
          <el-button @click="handleBatchCancelVIP" :disabled="selectedVideos.length === 0">批量取消VIP</el-button>
          <el-button @click="handleBatchSetCoin" :disabled="selectedVideos.length === 0">批量设置金币</el-button>
          <el-button @click="handleBatchCancelCoin" :disabled="selectedVideos.length === 0">批量取消金币</el-button>
        </div>
        <el-table
          :data="videoList"
          style="width: 100%"
          border
          @selection-change="handleVideoSelectionChange"
          v-loading="videoLoading"
          :empty-text="videoEmptyText"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="编号" width="80"></el-table-column>
          <el-table-column label="封面" width="100">
            <template #default="scope">
              <img v-if="scope.row.cover" :src="scope.row.cover" alt="封面" class="content-cover" />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" width="180"></el-table-column>
          <el-table-column label="所属专辑" width="150">
            <template #default="scope">
              {{ getAlbumTitle(scope.row.album_id) }}
            </template>
          </el-table-column>
          <el-table-column label="所属博主" width="150">
            <template #default="scope">
              {{ getInfluencerNickname(scope.row.influencer_id) }}
            </template>
          </el-table-column>
          <el-table-column label="标签" width="150">
            <template #default="scope">
              <el-tag v-for="tagId in scope.row.tag_ids" :key="tagId" size="small" style="margin-right: 5px;">
                {{ getTagName(tagId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="90">
              <template #default="scope">
                <el-tag :type="scope.row.video_url ? 'info' : 'primary'">
                  {{ scope.row.video_url ? '视频' : '图片' }}
                </el-tag>
              </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="VIP" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.is_vip" type="success">VIP</el-tag>
              <span v-else>—</span>
            </template>
          </el-table-column>
          <el-table-column label="金币" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.coin > 0" type="warning">{{ scope.row.coin }}</el-tag>
              <span v-else>—</span>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="handleEditVideo(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteVideo(scope.row.id)">删除</el-button>
              <el-button size="small" @click="handlePreviewVideo(scope.row)">预览</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-area">
          <el-pagination
            @size-change="handleVideoSizeChange"
            @current-change="handleVideoCurrentChange"
            :current-page="store.videoPagination.currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="store.videoPagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="store.videoPagination.total"
          ></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="albumDialogVisible"
      :title="albumDialogTitle"
      width="40%"
      destroy-on-close
    >
      <el-form :model="currentAlbum" ref="albumForm" :rules="albumFormRules" label-width="100px">
        <el-form-item label="专辑名" prop="title">
          <el-input v-model="currentAlbum.title"></el-input>
        </el-form-item>
        <el-form-item label="所属博主" prop="influencer_id">
          <el-select v-model="currentAlbum.influencer_id" placeholder="请选择博主" filterable>
            <el-option v-for="influencer in influencerOptions" :key="influencer.id" :label="influencer.nickname" :value="influencer.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面URL" prop="cover">
          <el-input v-model="currentAlbum.cover"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input type="textarea" v-model="currentAlbum.intro"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="albumDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAlbumForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="videoDialogVisible"
      :title="videoDialogTitle"
      width="50%"
      destroy-on-close
    >
      <el-form :model="currentVideo" ref="videoForm" :rules="videoFormRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="currentVideo.title"></el-input>
        </el-form-item>
        <el-form-item label="所属博主" prop="influencer_id">
          <el-select v-model="currentVideo.influencer_id" placeholder="请选择博主" filterable @change="handleVideoInfluencerChange">
            <el-option v-for="influencer in influencerOptions" :key="influencer.id" :label="influencer.nickname" :value="influencer.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属专辑" prop="album_id">
          <el-select v-model="currentVideo.album_id" placeholder="请选择专辑" filterable clearable :disabled="!currentVideo.influencer_id">
            <el-option v-for="album in filteredAlbumOptions" :key="album.id" :label="album.title" :value="album.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容类型" prop="type">
          <el-radio-group v-model="currentVideo.type">
            <el-radio label="video">视频</el-radio>
            <el-radio label="image">图片</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面URL" prop="cover">
          <el-input v-model="currentVideo.cover"></el-input>
        </el-form-item>
        <el-form-item v-if="currentVideo.type === 'video'" label="视频地址" prop="video_url">
          <el-input v-model="currentVideo.video_url"></el-input>
        </el-form-item>
        <el-form-item label="标签" prop="tag_ids">
          <el-select v-model="currentVideo.tag_ids" multiple placeholder="请选择标签">
            <el-option v-for="tag in store.tagOptions" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentVideo.status">
            <el-radio label="正常"></el-radio>
            <el-radio label="禁用"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitVideoForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model:visible="previewDialogVisible"
      :title="previewTitle"
      width="60%"
      destroy-on-close
    >
      <div v-if="previewType === 'video'">
        <video :src="previewUrl" controls autoplay style="width: 100%;"></video>
      </div>
      <div v-else-if="previewType === 'image'">
        <img :src="previewUrl" alt="预览图片" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
      </div>
      <div v-else>
        无法预览此内容类型。
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, onMounted, watch, ref, nextTick, toRef } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useContentStore } from '@/store/content.store';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'ContentManage',
  setup() {
    const store = useContentStore();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      activeTab: 'albums',
      searchForm: {
        influencerId: null,
        albumId: null,
        tagId: null,
        status: null,
        type: null,
      },
      albumList: [],
      selectedAlbums: [],
      albumLoading: false,
      albumEmptyText: '暂无数据',

      videoList: [],
      selectedVideos: [],
      videoLoading: false,
      videoEmptyText: '暂无数据',

      albumDialogVisible: false,
      albumDialogTitle: '',
      currentAlbum: {
        id: null, influencer_id: null, cover: '', title: '', intro: '', create_time: '', video_count: 0,
      },
      albumFormRules: {
        title: [{ required: true, message: '请输入专辑名', trigger: 'blur' }],
        influencer_id: [{ required: true, message: '请选择所属博主', trigger: 'change' }],
        cover: [{ required: true, message: '请输入封面URL', trigger: 'blur' }],
      },

      videoDialogVisible: false,
      videoDialogTitle: '',
      currentVideo: {
        id: null, album_id: null, influencer_id: null, title: '', cover: '', video_url: '', tag_ids: [], status: '正常', create_time: '', type: 'video'
      },
      videoFormRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        influencer_id: [{ required: true, message: '请选择所属博主', trigger: 'change' }],
        cover: [{ required: true, message: '请输入封面URL', trigger: 'blur' }],
        video_url: [{ required: true, message: '请输入视频地址', trigger: 'blur', trigger: 'change', validator: (rule, value, callback) => {
          if (state.currentVideo.type === 'video' && !value) {
            callback(new Error('请输入视频地址'));
          } else {
            callback();
          }
        }}],
        type: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
      },
      
      previewDialogVisible: false,
      previewTitle: '',
      previewUrl: '',
      previewType: '',

      influencerOptions: [],
      albumOptions: [],
      filteredAlbumOptions: [],
    });

    const albumForm = ref(null);
    const videoForm = ref(null);
    const videoFormReady = ref(false);

    const getInfluencerNickname = (id) => {
      const item = state.influencerOptions.find(opt => opt.id === id)
      return item ? item.nickname : ''
    }

    const getAlbumTitle = (id) => {
      const album = state.albumOptions.find(a => a.id === id);
      return album ? album.title : '无专辑';
    };

    const getTagName = (id) => {
      const tag = store.tagOptions.find(t => t.id === id);
      return tag ? tag.name : '未知标签';
    };

    const initOptions = async () => {
      state.influencerOptions = await store.getInfluencerOptions();
      state.albumOptions = await store.getAlbumOptions();
      await store.getTagOptions();
      // 加log
      console.log('initOptions后 store.tagOptions:', store.tagOptions);
    };

    const handleTabChange = () => {
      resetSearch();
      fetchDataForActiveTab();
    };

    const fetchDataForActiveTab = () => {
      if (state.activeTab === 'albums') {
        fetchAlbumList();
      } else if (state.activeTab === 'videos') {
        fetchVideoList();
      }
    };

    const handleSearch = () => {
      if (state.activeTab === 'albums') {
        store.albumPagination.currentPage = 1;
        fetchAlbumList();
      } else if (state.activeTab === 'videos') {
        store.videoPagination.currentPage = 1;
        fetchVideoList();
      }
    };

    const resetSearch = () => {
      state.searchForm = {
        influencerId: null,
        albumId: null,
        tagId: null,
        status: null,
        type: null,
      };
      if (state.activeTab === 'videos') {
        state.filteredAlbumOptions = [];
      }
      fetchDataForActiveTab();
    };

    const fetchAlbumList = async () => {
      state.albumLoading = true;
      state.albumEmptyText = '加载中...';
      try {
        const params = {
          currentPage: store.albumPagination.currentPage,
          pageSize: store.albumPagination.pageSize,
          influencer_id: state.searchForm.influencerId,
        };
        const res = await store.getAlbumList(params); // 只用store返回的
        state.albumList = res.list;
        store.albumPagination.total = res.total;
        if (res.list.length === 0) {
          state.albumEmptyText = '暂无数据';
          ElMessage.error('专辑列表数据异常！');
        } else {
          ElMessage.success('专辑列表获取成功！');
        }
      } catch (error) {
        state.albumList = [];
        store.albumPagination.total = 1;
        state.albumEmptyText = '暂无数据';
        ElMessage.error('获取专辑列表失败，请稍后再试！');
      } finally {
        state.albumLoading = false;
      }
    };

    const handleAlbumSelectionChange = (selection) => {
      state.selectedAlbums = selection;
    };

    const handleAlbumSizeChange = (val) => {
      store.albumPagination.pageSize = val;
      store.albumPagination.currentPage = 1;
      fetchAlbumList();
    };

    const handleAlbumCurrentChange = (val) => {
      store.albumPagination.currentPage = val;
      fetchAlbumList();
    };

    const handleAddAlbum = () => {
      state.albumDialogTitle = '新增专辑';
      state.currentAlbum = {
        id: null, influencer_id: null, cover: '', title: '', intro: '', video_count: 0,
      };
      state.albumDialogVisible = true;
      nextTick(() => {
        if (albumForm.value) {
          albumForm.value.clearValidate();
        }
      });
    };

    const handleEditAlbum = (row) => {
      state.albumDialogTitle = '编辑专辑';
      state.currentAlbum = { ...row };
      state.albumDialogVisible = true;
      nextTick(() => {
        if (albumForm.value) {
          albumForm.value.clearValidate();
        }
      });
    };

    const submitAlbumForm = () => {
      albumForm.value.validate(async (valid) => {
        if (valid) {
          try {
            if (state.currentAlbum.id) {
              await ElMessageBox.confirm('确定保存对该专辑的修改吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
              await store.updateAlbum(state.currentAlbum.id, state.currentAlbum);
              ElMessage.success('专辑信息更新成功！');
            } else {
              await ElMessageBox.confirm('确定新增该专辑吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
              await store.createAlbum(state.currentAlbum);
              ElMessage.success('专辑新增成功！');
            }
            state.albumDialogVisible = false;
            fetchAlbumList();
            initOptions(); // 刷新专辑选项
          } catch (error) {
            console.error('提交专辑表单失败:', error);
            ElMessage.error('操作失败，请稍后再试！');
          }
        } else {
          ElMessage.error('请检查表单填写是否完整和正确！');
        }
      });
    };

    const handleDeleteAlbum = async (id) => {
      try {
        await ElMessageBox.confirm('此操作将永久删除该专辑, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        await store.removeAlbum(id);
        ElMessage.success('专辑删除成功!');
        fetchAlbumList();
        fetchVideoList();
        initOptions(); // 刷新专辑选项
      } catch (error) {
        console.error('删除专辑失败:', error);
        if (error !== 'cancel') ElMessage.error('删除失败，请稍后再试！');
      }
    };

    const handleBatchDeleteAlbums = async () => {
      if (state.selectedAlbums.length === 0) { ElMessage.warning('请至少选择一个专辑进行删除！'); return; }
      try {
        await ElMessageBox.confirm('此操作将永久删除选中的专辑, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        const idsToDelete = state.selectedAlbums.map(item => item.id);
        await store.batchRemoveAlbum(idsToDelete);
        state.selectedAlbums = [];
        ElMessage.success('批量删除成功!');
        fetchAlbumList();
        fetchVideoList();
        initOptions(); // 刷新专辑选项
      } catch (error) {
        console.error('批量删除专辑失败:', error);
        if (error !== 'cancel') ElMessage.error('批量删除失败，请稍后再试！');
      }
    };
    
    const handleViewVideosInAlbum = (row) => {
      state.searchForm.albumId = row.id;
      state.searchForm.influencerId = row.influencer_id;
      state.activeTab = 'videos';
      nextTick(() => {
        fetchVideoList();
      });
      ElMessage.info(`已切换到视频列表并筛选专辑：${row.title}`);
    };

    const fetchVideoList = async () => {
      state.videoLoading = true;
      state.videoEmptyText = '加载中...';
      try {
        const params = {
          currentPage: store.videoPagination.currentPage,
          pageSize: store.videoPagination.pageSize,
          influencer_id: state.searchForm.influencerId,
          album_id: state.searchForm.albumId,
          tag_id: state.searchForm.tagId,
          status: state.searchForm.status,
          type: state.searchForm.type,
        };
        const res = await store.getVideoList(params);
        state.videoList = res.list;
        store.videoPagination.total = res.total;
        ElMessage.success('视频列表获取成功！');
      } catch (error) {
        console.error('获取视频列表失败:', error);
        ElMessage.error('获取视频列表失败，请稍后再试！');
        state.videoList = [];
        store.videoPagination.total = 0;
      } finally {
        state.videoLoading = false;
        if (state.videoList.length === 0) {
            state.videoEmptyText = '暂无数据';
        }
      }
    };

    const handleVideoSelectionChange = (selection) => {
      state.selectedVideos = selection;
    };

    const handleVideoSizeChange = (val) => {
      store.videoPagination.pageSize = val;
      store.videoPagination.currentPage = 1;
      fetchVideoList();
    };

    const handleVideoCurrentChange = (val) => {
      store.videoPagination.currentPage = val;
      fetchVideoList();
    };

    const handleAddVideo = async () => {
      state.videoDialogTitle = '新增视频/图片';
      state.currentVideo = {
        id: null, album_id: null, influencer_id: null, title: '', cover: '', video_url: '', tag_ids: [], status: '正常', type: 'video'
      };
      state.filteredAlbumOptions = [];
      state.videoDialogVisible = true;
      await initOptions(); // ← 关键：弹窗打开时刷新专辑选项
      nextTick(() => {
        if (videoForm.value) {
          videoForm.value.clearValidate();
        }
      });
    };

    const handleEditVideo = async (row) => {
      state.videoDialogTitle = '编辑视频/图片';
      state.currentVideo = { ...row };
      state.currentVideo.type = row.video_url ? 'video' : 'image';
      await initOptions(); // ← 关键：弹窗打开时刷新专辑选项
      handleVideoInfluencerChange(state.currentVideo.influencer_id);

      state.videoDialogVisible = true;
      videoFormReady.value = false;
      nextTick(() => {
        videoFormReady.value = true;
        if (videoForm.value) {
          videoForm.value.clearValidate();
        }
      });
    };

    const handleVideoInfluencerChange = (influencerId) => {
      const albumOptions = Array.isArray(state.albumOptions) ? state.albumOptions : [];
      console.log('albumOptions:', albumOptions, 'influencerId:', influencerId);
      if (influencerId) {
        state.filteredAlbumOptions = albumOptions.filter(
          album => String(album.influencer_id) === String(influencerId)
        );
        console.log('filteredAlbumOptions:', state.filteredAlbumOptions);
        if (
          state.currentVideo.album_id &&
          !state.filteredAlbumOptions.some(a => a.id === state.currentVideo.album_id)
        ) {
          state.currentVideo.album_id = null;
        }
      } else {
        state.filteredAlbumOptions = [];
        state.currentVideo.album_id = null;
      }
    };

    const submitVideoForm = () => {
      if (!videoForm.value) {
        ElMessage.error('表单未渲染，请稍后重试！');
        return;
      }
      videoForm.value.validate(async (valid) => {
        if (valid) {
          if (state.currentVideo.type === 'image') {
            state.currentVideo.video_url = '';
          }
          try {
            if (state.currentVideo.id) {
              await ElMessageBox.confirm('确定保存对该内容的修改吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
              await store.updateVideo(state.currentVideo); // 只传对象，包含 id
              ElMessage.success('内容信息更新成功！');
            } else {
              await ElMessageBox.confirm('确定新增该内容吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
              await store.createVideo(state.currentVideo);
              ElMessage.success('内容新增成功！');
            }
            state.videoDialogVisible = false;
            fetchVideoList();
            initOptions();
          } catch (error) {
            console.error('提交视频表单失败:', error);
            ElMessage.error('操作失败，请稍后再试！');
          }
        } else {
          ElMessage.error('请检查表单填写是否完整和正确！');
        }
      });
    };

    const handleDeleteVideo = async (id) => {
      try {
        await ElMessageBox.confirm('此操作将永久删除该内容, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        await store.removeVideo(id);
        ElMessage.success('内容删除成功!');
        fetchVideoList();
        initOptions(); // 刷新专辑选项（可能影响专辑的视频数）
      } catch (error) {
        console.error('删除视频失败:', error);
        if (error !== 'cancel') ElMessage.error('删除失败，请稍后再试！');
      }
    };

    const handleBatchDeleteVideos = async () => {
      if (state.selectedVideos.length === 0) { ElMessage.warning('请至少选择一个内容进行删除！'); return; }
      try {
        await ElMessageBox.confirm('此操作将永久删除选中的内容, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        const idsToDelete = state.selectedVideos.map(item => item.id);
        await store.batchRemoveVideo(idsToDelete);
        state.selectedVideos = [];
        ElMessage.success('批量删除成功!');
        fetchVideoList();
        initOptions(); // 刷新专辑选项（可能影响专辑的视频数）
      } catch (error) {
        console.error('批量删除视频失败:', error);
        if (error !== 'cancel') ElMessage.error('批量删除失败，请稍后再试！');
      }
    };

    const handlePreviewVideo = (row) => {
      state.previewTitle = row.title;
      state.previewUrl = row.video_url || row.cover;
      state.previewType = row.video_url ? 'video' : 'image';
      state.previewDialogVisible = true;
    };

    const handleBatchSetVIP = async () => {
      const ids = state.selectedVideos.map(item => item.id);
      if (ids.length === 0) {
        ElMessage.warning('请至少选择一个内容进行操作！');
        return;
      }
      await store.batchSetVideoVIPAction({ ids, is_vip: true });
      ElMessage.success('批量设为VIP成功！');
      fetchVideoList();
    };

    const handleBatchCancelVIP = async () => {
      const ids = state.selectedVideos.map(item => item.id);
      if (ids.length === 0) {
        ElMessage.warning('请至少选择一个内容进行操作！');
        return;
      }
      await store.batchSetVideoVIPAction({ ids, is_vip: false });
      ElMessage.success('批量取消VIP成功！');
      fetchVideoList();
    };

    const handleBatchSetCoin = async () => {
      const coin = await promptCoinValue();
      const ids = state.selectedVideos.map(item => item.id);
      if (ids.length === 0) {
        ElMessage.warning('请至少选择一个内容进行操作！');
        return;
      }
      await store.batchSetVideoCoinAction({ ids, coin });
      ElMessage.success('批量设置金币成功！');
      fetchVideoList();
    };

    const handleBatchCancelCoin = async () => {
      const ids = state.selectedVideos.map(item => item.id);
      if (ids.length === 0) {
        ElMessage.warning('请至少选择一个内容进行操作！');
        return;
      }
      await store.batchSetVideoCoinAction({ ids, coin: 0 });
      ElMessage.success('批量取消金币成功！');
      fetchVideoList();
    };

    // 批量设置金币弹窗
    const promptCoinValue = async () => {
      try {
        const { value } = await ElMessageBox.prompt('请输入金币数', '设置金币', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9]\d*$/,
          inputErrorMessage: '请输入正整数',
        });
        return parseInt(value, 10);
      } catch {
        throw 'cancel';
      }
    };

    onMounted(() => {
      initOptions();
      // 路由带参数时才赋值
      if (route.query.influencerId) {
        state.searchForm.influencerId = parseInt(route.query.influencerId);
      }
      if (route.query.albumId) {
        state.searchForm.albumId = parseInt(route.query.albumId);
        state.activeTab = 'videos';
      }
      fetchDataForActiveTab();
    });

    return {
      store,
      activeTab: toRef(state, 'activeTab'),
      searchForm: toRef(state, 'searchForm'),
      albumList: toRef(state, 'albumList'),
      selectedAlbums: toRef(state, 'selectedAlbums'),
      albumLoading: toRef(state, 'albumLoading'),
      albumEmptyText: toRef(state, 'albumEmptyText'),

      videoList: toRef(state, 'videoList'),
      selectedVideos: toRef(state, 'selectedVideos'),
      videoLoading: toRef(state, 'videoLoading'),
      videoEmptyText: toRef(state, 'videoEmptyText'),

      albumDialogVisible: toRef(state, 'albumDialogVisible'),
      albumDialogTitle: toRef(state, 'albumDialogTitle'),
      currentAlbum: toRef(state, 'currentAlbum'),
      albumFormRules: toRef(state, 'albumFormRules'),

      videoDialogVisible: toRef(state, 'videoDialogVisible'),
      videoDialogTitle: toRef(state, 'videoDialogTitle'),
      currentVideo: toRef(state, 'currentVideo'),
      videoFormRules: toRef(state, 'videoFormRules'),

      previewDialogVisible: toRef(state, 'previewDialogVisible'),
      previewTitle: toRef(state, 'previewTitle'),
      previewUrl: toRef(state, 'previewUrl'),
      previewType: toRef(state, 'previewType'),

      influencerOptions: toRef(state, 'influencerOptions'),
      albumOptions: toRef(state, 'albumOptions'),
      filteredAlbumOptions: toRef(state, 'filteredAlbumOptions'),

      handleTabChange,
      handleSearch,
      resetSearch,
      fetchAlbumList,
      handleAlbumSelectionChange,
      handleAlbumSizeChange,
      handleAlbumCurrentChange,
      handleAddAlbum,
      handleEditAlbum,
      submitAlbumForm,
      handleDeleteAlbum,
      handleBatchDeleteAlbums,
      handleViewVideosInAlbum,
      fetchVideoList,
      handleVideoSelectionChange,
      handleVideoSizeChange,
      handleVideoCurrentChange,
      handleAddVideo,
      handleEditVideo,
      handleVideoInfluencerChange,
      submitVideoForm,
      handleDeleteVideo,
      handleBatchDeleteVideos,
      handlePreviewVideo,
      videoForm, // ← 这行必须加上！
      albumForm,

      getInfluencerNickname,
      getAlbumTitle,
      getTagName,

      handleBatchSetVIP,
      handleBatchCancelVIP,
      handleBatchSetCoin,      // ← 加上
      handleBatchCancelCoin,   // ← 加上
    };
  },
});
</script>

<style scoped>
.content-manage {
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-list .tab-item {
  font-size: 18px;
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}

.tab-list .tab-item.active {
  border-color: #409eff;
  color: #409eff;
}

.search-filter-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.content-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style>