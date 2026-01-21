# 任务计划：创建后台框架和菜单系统

## 目标
在 `client/spa/apps/default/json` 目录下生成菜单 JSON 数据，使用 Element Plus 的 NavMenu 创建后台框架，包括仪表盘、用户信息、聊天机器人3个页面。

## 阶段
- [x] 阶段 1: 创建菜单 JSON 数据
  - [x] 创建 json 目录
  - [x] 创建菜单 JSON 数据文件
- [x] 阶段 2: 创建后台布局组件
  - [x] 创建 Layout 组件（使用 Element Plus NavMenu）
  - [x] 集成菜单 JSON 数据
  - [x] 实现侧边栏导航
- [x] 阶段 3: 创建页面组件
  - [x] 仪表盘页面（Dashboard）
  - [x] 用户信息页面（UserInfo）
  - [x] 聊天机器人页面（ChatBot）
- [x] 阶段 4: 更新路由配置
  - [x] 添加新页面路由
  - [x] 配置布局路由嵌套
- [ ] 阶段 5: 测试和验证
  - [ ] 验证菜单显示
  - [ ] 验证页面跳转
  - [ ] 验证布局响应式

## 关键问题
1. 菜单数据结构如何设计？✅ 已解决：使用 JSON 数组，包含 id、title、icon、path、name
2. 如何实现菜单与路由的映射？✅ 已解决：通过 route.name 和 menu.name 映射
3. 布局组件如何组织？✅ 已解决：使用嵌套路由，Layout 作为父路由

## 已做决策
- 使用 JSON 文件存储菜单配置
- 使用 Element Plus 的 el-menu 组件
- 采用后台管理常见的左右布局（侧边栏+主内容区）
- 使用 Element Plus 图标组件
- 实现侧边栏折叠功能

## 遇到的错误
- Layout 组件中 ArrowDown 图标名称错误，已修复为 ArrowDown

## 状态
**当前处于阶段 5** - 测试和验证，等待用户测试
