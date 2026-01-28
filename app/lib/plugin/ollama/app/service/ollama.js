const { Service } = require('egg');
const { Ollama } = require('ollama');
const axios = require('axios');

class OllamaService extends Service {
  constructor(ctx) {
    super(ctx);
    this._client = null;
    this._deepseekClient = null;
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

  getDeepSeekClient() {
    if (this._deepseekClient) {
      return this._deepseekClient;
    }

    const config = this.ctx.app.config.ollama || {};
    const deepseekConfig = config.deepseek || {};
    const baseURL = deepseekConfig.baseUrl || 'https://api.deepseek.com';
    const apiKey = deepseekConfig.apiKey || 'sk-b9124171e4de4b1f9c4511b9710ba883';

    this._deepseekClient = axios.create({
      baseURL,
      timeout: deepseekConfig.timeout || 60000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return this._deepseekClient;
  }

  getModel() {
    const config = this.ctx.app.config.ollama || {};
    const mode = config.mode;

    if (mode === 'deepseek') {
      const deepseekConfig = config.deepseek || {};
      return deepseekConfig.model || 'deepseek-chat';
    }

    return config.model || 'deepseek-chat';
  }

  getMode() {
    const config = this.ctx.app.config.ollama || {};
    return config.mode || 'local';
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

  getRecentCacheKey(conversationId) {
    return `ollama:ctx:recent:${conversationId}`;
  }

  getRecentMetaCacheKey(conversationId) {
    return `ollama:ctx:recent_meta:${conversationId}`;
  }

  async clearConversationCache(conversationId) {
    const redis = this.getRedisClient();
    if (!redis) {
      return;
    }

    const id = Number(conversationId);
    await redis.del(
      this.getSummaryCacheKey(id),
      this.getSummaryMetaCacheKey(id),
      this.getVectorCacheKey(id),
      this.getVectorMetaCacheKey(id),
      this.getRecentCacheKey(id),
      this.getRecentMetaCacheKey(id),
    );
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

  async getCachedRecent(conversationId) {
    const redis = this.getRedisClient();
    if (!redis) {
      return null;
    }

    const memoryConfig = this.getMemoryConfig();
    const maxHistoryLength = Math.max(1, memoryConfig.maxHistoryLength);

    const rawList = await redis.lrange(this.getRecentCacheKey(conversationId), -maxHistoryLength, -1);
    const metaRaw = await redis.get(this.getRecentMetaCacheKey(conversationId));

    let meta = null;
    if (metaRaw) {
      try {
        meta = JSON.parse(metaRaw);
      } catch {
        meta = null;
      }
    }

    const messages = (rawList || [])
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));

    return { messages, meta };
  }

  async rebuildRecentCacheFromDb(conversationId) {
    const { ctx } = this;
    const redis = this.getRedisClient();
    if (!redis) {
      return null;
    }

    const memoryConfig = this.getMemoryConfig();
    const maxHistoryLength = Math.max(1, memoryConfig.maxHistoryLength);

    const rows = await ctx.model.Message.findAll({
      where: { conversationId: Number(conversationId) },
      order: [['id', 'DESC']],
      limit: maxHistoryLength,
      attributes: ['id', 'role', 'content'],
    });

    const ordered = (rows || []).slice().reverse();
    const listPayload = ordered.map((m) =>
      JSON.stringify({
        id: m.id,
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }),
    );

    const key = this.getRecentCacheKey(conversationId);
    const metaKey = this.getRecentMetaCacheKey(conversationId);
    const ttlSeconds = 7 * 24 * 60 * 60;

    await redis.del(key);
    if (listPayload.length > 0) {
      await redis.rpush(key, ...listPayload);
      await redis.expire(key, ttlSeconds);
    }

    const minId = ordered.length > 0 ? ordered[0].id : null;
    const maxId = ordered.length > 0 ? ordered[ordered.length - 1].id : null;
    const meta = { minId, maxId, hasOlder: false };
    await redis.set(metaKey, JSON.stringify(meta), 'EX', ttlSeconds);

    return { messages: ordered.map((m) => ({ id: m.id, role: m.role === 'user' ? 'user' : 'assistant', content: m.content })), meta };
  }

  async appendRecentMessages(conversationId, newMessages) {
    const redis = this.getRedisClient();
    if (!redis) {
      return;
    }

    const id = Number(conversationId);
    const memoryConfig = this.getMemoryConfig();
    const maxHistoryLength = Math.max(1, memoryConfig.maxHistoryLength);

    const key = this.getRecentCacheKey(id);
    const metaKey = this.getRecentMetaCacheKey(id);
    const ttlSeconds = 7 * 24 * 60 * 60;

    const beforeLen = await redis.llen(key);

    const payload = (newMessages || []).map((m) =>
      JSON.stringify({
        id: m.id,
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }),
    );

    if (payload.length > 0) {
      const multi = redis.multi();
      multi.rpush(key, ...payload);
      multi.ltrim(key, -maxHistoryLength, -1);
      multi.expire(key, ttlSeconds);
      await multi.exec();
    }

    const first = await redis.lindex(key, 0);
    const last = await redis.lindex(key, -1);

    let minId = null;
    let maxId = null;
    if (first) {
      try {
        minId = JSON.parse(first).id;
      } catch {}
    }
    if (last) {
      try {
        maxId = JSON.parse(last).id;
      } catch {}
    }

    const hasOlder = beforeLen >= maxHistoryLength;
    await redis.set(metaKey, JSON.stringify({ minId, maxId, hasOlder }), 'EX', ttlSeconds);
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
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'role', 'content', 'createdAt'],
    });
    return (messages || []).slice().reverse();
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
    const mode = this.getMode();

    if (mode === 'deepseek') {
      throw new Error('DeepSeek API 模式不支持向量记忆功能，请使用本地 Ollama 模式或关闭向量记忆');
    }

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
    const mode = this.getMode();

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

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: promptParts.join('\n\n') },
    ];

    if (mode === 'deepseek') {
      const response = await this.deepseekChat(messages, {
        temperature: 0.2,
        maxTokens: 512,
      });
      return response.content;
    }

    const client = this.getClient();
    const model = memoryConfig.summaryModel;

    const response = await client.chat({
      model,
      think: false,
      stream: false,
      messages,
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

    const messagesForChat = [];
    let recent = await this.getCachedRecent(conversationId);
    if (!recent || !Array.isArray(recent.messages)) {
      recent = await this.rebuildRecentCacheFromDb(conversationId);
    }
    const recentMessages = recent?.messages || [];
    const recentMeta = recent?.meta || {};

    if (memoryConfig.type === 'summary') {
      const cached = await this.getCachedSummary(conversationId);
      const cachedSummary = cached?.summary || '';
      const lastSummarizedId = cached?.meta?.lastSummarizedId || 0;

      let summaryToUse = cachedSummary;
      const summaryThreshold = Math.max(1, memoryConfig.summaryThreshold);
      const minCachedId = Number(recentMeta?.minId || 0);
      const hasOlder = !!recentMeta?.hasOlder;

      if (hasOlder && minCachedId > 0) {
        const { ctx } = this;
        const Op = ctx.app.Sequelize.Op;
        const incremental = await ctx.model.Message.findAll({
          where: {
            conversationId: Number(conversationId),
            id: { [Op.gt]: Number(lastSummarizedId), [Op.lt]: minCachedId },
          },
          order: [['id', 'ASC']],
          limit: 50,
          attributes: ['id', 'role', 'content'],
        });

        if (incremental.length >= summaryThreshold || (!summaryToUse && incremental.length > 0)) {
          const target = incremental.map((m) => ({ id: m.id, role: m.role, content: m.content }));
          const newSummary = await this.buildSummary(conversationId, target, summaryToUse);
          const newLastId = target[target.length - 1].id;
          summaryToUse = newSummary;
          await this.setCachedSummary(conversationId, summaryToUse, { lastSummarizedId: newLastId });
        }
      }

      if (summaryToUse) {
        messagesForChat.push({
          role: 'system',
          content: `对话记忆摘要：\n${summaryToUse}`,
        });
      }
    }

    return messagesForChat.concat(recentMessages).concat(userMessages);
  }

  async deepseekChat(messages, options = {}) {
    const deepseekClient = this.getDeepSeekClient();
    const model = this.getModel();
    const config = this.ctx.app.config.ollama || {};
    const deepseekConfig = config.deepseek || {};

    if (!deepseekConfig.apiKey) {
      throw new Error('DeepSeek API Key 未配置');
    }

    const requestMessages = (messages || []).map((msg) => {
      const role = msg?.role === 'user' ? 'user' : msg?.role === 'system' ? 'system' : 'assistant';
      return {
        role,
        content: msg?.content ?? '',
      };
    });

    try {
      const response = await deepseekClient.post('/chat/completions', {
        model,
        messages: requestMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        stream: false,
      });

      if (response && response.data && response.data.choices && response.data.choices.length > 0) {
        const choice = response.data.choices[0];
        if (choice.message && choice.message.content) {
          return {
            content: choice.message.content.trim(),
            model: response.data.model || model,
            done: true,
          };
        }
      }

      throw new Error(`DeepSeek API 响应格式错误: ${JSON.stringify(response.data)}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        throw new Error(`DeepSeek API 请求失败 (${status}): ${data?.error?.message || JSON.stringify(data)}`);
      }
      throw new Error(`DeepSeek API 请求失败: ${error.message}`);
    }
  }

  async ollamaChat(messages, options = {}, context = null) {
    if (!this.isEnabled()) {
      throw new Error('Ollama 未启用');
    }

    const mode = this.getMode();
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

    if (mode === 'deepseek') {
      return await this.deepseekChat(finalMessages, options);
    }

    const client = this.getClient();
    const model = this.getModel();

    const response = await client.chat({
      model,
      think: false,
      messages: finalMessages,
      stream: false,
      options: {
        num_ctx: 2048,
        num_thread: 8,
        temperature: options.temperature ?? 0.1,
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

    const mode = this.getMode();

    if (mode === 'deepseek') {
      try {
        const deepseekClient = this.getDeepSeekClient();
        const config = this.ctx.app.config.ollama || {};
        const deepseekConfig = config.deepseek || {};

        if (!deepseekConfig.apiKey) {
          return false;
        }

        await deepseekClient.get('/v1/models');
        return true;
      } catch (error) {
        return false;
      }
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
