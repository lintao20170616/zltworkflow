const { Service } = require('egg');
const { Ollama } = require('ollama');

class OllamaService extends Service {
  constructor(ctx) {
    super(ctx);
    this._client = null;
  }

  getClient() {
    if (this._client) {
      return this._client;
    }

    const config = this.ctx.app.config.ollama || {};
    const host = config.baseUrl || 'http://127.0.0.1:11434';

    this._client = new Ollama({ host });
    return this._client;
  }

  getModel() {
    const config = this.ctx.app.config.ollama || {};
    return config.model || 'deepseek-r1:7b';
  }

  isEnabled() {
    const config = this.ctx.app.config.ollama || {};
    return !!config.enabled;
  }

  removeThinkTags(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }
    return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  async ollamaChat(messages, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('Ollama 未启用');
    }

    const client = this.getClient();
    const model = this.getModel();

    const requestMessages = (messages || []).map((msg) => {
      const role = msg?.role === 'user' ? 'user' : msg?.role === 'system' ? 'system' : 'assistant';
      return {
        role,
        content: msg?.content ?? '',
      };
    });

    const response = await client.chat({
      model,
      messages: requestMessages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 2000,
      },
    });

    if (response && response.message && response.message.content) {
      return {
        content: this.removeThinkTags(response.message.content),
        model: response.model || model,
        done: response.done !== undefined ? response.done : true,
      };
    }

    throw new Error(`Ollama 响应格式错误: ${JSON.stringify(response)}`);
  }

  async checkHealth() {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const client = this.getClient();
      await client.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = OllamaService;
