## ADDED Requirements

### Requirement: 递归树数据结构
系统 SHALL 使用递归树结构存储组件配置，`rootComponent` 为根节点，每个组件 SHALL 支持 `children` 递归嵌套。容器组件（el-card、el-tabs、el-form 等）SHALL 支持子组件嵌套。

#### Scenario: 根组件树结构
- **WHEN** 系统初始化或加载配置
- **THEN** 状态以 `rootComponent: Component | null` 存储
- **AND** 每个 Component 可包含 `children?: Component[]`
- **AND** 支持任意层级嵌套

#### Scenario: 三种插入位置
- **WHEN** 用户拖拽组件到画布
- **THEN** 系统 SHALL 支持插入到目标组件前面（before）
- **AND** 系统 SHALL 支持插入到目标组件后面（after）
- **AND** 系统 SHALL 支持插入到容器组件内部（append）

### Requirement: 画布渲染系统
系统 SHALL 提供画布渲染能力，支持拖拽接收、组件递归渲染、选中交互。画布 SHALL 通过 ComponentWrapper 递归渲染组件树，支持零侵入包裹层实现选中和操作按钮。

#### Scenario: 拖拽接收与渲染
- **WHEN** 用户从组件库拖拽组件到画布
- **THEN** 画布接收 drop 事件并计算插入位置
- **AND** 组件插入后通过 ComponentWrapper 递归渲染
- **AND** 拖拽过程显示插入线或高亮等视觉反馈

#### Scenario: 选中与操作
- **WHEN** 用户点击画布上的组件
- **THEN** 组件显示选中边框
- **AND** 悬停时显示复制、删除操作按钮
- **AND** 空容器显示占位提示

### Requirement: 默认数据系统
系统 SHALL 在 Schema 级别定义 `defaultConfig` 和 `mockData`，组件创建时 SHALL 自动合并默认数据。高频组件（el-button、el-input、el-table、el-form、el-tabs 等）拖入后 SHALL 立即显示可用的演示效果。

#### Scenario: 组件拖入有默认数据
- **WHEN** 用户拖入 el-button
- **THEN** 按钮显示默认文案和类型
- **WHEN** 用户拖入 el-table
- **THEN** 表格显示演示数据和列配置
- **WHEN** 用户拖入 el-form
- **THEN** 表单显示默认表单项

### Requirement: 编辑预览双模式
系统 SHALL 支持编辑模式和预览模式切换。预览模式 SHALL 完全模拟生产环境，去除包裹层、选中边框和操作按钮。

#### Scenario: 模式切换
- **WHEN** 用户点击切换预览模式
- **THEN** 画布进入预览模式
- **AND** 无编辑器痕迹（无包裹层、无选中边框）
- **AND** 布局与生产环境 100% 一致

### Requirement: 事件系统
系统 SHALL 支持组件事件绑定与执行。第一版 SHALL 实现 console.log 打印，支持 `{{form.username}}` 等模板语法解析。事件配置 SHALL 存储在组件的 `events` 字段。

#### Scenario: 按钮点击打印日志
- **WHEN** 用户配置按钮 click 事件并点击
- **THEN** 控制台打印事件类型、组件信息、数据
- **AND** 支持模板语法解析表单等数据

#### Scenario: 表单提交打印
- **WHEN** 用户提交配置了 submit 事件的表单
- **THEN** 控制台打印表单数据

### Requirement: 生产页面生成
系统 SHALL 支持通过 `/page/:id` 路由访问生成的页面。Viewer 组件 SHALL 加载 JSON 配置，ComponentRenderer SHALL 递归渲染，无编辑器痕迹，支持表单数据绑定与提交。

#### Scenario: 访问生产页面
- **WHEN** 用户访问 `/page/:id`
- **THEN** 系统加载对应页面配置
- **AND** 页面正常渲染，无编辑器痕迹
- **AND** 表单可提交并打印数据
- **AND** 支持递归嵌套组件

## MODIFIED Requirements

### Requirement: 组件库管理
系统 SHALL 提供组件库管理功能，按四分类（基础、表单、展示、业务模版）展示，SHALL 从 Schema 动态读取组件列表，支持分类 Tab 切换和搜索过滤。每个组件 SHALL 支持拖拽到画布。

#### Scenario: 四分类展示
- **WHEN** 用户打开低代码编辑器
- **THEN** 组件库按基础、表单、展示、业务模版四类分组
- **AND** 支持 Tab 切换和搜索过滤
- **AND** 组件列表从 Schema 动态生成，无硬编码

#### Scenario: 组件拖拽到画布
- **WHEN** 用户从组件库拖拽组件到画布区域
- **THEN** 系统通过 dataTransfer 识别组件类型
- **AND** 系统在计算出的插入位置创建组件实例
- **AND** 组件使用默认属性配置和 mockData
