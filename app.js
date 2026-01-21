module.exports = (app) => {
  app.ready(async () => {
    app.logger.info('[App] 应用启动前检查...');
    // 检查 Redis 是否连接成功
    if (app.redis) {
      const redisConfig = app.config.redis.client;
      const mode = redisConfig.sentinels ? '哨兵模式' : '单机模式';
      app.logger.info(`[App] Redis 配置: ${mode}`);
      if (redisConfig.sentinels) {
        app.logger.info(`[App] Redis 哨兵节点: ${redisConfig.sentinels.map((s) => `${s.host}:${s.port}`).join(', ')}`);
        app.logger.info(`[App] Redis Master 名称: ${redisConfig.name}`);
      } else {
        app.logger.info(`[App] Redis 地址: ${redisConfig.host}:${redisConfig.port}`);
      }
      try {
        await app.redis.ping();
        app.logger.info('[App] Redis 连接成功');
      } catch (err) {
        app.logger.error('[App] Redis 连接失败: %s', err.message);
        // 可以按需处理错误，比如 process.exit(1)
      }
    } else {
      app.logger.warn('[App] 未检测到 Redis 实例');
    }
  });
};
