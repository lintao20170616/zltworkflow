import http from '@spa/utils/http';

export interface LanguageItem {
  id: number;
  code: string;
  name: string;
  nativeName?: string | null;
  flag?: string | null;
  status: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageListParams {
  keyword?: string;
  status?: number | '';
}

export interface LanguageCreateRequest {
  code: string;
  name: string;
  nativeName?: string | null;
  flag?: string | null;
  status?: number;
  sort?: number;
}

export interface LanguageUpdateRequest {
  code?: string;
  name?: string;
  nativeName?: string | null;
  flag?: string | null;
  status?: number;
  sort?: number;
}

export const getLanguageList = async (params?: LanguageListParams): Promise<LanguageItem[]> => {
  return http.api.get('/language/list', { params });
};

export const createLanguage = async (data: LanguageCreateRequest): Promise<LanguageItem> => {
  return http.api.post('/language', { data });
};

export const updateLanguage = async (id: number, data: LanguageUpdateRequest): Promise<LanguageItem> => {
  return http.api.put(`/language/${id}`, { data });
};

export const deleteLanguage = async (id: number): Promise<void> => {
  return http.api.delete(`/language/${id}`);
};

export const updateLanguageStatus = async (id: number, status: number): Promise<LanguageItem> => {
  return http.api.patch(`/language/${id}/status`, { data: { status } });
};
