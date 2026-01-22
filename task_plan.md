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
- [ ] 阶段 5: 测试和优化
  - [ ] 测试 API 调用
  - [ ] 测试上下文传递
  - [ ] 测试降级机制
  - [ ] 优化性能和错误处理
- [ ] 阶段 6: 记忆功能与 token 优化（Ollama 插件）
  - [ ] 记忆策略落地：摘要记忆（summary）
  - [ ] 摘要生成与缓存（按 conversationId）
  - [ ] 上下文拼接：summary + 最近 N 条消息
  - [ ] token 优化：限制历史条数、限制摘要输入、限制输出 num_predict
  - [ ] 端到端验证：sendMessage/test-ollama

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
**当前处于阶段 6** - 在 Ollama 插件中实现记忆（summary）与 token 优化

## 配置说明
需要在环境变量中配置：
- OLLAMA_BASE_URL: Ollama 服务地址（默认 `http://localhost:11434`）
- OLLAMA_MODEL: 使用的模型名称（默认 `llama3`）
- OLLAMA_ENABLED: 设置为 `true` 启用 Ollama AI（默认 `false`，使用规则回复）
- OLLAMA_TIMEOUT: 请求超时时间（毫秒，默认 `30000`）

## 前置条件
1. 确保 Ollama 已安装并运行：`ollama serve`
2. 确保已下载所需模型：`ollama pull llama3` 或 `ollama pull qwen2.5`
