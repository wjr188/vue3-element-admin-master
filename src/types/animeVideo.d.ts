export interface AnimeVideo {
  id: number
  title: string
  tags?: string[]
  parent_id: number
  category_id: number
  m3u8?: string
  cover?: string
  preview: string
  is_vip: number
  gold: number
  status: string
  play: number
  collect: number
  upload_time: string
  // 其他字段如 duration, like, comment_count 可扩展
}