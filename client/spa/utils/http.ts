import { extend, RequestMethod } from 'umi-request';
// @ts-expect-error - js-cookies 没有类型定义
import Cookies from 'js-cookies';
import router from '../apps/default/router';
import { useUserStore } from '../apps/default/store/user';
import type { ApiResponse } from '../apps/default/types';

type HttpStatusCode = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 406 | 408 | 410 | 422 | 500 | 502 | 503 | 504;

const HTTP_STATUS_MESSAGES: Readonly<Record<HttpStatusCode, string>> = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作',
  401: '登录信息已过期，请重新登录！',
  403: '没有该页面权限！',
  404: '接口地址 404， 请确认接口已经发布了!',
  406: '业务错误',
  408: '接口超时',
  410: '请求的资源被永久删除，且不会再得到的',
  422: '当创建一个对象时，发生一个验证错误',
  500: '服务器发生错误，请检查服务器',
  502: '系统正在部署，请稍候。',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
} as const;

const getMessage = (status: number): string => {
  return HTTP_STATUS_MESSAGES[status as HttpStatusCode] ?? '未知错误';
};

// let logoutCounter = 0;

const getCsrfToken = (): string => {
  const name = 'csrfToken=';
  const decodedCookie = decodeURIComponent(document.cookie ?? '');
  const cookies = decodedCookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name)) {
      return trimmed.substring(name.length);
    }
  }

  return '';
};

const requestInterceptor = async (url: string, options: Record<string, unknown>) => {
  console.log('requestInterceptor', url, options);

  const modifiedOptions: Record<string, unknown> = { ...options };

  if (modifiedOptions.data instanceof FormData) {
    if (modifiedOptions.headers && typeof modifiedOptions.headers === 'object') {
      const headers = { ...(modifiedOptions.headers as Record<string, string>) };
      delete headers['Content-Type'];
      modifiedOptions.headers = headers;
    }
  }

  if (!modifiedOptions.headers || typeof modifiedOptions.headers !== 'object') {
    modifiedOptions.headers = {};
  }

  const headers = modifiedOptions.headers as Record<string, string>;
  headers['X-CSRF-Token'] = (Cookies.getItem('csrfToken') as string | null) ?? '';

  return { url, options: modifiedOptions as RequestInit };
};

const responseInterceptor = async (response: Response): Promise<Response> => {
  if (response.status === 200) {
    const resp: ApiResponse<unknown> = await response.clone().json();
    if (resp.code === 0) {
      return new Response(JSON.stringify(resp.data), {
        status: 200,
        statusText: 'OK',
        headers: response.headers,
      });
    }
    throw new Error(resp.message ?? response.statusText);
  }
  return response;
};

interface ErrorWithResponse {
  readonly response?: {
    readonly status: number;
    readonly clone: () => Response;
  };
  readonly message?: string;
}

const isErrorWithResponse = (error: unknown): error is ErrorWithResponse => {
  return typeof error === 'object' && error !== null && 'response' in error && typeof (error as ErrorWithResponse).response === 'object';
};

const errorHandler = async (error: unknown): Promise<never> => {
  if (!isErrorWithResponse(error)) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    throw new Error(message);
  }

  const { response } = error;
  if (!response) {
    const message = error.message ?? String(error);
    console.error(message);
    throw new Error(message);
  }

  const { status } = response;

  if (status === 401) {
    const userStore = useUserStore();
    await userStore.logout();
    router.push('/login');
    return Promise.reject(new Error('登录信息已过期，请重新登录！'));
  }

  let errorMessage: string;
  try {
    const data: ApiResponse<unknown> = await response.clone().json();
    errorMessage = data.message ?? getMessage(status);
  } catch {
    errorMessage = getMessage(status);
  }

  console.error(errorMessage);
  throw new Error(errorMessage);
};

const getClient = (oapiName?: string): RequestMethod => {
  const client = extend({
    prefix: `/api${oapiName ? `/${oapiName}` : ''}`,
    timeout: 60000,
    timeoutMessage: 'timeout',
    credentials: 'include',
    requestType: 'json',
    responseType: 'json',
    useCache: false,
    ttl: 60000,
    maxCache: 0,
    parseResponse: true,
    throwErrIfParseFail: false,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
    errorHandler,
    cancelToken: undefined,
  });

  // @ts-expect-error - umi-request 拦截器类型定义不够灵活
  client.interceptors.request.use(requestInterceptor, { global: false });
  client.interceptors.response.use(responseInterceptor, { global: false });

  return client;
};

const http = {
  api: getClient(''),
} as const;

export default http;
