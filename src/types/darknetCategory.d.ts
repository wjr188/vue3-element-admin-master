export interface DarknetCategory {
  id: number
  name: string
  parent_id: number
  sort: number
  status: number
  tags?: string[]
  videoCount?: number
  create_time?: string
  update_time?: string
}