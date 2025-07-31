import service from '@/utils/request'

// 拉列表
export function fetchCoinPackageList(params) {
  return service.get('/api/coin-package/list', { params })
}

// 新增
export function addCoinPackage(data) {
  return service.post('/api/coin-package/add', data)
}

// 更新
export function updateCoinPackage(data) {
  return service.post('/api/coin-package/update', data)
}

// 删除
export function deleteCoinPackage(id: number) {
  return service.post('/api/coin-package/delete', { id })
}

// 上下架/批量上下架
export function changeCoinPackageStatus(ids: number[], status: number) {
  return service.post('/api/coin-package/status', { ids, status })
}
