## MODIFIED Requirements

### Requirement: 布局容器组件
系统 SHALL 提供布局容器组件，支持栅格布局和弹性布局。布局容器 SHALL 支持响应式配置，SHALL 支持内嵌子组件，SHALL 在编辑器中提供清晰的父子结构视觉区分，SHALL 支持属性实时响应更新。

#### Scenario: 布局组件拖拽到编辑器
- **WHEN** 用户从组件库拖拽layout布局组件（el-row、el-col、el-container）到画布
- **THEN** 系统在画布上创建布局组件实例
- **AND** 布局组件使用默认属性配置
- **AND** 布局组件自动添加到组件树中
- **AND** 布局组件显示为容器样式（背景色、边框等）
- **AND** 如果容器为空，显示占位提示"拖拽组件到此处"

#### Scenario: 容器组件内嵌子组件
- **WHEN** 用户拖拽组件到布局容器组件内部
- **THEN** 系统将组件添加到容器的children数组中
- **AND** 子组件在容器内部正确渲染
- **AND** 子组件显示为子组件样式（与容器样式区分）
- **AND** 支持在容器内部拖拽排序子组件
- **AND** 支持多层级嵌套（容器内嵌套容器）

#### Scenario: 编辑器样式父子结构分明
- **WHEN** 用户在编辑器中查看嵌套组件结构
- **THEN** 容器组件显示容器样式（浅色背景、边框、内边距）
- **AND** 子组件显示子组件样式（白色背景、边框、外边距）
- **AND** 容器组件和子组件有清晰的视觉层级（z-index、阴影）
- **AND** 选中容器组件时，容器边框高亮
- **AND** 选中子组件时，子组件边框高亮，不影响容器样式
- **AND** 嵌套层级越深，视觉区分越明显

#### Scenario: Layout组件属性实时更新
- **WHEN** 用户在属性面板修改layout组件的属性（如gutter、span、offset、direction等）
- **THEN** 系统立即更新组件的props配置
- **AND** 画布上的组件立即更新显示效果
- **AND** 预览区域的组件同步更新
- **AND** 属性更新延迟小于100ms
- **AND** 嵌套子组件的布局同步更新

#### Scenario: 栅格布局（Row/Col）属性更新
- **WHEN** 用户修改Row组件的gutter属性
- **THEN** 系统立即更新Row组件的gutter值
- **AND** 画布上的Row组件立即应用新的gutter间距
- **AND** Row内的Col组件间距同步更新
- **WHEN** 用户修改Col组件的span、offset、push、pull属性
- **THEN** 系统立即更新Col组件的对应属性
- **AND** 画布上的Col组件立即调整宽度和位置
- **AND** 其他Col组件的布局自动调整

#### Scenario: 容器布局（Container）属性更新
- **WHEN** 用户修改Container组件的direction属性
- **THEN** 系统立即更新Container的direction值
- **AND** 画布上的Container立即切换排列方向（水平/垂直）
- **AND** 容器内的子组件布局同步调整
- **WHEN** 用户修改Container组件的style属性
- **THEN** 系统立即更新Container的样式
- **AND** 画布上的Container立即应用新样式
- **AND** 样式更新不影响子组件的布局

#### Scenario: 嵌套容器属性更新
- **WHEN** 用户修改嵌套容器组件的属性
- **THEN** 系统更新对应容器的属性
- **AND** 只影响当前容器及其直接子组件
- **AND** 不影响其他层级的容器和组件
- **AND** 嵌套结构的层级关系保持不变
