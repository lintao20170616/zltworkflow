# Change: 实现低代码页面构建工具

## Why

当前团队开发配置列表查询页面和表单页面时，存在大量重复性代码编写工作，开发效率低下。需要通过可视化拖拽配置的方式，降低开发门槛，提升开发效率。构建一个基于JSON驱动的低代码页面构建工具，通过可视化拖拽方式配置页面布局和组件属性，生成标准JSON配置，再通过渲染组件动态生成最终页面。

## What Changes

- **新增低代码页面构建工具核心功能**
  - 组件库管理：提供Element Plus基础组件（按钮、输入框、选择器、表格、表单等），支持拖拽到画布
  - 画布编辑：支持组件拖放、选中、移动、删除、层级调整
  - 属性配置：右侧面板实时显示选中组件的属性，支持修改并实时预览
  - 双端预览：Web模拟器支持PC端和移动端视图切换，实时预览配置效果
  - JSON生成：将页面配置生成标准JSON格式，支持导出和复制
  - 页面渲染：接收JSON配置动态渲染页面，支持接口数据绑定

- **新增辅助功能**
  - 布局容器：提供栅格布局、弹性布局等容器组件
  - 快捷操作：支持复制、粘贴、撤销、重做等编辑操作
  - 代码预览：可查看生成的JSON配置代码
  - 模板保存：本地保存常用页面模板

- **技术架构**
  - 前端编辑器：Vue 3 + Composition API + Pinia + Element Plus
  - 拖拽库：vue-draggable-plus（Vue 3 专用拖拽库）
  - 渲染器组件：独立的Vue组件，可嵌入现有业务系统
  - 本地存储：LocalStorage / IndexedDB

## Impact

- **受影响的规范**：
  - 新增 `lowcode-page-builder` 功能规范
- **受影响的代码**：
  - 前端：
    - 新增编辑器页面：`client/spa/apps/default/views/lowcode/editor.vue`
    - 新增项目列表页面：`client/spa/apps/default/views/lowcode/projects/index.vue`
    - 新增渲染器组件：`client/spa/apps/default/components/lowcode/LowcodeRenderer.vue`
    - 新增状态管理：`client/spa/apps/default/store/lowcode.ts`
    - 新增组件库：`client/spa/apps/default/components/lowcode/ComponentLibrary.vue`
    - 新增画布组件：`client/spa/apps/default/components/lowcode/Canvas.vue`
    - 新增组件项组件：`client/spa/apps/default/components/lowcode/ComponentItem.vue`
    - 新增属性面板：`client/spa/apps/default/components/lowcode/PropertyPanel.vue`
    - 新增预览组件：`client/spa/apps/default/components/lowcode/Preview.vue`
    - 更新路由配置：`client/spa/apps/default/router/index.ts`
    - 更新store导出：`client/spa/apps/default/store/index.ts`
  - 后端（可选，第一版暂不实现）：
    - 预留配置管理接口（如后续需要云端存储）
- **依赖关系**：
  - 依赖现有Vue 3 + Element Plus技术栈
  - 需要新增拖拽库依赖：vue-draggable-plus（Vue 3 专用，性能优异）
  - 需要新增状态管理库（Pinia，项目已集成）
