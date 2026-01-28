module.exports = () => {
  const config = {};

  config.ollama = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-chat', //deepseek-r1:7b,deepseek-chat
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),
    enabled: process.env.OLLAMA_ENABLED === 'true',
    mode: process.env.OLLAMA_MODE || 'deepseek', //deepseek,local
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || 'sk-b9124171e4de4b1f9c4511b9710ba883',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '60000', 10),
    },
    memory: {
      enable: true,
      type: 'summary',
      maxHistoryLength: 5,
      summaryThreshold: 1,
      summaryModel: 'deepseek-r1:7b',
    },
  };

  return config;
};
