#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DEFAULT_JSON_PATH = path.join(__dirname, '../client/spa/apps/default/i18n/locales/default.json');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9090';
const PROJECT_ID = process.env.PROJECT_ID || '2';

/**
 * 安全解析 JSON 字符串为对象，失败返回空对象
 * @param {string} content
 * @returns {object}
 */
const parseJSONSafe = (content) => {
  try {
    return JSON.parse(content || '{}') || {};
  } catch (e) {
    return {};
  }
};

/**
 * 获取 CSRF token（通过访问任意接口获取 cookie）
 * @param {string} apiBaseUrl - API基础URL
 * @returns {Promise<{token: string, cookies: string}>} CSRF token 和 cookies
 */
const getCsrfToken = async (apiBaseUrl) => {
  const axiosInstance = axios.create({
    withCredentials: true,
    validateStatus: () => true,
  });

  try {
    const resp = await axiosInstance.get(`${apiBaseUrl}/api/user/info`);

    const setCookieHeaders = resp.headers['set-cookie'] || [];
    let csrfToken = '';
    const cookies = [];

    for (const cookieHeader of setCookieHeaders) {
      cookies.push(cookieHeader.split(';')[0]);
      const match = cookieHeader.match(/csrfToken=([^;]+)/);
      if (match) {
        csrfToken = match[1];
      }
    }

    if (!csrfToken) {
      const cookieString = cookies.join('; ');
      const match = cookieString.match(/csrfToken=([^;]+)/);
      if (match) {
        csrfToken = match[1];
      }
    }

    return {
      token: csrfToken,
      cookies: cookies.join('; '),
      axiosInstance,
    };
  } catch (error) {
    console.log(`[i18n-push] 获取 CSRF token 失败: ${error.message}`);
    return {
      token: '',
      cookies: '',
      axiosInstance: axios.create({ withCredentials: true }),
    };
  }
};

/**
 * 推送 default.json 到翻译平台
 * @param {object} options
 * @param {number} options.projectId - 翻译项目ID
 * @param {string} options.defaultJsonPath - default.json 文件路径
 * @param {string} options.apiBaseUrl - API基础URL
 */
const pushDefaultJson = async ({ projectId, defaultJsonPath, apiBaseUrl }) => {
  if (!fs.existsSync(defaultJsonPath)) {
    throw new Error(`文件不存在: ${defaultJsonPath}`);
  }

  const defaultJsonContent = fs.readFileSync(defaultJsonPath, 'utf-8');
  const defaultJson = parseJSONSafe(defaultJsonContent);

  if (Object.keys(defaultJson).length === 0) {
    throw new Error('default.json 文件为空或格式错误');
  }

  console.log(`[i18n-push] 读取 default.json 文件: ${defaultJsonPath}`);
  console.log(`[i18n-push] 包含 ${Object.keys(defaultJson).length} 个翻译键`);

  console.log(`[i18n-push] 正在获取 CSRF token...`);
  const { token: csrfToken, axiosInstance } = await getCsrfToken(apiBaseUrl);

  if (csrfToken) {
    console.log(`[i18n-push] CSRF token 获取成功`);
  } else {
    console.log(`[i18n-push] 警告: 未获取到 CSRF token，接口已在白名单中，将尝试直接请求`);
  }

  console.log(`[i18n-push] 正在推送 default.json 到翻译平台...`);
  console.log(`[i18n-push] API地址: ${apiBaseUrl}/api/translation/push-default-json`);
  console.log(`[i18n-push] 项目ID: ${projectId}`);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  try {
    const resp = await axiosInstance({
      url: `${apiBaseUrl}/api/translation/push-default-json`,
      method: 'POST',
      headers,
      data: {
        projectId: Number(projectId),
        defaultJson: defaultJson,
      },
    });

    const payload = resp && resp.data;
    if (payload && payload.code === 0 && payload.data) {
      const result = payload.data;
      console.log(`[i18n-push] 推送成功:`);
      console.log(`[i18n-push]   任务编号: ${result.taskNumber}`);
      console.log(`[i18n-push]   任务ID: ${result.taskId}`);
      console.log(`[i18n-push]   成功: ${result.successCount} 条`);
      console.log(`[i18n-push]   失败: ${result.failCount} 条`);
      if (result.errors && result.errors.length > 0) {
        console.log(`[i18n-push]   错误信息:`);
        result.errors.forEach((error) => console.log(`[i18n-push]     - ${error}`));
      }
      return result;
    } else {
      throw new Error(payload?.message || '推送失败: 未知错误');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      throw new Error(`推送失败: ${errorData.message || errorData.code || '未知错误'}`);
    }
    throw new Error(`推送失败: ${error.message || '网络错误'}`);
  }
};

/**
 * 推送命令处理函数
 */
const actionPush = async (cmdOptions) => {
  const projectId = cmdOptions.projectId || PROJECT_ID;
  const defaultJsonPath = cmdOptions.file || DEFAULT_JSON_PATH;
  const apiBaseUrl = cmdOptions.apiUrl || API_BASE_URL;

  try {
    await pushDefaultJson({
      projectId,
      defaultJsonPath,
      apiBaseUrl,
    });
  } catch (error) {
    console.error(`[i18n-push] 错误: ${error.message}`);
    process.exit(1);
  }
};

program
  .name('i18n-push')
  .description('推送 default.json 到翻译平台')
  .version('1.0.0')
  .option('-p, --project-id <id>', '翻译项目ID', PROJECT_ID)
  .option('-f, --file <path>', 'default.json 文件路径', DEFAULT_JSON_PATH)
  .option('-a, --api-url <url>', 'API基础URL', API_BASE_URL)
  .action(actionPush);

program.parse();
