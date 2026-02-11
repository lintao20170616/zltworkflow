# Design: 低代码页面构建工具实施方案

## Context

低代码页面构建工具现有完成度约 50%。已完成：项目管理、属性配置面板、样式编辑器、状态管理、Schema 定义；未完成：画布渲染、事件系统、数据绑定、生产页面生成。Store 当前使用扁平数组，需改为递归树以支持嵌套布局。组件库为硬编码且仅表单组件，未复用 Schema。

## Goals / Non-Goals

- **Goals**：打通拖拽 → 渲染 → 选中 → 配置闭环；支持递归嵌套；组件拖入有默认数据；事件绑定（先 log）；生产页面可访问
- **Non-Goals**：API 集成、数据源管理、组件市场、多人协作、版本管理（后续扩展）

## Decisions

### Decision: 递归树数据结构
- 使用 `rootComponent: Component | null` 替代 `components: Component[]`
- `Component` 含 `children?: Component[]` 递归
- 理由：支持嵌套布局，符合 DOM 结构，便于容器组件（el-card、el-tabs、el-form）嵌套

**Alternatives**：扁平数组 + 父 ID 引用 → 遍历与维护复杂

### Decision: 递归组件 + 包装器渲染模式
- `ComponentWrapper.vue` 递归渲染，`:is` 动态组件
- 零侵入包裹层（绝对定位，不影响布局）
- 编辑模式：包裹层、选中边框、操作按钮；预览模式：纯组件渲染

**Alternatives**：单层渲染 → 无法支持嵌套

### Decision: 精细拖拽模式（3 种位置）
- 支持 before、after、append（容器内）三种插入位置
- 使用原生 HTML5 拖拽 API + `dataTransfer` 传递组件类型
- 拖拽指示器提供视觉反馈

**Alternatives**：仅 append → 无法精确排序

### Decision: Schema 级别默认数据
- `defaultConfig`：组件默认 props
- `mockData`：演示数据（表格列、表格数据等）
- `defaultChildren`：容器默认子组件（el-form、el-tabs）
- `addComponent` 时自动合并

### Decision: 事件系统先实现 log
- 定义 `EventConfig`、`eventHandlers` 注册表
- 实现 `handleLogEvent`，支持 `{{form.username}}` 模板
- 预留 API 接口供后续扩展

### Decision: 运行时动态渲染生产页面
- 访问 `/page/:id` 加载 JSON 配置
- `ComponentRenderer.vue` 递归渲染，无编辑器包裹层
- 配置变更无需重新部署

## Risks / Trade-offs

- **递归渲染性能**：组件 >100 时考虑虚拟滚动
- **拖拽插入点计算**：充分测试不同组件尺寸
- **Store 改造破坏性**：需一次性迁移，建议与画布改造同步完成

## Migration Plan

1. 阶段一：Store 改造 + 组件包装器 + 画布容器 + 组件库拖拽
2. 阶段二：组件库分类 + Schema 优化
3. 阶段三：默认数据系统
4. 阶段四：编辑/预览双模式
5. 阶段五：事件系统
6. 阶段六：生产页面生成
7. 阶段七：优化与完善

**回滚**：Store 改造前备份现有逻辑，可回退到扁平结构。

## Open Questions

- 生产页面数据持久化是否接入后端 API？
