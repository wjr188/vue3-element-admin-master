// src/api/permission.ts
import request from '@/utils/request'

/**
 * 获取内容–会员卡映射
 * 后端接口：GET /api/v1/content-vip-map
 * 后端返回格式：
 *   {
 *     code: number,
 *     message: string,
 *     data: {
 *       long_video: { [id: string]: number },
 *       image:      { [id: string]: number },
 *       anime:      { [id: string]: number },
 *       …
 *     }
 *   }
 *
 * 本函数只返回最内层的 data 对象：{ long_video: {...}, image: {...}, … }
 */
export async function getContentVipMap(): Promise<
  Record<string, Record<string, number>>
> {
  const res = await request.get<{
    code: number
    message: string
    data: Record<string, Record<string, number>>
  }>('/api/v1/content-vip-map')
  // 如果你的 request 拦截器已经直接返回 response.data，
  // 那么 res 就等同于上面接口的整个对象，此时下面才正确：
  return res.data
  // 如果你的 request.get 直接返回了 axios.Response，
  // 则需要改成: return res.data.data
}
