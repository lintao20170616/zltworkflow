import http from '@spa/utils/http';

export interface SystemItem {
  id: number;
  code: string;
  name: string;
  status: number;
  isExternal: number;
  externalUrl?: string | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemListParams {
  keyword?: string;
  status?: number | '';
}

export interface SystemCreateRequest {
  code: string;
  name: string;
  status?: number;
  isExternal?: number;
  externalUrl?: string | null;
  sort?: number;
}

export interface SystemUpdateRequest {
  code?: string;
  name?: string;
  status?: number;
  isExternal?: number;
  externalUrl?: string | null;
  sort?: number;
}

export const getSystemList = async (params?: SystemListParams): Promise<SystemItem[]> => {
  return http.api.get('/system/list', { params });
};

export const createSystem = async (data: SystemCreateRequest): Promise<SystemItem> => {
  return http.api.post('/system', { data });
};

export const updateSystem = async (id: number, data: SystemUpdateRequest): Promise<SystemItem> => {
  return http.api.put(`/system/${id}`, { data });
};

export const deleteSystem = async (id: number): Promise<void> => {
  return http.api.delete(`/system/${id}`);
};

export const updateSystemStatus = async (id: number, status: number): Promise<SystemItem> => {
  return http.api.patch(`/system/${id}/status`, { data: { status } });
};

export interface MenuTreeItem {
  id: number;
  systemId?: number;
  parentId?: number | null;
  title: string;
  name?: string;
  path?: string;
  icon?: string | null;
  component?: string | null;
  status?: number;
  sort?: number;
  children?: MenuTreeItem[];
}

export interface SystemMenuTreeItem {
  id: number;
  code: string;
  name: string;
  title: string;
  isExternal?: number;
  externalUrl?: string | null;
  children: MenuTreeItem[];
}

export interface SystemMenuTreeParams {
  systemId?: number;
  status?: number | '';
}

export const getSystemMenuTree = async (params?: SystemMenuTreeParams): Promise<SystemMenuTreeItem[]> => {
  return http.api.get('/system/menu-tree', { params });
};
