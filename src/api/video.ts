// src/api/video.ts
import axios from 'axios';

// ======================================
// 接口类型定义
// ======================================

export interface Video {
  id: number;
  title: string;
  main_category_name?: string; // 主分类名称
  child_category_name?: string; // 子分类名称
  // 根据实际 long_videos 表添加其他字段
  // 例如: cover_url?: string;
  // 例如: duration?: number;
  // 例如: status?: number;
}

export interface VideoFilterParams {
  keyword?: string;
  parentId?: number | string; // 主分类ID
  categoryId?: number | string; // 子分类ID
  currentPage: number;
  pageSize: number;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number; // 仅对子分类有效
  // 根据实际分类表添加其他字段
}

// ======================================
// API 请求函数
// ======================================

/**
 * 获取所有视频列表 (用于视频管理对话框的左侧面板)
 */
export async function getAllVideos(params: VideoFilterParams) {
  const res = await axios.get('/api/long/videos', { params });
  return res.data;
}

/**
 * 获取所有父级视频分类
 */
export async function getAllParentCategories() {
  const res = await axios.get('/api/categories/parents');
  return res.data;
}

/**
 * 获取所有子级视频分类
 */
export async function getAllChildCategories() {
  const res = await axios.get('/api/categories/children');
  return res.data;
}

/**
 * 获取所有分类（用于分组所属分类下拉）
 */
export async function getAllCategories() {
  const res = await axios.get('/api/long/categories/list');
  return res.data;
}