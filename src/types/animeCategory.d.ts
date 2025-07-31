export interface AnimeCategory {
  id: number
  name: string
  parent_id: number
  sort: number
  status: number
  tags?: string[]
  videoCount?: number
}