const path = require('path');

module.exports = (appInfo) => {
  const config = {};
  config.session = {
    key: 'EGG_SESS',
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    encrypt: true,
    renew: false,
    signed: true,
  };
  // 本地开发环境日志配置
  config.logger = {
    // 日志级别：DEBUG < INFO < WARN < ERROR < NONE
    level: 'DEBUG',
    // 控制台输出
    consoleLevel: 'DEBUG',
    // 禁用文件输出（开发环境可选）
    disableConsoleAfterReady: false,
    // 日志文件输出目录
    dir: path.join(appInfo.baseDir, 'logs', appInfo.name),
    // 日志文件命名格式
    appLogName: `${appInfo.name}-web.log`,
    coreLogName: 'egg-web.log',
    agentLogName: 'egg-agent.log',
    errorLogName: 'common-error.log',
    // 日志文件大小限制（超过后自动分割）
    maxFileSize: 2 * 1024 * 1024, // 2MB
    // 保留的日志文件数量
    maxFiles: 10,
    // 输出格式
    outputJSON: false,
    // 是否输出到文件
    file: true,
  };
  config.ollama = {
    baseUrl: 'http://127.0.0.1:11434',
    model: 'deepseek-r1:7b',
    timeout: 120000,
    enabled: true,
  };
  return config;
};
