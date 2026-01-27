#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../client/spa/apps/default/i18n/locales');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9090';
const PROJECT_ID = process.env.PROJECT_ID || '2';

/**
 * 获取 CSRF token（通过访问任意接口获取 cookie）
 * @param {string} apiBaseUrl - API基础URL
 * @returns {Promise<{token: string, cookies: string, axiosInstance: any}>} CSRF token 和 cookies
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
    console.log(`[i18n-pull] 获取 CSRF token 失败: ${error.message}`);
    return {
      token: '',
      cookies: '',
      axiosInstance: axios.create({ withCredentials: true }),
    };
  }
};

/**
 * 从API拉取所有翻译内容
 * @param {object} options
 * @param {number} options.projectId - 翻译项目ID
 * @param {string} options.apiBaseUrl - API基础URL
 * @param {any} options.axiosInstance - axios实例
 * @param {string} options.csrfToken - CSRF token
 */
const pullTranslationsFromAPI = async ({ projectId, apiBaseUrl, axiosInstance, csrfToken }) => {
  const headers = {};
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const resp = await axiosInstance({
    url: `${apiBaseUrl}/api/translation/pullTranslations`,
    method: 'GET',
    headers,
    params: {
      projectId,
    },
  });

  const payload = resp && resp.data;
  if (payload && payload.code === 0 && payload.data) {
    return payload.data;
  } else {
    throw new Error(payload?.message || '拉取翻译内容失败');
  }
};

/**
 * 拉取翻译内容并生成JSON文件
 * @param {object} options
 * @param {number} options.projectId - 翻译项目ID
 * @param {string} options.localesDir - locales目录路径
 * @param {string} options.apiBaseUrl - API基础URL
 */
const pullTranslations = async ({ projectId, localesDir, apiBaseUrl }) => {
  console.log(`[i18n-pull] 正在获取 CSRF token...`);
  const { token: csrfToken, axiosInstance } = await getCsrfToken(apiBaseUrl);

  if (csrfToken) {
    console.log(`[i18n-pull] CSRF token 获取成功`);
  } else {
    console.log(`[i18n-pull] 警告: 未获取到 CSRF token，接口已在白名单中，将尝试直接请求`);
  }

  console.log(`[i18n-pull] 正在拉取翻译内容...`);
  console.log(`[i18n-pull] API地址: ${apiBaseUrl}/api/translation/pullTranslations`);
  console.log(`[i18n-pull] 项目ID: ${projectId}`);

  const result = await pullTranslationsFromAPI({
    projectId,
    apiBaseUrl,
    axiosInstance,
    csrfToken,
  });

  console.log(`[i18n-pull] 项目名称: ${result.projectName}`);
  console.log(`[i18n-pull] 目标语言数量: ${Object.keys(result.translations || {}).length}`);

  if (!result.translations || Object.keys(result.translations).length === 0) {
    throw new Error('项目没有已完成的翻译内容');
  }

  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
    console.log(`[i18n-pull] 创建目录: ${localesDir}`);
  }

  let totalSuccess = 0;
  let totalFail = 0;

  for (const [langCode, translationMap] of Object.entries(result.translations)) {
    const langStat = result.statistics?.[langCode];
    const langName = langStat?.languageName || langCode;
    const filePath = path.join(localesDir, `${langCode}.json`);

    console.log(`[i18n-pull] 正在处理 ${langName} (${langCode})...`);

    try {
      if (!translationMap || Object.keys(translationMap).length === 0) {
        console.log(`[i18n-pull]   ${langName}: 没有已完成的翻译内容，跳过`);
        continue;
      }

      let existingData = {};
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          existingData = JSON.parse(fileContent);
        } catch (error) {
          console.log(`[i18n-pull]   ${langName}: 读取现有文件失败，将覆盖: ${error.message}`);
        }
      }

      const mergedData = { ...existingData, ...translationMap };
      const jsonContent = JSON.stringify(mergedData, null, 2);

      fs.writeFileSync(filePath, jsonContent, 'utf-8');

      const newCount = Object.keys(translationMap).length;
      const totalCount = Object.keys(mergedData).length;
      console.log(`[i18n-pull]   ${langName}: 成功生成 ${filePath}`);
      console.log(`[i18n-pull]     新增: ${newCount} 条`);
      console.log(`[i18n-pull]     总计: ${totalCount} 条`);

      totalSuccess += newCount;
    } catch (error) {
      console.error(`[i18n-pull]   ${langName}: 处理失败 - ${error.message}`);
      totalFail++;
    }
  }

  console.log(`[i18n-pull] 拉取完成:`);
  console.log(`[i18n-pull]   成功: ${totalSuccess} 条翻译`);
  if (totalFail > 0) {
    console.log(`[i18n-pull]   失败: ${totalFail} 个语言文件`);
  }
};

/**
 * 拉取命令处理函数
 */
const actionPull = async (cmdOptions) => {
  const projectId = cmdOptions.projectId || PROJECT_ID;
  const localesDir = cmdOptions.output || LOCALES_DIR;
  const apiBaseUrl = cmdOptions.apiUrl || API_BASE_URL;

  try {
    await pullTranslations({
      projectId,
      localesDir,
      apiBaseUrl,
    });
  } catch (error) {
    console.error(`[i18n-pull] 错误: ${error.message}`);
    process.exit(1);
  }
};

program
  .name('i18n-pull')
  .description('从翻译平台拉取已完成的翻译内容到本地 locales 目录')
  .version('1.0.0')
  .option('-p, --project-id <id>', '翻译项目ID', PROJECT_ID)
  .option('-o, --output <path>', 'locales 目录路径', LOCALES_DIR)
  .option('-a, --api-url <url>', 'API基础URL', API_BASE_URL)
  .action(actionPull);

program.parse();
