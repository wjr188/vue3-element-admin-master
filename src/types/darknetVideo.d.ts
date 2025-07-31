export interface DarknetVideo {
  id: number
  title: string
  cover: string
  url: string
  parent_id: number
  category_id: number
  tags?: string[]
  preview: string
  gold: number
  is_vip: number
  status: string
  play: number
  collect: number
  upload_time: string
  // 其他字段按需补充
}