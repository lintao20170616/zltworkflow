# Change: 重构低代码编辑器 - 父子层级与交互体验

## Why

当前低代码编辑器需要重构以提升编辑体验：
1. 父子层级视觉不分明，嵌套结构难以辨认
2. 组件样式与原生组件不一致，影响所见即所得
3. 选中/拖拽时操作按钮不够明显
4. 拖拽到容器时未显示可容纳区域提示
5. 组件层级关系不清晰

需要重构 LowcodeRendererWrapper 和 ComponentItem，构建层级清晰、交互直观的编辑器。

## What Changes

- **父子层级分明样式**
  - 容器组件与子组件有清晰的视觉层级（缩进、边框、背景）
  - 嵌套层级越深，样式层级越明显
  - 层级结构一目了然

- **样式与原组件一致**
  - 非选中状态保持 Element Plus 原组件外观
  - 不添加额外背景、边框等干扰
  - 所见即所得

- **选中/拖拽时显示操作按钮**
  - 选中时显示：拖拽把手、删除按钮
  - 拖拽时显示：拖拽把手、删除按钮
  - 按钮位置固定，不遮挡组件主体

- **容器可容纳区域高亮**
  - 拖拽组件经过容器时，容器显示可容纳区域（虚线框/高亮）
  - 明确反馈可放置位置
  - 空容器显示占位提示

- **支持拖拽和删除**
  - 支持从组件库拖拽到画布、到容器内
  - 支持画布内组件拖拽排序、跨容器移动
  - 支持删除操作，可删除任意组件及其子组件

- **组件层级清晰**
  - 通过视觉样式表达父子关系
  - 通过 z-index 确保选中/拖拽时层级正确

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
