const { Service } = require('egg');
const { Ollama } = require('ollama');

class OllamaService extends Service {
  constructor(ctx) {
    super(ctx);
    this._client = null;
  }

  getMemoryConfig() {
    const config = this.ctx.app.config.ollama || {};
    const memory = config.memory || {};
    return {
      enable: !!memory.enable,
      type: memory.type || 'summary',
      maxHistoryLength: Number(memory.maxHistoryLength || 5),
      summaryThreshold: Number(memory.summaryThreshold || 1),
      summaryModel: memory.summaryModel || config.model || 'deepseek-r1:7b',
      embeddingModel: memory.embeddingModel || config.model || 'deepseek-r1:7b',
      vectorTopK: Number(memory.vectorTopK || 3),
      vectorMaxItems: Number(memory.vectorMaxItems || 200),
      vectorMinScore: Number(memory.vectorMinScore || 0.25),
    };
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

  getRedisClient() {
    return this.ctx.app.redis;
  }

  getSummaryCacheKey(conversationId) {
    return `ollama:memory:summary:${conversationId}`;
  }

  getSummaryMetaCacheKey(conversationId) {
    return `ollama:memory:summary_meta:${conversationId}`;
  }

  getVectorCacheKey(conversationId) {
    return `ollama:memory:vector:${conversationId}`;
  }

  getVectorMetaCacheKey(conversationId) {
    return `ollama:memory:vector_meta:${conversationId}`;
  }

  async clearConversationCache(conversationId) {
    const redis = this.getRedisClient();
    if (!redis) {
      return;
    }

    const id = Number(conversationId);
    await redis.del(this.getSummaryCacheKey(id), this.getSummaryMetaCacheKey(id), this.getVectorCacheKey(id), this.getVectorMetaCacheKey(id));
  }

  async getCachedSummary(conversationId) {
    const redis = this.getRedisClient();
    if (!redis) {
      return null;
    }
    const summary = await redis.get(this.getSummaryCacheKey(conversationId));
    if (!summary) {
      return null;
    }
    const metaRaw = await redis.get(this.getSummaryMetaCacheKey(conversationId));
    let meta = null;
    if (metaRaw) {
      try {
        meta = JSON.parse(metaRaw);
      } catch {
        meta = null;
      }
    }
    return { summary, meta };
  }

  async setCachedSummary(conversationId, summary, meta) {
    const redis = this.getRedisClient();
    if (!redis) {
      return;
    }
    const ttlSeconds = 7 * 24 * 60 * 60;
    await redis.set(this.getSummaryCacheKey(conversationId), summary, 'EX', ttlSeconds);
    await redis.set(this.getSummaryMetaCacheKey(conversationId), JSON.stringify(meta || {}), 'EX', ttlSeconds);
  }

  async getCachedVectorMemory(conversationId) {
    const redis = this.getRedisClient();
    if (!redis) {
      return null;
    }
    const raw = await redis.get(this.getVectorCacheKey(conversationId));
    const metaRaw = await redis.get(this.getVectorMetaCacheKey(conversationId));
    if (!raw) {
      return { items: [], meta: metaRaw ? JSON.parse(metaRaw) : null };
    }
    let items = [];
    try {
      items = JSON.parse(raw) || [];
    } catch {
      items = [];
    }
    let meta = null;
    if (metaRaw) {
      try {
        meta = JSON.parse(metaRaw);
      } catch {
        meta = null;
      }
    }
    return { items, meta };
  }

  async setCachedVectorMemory(conversationId, items, meta) {
    const redis = this.getRedisClient();
    if (!redis) {
      return;
    }
    const ttlSeconds = 7 * 24 * 60 * 60;
    await redis.set(this.getVectorCacheKey(conversationId), JSON.stringify(items || []), 'EX', ttlSeconds);
    await redis.set(this.getVectorMetaCacheKey(conversationId), JSON.stringify(meta || {}), 'EX', ttlSeconds);
  }

  async getConversationMessages(conversationId) {
    const { ctx } = this;
    const messages = await ctx.model.Message.findAll({
      where: { conversationId: Number(conversationId) },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'role', 'content', 'createdAt'],
    });
    return messages || [];
  }

  cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      const y = b[i];
      dot += x * y;
      normA += x * x;
      normB += y * y;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  truncateText(text, maxLen) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    const trimmed = text.trim();
    if (trimmed.length <= maxLen) {
      return trimmed;
    }
    return trimmed.slice(0, maxLen) + '...';
  }

  async embedPrompt(prompt) {
    const memoryConfig = this.getMemoryConfig();
    const client = this.getClient();
    const model = memoryConfig.embeddingModel;

    const response = await client.embeddings({
      model,
      prompt,
    });

    if (!response || !Array.isArray(response.embedding)) {
      throw new Error(`Ollama embeddings 响应格式错误: ${JSON.stringify(response)}`);
    }

    return response.embedding;
  }

  async ensureVectorMemoryUpdated(conversationId, allMessages) {
    const memoryConfig = this.getMemoryConfig();
    const vectorMaxItems = Math.max(1, memoryConfig.vectorMaxItems);
    const cached = await this.getCachedVectorMemory(conversationId);
    const items = Array.isArray(cached?.items) ? cached.items : [];
    const lastEmbeddedId = cached?.meta?.lastEmbeddedId || 0;

    const candidates = (allMessages || []).filter((m) => m.role === 'user' && m.id > lastEmbeddedId);
    if (candidates.length === 0) {
      return { items, lastEmbeddedId };
    }

    let newLastId = lastEmbeddedId;
    for (const m of candidates) {
      const content = this.truncateText(m.content, 800);
      if (!content) {
        newLastId = Math.max(newLastId, m.id);
        continue;
      }
      const embedding = await this.embedPrompt(content);
      items.push({
        id: m.id,
        text: content,
        embedding,
      });
      newLastId = Math.max(newLastId, m.id);
    }

    const trimmed = items.slice(-vectorMaxItems);
    await this.setCachedVectorMemory(conversationId, trimmed, { lastEmbeddedId: newLastId });
    return { items: trimmed, lastEmbeddedId: newLastId };
  }

  async retrieveVectorMemory(conversationId, query) {
    const memoryConfig = this.getMemoryConfig();
    const vectorTopK = Math.max(1, memoryConfig.vectorTopK);
    const vectorMinScore = Number.isFinite(memoryConfig.vectorMinScore) ? memoryConfig.vectorMinScore : 0.25;

    const cached = await this.getCachedVectorMemory(conversationId);
    const items = Array.isArray(cached?.items) ? cached.items : [];
    if (items.length === 0) {
      return [];
    }

    const q = this.truncateText(query, 800);
    if (!q) {
      return [];
    }

    const queryEmbedding = await this.embedPrompt(q);
    const scored = items
      .map((it) => ({
        text: it.text,
        score: this.cosineSimilarity(queryEmbedding, it.embedding),
      }))
      .filter((x) => x.score >= vectorMinScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, vectorTopK);

    return scored.map((x) => x.text);
  }

  async buildSummary(conversationId, messagesToSummarize, previousSummary) {
    const memoryConfig = this.getMemoryConfig();
    const client = this.getClient();
    const model = memoryConfig.summaryModel;

    const transcript = messagesToSummarize.map((m) => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`).join('\n');

    const system = [
      '你是对话记忆压缩器，请将对话内容压缩成可用于后续对话的“记忆摘要”。',
      '要求：只保留关键信息（用户偏好/身份信息/目标/约束/结论/待办），用中文，尽量短。',
      '不要输出<think>标签，不要输出无关内容。',
    ].join('\n');

    const promptParts = [];
    if (previousSummary) {
      promptParts.push(`已有摘要：\n${previousSummary}`);
    }
    promptParts.push(`需要总结的对话片段：\n${transcript}`);

    const response = await client.chat({
      model,
      think: false,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: promptParts.join('\n\n') },
      ],
      options: {
        temperature: 0.2,
        num_predict: 512,
      },
    });

    if (!response || !response.message || !response.message.content) {
      throw new Error(`Ollama 摘要响应格式错误: ${JSON.stringify(response)}`);
    }

    return this.removeThinkTags(response.message.content);
  }

  async buildMemoryMessages(conversationId, userMessages) {
    const memoryConfig = this.getMemoryConfig();
    if (!memoryConfig.enable) {
      return userMessages;
    }

    const allMessages = await this.getConversationMessages(conversationId);
    if (!allMessages.length) {
      return userMessages;
    }

    const maxHistoryLength = Math.max(1, memoryConfig.maxHistoryLength);

    const keepStartIndex = Math.max(0, allMessages.length - maxHistoryLength);
    const olderMessages = allMessages.slice(0, keepStartIndex);
    const recentMessages = allMessages.slice(keepStartIndex);

    const messagesForChat = [];

    if (memoryConfig.type === 'summary') {
      const cached = await this.getCachedSummary(conversationId);
      const cachedSummary = cached?.summary || '';
      const lastSummarizedId = cached?.meta?.lastSummarizedId || 0;

      let summaryToUse = cachedSummary;
      const summaryThreshold = Math.max(1, memoryConfig.summaryThreshold);
      const incremental = allMessages.filter((m) => m.id > lastSummarizedId);
      if (incremental.length >= summaryThreshold || (!summaryToUse && allMessages.length > 0)) {
        const target = incremental.length > 0 ? incremental : allMessages;
        const newSummary = await this.buildSummary(conversationId, target, summaryToUse);
        const newLastId = target[target.length - 1].id;
        summaryToUse = newSummary;
        await this.setCachedSummary(conversationId, summaryToUse, { lastSummarizedId: newLastId });
      }

      if (summaryToUse) {
        messagesForChat.push({
          role: 'system',
          content: `对话记忆摘要：\n${summaryToUse}`,
        });
      }
    }

    if (memoryConfig.type === 'vector') {
      await this.ensureVectorMemoryUpdated(conversationId, olderMessages.concat(recentMessages));
      const query = userMessages && userMessages.length ? userMessages[userMessages.length - 1].content : '';
      const recalled = await this.retrieveVectorMemory(conversationId, query);
      if (recalled.length > 0) {
        const content = recalled.map((t) => `- ${this.truncateText(t, 200)}`).join('\n');
        messagesForChat.push({
          role: 'system',
          content: `相关记忆：\n${content}`,
        });
      }
    }

    const mappedRecent = recentMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    return messagesForChat.concat(mappedRecent).concat(userMessages);
  }

  async ollamaChat(messages, options = {}, context = null) {
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

    let finalMessages = requestMessages;
    const memoryConfig = this.getMemoryConfig();
    if (memoryConfig.enable && context && context.conversationId) {
      finalMessages = await this.buildMemoryMessages(context.conversationId, requestMessages);
    }

    const response = await client.chat({
      model,
      think: false,
      messages: finalMessages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 2000,
      },
    });

    if (response && response.message && typeof response.message.content === 'string') {
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
