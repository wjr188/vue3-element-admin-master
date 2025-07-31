import request from '@/utils/request-new'; // 如果你用axios封装，这里写你的封装

// 获取弹窗配置
export function fetchPopupConfig(popupType: string) {
  return request.get('/api/popup_config', {
    params: { popup_type: popupType },
  });
}

// 保存弹窗配置
export function savePopupConfig(data: { id: number; config_value: any }) {
  return request.post('/api/popup_config/save', data);
}
