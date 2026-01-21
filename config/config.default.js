const path = require('path');

module.exports = (appInfo) => {
  const config = {};
  config.keys = appInfo.name + '_1677811477866_8821';
  config.view = {
    cache: true,
    defaultViewEngine: 'nunjucks',
    root: path.join(appInfo.baseDir, 'app/public'),
  };

  config.middleware = ['oauth'];

  config.oauth = {
    enable: true,
    whitelist: ['/api/user/login', '/api/user/register', '/api/user/logout', '/api/chatbot/test-ollama'],
    userKey: 'user',
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1', // ⚠️ 不是 mysql / 不是 localhost 容器名
    port: 3306,
    username: 'root',
    password: '', // 空密码
    database: 'zltadmin',
    timezone: '+08:00',
  };

  // Redis 配置支持单机模式和哨兵模式
  // 哨兵模式：设置环境变量 REDIS_SENTINELS（格式：host1:port1,host2:port2,host3:port3）
  // 可选环境变量：REDIS_MASTER_NAME（默认：mymaster）、REDIS_PASSWORD
  // 单机模式：未设置 REDIS_SENTINELS 时，使用默认的 host:port 配置
  config.redis = {
    enableReadyCheck: true,
    client: (() => {
      const redisConfig = {
        db: 0,
      };

      const sentinelsEnv = process.env.REDIS_SENTINELS;
      const masterName = process.env.REDIS_MASTER_NAME || 'mymaster';
      const password = process.env.REDIS_PASSWORD || '';

      if (sentinelsEnv) {
        const sentinels = sentinelsEnv.split(',').map((item) => {
          const [host, port] = item.trim().split(':');
          return {
            host: host.trim(),
            port: parseInt(port?.trim() || '26379', 10),
          };
        });

        redisConfig.sentinels = sentinels;
        redisConfig.name = masterName;
        redisConfig.password = password;
      } else {
        redisConfig.host = '127.0.0.1';
        redisConfig.port = 6379;
        redisConfig.password = password;
      }

      return redisConfig;
    })(),
  };

  config.session = {
    key: 'EGG_SESS',
    maxAge: 40 * 1000,
    httpOnly: true,
    encrypt: true,
    renew: false,
    signed: true,
  };

  // 日志配置（生产环境默认配置）
  config.logger = {
    level: 'INFO',
    consoleLevel: 'INFO',
    disableConsoleAfterReady: true,
    dir: path.join(appInfo.baseDir, 'logs', appInfo.name),
    appLogName: `${appInfo.name}-web.log`,
    coreLogName: 'egg-web.log',
    agentLogName: 'egg-agent.log',
    errorLogName: 'common-error.log',
    maxFileSize: 2 * 1024 * 1024,
    maxFiles: 10,
    outputJSON: false,
    file: false,
  };

  return config;
};
