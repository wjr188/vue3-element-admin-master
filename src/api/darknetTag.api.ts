import { simpleService } from '@/utils/request-new'
import type { DarknetTag } from '@/types/darknetTag'

export function getDarknetTags(params: Record<string, any> = {}) {
  return simpleService.get<{ code: number; data: DarknetTag[] }>('/api/darknet/tags/list', { params })
}

export function addDarknetTag(data: Omit<DarknetTag, 'id' | 'videoCount' | 'create_time' | 'update_time'>) {
  return simpleService.post('/api/darknet/tags/add', data)
}

export function updateDarknetTag(data: DarknetTag) {
  return simpleService.post('/api/darknet/tags/update', data)
}

export function deleteDarknetTag(id: number) {
  return simpleService.post('/api/darknet/tags/delete', { id })
}

export function batchDeleteDarknetTags(ids: number[]) {
  return simpleService.post('/api/darknet/tags/batch-delete', { ids })
}

export function batchDisableDarknetTags(ids: number[]) {
  return simpleService.post('/api/darknet/tags/batch-disable', { ids })
}

export function toggleDarknetTagStatus(id: number) {
  return simpleService.post('/api/darknet/tags/toggle-status', { id })
}