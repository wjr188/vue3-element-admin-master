import request from '@/utils/request-new';

export interface BrandConfig {
  id: number;
  config_key: string;
  config_value: string;
  updated_at: string;
}

// 获取所有配置
export function fetchBrandConfigs() {
  return request.get<BrandConfig[]>('/api/site_config');
}

// 更新配置
export function updateBrandConfig(data: { config_key: string; config_value: string }) {
  return request.post('/api/site_config/update', data);
}
