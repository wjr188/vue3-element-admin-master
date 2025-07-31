// src/store/modules/popupConfig.store.ts

import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { fetchPopupConfig, savePopupConfig } from '@/api/popupConfig.api';

export interface PopupConfigItem {
  id: number;
  popup_type: string;
  value: any;
}

export const usePopupConfigStore = defineStore('popupConfig', {
  state: () => ({
    configs: [] as PopupConfigItem[],
    loading: false,
  }),

  actions: {
    /**
     * 加载指定弹窗类型的配置
     */
    async loadConfig(popupType: string): Promise<PopupConfigItem | null> {
      this.loading = true;
      try {
        const res = await fetchPopupConfig(popupType);
        console.log('加载配置接口返回：', res);

        if (res.data.code === 0 && res.data.data.length > 0) {
          const item: PopupConfigItem = {
            id: res.data.data[0].id,
            popup_type: res.data.data[0].popup_type,
            value: res.data.data[0].value,
          };
          console.log('已加载配置：', item);
          return item;
        } else {
          console.log('未查询到配置数据');
          return null;
        }
      } catch (error) {
        console.error('加载配置失败：', error);
        ElMessage.error('加载配置失败，请检查网络或后端');
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 保存配置
     */
    async saveConfig(id: number, value: any) {
      this.loading = true;
      try {
        const res = await savePopupConfig({
          id,
          config_value: value,
        });

        if (res.code === 0) {
          ElMessage.success('✅ 保存成功');
        } else {
          ElMessage.error(res.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存配置失败：', error);
        ElMessage.error('保存配置失败，请检查网络或后端');
      } finally {
        this.loading = false;
      }
    },
  },
});
