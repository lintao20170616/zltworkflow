import http from '@spa/utils/http';

export interface MenuItem {
  id: number;
  systemId: number;
  parentId: number | null;
  title: string;
  name: string;
  path: string;
  icon: string | null;
  component: string | null;
  status: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuListParams {
  systemId?: number;
  keyword?: string;
  status?: number | '';
}

export interface MenuCreateRequest {
  systemId: number;
  parentId?: number | null;
  title: string;
  name: string;
  path: string;
  icon?: string | null;
  component?: string | null;
  status?: number;
  sort?: number;
}

export interface MenuUpdateRequest {
  systemId?: number;
  parentId?: number | null;
  title?: string;
  name?: string;
  path?: string;
  icon?: string | null;
  component?: string | null;
  status?: number;
  sort?: number;
}

export const getMenuList = async (params?: MenuListParams): Promise<MenuItem[]> => {
  return http.api.get('/menu/list', { params });
};

export const createMenu = async (data: MenuCreateRequest): Promise<MenuItem> => {
  return http.api.post('/menu', { data });
};

export const updateMenu = async (id: number, data: MenuUpdateRequest): Promise<MenuItem> => {
  return http.api.put(`/menu/${id}`, { data });
};

export const deleteMenu = async (id: number): Promise<void> => {
  return http.api.delete(`/menu/${id}`);
};

export const updateMenuStatus = async (id: number, status: number): Promise<MenuItem> => {
  return http.api.patch(`/menu/${id}/status`, { data: { status } });
};
