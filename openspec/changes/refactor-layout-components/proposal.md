# Change: 重构Layout布局组件功能

## Why

当前低代码编辑器中，layout布局组件（el-row、el-col、el-container等）虽然已支持基本的拖拽和嵌套功能，但存在以下问题：
1. 布局组件拖拽到编辑器后的交互体验不够直观
2. 容器组件的内嵌子组件功能不够完善，父子结构在编辑器中的视觉区分不明显
3. 布局组件的属性动态调整后，画布上的实时更新响应不够及时
4. 嵌套组件的样式层级关系不够清晰，影响编辑体验

需要重构LowcodeRendererWrapper和ComponentItem组件，增强layout布局组件的容器功能和编辑体验。

## What Changes

- **增强Layout布局组件拖拽功能**
  - 优化布局组件从组件库拖拽到画布的交互流程
  - 确保布局组件拖拽后能正确初始化并显示在画布上
  - 支持布局组件作为根组件直接添加到画布

- **完善容器组件内嵌子组件功能**
  - 重构ComponentItem组件，增强对容器组件的支持
  - 实现布局组件作为容器时，支持内嵌任意子组件
  - 优化子组件的拖拽插入逻辑，支持拖拽到容器内部
  - 确保嵌套组件的层级关系正确维护

- **优化编辑器样式父子结构**
  - 重构LowcodeRendererWrapper和ComponentItem的样式系统
  - 为容器组件和子组件设计清晰的视觉区分样式
  - 实现父子组件的层级样式（z-index、边框、背景色等）
  - 确保选中状态在嵌套结构中正确显示

- **实现属性实时响应更新**
  - 优化属性面板与组件实例的响应式绑定
  - 确保layout组件属性（如gutter、span、offset等）修改后立即更新到画布
  - 实现属性变更的实时预览，无需手动刷新
  - 优化store中的属性更新逻辑，确保嵌套组件属性同步更新

## Impact

- **受影响的规范**：
  - 修改 `lowcode-page-builder` 功能规范中的布局容器组件需求
- **受影响的代码**：
  - 前端：
    - 重构 `client/spa/apps/default/components/lowcode/LowcodeRendererWrapper.vue`
    - 重构 `client/spa/apps/default/components/lowcode/ComponentItem.vue`
    - 优化 `client/spa/apps/default/components/lowcode/PropertyPanel.vue` 的属性更新逻辑
    - 优化 `client/spa/apps/default/store/lowcode.ts` 的响应式更新机制
    - 可能需要调整 `client/spa/apps/default/components/lowcode/componentSchemas.ts` 中layout组件的配置
- **依赖关系**：
  - 依赖现有的Vue 3响应式系统
  - 依赖vue-draggable-plus拖拽库
  - 依赖Pinia状态管理
