import simpleService from "@/utils/request-new";

// 获取所有配置
export function fetchSiteConfigs() {
  return simpleService.get("/api/site-config/all");
}


// 更新配置
export function updateSiteConfigs(data: Record<string, any>) {
  return simpleService.post("/api/site-config/update", data);
}
