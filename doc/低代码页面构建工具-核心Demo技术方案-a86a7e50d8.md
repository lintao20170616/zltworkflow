# 低代码页面构建工具 - 核心Demo技术方案

## 1. 项目概述

### 1.1 Demo目标
基于设计文档，开发一个可运行的**核心功能Demo**，验证低代码页面构建的核心技术可行性，为后续完整开发奠定基础。

### 1.2 范围界定
**本次Demo包含的核心功能：**
- 组件库拖拽到画布
- 画布基础编辑（选中、移动、删除）
- 右侧属性配置（实时预览）
- PC/移动端预览切换
- JSON配置生成与导出
- 基础渲染器（接收JSON动态渲染）

**本次Demo暂不包含的功能：**
- 完整的组件属性配置（仅实现部分核心属性）
- 复杂的表单验证
- 历史记录（撤销/重做）
- 本地存储持久化
- 用户权限管理

### 1.3 技术栈
- **前端**：Vue 3 + TypeScript + Vite + Pinia
- **UI框架**：Element Plus
- **拖拽库**：Vue.Draggable (基于 Sortable.js)
- **状态管理**：Pinia
- **构建工具**：Vite

---

## 2. 核心功能需求

### 2.1 功能清单

| 功能模块 | 功能点 | 优先级 | 说明 |
|---------|-------|--------|------|
| 组件库 | 左侧组件面板 | P0 | 展示可拖拽组件列表 |
| 组件库 | 组件拖拽 | P0 | 从组件库拖拽到画布 |
| 画布编辑 | 组件渲染 | P0 | 在画布中渲染组件 |
| 画布编辑 | 组件选中 | P0 | 点击组件高亮选中 |
| 画布编辑 | 组件移动 | P1 | 拖拽调整组件位置 |
| 画布编辑 | 组件删除 | P0 | 删除选中组件 |
| 属性配置 | 属性面板 | P0 | 右侧展示选中组件属性 |
| 属性配置 | 属性修改 | P0 | 修改属性实时更新预览 |
| 预览功能 | PC预览 | P0 | PC端预览模式 |
| 预览功能 | 移动端预览 | P0 | 移动端预览模式 |
| JSON生成 | 配置导出 | P0 | 生成JSON并导出 |
| JSON生成 | 配置导入 | P1 | 导入JSON恢复配置 |
| 渲染器 | 动态渲染 | P0 | 接收JSON动态渲染页面 |

### 2.2 核心组件清单（Demo版本）

| 组件类型 | 组件名 | Element Plus组件 | 说明 |
|---------|-------|-----------------|------|
| 布局组件 | 容器 | el-container | 页面容器 |
| 布局组件 | 行 | el-row | 栅格行 |
| 布局组件 | 列 | el-col | 栅格列 |
| 表单组件 | 输入框 | el-input | 文本输入 |
| 表单组件 | 选择器 | el-select | 下拉选择 |
| 表单组件 | 按钮 | el-button | 操作按钮 |
| 表单组件 | 日期选择器 | el-date-picker | 日期选择 |
| 数据展示 | 表格 | el-table | 数据表格 |
| 数据展示 | 卡片 | el-card | 卡片容器 |

---

## 3. 技术架构设计

### 3.1 项目结构

```
lowcode-demo/
├── src/
│   ├── assets/                 # 静态资源
│   │   └── styles/
│   │       └── index.css       # 全局样式
│   ├── components/            # 组件
│   │   ├── editor/            # 编辑器组件
│   │   │   ├── ComponentLibrary.vue      # 组件库面板
│   │   │   ├── Canvas.vue                # 画布编辑区
│   │   │   ├── PropertyPanel.vue         # 属性配置面板
│   │   │   └── PreviewPanel.vue         # 预览面板
│   │   ├── renderer/          # 渲染器组件
│   │   │   ├── DynamicRenderer.vue      # 主渲染器
│   │   │   ├── ComponentTree.vue        # 组件树递归
│   │   │   └── ComponentWrapper.vue     # 组件包装器（用于选中、拖拽）
│   │   └── common/            # 通用组件
│   │       └── Icon.vue                  # 图标组件
│   ├── stores/                # Pinia状态管理
│   │   ├── editor.ts          # 编辑器状态
│   │   └── config.ts          # 配置状态
│   ├── types/                 # TypeScript类型定义
│   │   ├── component.ts       # 组件类型
│   │   ├── config.ts          # 配置类型
│   │   └── index.ts           # 导出
│   ├── utils/                 # 工具函数
│   │   ├── generator.ts       # JSON生成器
│   │   ├── parser.ts          # JSON解析器
│   │   ├── helper.ts          # 辅助函数
│   │   └── constants.ts       # 常量定义
│   ├── views/                 # 页面
│   │   └── Editor.vue         # 编辑器主页面
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── public/                    # 公共资源
├── index.html                 # HTML模板
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
└── README.md                  # 项目说明
```

### 3.2 数据流设计

```
┌─────────────────────────────────────────────────────────────┐
│                        用户操作                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Pinia Store (状态中心)                     │
│  - 组件树数据 (componentTree)                                │
│  - 当前选中组件 (selectedComponent)                          │
│  - 预览模式 (previewMode: pc/mobile)                         │
└────────┬────────────────────────┬───────────────────────────┘
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐
│   编辑器组件      │    │    属性配置面板       │
│ - 组件库面板      │    │ - 属性表单           │
│ - 画布编辑区      │    │ - 实时更新           │
│ - 预览面板        │    │                      │
└──────────────────┘    └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    JSON 配置生成器                            │
│                     (导出功能)                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 核心状态定义

```typescript
// stores/editor.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComponentConfig, ComponentTree } from '@/types'

interface EditorState {
  // 组件树数据
  componentTree: ComponentTree[]

  // 当前选中的组件ID
  selectedComponentId: string | null

  // 预览模式：pc | mobile
  previewMode: 'pc' | 'mobile'

  // 是否正在编辑
  isEditing: boolean
}

export const useEditorStore = defineStore('editor', () => {
  const componentTree = ref<ComponentTree[]>([])
  const selectedComponentId = ref<string | null>(null)
  const previewMode = ref<'pc' | 'mobile'>('pc')
  const isEditing = ref(false)

  // 计算属性：获取当前选中的组件
  const selectedComponent = computed(() => {
    if (!selectedComponentId.value) return null

    // 递归查找组件
    const findComponent = (components: ComponentTree[]): ComponentTree | null => {
      for (const comp of components) {
        if (comp.id === selectedComponentId.value) return comp
        if (comp.children && comp.children.length > 0) {
          const found = findComponent(comp.children)
          if (found) return found
        }
      }
      return null
    }

    return findComponent(componentTree.value)
  })

  // 动作：添加组件
  const addComponent = (component: ComponentConfig, parentId?: string) => {
    const newComponent: ComponentTree = {
      id: generateId(),
      type: component.type,
      props: { ...component.props },
      children: []
    }

    if (parentId) {
      // 添加到指定父组件的子节点
      const parent = findComponentById(parentId, componentTree.value)
      if (parent) {
        parent.children?.push(newComponent)
      }
    } else {
      // 添加到根节点
      componentTree.value.push(newComponent)
    }

    // 选中新添加的组件
    selectedComponentId.value = newComponent.id
  }

  // 动作：删除组件
  const removeComponent = (componentId: string) => {
    const removeRecursive = (components: ComponentTree[]): boolean => {
      const index = components.findIndex(c => c.id === componentId)
      if (index !== -1) {
        components.splice(index, 1)
        return true
      }
      for (const comp of components) {
        if (comp.children && removeRecursive(comp.children)) {
          return true
        }
      }
      return false
    }

    removeRecursive(componentTree.value)

    // 如果删除的是当前选中的组件，清空选中状态
    if (selectedComponentId.value === componentId) {
      selectedComponentId.value = null
    }
  }

  // 动作：更新组件属性
  const updateComponentProps = (componentId: string, props: Record<string, any>) => {
    const component = findComponentById(componentId, componentTree.value)
    if (component) {
      component.props = { ...component.props, ...props }
    }
  }

  // 动作：选中组件
  const selectComponent = (componentId: string | null) => {
    selectedComponentId.value = componentId
  }

  // 动作：切换预览模式
  const setPreviewMode = (mode: 'pc' | 'mobile') => {
    previewMode.value = mode
  }

  // 动作：清空画布
  const clearCanvas = () => {
    componentTree.value = []
    selectedComponentId.value = null
  }

  // 动作：导入配置
  const importConfig = (config: ComponentTree[]) => {
    componentTree.value = config
    selectedComponentId.value = null
  }

  // 辅助函数：生成唯一ID
  const generateId = () => {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 辅助函数：根据ID查找组件
  const findComponentById = (id: string, components: ComponentTree[]): ComponentTree | null => {
    for (const comp of components) {
      if (comp.id === id) return comp
      if (comp.children && comp.children.length > 0) {
        const found = findComponentById(id, comp.children)
        if (found) return found
      }
    }
    return null
  }

  return {
    componentTree,
    selectedComponentId,
    selectedComponent,
    previewMode,
    isEditing,
    addComponent,
    removeComponent,
    updateComponentProps,
    selectComponent,
    setPreviewMode,
    clearCanvas,
    importConfig
  }
})
```

---

## 4. 核心组件实现

### 4.1 组件库面板 (ComponentLibrary.vue)

**功能描述：**
- 展示可拖拽的组件列表
- 按类型分类展示（布局、表单、数据展示）
- 支持拖拽组件到画布

**技术要点：**
- 使用 Vue.Draggable 实现拖拽
- 拖拽时携带组件类型信息

**实现示例：**
```vue
<template>
  <div class="component-library">
    <div class="library-header">
      <h3>组件库</h3>
    </div>
    <div class="library-content">
      <div
        v-for="(category, categoryKey) in componentCategories"
        :key="categoryKey"
        class="category-section"
      >
        <div class="category-title">{{ category.label }}</div>
        <div class="component-list">
          <div
            v-for="component in category.components"
            :key="component.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
          >
            <el-icon><component :is="component.icon" /></el-icon>
            <span>{{ component.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// 组件分类数据
const componentCategories = reactive({
  layout: {
    label: '布局组件',
    components: [
      { type: 'el-container', label: '容器', icon: 'Grid' },
      { type: 'el-row', label: '行', icon: 'Menu' },
      { type: 'el-col', label: '列', icon: 'Rank' }
    ]
  },
  form: {
    label: '表单组件',
    components: [
      { type: 'el-input', label: '输入框', icon: 'Edit' },
      { type: 'el-select', label: '选择器', icon: 'ArrowDown' },
      { type: 'el-button', label: '按钮', icon: 'Pointer' },
      { type: 'el-date-picker', label: '日期选择', icon: 'Calendar' }
    ]
  },
  display: {
    label: '数据展示',
    components: [
      { type: 'el-table', label: '表格', icon: 'Grid' },
      { type: 'el-card', label: '卡片', icon: 'Document' }
    ]
  }
})

// 拖拽开始事件
const handleDragStart = (event: DragEvent, component: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('componentType', component.type)
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<style scoped>
.component-library {
  width: 260px;
  height: 100%;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.library-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.library-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.library-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.category-section {
  margin-bottom: 24px;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 12px;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.3s;
}

.component-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.component-item .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #606266;
}

.component-item span {
  font-size: 12px;
  color: #606266;
}
</style>
```

### 4.2 画布编辑区 (Canvas.vue)

**功能描述：**
- 接收拖拽的组件并渲染
- 支持组件选中高亮
- 支持组件删除
- 渲染组件树

**技术要点：**
- 使用 ComponentWrapper 包装每个组件
- 递归渲染组件树
- 选中状态可视化反馈

**实现示例：**
```vue
<template>
  <div
    class="canvas-container"
    :class="{ 'preview-mode': !isEditing }"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div class="canvas-header">
      <span>画布</span>
      <el-button
        :type="isEditing ? 'primary' : 'default'"
        size="small"
        @click="toggleEdit"
      >
        {{ isEditing ? '编辑中' : '预览' }}
      </el-button>
    </div>

    <div
      class="canvas-content"
      :class="previewMode"
      :style="canvasStyle"
    >
      <!-- 组件树渲染 -->
      <ComponentTree
        v-for="(component, index) in componentTree"
        :key="component.id"
        :config="component"
        :selected-id="selectedComponentId"
        :is-editing="isEditing"
        @select="handleSelect"
        @delete="handleDelete"
      />

      <!-- 空状态提示 -->
      <div v-if="componentTree.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Plus /></el-icon>
        <p>拖拽左侧组件到此处</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import ComponentTree from './ComponentTree.vue'

const editorStore = useEditorStore()

// 是否处于编辑模式
const isEditing = computed(() => editorStore.isEditing)

// 预览模式
const previewMode = computed(() => editorStore.previewMode)

// 组件树数据
const componentTree = computed(() => editorStore.componentTree)

// 当前选中的组件ID
const selectedComponentId = computed(() => editorStore.selectedComponentId)

// 画布样式
const canvasStyle = computed(() => {
  const styles: Record<string, string> = {}
  if (previewMode.value === 'mobile') {
    styles.width = '375px'
    styles.margin = '0 auto'
  }
  return styles
})

// 切换编辑/预览模式
const toggleEdit = () => {
  editorStore.isEditing = !isEditing.value
}

// 处理拖拽放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault()

  if (!isEditing.value) return

  const componentType = event.dataTransfer?.getData('componentType')
  if (componentType) {
    editorStore.addComponent({
      type: componentType,
      props: getDefaultProps(componentType)
    })
  }
}

// 处理组件选中
const handleSelect = (componentId: string) => {
  if (isEditing.value) {
    editorStore.selectComponent(componentId)
  }
}

// 处理组件删除
const handleDelete = (componentId: string) => {
  editorStore.removeComponent(componentId)
}

// 获取组件默认属性
const getDefaultProps = (componentType: string): Record<string, any> => {
  const defaultPropsMap: Record<string, any> = {
    'el-input': { placeholder: '请输入内容' },
    'el-button': { type: 'primary' },
    'el-select': { placeholder: '请选择' },
    'el-table': { border: true, stripe: true },
    'el-card': { shadow: 'hover' },
    'el-row': { gutter: 20 },
    'el-col': { span: 24 }
  }

  return defaultPropsMap[componentType] || {}
}
</script>

<style scoped>
.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.canvas-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.canvas-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}

.canvas-content.mobile {
  background: #e0e0e0;
  padding: 40px 0;
}

.canvas-content.preview-mode {
  background: #fff;
  padding: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
```

### 4.3 组件树递归渲染 (ComponentTree.vue)

**功能描述：**
- 递归渲染组件树
- 包装组件支持选中、拖拽
- 处理事件冒泡

**实现示例：**
```vue
<template>
  <ComponentWrapper
    :id="config.id"
    :selected="isSelected"
    :is-editing="isEditing"
    @click="handleClick"
    @delete="handleDelete"
  >
    <component
      :is="componentType"
      v-bind="config.props"
    >
      <!-- 递归渲染子组件 -->
      <ComponentTree
        v-for="(child, index) in config.children"
        :key="child.id"
        :config="child"
        :selected-id="selectedId"
        :is-editing="isEditing"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
      />
    </component>
  </ComponentWrapper>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { ElContainer, ElRow, ElCol, ElInput, ElSelect, ElOption, ElButton, ElDatePicker, ElTable, ElTableColumn, ElCard } from 'element-plus'
import ComponentWrapper from './ComponentWrapper.vue'

interface Props {
  config: ComponentTree
  selectedId: string | null
  isEditing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()

// 组件类型映射
const componentMap: Record<string, any> = {
  'el-container': ElContainer,
  'el-row': ElRow,
  'el-col': ElCol,
  'el-input': ElInput,
  'el-select': ElSelect,
  'el-option': ElOption,
  'el-button': ElButton,
  'el-date-picker': ElDatePicker,
  'el-table': ElTable,
  'el-table-column': ElTableColumn,
  'el-card': ElCard
}

// 当前组件类型
const componentType = computed(() => componentMap[props.config.type] || 'div')

// 是否被选中
const isSelected = computed(() => props.selectedId === props.config.id)

// 处理点击事件
const handleClick = (event: Event) => {
  event.stopPropagation()
  if (props.isEditing) {
    emit('select', props.config.id)
  }
}

// 处理删除事件
const handleDelete = () => {
  emit('delete', props.config.id)
}
</script>
```

### 4.4 组件包装器 (ComponentWrapper.vue)

**功能描述：**
- 包装组件，提供选中高亮效果
- 显示删除按钮
- 处理拖拽排序（可选）

**实现示例：**
```vue
<template>
  <div
    class="component-wrapper"
    :class="{ 'selected': selected, 'editing': isEditing }"
    @click="$emit('click', $event)"
  >
    <!-- 选中状态时的操作栏 -->
    <div v-if="selected && isEditing" class="component-actions">
      <span class="component-label">{{ config.type }}</span>
      <el-button
        type="danger"
        size="small"
        icon="Delete"
        circle
        @click.stop="$emit('delete')"
      />
    </div>

    <!-- 组件内容 -->
    <div class="component-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string
  selected: boolean
  isEditing: boolean
}

defineProps<Props>()
defineEmits<{
  click: [event: Event]
  delete: []
}>()
</script>

<style scoped>
.component-wrapper {
  position: relative;
  min-height: 40px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.component-wrapper.editing:hover {
  border-color: #c0c4cc;
  cursor: pointer;
}

.component-wrapper.selected {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.component-actions {
  position: absolute;
  top: -28px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
}

.component-label {
  font-weight: 500;
}

.component-content {
  min-height: 100%;
}
</style>
```

### 4.5 属性配置面板 (PropertyPanel.vue)

**功能描述：**
- 显示选中组件的属性
- 支持属性修改
- 实时更新预览

**实现示例：**
```vue
<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
    </div>

    <div v-if="selectedComponent" class="panel-content">
      <!-- 组件信息 -->
      <div class="component-info">
        <el-tag>{{ selectedComponent.type }}</el-tag>
        <span class="component-id">{{ selectedComponent.id }}</span>
      </div>

      <!-- 属性编辑表单 -->
      <el-form :model="formProps" label-width="80px">
        <el-form-item
          v-for="(value, key) in editableProps"
          :key="key"
          :label="key"
        >
          <el-input
            v-if="typeof value === 'string'"
            v-model="formProps[key]"
            @input="handlePropChange"
          />
          <el-switch
            v-else-if (typeof value === 'boolean'"
            v-model="formProps[key]"
            @change="handlePropChange"
          />
          <el-input-number
            v-else-if (typeof value === 'number'"
            v-model="formProps[key]"
            @change="handlePropChange"
          />
          <el-input
            v-else
            v-model="formProps[key]"
            type="textarea"
            @input="handlePropChange"
          />
        </el-form-item>
      </el-form>
    </div>

    <div v-else class="panel-empty">
      <el-empty description="请选择组件以编辑属性" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()

// 当前选中的组件
const selectedComponent = computed(() => editorStore.selectedComponent)

// 表单属性
const formProps = reactive<Record<string, any>>({})

// 可编辑的属性（排除内部属性）
const editableProps = computed(() => {
  if (!selectedComponent.value) return {}

  const props = { ...selectedComponent.value.props }
  // 排除一些不应该编辑的属性
  delete props.vModel
  delete props.ref

  return props
})

// 监听选中组件变化，更新表单
watch(() => selectedComponent.value?.id, (newId) => {
  if (newId && selectedComponent.value) {
    Object.assign(formProps, selectedComponent.value.props)
  } else {
    Object.keys(formProps).forEach(key => delete formProps[key])
  }
}, { immediate: true })

// 处理属性变化
const handlePropChange = () => {
  if (selectedComponent.value) {
    editorStore.updateComponentProps(selectedComponent.value.id, { ...formProps })
  }
}
</script>

<style scoped>
.property-panel {
  width: 300px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.component-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.component-id {
  font-size: 12px;
  color: #909399;
}

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 4.6 预览面板 (PreviewPanel.vue)

**功能描述：**
- 显示PC/移动端预览
- 切换预览模式

**实现示例：**
```vue
<template>
  <div class="preview-panel">
    <div class="preview-header">
      <h3>预览</h3>
      <div class="mode-switch">
        <el-button
          :type="previewMode === 'pc' ? 'primary' : 'default'"
          size="small"
          @click="switchMode('pc')"
        >
          PC
        </el-button>
        <el-button
          :type="previewMode === 'mobile' ? 'primary' : 'default'"
          size="small"
          @click="switchMode('mobile')"
        >
          移动端
        </el-button>
      </div>
    </div>

    <div class="preview-content">
      <div class="preview-container" :class="previewMode">
        <DynamicRenderer
          :config="pageConfig"
          :data="mockData"
        />
      </div>
    </div>

    <div class="preview-footer">
      <el-button @click="exportConfig">导出JSON</el-button>
      <el-button @click="copyConfig">复制配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useEditorStore } from '@/stores/editor'
import DynamicRenderer from '@/components/renderer/DynamicRenderer.vue'

const editorStore = useEditorStore()

// 预览模式
const previewMode = computed(() => editorStore.previewMode)

// 组件树数据
const componentTree = computed(() => editorStore.componentTree)

// 页面配置
const pageConfig = computed(() => ({
  version: '1.0.0',
  page: {
    id: 'demo-page',
    title: '演示页面'
  },
  components: componentTree.value
}))

// 模拟数据
const mockData = {
  username: '张三',
  email: 'zhangsan@example.com',
  status: 'active'
}

// 切换预览模式
const switchMode = (mode: 'pc' | 'mobile') => {
  editorStore.setPreviewMode(mode)
}

// 导出配置
const exportConfig = () => {
  const config = JSON.stringify(pageConfig.value, null, 2)
  const blob = new Blob([config], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `page-config-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 复制配置
const copyConfig = () => {
  const config = JSON.stringify(pageConfig.value, null, 2)
  navigator.clipboard.writeText(config).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}
</script>

<style scoped>
.preview-panel {
  width: 400px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.mode-switch {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}

.preview-container {
  min-height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.preview-container.mobile {
  width: 375px;
  margin: 0 auto;
}

.preview-footer {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
```

### 4.7 动态渲染器 (DynamicRenderer.vue)

**功能描述：**
- 接收JSON配置动态渲染页面
- 支持数据绑定
- 支持事件处理

**实现示例：**
```vue
<template>
  <div class="dynamic-renderer">
    <ComponentTree
      v-for="(component, index) in config.components"
      :key="component.id || index"
      :config="component"
      :data="data"
      @event="handleEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import ComponentTree from './ComponentTree.vue'

interface Props {
  config: PageConfig
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
})

// 向下提供数据上下文
provide('renderData', computed(() => props.data))

// 事件处理
const emit = defineEmits<{
  (e: 'event', payload: any): void
}>()

const handleEvent = (payload: any) => {
  emit('event', payload)
}
</script>

<style scoped>
.dynamic-renderer {
  width: 100%;
  height: 100%;
}
</style>
```

---

## 5. JSON配置生成

### 5.1 配置结构

```typescript
// types/config.ts
export interface PageConfig {
  version: string
  page: {
    id: string
    title: string
  }
  components: ComponentTree[]
}

export interface ComponentTree {
  id: string
  type: string
  props: Record<string, any>
  children?: ComponentTree[]
}
```

### 5.2 生成工具函数

```typescript
// utils/generator.ts
import type { PageConfig, ComponentTree } from '@/types'

export const generatePageConfig = (componentTree: ComponentTree[]): PageConfig => {
  return {
    version: '1.0.0',
    page: {
      id: `page_${Date.now()}`,
      title: '自定义页面'
    },
    components: componentTree
  }
}

export const exportConfigAsJSON = (config: PageConfig): string => {
  return JSON.stringify(config, null, 2)
}

export const importConfigFromJSON = (jsonStr: string): PageConfig => {
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    throw new Error('JSON格式错误')
  }
}
```

---

## 6. 开发计划

### 6.1 开发任务

| 阶段 | 任务 | 工期 | 说明 |
|------|------|------|------|
| 环境搭建 | 初始化项目、安装依赖 | 0.5天 | Vue3 + Vite + Pinia |
| 类型定义 | TypeScript类型定义 | 0.5天 | 组件、配置类型 |
| 状态管理 | Pinia Store实现 | 1天 | 编辑器状态、组件树管理 |
| 组件库面板 | 左侧组件面板开发 | 0.5天 | 组件列表、拖拽 |
| 画布编辑 | 画布编辑区开发 | 1.5天 | 组件渲染、选中、删除 |
| 属性面板 | 右侧属性面板开发 | 1天 | 属性编辑、实时更新 |
| 预览面板 | 预览功能开发 | 0.5天 | PC/移动端预览 |
| 渲染器 | 动态渲染器开发 | 1天 | 接收JSON、动态渲染 |
| JSON生成 | 导入导出功能 | 0.5天 | JSON生成、导出 |
| 样式优化 | UI样式调整 | 0.5天 | 响应式、交互优化 |
| 测试调试 | 功能测试、Bug修复 | 1天 | - |

**总计工期**：约8个工作日

### 6.2 里程碑

- [ ] Day 1：环境搭建完成、类型定义完成
- [ ] Day 3：状态管理完成、组件库面板完成
- [ ] Day 5：画布编辑完成、属性面板完成
- [ ] Day 6：预览功能完成、渲染器完成
- [ ] Day 7：JSON导入导出完成
- [ ] Day 8：样式优化、测试完成

---

## 7. 技术要点与注意事项

### 7.1 关键技术点

1. **组件递归渲染**
   - 使用递归组件渲染组件树
   - 注意避免无限递归

2. **拖拽实现**
   - 使用 Vue.Draggable 实现组件拖拽
   - 注意拖拽事件的数据传递

3. **状态同步**
   - 使用 Pinia 管理全局状态
   - 注意响应式更新

4. **动态组件渲染**
   - 使用 Vue 的 `component` 组件
   - 组件类型映射表

5. **数据绑定**
   - 使用 `v-model` 实现双向绑定
   - 注意数据路径解析

### 7.2 注意事项

1. **组件ID唯一性**
   - 确保每个组件有唯一ID
   - 使用时间戳 + 随机数生成

2. **性能优化**
   - 大量组件时考虑虚拟滚动
   - 避免频繁的全局状态更新

3. **类型安全**
   - 充分利用 TypeScript 类型检查
   - 定义完整的类型定义

4. **错误处理**
   - JSON解析错误处理
   - 组件渲染失败处理

5. **浏览器兼容性**
   - 测试主流浏览器
   - 注意拖拽API的兼容性

---

## 8. Demo验证目标

### 8.1 功能验证

- [ ] 能够从组件库拖拽组件到画布
- [ ] 能够在画布中选中组件
- [ ] 能够删除画布中的组件
- [ ] 能够修改组件属性并实时预览
- [ ] 能够切换PC/移动端预览模式
- [ ] 能够导出页面JSON配置
- [ ] 能够导入JSON配置恢复页面
- [ ] 渲染器能够正确渲染JSON配置

### 8.2 性能验证

- [ ] 拖拽流畅无卡顿
- [ ] 属性修改实时更新无延迟
- [ ] 预览切换流畅
- [ ] JSON生成速度 < 500ms

### 8.3 体验验证

- [ ] 界面布局合理
- [ ] 操作流程顺畅
- [ ] 选中状态清晰
- [ ] 错误提示友好

---

**文档结束**
