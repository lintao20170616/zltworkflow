## 1. 项目初始化

- [x] 1.1 创建低代码编辑器目录结构
  - [x] `client/spa/apps/default/views/lowcode/` - 编辑器页面
  - [x] `client/spa/apps/default/components/lowcode/` - 编辑器组件
  - [x] `client/spa/apps/default/store/lowcode.ts` - 状态管理

- [ ] 1.2 安装必要依赖
  - [ ] vue-draggable-plus（Vue 3专用拖拽库）
  - [x] Pinia（状态管理，项目已集成）
  - [ ] JSON Schema验证库（可选）

- [x] 1.3 配置路由
  - [x] 在 `client/spa/apps/default/router/index.ts` 中添加低代码编辑器路由
  - [x] 路由路径：`/lowcode-editor` 和 `/lowcode/projects`
  - [x] 配置路由元信息（requiresAuth等）

## 2. 状态管理实现

- [x] 2.1 创建编辑器状态管理（Pinia Store）
  - [x] `client/spa/apps/default/store/lowcode.ts` - 编辑器核心状态
  - [x] 组件树数据结构设计
  - [x] 选中组件状态管理
  - [x] 撤销/重做功能实现
  - [x] 在 `client/spa/apps/default/store/index.ts` 中注册store

- [x] 2.2 实现状态操作方法
  - [x] 添加组件到画布
  - [x] 删除组件
  - [x] 更新组件属性
  - [x] 移动组件位置
  - [x] 调整组件层级

## 3. 组件库模块

- [x] 3.1 创建组件库组件
  - [x] `client/spa/apps/default/components/lowcode/ComponentLibrary.vue`
  - [x] 组件分类展示（基础、表单、数据展示、布局）
  - [x] 组件列表渲染
  - [x] 侧边导航标签页
  - [x] 图标代替文案，带tooltip提示

- [ ] 3.2 实现组件拖拽功能（使用vue-draggable-plus）
  - [ ] 组件库拖拽到画布（保留原生HTML5拖拽或改用vue-draggable-plus）
  - [ ] 画布内组件排序（使用vue-draggable-plus）
  - [ ] 拖拽动画和视觉反馈
  - [ ] 拖拽占位符显示

- [x] 3.3 封装Element Plus组件元数据
  - [x] 组件类型定义
  - [x] 组件默认属性配置
  - [x] 组件属性Schema定义（基础组件、表单组件、数据展示组件、布局组件）
  - [x] 基础组件Schema完善（el-button、el-text、el-link、el-divider、el-space、el-image、el-avatar、el-badge、el-alert）
  - [x] 数据展示组件Schema完善（el-table、el-card、el-list、el-tag）
  - [x] 表单组件Schema完善（el-input、el-textarea、el-input-number、el-select、el-date-picker、el-checkbox、el-radio、el-switch、el-slider、el-rate、el-form、el-form-item）

## 4. 画布编辑模块

- [x] 4.1 创建画布组件
  - [x] `client/spa/apps/default/components/lowcode/Canvas.vue`
  - [x] 画布容器布局
  - [x] 组件渲染区域

- [x] 4.2 实现组件拖放接收
  - [x] 拖放区域识别
  - [x] 组件实例生成
  - [x] 组件添加到画布

- [x] 4.3 实现组件交互功能（使用vue-draggable-plus优化）
  - [x] 组件选中与高亮
  - [x] 组件移动排序（使用vue-draggable-plus实现画布内排序）
  - [x] 拖拽到指定位置插入
  - [x] 组件删除
  - [x] 嵌套组件拖拽支持（使用vue-draggable-plus的group功能）
  - [x] 嵌套组件层级样式（z-index和选中覆盖层）
  - [x] 所见即所得（WYSIWYG）编辑器实现
  - [ ] 组件层级调整（上移/下移）

- [x] 4.4 实现快捷操作
  - [x] 复制/粘贴组件（状态管理已支持）
  - [x] 撤销/重做操作
  - [ ] 快捷键支持
  - [ ] 拖拽手柄（指定拖拽区域，避免与组件交互冲突）

## 5. 属性配置模块

- [x] 5.1 创建属性面板组件
  - [x] `client/spa/apps/default/components/lowcode/PropertyPanel.vue`
  - [x] 属性表单动态渲染

- [x] 5.2 实现属性配置功能
  - [x] 根据组件类型加载属性Schema
  - [x] 属性表单生成（基础实现）
  - [x] 属性值实时更新
  - [ ] 属性值校验（部分实现）

- [x] 5.3 实现常用属性配置
  - [x] 样式属性（通过StyleEditor组件支持自定义CSS样式）
  - [x] 组件文本内容编辑
  - [ ] 事件绑定配置
  - [ ] 数据绑定配置（v-model）

## 6. 预览模块

- [x] 6.1 创建预览组件
  - [x] `client/spa/apps/default/components/lowcode/Preview.vue`
  - [x] PC端预览视图
  - [x] 移动端预览视图

- [x] 6.2 实现预览功能
  - [x] 实时同步画布配置
  - [x] PC/移动端视图切换
  - [x] 响应式布局预览
  - [x] el-row gutter在预览中正确应用
  - [x] el-row/el-col避免多余的lowcode-renderer包装
  - [ ] 预览交互功能（表单提交等）
  - [x] 预览功能当前已隐藏（根据用户需求）

## 7. JSON配置生成模块

- [x] 7.1 实现配置序列化
  - [x] 组件树遍历
  - [x] JSON Schema生成
  - [ ] 配置格式校验

- [x] 7.2 实现配置导出功能
  - [x] JSON文件下载
  - [ ] JSON复制到剪贴板
  - [ ] 配置代码预览

- [x] 7.3 实现配置导入功能
  - [ ] JSON文件上传
  - [ ] JSON粘贴导入
  - [x] 配置格式验证（通过loadConfig实现）

## 8. 页面渲染器模块

- [x] 8.1 创建渲染器组件
  - [x] `client/spa/apps/default/components/lowcode/LowcodeRenderer.vue`
  - [x] 组件类型映射表（基础实现）
  - [x] 动态组件渲染

- [x] 8.2 实现渲染功能
  - [x] JSON配置解析
  - [x] 组件动态创建
  - [x] 属性绑定
  - [ ] 事件绑定

- [ ] 8.3 实现数据绑定
  - [ ] v-model双向绑定
  - [ ] 接口数据绑定
  - [ ] 表单数据收集

- [ ] 8.4 实现事件处理
  - [ ] 按钮点击事件
  - [ ] 表单提交事件
  - [ ] 自定义事件处理

## 9. 布局容器组件

- [x] 9.1 实现栅格布局（Row/Col）
  - [x] 响应式栅格系统
  - [x] 栅格属性配置（gutter、justify、align）
  - [x] gutter在编辑器和预览中正确应用
  - [x] 支持嵌套子组件
  - [x] 支持组件插入到布局组件内部
  - [x] el-row子组件水平排列，不换行
  - [x] 编辑器中选择器组件长度显示优化

- [x] 9.2 实现弹性布局（Container）
  - [x] 容器布局配置
  - [x] 支持嵌套子组件
  - [x] 支持组件插入到布局组件内部

- [x] 9.3 布局组件嵌套功能
  - [x] 完善布局组件Schema定义（canNest标记）
  - [x] 实现嵌套拖拽功能（vue-draggable-plus）
  - [x] 支持组件插入到布局组件内部
  - [x] 嵌套组件排序和移动

## 10. 项目管理和模板管理（本地存储）

- [x] 10.1 实现项目列表管理
  - [x] `client/spa/apps/default/views/lowcode/projects/index.vue`
  - [x] LocalStorage存储
  - [x] 项目列表管理
  - [x] 项目创建、编辑、删除、复制
  - [x] 项目配置保存和加载

- [x] 10.2 实现项目加载功能
  - [x] 项目列表展示
  - [x] 项目配置加载到画布
  - [x] 项目删除

- [ ] 10.3 模板管理功能（待实现）
  - [ ] 模板保存功能
  - [ ] 模板列表展示
  - [ ] 模板加载到画布

## 11. 编辑器页面和UI优化

- [x] 11.1 创建编辑器主页面
  - [x] `client/spa/apps/default/views/lowcode/editor.vue`
  - [x] 集成组件库、画布、属性面板、预览模块
  - [x] 三栏布局（组件库、画布、属性面板）
  - [x] 工具栏设计（保存、导出、撤销、重做、预览切换）
  - [x] 项目加载和保存功能

- [x] 11.2 编辑器布局优化
  - [x] 三栏布局（组件库、画布、属性面板）
  - [ ] 响应式布局适配
  - [x] 工具栏设计

- [x] 11.3 交互体验优化
  - [x] 拖拽视觉反馈
  - [x] 选中高亮效果
  - [x] 操作提示和引导（tooltip）
  - [x] 错误提示处理

## 12. 测试和文档

- [ ] 12.1 功能测试
  - [ ] 组件拖拽测试
  - [ ] 属性配置测试
  - [ ] JSON生成测试
  - [ ] 渲染器测试

- [ ] 12.2 兼容性测试
  - [ ] 浏览器兼容性测试
  - [ ] 移动端预览测试

- [ ] 12.3 文档编写
  - [ ] 使用文档
  - [ ] API文档
  - [ ] 示例代码
