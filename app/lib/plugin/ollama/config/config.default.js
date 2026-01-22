module.exports = () => {
  const config = {};

  config.ollama = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-r1:7b',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),
    enabled: process.env.OLLAMA_ENABLED === 'true',
    memory: {
      enable: true, // 开启AI记忆功能
      type: 'summary', // 记忆类型：summary（摘要记忆）/vector（向量记忆）
      maxHistoryLength: 5, // 最大原始历史消息数（默认仅保留最近 5 条）
      summaryThreshold: 1, // 触发摘要的消息数阈值（只要存在 olderMessages 就可触发）
      summaryModel: 'deepseek-r1:7b', // 用于生成摘要的模型（可复用主模型）
    },
  };

  return config;
};
