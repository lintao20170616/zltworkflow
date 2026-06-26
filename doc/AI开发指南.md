# ZLT Workflow - AI 开发指南

## 📖 快速导航

本文档是 AI 辅助开发的核心指南，帮助 AI 快速理解项目架构、业务逻辑和开发规范。

**目标读者**: AI 助手、新开发人员、代码审查者  
**更新时间**: 2026-06-26

---

## 🏗️ 项目架构概览

### 技术栈

- **后端**: Egg.js 3.32.0 + Sequelize 6.37.1 + MySQL + Redis
- **前端**: Vue 3.5.26 + TypeScript + Vite + Element Plus + Pinia
- **AI 服务**: Ollama (本地 LLM) + DeepSeek API (可选)
- **开发工具**: ESLint + Prettier + Stylelint + Husky + pnpm

### 项目特点

- 🚀 前后端分离，MVC 架构
- 🔐 Session 认证 + RBAC 权限控制
- 🤖 集成本地 AI 对话服务（Ollama）
- 🌐 多语言支持 + 翻译平台
- 📝 低代码页面构建工具
- 📚 OpenSpec 规范驱动开发

---

## 📂 目录结构导航

### 后端核心目录

```
app/
├── controller/        # 控制器层 (9个文件)
│   ├── chatbot.js     # 聊天机器人接口
│   ├── language.js    # 语言管理
│   ├── menu.js        # 菜单管理
│   ├── pages.js       # 页面渲染
│   ├── system.js      # 系统配置
│   ├── translation.js # 翻译内容管理
│   ├── translationProject.js # 翻译项目管理
│   ├── translationTask.js    # 翻译任务管理
│   └── user.js        # 用户管理
├── service/           # 业务逻辑层 (9个文件)
├── model/             # 数据模型层 (11个文件)
└── lib/plugin/        # 自定义插件
    ├── oauth/         # OAuth认证中间件
    └── ollama/        # Ollama AI服务
```

### 前端核心目录

```
client/spa/apps/default/
├── views/             # 页面视图 (11个模块)
├── components/        # 通用组件
│   └── lowcode/       # 低代码组件 (8个)
├── service/           # API服务封装
├── store/             # Pinia状态管理
├── router/            # 路由配置
├── i18n/              # 国际化配置
└── styles/            # 样式文件
```

### 配置和文档

```
├── config/            # 配置文件
├── database/          # 数据库迁移脚本
├── openspec/          # OpenSpec规范管理
├── doc/               # 项目文档
└── fabric/            # 代码规范配置
```

---

## 🔑 核心业务流程

### 用户登录流程

1. 前端调用 `POST /api/user/login`，传 username 和 password
2. UserController.login 接收请求
3. 调用 UserService.validateUser 验证用户
4. 验证通过后，将用户信息存入 Session: `ctx.session.user = {...}`
5. Session 存储在 Redis 中（支持哨兵模式）
6. 返回用户信息，前端存储到 Pinia userStore

### 认证机制

- **中间件**: oauth 中间件 (app/lib/plugin/oauth/app/middleware/oauth.js)
- **白名单**: 登录、注册等公开接口在配置的白名单中
- **Session 验证**: 其他接口自动验证 Session 是否存在
- **错误处理**: 401 状态码表示未认证

### 聊天机器人流程

1. 用户发送消息到 `POST /api/chatbot/send`
2. ChatbotService.sendMessage 处理逻辑：
   - 创建用户消息记录
   - 调用 OllamaService.ollamaChat 生成回复
   - 支持记忆摘要和上下文优化
   - 创建机器人消息记录
   - 自动更新会话标题
3. 支持降级机制：Ollama 失败时使用规则回复

### 翻译平台流程

1. 创建翻译项目：`POST /api/translation/projects`
2. 添加翻译内容：`POST /api/translation/contents`
3. AI 自动翻译：`POST /api/translation/contents/:id/translate-with-ai`
4. 创建翻译任务：`POST /api/translation/tasks`
5. 任务回填：`POST /api/translation/tasks/:id/backfill`

---

## 🎯 AI 辅助开发要点

### 代码编写原则

1. **遵循现有模式**: 优先参考现有代码的实现方式
2. **分层清晰**: Controller → Service → Model 三层分离
3. **错误处理**: 使用 try-catch，记录日志，返回标准格式
4. **类型安全**: 前端使用 TypeScript，后端使用 Sequelize 验证
5. **注释规范**: 复杂逻辑使用中文注释说明

### 常见任务模式

#### 新增 Controller

```javascript
const Controller = require('egg').Controller;

class XxxController extends Controller {
  async actionName() {
    const { ctx } = this;
    const { param1, param2 } = ctx.request.body;

    if (!param1) {
      ctx.body = { code: 400, message: '参数错误', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.xxx.methodName(param1, param2);

      if (!result.success) {
        ctx.body = { code: 500, message: result.message, data: null };
        ctx.status = 500;
        return;
      }

      ctx.body = {
        code: 0,
        message: 'success',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[XxxController] actionName error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = XxxController;
```

#### 新增 Service

```javascript
const { Service } = require('egg');

class XxxService extends Service {
  async methodName(param1, param2) {
    const { ctx } = this;
    try {
      const data = await ctx.model.ModelName.findOne({
        where: { key: param1 },
      });

      return { success: true, data };
    } catch (error) {
      ctx.logger.error('[XxxService] methodName error:', error);
      return { success: false, message: '操作失败' };
    }
  }
}

module.exports = XxxService;
```

#### 新增 Model

```javascript
'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const ModelName = app.model.define(
    'ModelName',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID',
      },
      name: {
        type: STRING(100),
        allowNull: false,
        comment: '名称',
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        field: 'created_at',
        comment: '创建时间',
        defaultValue: app.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        field: 'updated_at',
        comment: '更新时间',
        defaultValue: app.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      tableName: 'table_name',
      timestamps: true,
      underscored: false,
    },
  );

  return ModelName;
};
```

#### 前端 Service 封装

```typescript
import http from '../utils/http';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const xxxApi = {
  getList: async (params: Record<string, unknown>) => {
    return await http.api.get<ApiResponse<unknown[]>>('/xxx/list', { params });
  },

  create: async (data: Record<string, unknown>) => {
    return await http.api.post<ApiResponse<unknown>>('/xxx', data);
  },

  update: async (id: number, data: Record<string, unknown>) => {
    return await http.api.put<ApiResponse<unknown>>(`/xxx/${id}`, data);
  },

  delete: async (id: number) => {
    return await http.api.delete<ApiResponse<void>>(`/xxx/${id}`);
  },
};
```

### 数据库变更流程

1. 在 `database/migrations/` 目录创建新的 SQL 文件
2. 命名格式：`序号_描述.sql`，如 `008_create_xxx_table.sql`
3. 编写 DDL 语句（CREATE TABLE、ALTER TABLE 等）
4. 执行迁移：`npm run migrate`
5. 在 OpenSpec 中记录变更（如果有相关规范）

### 路由注册流程

1. 在 `app/router.js` 中添加路由
2. 遵循 RESTful 规范：GET/POST/PUT/DELETE/PATCH
3. 路径格式：`/api/resource/sub-resource/:id`
4. 指定对应的 Controller 方法

---

## 🔍 调试和测试

### 后端调试

- 日志文件：`logs/` 目录
- 日志级别：在 `config/config.default.js` 中配置
- 错误日志：`common-error.log`

### 前端调试

- 浏览器开发者工具
- Network 面板查看 API 请求
- Console 查看错误信息
- Vue DevTools 查看组件状态

### 常见问题排查

1. **401 错误**: Session 过期，重新登录
2. **500 错误**: 查看后端日志，定位具体错误
3. **数据库连接失败**: 检查 `config/config.default.js` 中数据库配置
4. **Redis 连接失败**: 检查 Redis 是否启动，配置是否正确

---

## 📚 相关文档

- [项目 README](../README.md)
- [业务逻辑详解](./业务逻辑详解.md)
- [后端开发规范](./后端开发规范.md)
- [前端开发规范](./前端开发规范.md)
- [数据模型文档](./数据模型文档.md)
- [项目分析报告](./项目分析报告.md)
- [OpenSpec 规范](../openspec/project.md)

---

## 🤖 AI 使用建议

### 如何让 AI 更好地理解项目

1. 提供具体的文件路径和代码片段
2. 说明业务背景和需求
3. 引用现有的相似实现作为参考
4. 明确技术约束和规范要求

### 常用 AI 辅助开发场景

- 🔹 **代码生成**: "参考 `user.js` 的 login 方法，创建一个新的 controller 方法"
- 🔹 **代码审查**: "请审查 `chatbot.js` 的代码质量和安全性"
- 🔹 **错误排查**: "查看日志文件，分析为什么会报错"
- 🔹 **功能扩展**: "基于现有的翻译平台，添加批量导入功能"
- 🔹 **优化建议**: "分析 `ollama.js` 的性能优化空间"

### AI 辅助开发最佳实践

1. **逐步引导**: 从简单任务开始，逐步增加复杂度
2. **明确目标**: 清晰描述要实现的功能和预期效果
3. **提供上下文**: 给出相关的代码、文档和业务背景
4. **验证结果**: 让 AI 先提供方案，再实施，最后验证
5. **迭代优化**: 根据反馈不断调整和优化

---

## 📞 快速联系

- **项目仓库**: [https://github.com/lintao20170616/zltworkflow](https://github.com/lintao20170616/zltworkflow)
- **问题反馈**: [Issues](https://github.com/lintao20170616/zltworkflow/issues)

---

**记住**: AI 是你的助手，最终决策和代码质量责任由开发者承担。充分利用 AI 的能力，提高开发效率，但保持对代码的理解和掌控。
