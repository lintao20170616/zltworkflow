const { Service } = require('egg');

class OllamaService extends Service {
  async ollamaChat(messages, options = {}) {
    const response = await this.ctx.app.ollama.chat(messages, options);
    return response;
  }

  async checkHealth() {
    return this.ctx.app.ollama.checkHealth();
  }
}

module.exports = OllamaService;
