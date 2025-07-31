export interface DarknetTag {
  id: number
  name: string
  status: number // 0禁用 1启用
  videoCount?: number
  create_time?: string
  update_time?: string
}