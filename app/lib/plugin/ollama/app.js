const { Ollama } = require('ollama');
class OllamaAI {
  constructor(config) {
    this.model = config.model || 'deepseek-r1:7b';
    this.timeout = config.timeout || 30000;

    const host = config.baseUrl || 'http://127.0.0.1:11434';
    this.client = new Ollama({ host });
  }

  async checkHealth() {
    try {
      await this.client.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  removeThinkTags(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }
    return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  async chat(messages, options = {}) {
    try {
      const response = await this.client.chat({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2000,
        },
      });

      if (response && response.message && response.message.content) {
        const cleanedContent = this.removeThinkTags(response.message.content);
        return {
          content: cleanedContent,
          model: response.model || this.model,
          done: response.done !== undefined ? response.done : true,
        };
      }
      throw new Error(`Ollama API 响应格式错误: ${JSON.stringify(response)}`);
    } catch (error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error(`请求超时（${this.timeout}ms）`);
      }
      throw new Error(`请求失败: ${error.message}`);
    }
  }
}
module.exports = (app) => {
  try {
    const config = app.config.ollama || {};
    app.ollama = new OllamaAI({
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout,
    });
    if (!config.enabled) {
      app.logger.info('[egg-ollama] plugin disabled');
      return;
    }
  } catch (error) {
    app.logger.error('[egg-ollama] plugin initialization error:', error);
  }
};
