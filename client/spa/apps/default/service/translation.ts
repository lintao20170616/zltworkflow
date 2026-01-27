import http from '@spa/utils/http';

export interface TranslationProjectItem {
  id: number;
  name: string;
  description?: string | null;
  sourceLanguageId: number;
  targetLanguageIds: number[];
  status: number;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  sourceLanguage?: {
    id: number;
    code: string;
    name: string;
    nativeName?: string | null;
  };
}

export interface TranslationProjectDetail extends TranslationProjectItem {
  targetLanguages: Array<{
    id: number;
    code: string;
    name: string;
    nativeName?: string | null;
  }>;
}

export interface TranslationProjectListParams {
  keyword?: string;
  status?: number | '';
}

export interface TranslationProjectCreateRequest {
  name: string;
  description?: string | null;
  sourceLanguageId: number;
  targetLanguageIds: number[];
  status?: number;
}

export interface TranslationProjectUpdateRequest {
  name?: string;
  description?: string | null;
  sourceLanguageId?: number;
  targetLanguageIds?: number[];
  status?: number;
}

export interface TranslationItem {
  id: number;
  projectId: number;
  key: string;
  sourceText?: string | null;
  languageId: number;
  translatedText?: string | null;
  status: number;
  translatorId?: number | null;
  reviewerId?: number | null;
  createdAt: string;
  updatedAt: string;
  language?: {
    id: number;
    code: string;
    name: string;
    nativeName?: string | null;
  };
}

export interface TranslationListParams {
  projectId?: number;
  languageId?: number;
  keyword?: string;
  status?: number | '';
  page?: number;
  pageSize?: number;
}

export interface TranslationListResponse {
  data: TranslationItem[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

export interface TranslationCreateRequest {
  projectId: number;
  key: string;
  sourceText?: string | null;
  languageId: number;
  translatedText?: string | null;
  status?: number;
}

export interface TranslationUpdateRequest {
  key?: string;
  sourceText?: string | null;
  translatedText?: string | null;
  status?: number;
}

export interface TranslationTaskItem {
  id: number;
  taskNumber: string;
  projectId: number;
  projectName: string;
  translatorId?: number | null;
  reviewerId?: number | null;
  status: number;
  progress: number;
  totalCount: number;
  textCount: number;
  isBackfilled: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
  };
}

export interface TranslationTaskListParams {
  projectId?: number;
  translatorId?: number;
  reviewerId?: number;
  status?: number | '';
  taskNumber?: string;
  projectName?: string;
  isBackfilled?: number | '';
}

export interface TranslationTaskDetail extends TranslationTaskItem {
  project?: {
    id: number;
    name: string;
    description?: string | null;
    targetLanguages?: Array<{
      id: number;
      code: string;
      name: string;
      nativeName?: string | null;
    }>;
  };
  translations?: TranslationItem[];
}

export interface TranslationTaskTranslationsParams {
  languageId?: number;
  page?: number;
  pageSize?: number;
}

export interface PushDefaultJsonRequest {
  projectId: number;
  defaultJsonPath?: string;
}

export interface PushDefaultJsonResponse {
  taskId: number;
  taskNumber: string;
  successCount: number;
  failCount: number;
  errors: string[];
}

export interface TranslationTaskCreateRequest {
  projectId: number;
  translatorId?: number | null;
  reviewerId?: number | null;
  status?: number;
  dueDate?: string | null;
}

export interface TranslationTaskUpdateRequest {
  translatorId?: number | null;
  reviewerId?: number | null;
  status?: number;
  progress?: number;
  dueDate?: string | null;
}

export const getTranslationProjectList = async (params?: TranslationProjectListParams): Promise<TranslationProjectItem[]> => {
  return http.api.get('/translation/projects', { params });
};

export const getTranslationProjectDetail = async (id: number): Promise<TranslationProjectDetail> => {
  return http.api.get(`/translation/projects/${id}`);
};

export const createTranslationProject = async (data: TranslationProjectCreateRequest): Promise<TranslationProjectItem> => {
  return http.api.post('/translation/projects', { data });
};

export const updateTranslationProject = async (id: number, data: TranslationProjectUpdateRequest): Promise<TranslationProjectItem> => {
  return http.api.put(`/translation/projects/${id}`, { data });
};

export const deleteTranslationProject = async (id: number): Promise<void> => {
  return http.api.delete(`/translation/projects/${id}`);
};

export const updateTranslationProjectStatus = async (id: number, status: number): Promise<TranslationProjectItem> => {
  return http.api.patch(`/translation/projects/${id}/status`, { data: { status } });
};

export const getTranslationList = async (params?: TranslationListParams): Promise<TranslationListResponse> => {
  return http.api.get('/translation/contents', { params });
};

export const createTranslation = async (data: TranslationCreateRequest): Promise<TranslationItem> => {
  return http.api.post('/translation/contents', { data });
};

export const updateTranslation = async (id: number, data: TranslationUpdateRequest): Promise<TranslationItem> => {
  return http.api.put(`/translation/contents/${id}`, { data });
};

export const deleteTranslation = async (id: number): Promise<void> => {
  return http.api.delete(`/translation/contents/${id}`);
};

export const getTranslationTaskList = async (params?: TranslationTaskListParams): Promise<TranslationTaskItem[]> => {
  return http.api.get('/translation/tasks', { params });
};

export const createTranslationTask = async (data: TranslationTaskCreateRequest): Promise<TranslationTaskItem> => {
  return http.api.post('/translation/tasks', { data });
};

export const updateTranslationTask = async (id: number, data: TranslationTaskUpdateRequest): Promise<TranslationTaskItem> => {
  return http.api.put(`/translation/tasks/${id}`, { data });
};

export const updateTranslationTaskStatus = async (id: number, status: number): Promise<TranslationTaskItem> => {
  return http.api.patch(`/translation/tasks/${id}/status`, { data: { status } });
};

export const deleteTranslationTask = async (id: number): Promise<void> => {
  return http.api.delete(`/translation/tasks/${id}`);
};

export const getTranslationTaskStatistics = async (projectId?: number): Promise<{ total: number; byStatus: Record<number, number> }> => {
  return http.api.get('/translation/tasks/statistics', { params: projectId ? { projectId } : undefined });
};

export const getTranslationTaskDetail = async (id: number): Promise<TranslationTaskDetail> => {
  return http.api.get(`/translation/tasks/${id}`);
};

export const getTranslationTaskTranslations = async (id: number, params?: TranslationTaskTranslationsParams): Promise<TranslationListResponse> => {
  return http.api.get(`/translation/tasks/${id}/translations`, { params });
};

export const backfillTranslationTask = async (id: number): Promise<{ successCount: number; failCount: number; errors: string[] }> => {
  return http.api.post(`/translation/tasks/${id}/backfill`);
};

export const pushDefaultJson = async (data: PushDefaultJsonRequest): Promise<PushDefaultJsonResponse> => {
  return http.api.post('/translation/push-default-json', { data });
};

export const translateWithAI = async (translationId: number): Promise<TranslationItem> => {
  return http.api.post(`/translation/contents/${translationId}/translate-with-ai`);
};

export interface BatchTranslateWithAIResponse {
  successCount: number;
  failCount: number;
  totalCount: number;
  errors: string[];
}

export const batchTranslateWithAI = async (taskId: number): Promise<BatchTranslateWithAIResponse> => {
  return http.api.post(`/translation/tasks/${taskId}/batch-translate-with-ai`);
};
