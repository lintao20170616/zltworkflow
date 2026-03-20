# ZLT Workflow

基于 Egg.js 和 Vue 3 的企业级管理后台系统，提供用户管理、权限控制、菜单管理、系统配置、国际化翻译等核心功能，并集成了基于 Ollama 的智能聊天机器人服务。

## 特性

- 🚀 **现代化技术栈**: Egg.js + Vue 3 + TypeScript + Vite
- 📦 **开箱即用**: 完整的后台管理系统解决方案
- 🔐 **权限管理**: 基于角色的访问控制（RBAC）
- 🌐 **国际化**: 内置 i18n 解决方案和翻译管理平台
- 🤖 **AI 集成**: 支持 Ollama 本地大语言模型
- 📝 **低代码**: 可视化页面构建工具
- 🎨 **代码规范**: ESLint + Prettier + Stylelint + Husky

## 技术栈

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

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL >= 5.7
- Redis >= 6.0
- Ollama (可选，用于 AI 功能)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lintao20170616/zltworkflow.git
cd zltworkflow
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境

复制配置文件并修改数据库和 Redis 连接信息：

```bash
cp config/config.local.js.example config/config.local.js
```

编辑 `config/config.local.js`，配置以下内容：

```javascript
module.exports = {
  sequelize: {
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'your_password',
    database: 'zltadmin',
  },
  redis: {
    client: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0,
    },
  },
};
```

### 4. 初始化数据库

```bash
# 执行数据库迁移脚本
npm run migrate
```

### 5. 启动开发服务器

```bash
# 同时启动前后端服务
npm run dev

# 或分别启动
npm run dev:server  # 后端服务 (端口 9080)
npm run dev:client  # 前端开发服务 (端口 3000)
```

### 6. 构建生产版本

```bash
npm run build
```

## 项目结构

```
zltworkflow/
├── app/                        # Egg.js 后端应用
│   ├── controller/             # 控制器
│   │   ├── chatbot.js          # 聊天机器人
│   │   ├── language.js         # 语言管理
│   │   ├── menu.js             # 菜单管理
│   │   ├── pages.js            # 页面渲染
│   │   ├── system.js           # 系统配置
│   │   ├── translation.js      # 翻译管理
│   │   └── user.js             # 用户管理
│   ├── model/                  # 数据模型
│   ├── service/                # 业务逻辑层
│   ├── lib/                    # 自定义插件
│   │   ├── oauth/              # OAuth 认证插件
│   │   └── ollama/             # Ollama AI 插件
│   ├── router.js               # 路由配置
│   └── public/                 # 静态资源（构建后）
├── client/                     # 前端应用
│   └── spa/                    # SPA 应用
│       ├── apps/               # 多应用模块
│       │   └── default/        # 默认应用
│       │       ├── components/ # 项目组件
│       │       ├── views/      # 页面视图
│       │       ├── router/     # 路由配置
│       │       ├── service/    # API 服务
│       │       ├── store/      # Pinia 状态管理
│       │       ├── i18n/       # 国际化配置
│       │       └── styles/     # 样式文件
│       └── utils/              # 全局工具函数
├── config/                     # 配置文件
│   ├── config.default.js       # 默认配置
│   ├── config.local.js         # 本地配置（不提交）
│   └── plugin.js               # 插件配置
├── database/                   # 数据库脚本
│   └── migrations/             # 迁移脚本
├── scripts/                    # 工具脚本
├── fabric/                     # 代码规范配置
├── openspec/                   # OpenSpec 规范文档
└── doc/                        # 项目文档
```

## 功能模块

### 用户管理

- 用户注册、登录、登出
- 用户信息管理
- 密码加密存储

### 权限控制

- 基于角色的访问控制（RBAC）
- OAuth 中间件验证
- 接口白名单机制

### 菜单管理

- 动态菜单配置
- 菜单权限绑定
- 多级菜单支持

### 国际化

- 多语言支持
- 翻译项目管理
- AI 辅助翻译
- 翻译任务管理

### 聊天机器人

- 基于 Ollama 的本地 AI 服务
- 上下文记忆和摘要优化
- 多模型切换支持

### 低代码平台

- 可视化页面构建
- 组件拖拽配置
- 属性面板编辑

## 常用命令

```bash
# 开发
npm run dev              # 同时启动前后端
npm run dev:server       # 仅启动后端
npm run dev:client       # 仅启动前端

# 构建
npm run build            # 构建前端

# 代码质量
npm run eslint           # ESLint 检查
npm run stylelint        # Stylelint 检查
npm run prettier         # Prettier 格式化
npm run type-check       # TypeScript 类型检查

# 数据库
npm run migrate          # 执行数据库迁移
npm run backup:db        # 备份数据库

# 国际化
npm run i18n:scan        # 扫描国际化文本
npm run i18n:push        # 推送翻译
npm run i18n:pull        # 拉取翻译
```

## 环境变量

| 变量名              | 说明               | 默认值                   |
| ------------------- | ------------------ | ------------------------ |
| `REDIS_SENTINELS`   | Redis 哨兵地址列表 | -                        |
| `REDIS_MASTER_NAME` | Redis 主节点名称   | `mymaster`               |
| `REDIS_PASSWORD`    | Redis 密码         | -                        |
| `OLLAMA_BASE_URL`   | Ollama 服务地址    | `http://localhost:11434` |
| `OLLAMA_MODEL`      | Ollama 模型名称    | `llama3`                 |
| `OLLAMA_ENABLED`    | 是否启用 Ollama    | `true`                   |

## 部署说明

### 生产环境配置

1. 修改 `config/config.default.js` 中的安全配置
2. 设置强密码和安全的 Session 密钥
3. 配置 Redis 哨兵模式（高可用）
4. 启用 HTTPS

### Docker 部署（示例）

```bash
# 构建镜像
docker build -t zltworkflow .

# 运行容器
docker run -d \
  -p 9080:9080 \
  -e REDIS_SENTINELS=host1:26379,host2:26379 \
  -e REDIS_MASTER_NAME=mymaster \
  zltworkflow
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 许可证

[ISC](LICENSE)

## 联系方式

- 作者: lintao20170616
- 项目地址: [https://github.com/lintao20170616/zltworkflow](https://github.com/lintao20170616/zltworkflow)
- 问题反馈: [Issues](https://github.com/lintao20170616/zltworkflow/issues)
