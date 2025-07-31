// src/api/user.api.ts
import { simpleService as request } from '@/utils/request-new';

// 定义角色类型
export type UserRole = 'admin' | 'viewer';
// 定义账号状态
export type UserStatus = '正常' | '禁用';

// 接口返回的单个用户数据结构
export interface UserItem {
  id: number;
  account: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  last_login_time: string; // 后端返回的上次登录时间
}

// 获取账号列表的请求参数
interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string; // 模糊搜索账号或昵称
}

// 新建账号的请求参数
export type CreateUserParams = {
  account: string
  nickname: string
  role: string
  // ...其它字段...
}

// 编辑账号的请求参数
export type EditUserParams = {
  id: number
  nickname: string
  // ...其它字段...
}

// 重置密码的请求参数
interface ResetPasswordParams {
  id: number;
  new_password: string;
}

// 自己修改密码的请求参数
interface ChangePasswordParams {
  old_password: string;
  new_password: string;
}

// 登录的请求参数
export interface LoginParams {
  account: string;
  password: string;
}

// 登录成功返回的数据
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  userInfo: UserItem;
}

// 通用API响应结构
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取账号列表
 * GET /api/user/list
 */
export function getUserList(params: UserListParams): Promise<ApiResponse<{ list: UserItem[]; total: number }>> {
  return request.get('/api/user/list', { params }).then(res => res.data);
}

/**
 * 新建账号
 * POST /api/user/create
 */
export function createUser(data: CreateUserParams): Promise<ApiResponse> {
  return request.post('/api/user/create', data).then(res => res.data);
}

/**
 * 编辑账号
 * POST /api/user/update
 */
export function updateUser(data: EditUserParams): Promise<ApiResponse> {
  return request.post('/api/user/update', data).then(res => res.data);
}

/**
 * 删除账号
 * POST /api/user/delete
 */
export function deleteUser(id: number): Promise<ApiResponse> {
  return request.post('/api/user/delete', { id }).then(res => res.data);
}

/**
 * 重置账号密码（主账号可帮子账号重置）
 * POST /api/user/reset-password
 */
export function resetPassword(id: number, password: string): Promise<ApiResponse> {
  return request.post('/api/user/reset-password', { id, password }).then(res => res.data);
}

/**
 * 自己修改密码（需输入原密码校验）
 * POST /api/user/change-password
 */
export function changePassword(data: ChangePasswordParams): Promise<ApiResponse> {
  return request.post('/api/user/change-password', data).then(res => res.data);
}

/**
 * 登录
 * POST /api/user/login
 */
export function login(data: LoginParams): Promise<ApiResponse<LoginResponseData>> {
  return request.post('/api/v1/user/login', data).then(res => res.data);
}

/**
 * 登出
 * POST /api/user/logout2
 */
export function logout(): Promise<ApiResponse> {
  return request.post('/api/user/logout2').then(res => res.data);
}

/**
 * 刷新 token
 * POST /api/user/refresh-token
 */
export function refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponseData>> {
  return request.post('/api/user/refresh-token', { refreshToken }).then(res => res.data);
}

/**
 * 获取当前登录用户信息
 * GET /api/user/info
 */
export function getInfo(): Promise<any> {
  return request.get('/api/v1/user/info').then(res => res.data.data);
}

/**
 * 获取所有权限点（菜单/按钮权限树）
 * GET /api/permission/list
 */
export function getAllPermissions(): Promise<ApiResponse<any[]>> {
  return request.get('/api/permission/list').then(res => res.data);
}

/**
 * 获取验证码
 * GET /api/user/captcha
 */
export function getCaptcha(): Promise<CaptchaInfo> {
  return request.get('/api/user/captcha').then(res => res.data.data);
}

// 验证码类型
export interface CaptchaInfo {
  captchaKey: string;
  captchaBase64: string;
}