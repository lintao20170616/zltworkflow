# 聊天机器人服务端实现研究笔记

## 需求分析

### 前端需求
- 用户发送消息
- 接收机器人回复
- 显示对话历史
- 清空对话

### 功能设计

#### 1. 数据模型
- **会话表 (conversations)**
  - id: 会话ID
  - userId: 用户ID（关联users表）
  - title: 会话标题（可选，默认使用第一条消息）
  - createdAt: 创建时间
  - updatedAt: 更新时间

- **消息表 (messages)**
  - id: 消息ID
  - conversationId: 会话ID（关联conversations表）
  - role: 角色（user/bot）
  - content: 消息内容
  - createdAt: 创建时间

#### 2. API 接口设计
- `POST /api/chatbot/send` - 发送消息
  - 请求: { message: string, conversationId?: number }
  - 响应: { code, message, data: { message, conversationId } }

- `GET /api/chatbot/conversations` - 获取会话列表
  - 响应: { code, message, data: conversations[] }

- `GET /api/chatbot/messages/:conversationId` - 获取会话消息
  - 响应: { code, message, data: messages[] }

- `POST /api/chatbot/conversations` - 创建新会话
  - 响应: { code, message, data: { conversationId } }

- `DELETE /api/chatbot/conversations/:id` - 删除会话

#### 3. AI 回复方案
- 方案1: 使用 OpenAI API（需要API密钥）
- 方案2: 使用本地模型（如 Ollama）✅ **当前选择**
- 方案3: 使用规则回复（简单实现，用于演示）

**当前选择**: 集成方案2（Ollama本地模型），支持降级到方案3（规则回复）

## Ollama API 研究

### API 接入方式
1. **本地服务**
   - 默认地址: `http://localhost:11434`
   - 需要先启动 Ollama 服务: `ollama serve`
   - 需要先下载模型: `ollama pull <model-name>`

2. **API 端点**
   - 聊天接口: `POST /api/chat`
   - 生成接口: `POST /api/generate`（单次生成）
   - 模型列表: `GET /api/tags`

3. **请求格式（/api/chat）**
   ```json
   {
     "model": "llama3",
     "messages": [
       {"role": "user", "content": "你好"}
     ],
     "stream": false,
     "options": {
       "temperature": 0.7,
       "num_predict": 100
     }
   }
   ```

4. **响应格式**
   ```json
   {
     "model": "llama3",
     "created_at": "2024-01-01T00:00:00.000Z",
     "message": {
       "role": "assistant",
       "content": "你好！有什么可以帮助你的吗？"
     },
     "done": true
   }
   ```

5. **常用模型**
   - llama3: Meta 的 Llama 3 模型
   - qwen2.5: 阿里通义千问模型（中文友好）
   - mistral: Mistral AI 模型
   - gemma: Google Gemma 模型

### 实现步骤
1. 创建 Ollama 服务模块封装 API 调用
2. 实现消息格式转换（转换为 Ollama API 格式）
3. 实现上下文管理（传递历史消息）
4. 替换 generateBotResponse 方法
5. 实现服务健康检查和降级机制

## 实现步骤

1. ✅ 创建数据模型（Conversation, Message）
2. ✅ 创建 Service 层（chatbot service）
3. ✅ 创建 Controller 层（chatbot controller）
4. ✅ 添加路由配置
5. ✅ 实现简单的回复逻辑（规则回复）
6. 🔄 集成 Ollama API（进行中）

## Ollama 集成说明

### 配置方式
在环境变量中设置：
- `OLLAMA_BASE_URL`: Ollama 服务地址（默认 `http://localhost:11434`）
- `OLLAMA_MODEL`: 使用的模型名称（默认 `llama3`）
- `OLLAMA_ENABLED`: 设置为 `true` 启用（默认 `false`）

### 功能特点
- 支持上下文传递（最近20条消息）
- API 失败时自动降级到规则回复
- 本地运行，无需外部 API 密钥
- 支持流式响应（可选）
- 支持多种模型切换

### 前置条件
1. 安装 Ollama: https://ollama.ai/
2. 启动服务: `ollama serve`
3. 下载模型: `ollama pull llama3` 或 `ollama pull qwen2.5`
