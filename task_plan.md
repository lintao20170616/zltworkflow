# 任务计划：集成 Ollama 本地模型

## 目标
将聊天机器人的规则回复替换为 Ollama 本地模型，实现真正的 AI 对话能力，适合本地测试环境。

## 阶段
- [x] 阶段 1: 研究和准备
  - [x] 了解 Ollama API 接口格式
  - [x] 确定使用的模型（如 llama3、qwen 等）
  - [x] 研究 API 调用方式（HTTP 请求格式）
  - [x] 确认 Ollama 服务运行状态检查方法
- [x] 阶段 2: 创建 Ollama 服务模块
  - [x] 创建 Ollama 服务类（lib/ai/ollama.js）
  - [x] 实现 API 调用封装
  - [x] 实现错误处理和降级机制
  - [x] 实现上下文管理（消息格式转换）
- [x] 阶段 3: 集成到聊天服务
  - [x] 修改 generateBotResponse 方法
  - [x] 替换规则回复为 Ollama API 调用
  - [x] 处理 API 响应和错误
  - [x] 实现服务可用性检查
- [x] 阶段 4: 配置管理
  - [x] 添加环境变量配置
  - [x] 添加配置文件支持
  - [x] 实现配置验证
  - [x] 支持模型选择配置
- [x] 阶段 5: 测试和优化
  - [x] 测试 API 调用（已实现 testOllama 接口）
  - [x] 测试上下文传递（已集成到 sendMessage）
  - [x] 测试降级机制（已实现错误处理和降级）
  - [x] 优化性能和错误处理（基本完成，可继续优化）
- [x] 阶段 6: 记忆功能与 token 优化（Ollama 插件）
  - [x] 记忆策略落地：摘要记忆（summary）
  - [x] 摘要生成与缓存（按 conversationId，使用 Redis）
  - [x] 上下文拼接：summary + 最近 N 条消息
  - [x] token 优化：限制历史条数、限制摘要输入、限制输出 num_predict
  - [x] 端到端验证：sendMessage/test-ollama
  - [x] 向量记忆支持（已实现，可通过配置切换）
  - [x] Redis 缓存管理（摘要、向量、最近消息）

## 关键问题
1. Ollama API 的接入方式是什么？
   - 通过 HTTP 请求 `http://localhost:11434/api/chat`
2. 需要哪些配置信息？
   - Ollama 服务地址（默认 localhost:11434）
   - 模型名称（如 llama3、qwen2.5 等）
3. API 的请求格式和响应格式是什么？
   - 请求：POST，JSON 格式，包含 model、messages 等
   - 响应：JSON 格式，包含 message.content
4. 如何传递对话上下文？
   - 传递最近的消息列表作为 messages 数组
5. 如何处理服务不可用的情况？
   - 实现服务健康检查
   - API 失败时自动降级到规则回复

## 已做决策
- 使用 Ollama 本地模型（适合本地测试）
- 保留现有的消息存储和会话管理逻辑
- 只替换 generateBotResponse 方法中的回复生成部分
- 实现降级机制：Ollama 服务不可用时使用规则回复
- 使用 `/api/chat` 接口（更适合多轮对话）

## 遇到的错误
- （待记录）

## 状态
**已完成所有阶段** - Ollama 集成和记忆功能已全部实现

### 已完成功能
1. ✅ Ollama 服务集成（支持本地模型调用）
2. ✅ 摘要记忆（summary）功能
3. ✅ 向量记忆（vector）功能（可选）
4. ✅ Redis 缓存管理（摘要、向量、最近消息）
5. ✅ 上下文管理（自动拼接摘要和最近消息）
6. ✅ Token 优化（限制历史条数、摘要长度、输出长度）
7. ✅ 降级机制（Ollama 不可用时使用规则回复）
8. ✅ 测试接口（testOllama）

## 配置说明
需要在环境变量中配置：
- OLLAMA_BASE_URL: Ollama 服务地址（默认 `http://localhost:11434`）
- OLLAMA_MODEL: 使用的模型名称（默认 `deepseek-r1:7b`）
- OLLAMA_ENABLED: 设置为 `true` 启用 Ollama AI（默认 `false`，使用规则回复）
- OLLAMA_TIMEOUT: 请求超时时间（毫秒，默认 `30000`）

### 记忆功能配置（config.default.js）
- memory.enable: 是否启用记忆功能（默认 `true`）
- memory.type: 记忆类型，`summary`（摘要）或 `vector`（向量，默认 `summary`）
- memory.maxHistoryLength: 最大原始历史消息数（默认 `5`）
- memory.summaryThreshold: 触发摘要的消息数阈值（默认 `1`）
- memory.summaryModel: 用于生成摘要的模型（默认复用主模型）
- memory.embeddingModel: 用于向量化的模型（默认复用主模型）
- memory.vectorTopK: 向量检索返回的 top K 结果（默认 `3`）
- memory.vectorMaxItems: 向量记忆最大条目数（默认 `200`）
- memory.vectorMinScore: 向量相似度最小阈值（默认 `0.25`）

## 前置条件
1. 确保 Ollama 已安装并运行：`ollama serve`
2. 确保已下载所需模型：`ollama pull deepseek-r1:7b` 或其他支持的模型
3. 确保 Redis 服务已启动（用于记忆功能缓存）

## 后续优化方向
- [ ] 性能优化：批量处理、异步摘要生成
- [ ] 向量记忆优化：提升检索准确度
- [ ] 记忆策略优化：动态调整摘要阈值
- [ ] 监控和日志：添加详细的性能指标
- [ ] 流式响应支持：实现实时流式输出
