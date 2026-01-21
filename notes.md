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
- 方案2: 使用本地模型（如 Ollama）
- 方案3: 使用规则回复（简单实现，用于演示）

**当前选择**: 先实现方案3（规则回复），后续可扩展为方案1或2

## 实现步骤

1. 创建数据模型（Conversation, Message）
2. 创建 Service 层（chatbot service）
3. 创建 Controller 层（chatbot controller）
4. 添加路由配置
5. 实现简单的回复逻辑（后续可替换为AI服务）
