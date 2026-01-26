# Project Context

## Purpose
zltadminweb 是一个基于 Egg.js 和 Vue 3 的企业级管理后台系统，提供用户管理、权限控制、菜单管理、系统配置等核心功能，并集成了基于 Ollama 的智能聊天机器人服务。

## Tech Stack

### 后端
- **框架**: Egg.js 3.32.0
- **数据库**: MySQL 5.7+
- **ORM**: Sequelize 6.37.1 + egg-sequelize 6.0.0
- **缓存**: Redis 6.0+ (支持单机和哨兵模式)
- **认证**: Session (基于 Cookie + Redis)
- **模板引擎**: egg-view-nunjucks 2.3.0
- **AI 服务**: Ollama (本地大语言模型)

### 前端
- **框架**: Vue 3.5.26 (Composition API)
- **构建工具**: Vite 5.4.21
- **路由**: Vue Router 4.4.5
- **状态管理**: Pinia 3.0.2
- **UI 组件**: Element Plus 2.13.0
- **HTTP 请求**: umi-request 1.4.0
- **类型系统**: TypeScript 5.4.5

### 开发工具
- **包管理**: pnpm 8.0.0+
- **代码规范**: ESLint + Prettier + Stylelint
- **Git 钩子**: Husky + lint-staged + commitlint
- **提交规范**: Conventional Commits

## Project Conventions

### Code Style
- **命名规范**:
  - 变量/函数: camelCase (`userName`, `getUserInfo`)
  - 常量: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
  - 组件: PascalCase (`UserList`, `OrderGoods`)
  - 文件名: kebab-case (`user-list.vue`) 或 camelCase (`userList.js`)
- **缩进**: 2 个空格（根据 .editorconfig）
- **行长度**: 不超过 120 字符
- **注释**: 使用中文注释，复杂逻辑需要行内说明
- **文件末尾**: 保留一个空行

### Architecture Patterns
- **后端分层架构**:
  - Controller: 处理 HTTP 请求/响应
  - Service: 业务逻辑层
  - Model: 数据模型层（Sequelize ORM）
  - Router: 路由配置
- **前端架构**:
  - 组件化开发（单文件组件）
  - 组合式 API (Composition API)
  - 服务层封装 API 调用
  - Pinia 管理全局状态
- **插件化设计**:
  - 自定义 Egg 插件（oauth, ollama）
  - 插件独立配置和依赖管理

### Testing Strategy
- 当前阶段: 手动测试为主
- 未来计划: 单元测试 + 集成测试
- 测试覆盖率目标: 80%+

### Git Workflow
- **分支策略**:
  - 主分支: `main`
  - 开发分支: `dev` 或 `develop`
  - 功能分支: `feature/功能名`
  - 修复分支: `fix/问题描述`
- **提交规范**:
  - 格式: `type: 描述`
  - 类型: `feat`（新功能）、`fix`（修复）、`docs`、`style`、`refactor`、`test`、`chore`
  - 使用 `npm run commit` 进行规范化提交
  - 提交前自动执行 lint-staged 检查

## Domain Context

### 核心功能模块
1. **用户管理**: 用户注册、登录、信息管理
2. **权限控制**: 基于角色的访问控制（RBAC）
3. **菜单管理**: 动态菜单配置和权限绑定
4. **系统配置**: 系统参数和外部系统配置
5. **聊天机器人**: 基于 Ollama 的智能对话服务

### 数据模型
- **users**: 用户表
- **roles**: 角色表
- **userRoles**: 用户角色关联表
- **menus**: 菜单表
- **systems**: 系统配置表
- **conversations**: 聊天会话表
- **messages**: 聊天消息表

### 认证机制
- 基于 Session 的认证（存储在 Redis）
- OAuth 中间件进行权限验证
- 白名单机制（登录、注册等公开接口）

### AI 服务集成
- 使用 Ollama 本地大语言模型
- 支持上下文记忆和摘要优化
- 自动降级机制（API 失败时使用规则回复）
- 支持多种模型切换（llama3, qwen2.5 等）

## Important Constraints

### 技术约束
- Node.js >= 18.0.0
- MySQL >= 5.7
- Redis >= 6.0（支持哨兵模式）
- 必须使用 pnpm 作为包管理器
- 代码必须通过 ESLint、Prettier、Stylelint 检查

### 业务约束
- Session 密钥固定（用于父子系统 cookie 共享）
- 数据库时区设置为 +08:00
- Session 最大存活时间: 40 秒（可配置）
- Redis 支持单机和哨兵两种部署模式

### 安全约束
- 所有 API 接口默认需要 OAuth 认证
- 敏感接口需要角色权限验证
- 使用加密 Session（encrypt: true）
- 支持 CORS 配置

## External Dependencies

### 核心服务
- **MySQL**: 主数据库，存储业务数据
- **Redis**: 
  - Session 存储
  - 缓存服务
  - Ollama 记忆摘要缓存
- **Ollama**: 本地 AI 服务（可选）
  - 默认地址: `http://localhost:11434`
  - 环境变量: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_ENABLED`

### 外部库依赖
- **@zlt/zlt-admin-client**: 本地链接的共享库
- **bcryptjs**: 密码加密
- **dayjs**: 日期处理
- **lodash**: 工具函数库
- **axios**: HTTP 客户端

### 开发依赖
- **fabric**: 自定义代码规范配置
- **concurrently**: 并发运行多个命令
- **vue-tsc**: Vue TypeScript 类型检查
