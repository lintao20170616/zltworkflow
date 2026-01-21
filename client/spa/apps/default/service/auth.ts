import http from '@spa/utils/http';
import type { LoginParams, LoginResponse, RegisterParams, RegisterResponse } from '../types';

/**
 * 用户登录
 */
export const userLogin = (data: LoginParams): Promise<LoginResponse> => {
  return http.api.post('/user/login', { data });
};

/**
 * 用户注册
 */
export const userRegister = (data: RegisterParams): Promise<RegisterResponse> => {
  return http.api.post('/user/register', { data });
};

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): Promise<LoginResponse> => {
  return http.api.get('/user/info');
};

export const userLogout = () => {
  return http.api.post('/user/logout');
};

export interface UserRole {
  id: number;
  name: string;
  description: string | null;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string | null;
  status: number;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  code: number;
  message: string;
  data: UserListItem[];
}

/**
 * 获取用户列表
 */
export const getUserList = (): Promise<UserListItem[]> => {
  return http.api.get('/user/list');
};
