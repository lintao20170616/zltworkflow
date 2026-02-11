# Change: 实施低代码页面构建工具方案

## Why

低代码页面构建工具当前完成度约 50%，基础设施（状态管理、属性配置、Schema 定义）已完备，但核心闭环未打通。存在「有脑无手」问题：画布无法接收拖拽、无法渲染组件、无法选中编辑；Store 使用扁平数组，不支持递归嵌套；组件拖入后无默认数据；无事件系统与生产页面生成能力。需要通过分阶段实施打通完整编辑流程，实现从拖拽 → 渲染 → 选中 → 配置的闭环，并支持生产页面访问。

## What Changes

- **Store 数据结构改造**（**BREAKING**）
  - 将 `components` 扁平数组改为 `rootComponent` 递归树结构
  - 定义 `Component` 接口支持 `children` 递归
  - 定义容器组件列表 `CONTAINER_COMPONENTS`
  - 实现 `addComponent` 支持 3 种插入位置（before/after/append）
  - 实现 `getComponentById`、`flatComponents` getter 等

- **画布渲染系统**
  - 创建 `ComponentWrapper.vue` 递归组件实现动态组件渲染
  - 创建 `CanvasArea.vue` 画布容器支持拖拽接收、插入位置计算、拖拽指示器
  - 实现选中高亮、悬停操作按钮（复制/删除）、空容器占位

- **组件库优化**
  - 四分类模型（基础、表单、展示、业务模版）
  - 从 Schema 动态读取组件，移除硬编码
  - 支持分类 Tab、搜索过滤

- **默认数据系统**
  - Schema 级别 `defaultConfig`、`mockData`
  - 组件创建时自动合并默认数据
  - 支持 `defaultChildren`（el-form、el-tabs 默认子组件）

- **编辑/预览双模式**
  - `previewMode` 状态与切换
  - 预览模式下去除包裹层和编辑痕迹

- **事件系统**
  - `EventConfig` 接口与事件处理器
  - 先实现 `handleLogEvent`（console.log）
  - 支持 `{{form.username}}` 模板语法
  - 组件事件绑定（click、change、submit）

- **生产页面生成**
  - `/page/:id` 动态路由与 `Viewer.vue`
  - `ComponentRenderer.vue` 生产环境递归渲染
  - `loadPageConfig`、`exportPageConfig`、`savePageConfig`
  - 表单数据双向绑定与提交

## Impact

- **受影响的规范**：`lowcode-page-builder`
- **受影响的代码**：
  - `client/spa/apps/default/store/lowcode.ts`：**BREAKING** 数据结构改造
  - `client/spa/apps/default/components/lowcode/`：新增 ComponentWrapper、CanvasArea，重构 ComponentLibrary
  - `client/spa/apps/default/views/lowcode/`：新增 page/Viewer.vue
  - `client/spa/apps/default/components/lowcode/componentSchemas.ts`：Schema 增强
  - `client/spa/apps/default/router/index.ts`：新增 `/page/:id` 路由
