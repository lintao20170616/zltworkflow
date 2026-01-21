## 技术栈

### 后端
- **框架**: Egg.js 3.32.0
- **数据库**: MySQL
- **ORM**: Sequelize 6.37.1 + egg-sequelize 6.0.0
- **认证**: Session（基于 Cookie）
- **模板引擎**: egg-view-nunjucks 2.3.0

### 前端
- **框架**: Vue 3.5.26
- **构建工具**: Vite 5.4.21
- **路由**: Vue Router 4.4.5
- **状态管理**: Pinia 3.0.2
- **UI 组件**: Element Plus 2.13.0
- **HTTP 请求**: umi-request 1.4.0

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐使用 pnpm）
- MySQL >= 5.7
- Redis >= 6.0

## 项目结构

```
zltworkflow/
├── app/                    # Egg.js 后端应用
│   ├── controller/         # 控制器
│   ├── model/              # 数据模型
│   ├── service/            # 业务逻辑层
│   ├── router.js           # 路由配置
│   └── public/             # 静态资源（构建后的前端文件）
│   └── lib/                # 插件库
├── client/                 # 前端应用
│   └── spa/                # SPA 应用目录
│       └── apps/           # 多应用模块
│           └── default/    # 默认应用
│               ├── components/  # 组件
│               ├── views/       # 页面
│               ├── router/      # 路由
│               ├── service/     # API 服务
│               ├── store/       # Pinia 状态管理
│               ├── utils/       # 工具函数
│               └── styles/      # 样式文件
├── config/                 # 配置文件
├── database/               # 数据库脚本
├── scripts/                # 脚本文件
```