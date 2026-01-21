// 全局类型定义

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  token?: string;
  userInfo?: {
    id: number;
    username: string;
    email?: string;
    status: number;
  };
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}

// 注册响应数据
export interface RegisterResponse {
  userInfo?: {
    id: number;
    username: string;
    email?: string;
    status: number;
  };
}

export interface PaginationParams {
  current: number;
  pageSize: number;
}

export interface PaginationResponse {
  total: number;
  current: number;
  pageSize: number;
}
