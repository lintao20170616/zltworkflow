module.exports = () => {
  const config = {};

  config.ollama = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-r1:7b',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),
    enabled: process.env.OLLAMA_ENABLED === 'true',
  };

  return config;
};
