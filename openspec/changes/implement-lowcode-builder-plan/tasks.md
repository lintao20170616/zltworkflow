## 1. 阶段一：核心渲染系统（Week 1）

- [x] 1.1 Store 改造
  - 将 `components` 扁平数组改为 `rootComponent` 树结构
  - 定义 `Component` 接口支持 `children` 递归
  - 定义 `CONTAINER_COMPONENTS`
  - 实现 `addComponent`（before/after/append）
  - 实现 `deleteComponent`、`duplicateComponent`、`getComponentById`、`flatComponents` getter
- [x] 1.2 组件包装器
  - 创建 `ComponentWrapper.vue` 递归组件
  - 动态组件渲染、递归子组件、选中高亮、悬停操作按钮
  - 零侵入包裹层、空容器占位
- [x] 1.3 画布容器
  - 创建 `CanvasArea.vue`
  - 拖拽接收、插入位置计算、拖拽指示器、空状态
- [x] 1.4 组件库拖拽
  - `draggable="true"`、`handleDragStart`、`dataTransfer` 传递组件类型

## 2. 阶段二：组件库与 Schema 优化（Week 2）

- 2.1 组件库分类重构
  - 四分类（基础、表单、展示、业务模版）
  - `ComponentSchema` 添加 `category`
  - `getComponentSchemasByCategory`
- 2.2 组件库动态渲染
  - 从 Schema 动态读取，分类 Tab、搜索过滤
  - 移除硬编码
- 2.3 Schema 增强
  - 5 个高频组件人工优化（el-button、el-input、el-form、el-table、el-select）
  - 属性分组、标签、描述

## 3. 阶段三：默认数据系统（Week 2）

- 3.1 Schema 默认数据
  - `defaultConfig`、`mockData`
  - 10 个高频组件配置
- 3.2 组件创建合并
  - `processMockData`、`addComponent` 合并 defaultConfig/mockData
  - `createTableColumns`
- 3.3 占位符与复杂结构
  - `generatePlaceholder`、`defaultChildren`
  - el-form、el-tabs 默认子组件

## 4. 阶段四：编辑/预览双模式（Week 3）

- 4.1 模式切换
  - `previewMode` 状态、`togglePreview()`、工具栏按钮
- 4.2 预览模式渲染
  - 根据 `previewMode` 去除包裹层、选中边框、操作按钮
- 4.3 CSS 补偿
  - 编辑模式布局与预览模式 90%+ 一致

## 5. 阶段五：事件系统（Week 3）

- 5.1 事件数据结构
  - `EventConfig`、`ComponentEvents`、`EventContext`
- 5.2 事件处理器
  - `eventHandlers`、`handleLogEvent`、`resolveDataTemplate`、`executeEventHandlers`
- 5.3 组件事件绑定
  - `handleNativeClick`、`handleNativeChange`、`handleNativeSubmit`
  - 阻止事件冒泡
- 5.4 Schema 事件配置
  - el-button click、el-form submit、el-input change

## 6. 阶段六：生产页面生成（Week 4）

- 6.1 页面入口
  - `Viewer.vue`、`/page/:id` 路由、`loadPageConfig`
- 6.2 组件渲染器
  - `ComponentRenderer.vue` 生产环境递归渲染
  - 动态组件映射、事件绑定
- 6.3 配置服务
  - `loadPageConfig`、`exportPageConfig`、`savePageConfig`
- 6.4 数据绑定
  - 表单双向绑定、表单提交、表格数据加载

## 7. 阶段七：优化与完善（Week 4-5）

- 7.1 性能优化
  - 组件懒加载、配置缓存
- 7.2 错误处理
  - 组件加载降级、事件失败捕获
- 7.3 文档
  - 组件使用、事件配置、数据绑定、部署说明

