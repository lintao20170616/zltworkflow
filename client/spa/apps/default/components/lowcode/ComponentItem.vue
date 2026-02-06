<template>
  <div class="component-item" :class="{ selected: selected, 'can-nest': canNest, 'is-layout': isLayoutComponent }" @click.stop="$emit('select', component.id)">
    <div v-if="selected" class="component-actions">
      <div class="drag-handle" title="拖拽移动">
        <el-icon><sort /></el-icon>
      </div>
      <el-button type="danger" size="small" :icon="Delete" circle @click.stop="$emit('delete', component.id)" />
    </div>
    <div class="component-wrapper">
      <component :is="component.type" v-bind="component.props" :style="component.style" :class="component.class">
        <template v-if="component.type === 'el-table' && component.props.columns">
          <el-table-column
            v-for="col in component.props.columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :sortable="col.sortable"
          />
        </template>
        <template v-else-if="component.type === 'el-list' && component.props.data">
          <el-list-item v-for="(item, index) in component.props.data" :key="item.id || index">
            <span>{{ item.content || item.label || JSON.stringify(item) }}</span>
          </el-list-item>
        </template>
        <template v-else-if="component.type === 'el-select' && component.props.options">
          <el-option v-for="option in component.props.options" :key="option.value" :label="option.label" :value="option.value" />
        </template>
        <template v-else-if="hasTextContent(component.type) && component.text !== undefined">
          {{ component.text }}
        </template>
        <template v-else-if="canNest && component.children && component.children.length > 0">
          <div
            class="nest-container"
            :class="{ 'nest-container-full': isLayoutComponent, 'nest-container-row': component.type === 'el-row' }"
            :style="component.type === 'el-row' && component.props.gutter ? { '--el-row-gutter': component.props.gutter + 'px' } : {}"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <vue-draggable
              v-model="children"
              :animation="200"
              handle=".drag-handle"
              ghost-class="ghost"
              chosen-class="chosen"
              drag-class="drag"
              group="components"
              @start="handleDragStart"
              @end="handleDragEnd"
            >
              <component-item
                v-for="child in component.children"
                :key="child.id"
                :component="child"
                :selected="selectedComponentId === child.id"
                @select="$emit('select', $event)"
                @delete="$emit('delete', $event)"
              />
            </vue-draggable>
          </div>
        </template>
        <template v-else-if="canNest && (!component.children || component.children.length === 0)">
          <div class="nest-empty" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
            <el-empty description="拖拽组件到此处" :image-size="60" />
          </div>
        </template>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { Delete, Sort } from '@element-plus/icons-vue';
import { useLowcodeStore, type ComponentConfig } from '@app/store/lowcode';
import { canComponentNest } from './componentSchemas';
import ComponentItem from './ComponentItem.vue';

const props = defineProps<{
  component: ComponentConfig;
  selected: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  delete: [id: string];
}>();

const store = useLowcodeStore();
const selectedComponentId = computed(() => store.selectedComponentId);
const canNest = computed(() => canComponentNest(props.component.type));

const isLayoutComponent = computed(() => {
  const layoutTypes = ['el-row', 'el-col', 'el-container', 'el-card', 'el-table', 'el-form', 'el-form-item', 'el-space', 'el-badge'];
  return layoutTypes.includes(props.component.type);
});

const children = computed({
  get: () => props.component.children || [],
  set: (value: ComponentConfig[]) => {
    if (props.component.children) {
      props.component.children.length = 0;
      props.component.children.push(...value);
      store.saveHistory();
    }
  },
});

const textContentComponents = ['el-button', 'el-text', 'el-tag', 'el-link', 'el-alert', 'el-avatar', 'el-divider'];

function hasTextContent(type: string): boolean {
  return textContentComponents.includes(type);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  const data = event.dataTransfer?.getData('application/json');
  if (data) {
    try {
      const componentMeta = JSON.parse(data);
      const defaultProps = getDefaultProps(componentMeta.type);
      const newComponent: ComponentConfig = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: componentMeta.type,
        props: defaultProps,
        children: [],
        text: getDefaultText(componentMeta.type),
        style: {},
      };
      store.addComponent(newComponent, props.component.id);
      store.selectComponent(newComponent.id);
    } catch (error) {
      console.error('Failed to parse component data:', error);
    }
  }
}

function handleDragStart() {
  // 拖拽开始
}

function handleDragEnd() {
  // 拖拽结束
}

function getDefaultProps(type: string): Record<string, any> {
  const defaultPropsMap: Record<string, Record<string, any>> = {
    'el-button': { type: 'primary', size: 'default' },
    'el-text': { type: '', size: 'default' },
    'el-link': { type: 'default', href: '#', underline: true },
    'el-divider': { direction: 'horizontal', contentPosition: 'center' },
    'el-space': { size: 'default', direction: 'horizontal' },
    'el-image': { src: 'https://via.placeholder.com/300x200', fit: 'fill' },
    'el-avatar': { size: 'default', shape: 'circle' },
    'el-badge': { value: '1', max: 99, type: 'danger' },
    'el-alert': { type: 'info', closable: true, showIcon: true },
    'el-form': { labelWidth: '100px', labelPosition: 'right' },
    'el-form-item': { label: '表单项', prop: '' },
    'el-input': { placeholder: '请输入内容' },
    'el-textarea': { placeholder: '请输入内容', rows: 3 },
    'el-input-number': { placeholder: '请输入数字', step: 1 },
    'el-select': {
      placeholder: '请选择',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
    'el-date-picker': { type: 'date', placeholder: '选择日期' },
    'el-checkbox': { label: '选项' },
    'el-radio': { label: '选项' },
    'el-switch': { activeText: '开启', inactiveText: '关闭' },
    'el-slider': { min: 0, max: 100, step: 1 },
    'el-rate': { max: 5 },
    'el-table': {
      data: [
        { name: '张三', age: 20, address: '北京市' },
        { name: '李四', age: 25, address: '上海市' },
      ],
      columns: [
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'age', label: '年龄', width: '80' },
        { prop: 'address', label: '地址', minWidth: '150' },
      ],
      border: true,
    },
    'el-card': { shadow: 'hover' },
    'el-list': {
      data: [
        { id: 1, content: '列表项1' },
        { id: 2, content: '列表项2' },
      ],
      border: true,
    },
    'el-tag': { type: '', size: 'default', effect: 'light' },
    'el-row': { gutter: 0 },
    'el-col': { span: 12 },
    'el-container': {},
  };
  return defaultPropsMap[type] || {};
}

function getDefaultText(type: string): string | undefined {
  const textMap: Record<string, string> = {
    'el-button': '按钮',
    'el-text': '文本',
    'el-tag': '标签',
  };
  return textMap[type];
}
</script>

<style scoped>
.component-item {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

.component-item:hover:not(.selected) {
  outline: 1px dashed #409eff;
  outline-offset: 2px;
}

.component-item.selected {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.component-wrapper {
  pointer-events: none;
  display: inline-block;
  vertical-align: top;
}

.component-item.can-nest .component-wrapper {
  pointer-events: auto;
  display: block;
  width: 100%;
}

.component-item.can-nest .nest-container .component-item {
  margin: 0;
  box-sizing: border-box;
}

.component-item.can-nest .nest-container-row .component-item {
  width: auto;
  display: inline-block;
  flex-shrink: 0;
  padding-left: calc(var(--el-row-gutter, 0) / 2);
  padding-right: calc(var(--el-row-gutter, 0) / 2);
  box-sizing: border-box;
}

.component-item.can-nest .nest-container-row .component-item .component-wrapper {
  width: auto;
  min-width: 100px;
}

.component-item.can-nest .nest-container-row .component-item .component-wrapper > [class*='el-select'],
.component-item.can-nest .nest-container-row .component-item .component-wrapper > [class*='el-input'],
.component-item.can-nest .nest-container-row .component-item .component-wrapper > [class*='el-date-picker'] {
  width: 200px;
  min-width: 150px;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper {
  width: auto;
  min-width: 200px;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-select'],
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-input'],
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-date-picker'],
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-textarea'],
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-input-number'] {
  width: auto;
  min-width: 200px;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-input'] :deep(.el-input__wrapper),
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-select'] :deep(.el-select__wrapper),
.component-item.can-nest .nest-container:not(.nest-container-row) .component-item .component-wrapper > [class*='el-date-picker'] :deep(.el-input__wrapper) {
  width: auto;
  min-width: 200px;
}

.component-item.can-nest .nest-container-row .component-item.is-layout {
  width: 100%;
  display: block;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item {
  width: 100%;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item:not(.is-layout) {
  width: auto;
  display: inline-block;
}

.component-item.can-nest .nest-container .component-item .component-wrapper {
  width: auto;
}

.component-item.can-nest .nest-container:not(.nest-container-row) .component-item.is-layout .component-wrapper {
  width: 100%;
}

.component-item.is-layout {
  display: block;
  width: 100%;
}

.component-item.is-layout .component-wrapper {
  display: block;
  width: 100%;
}

.nest-container {
  display: inline-block;
  width: auto;
  padding: 12px;
  box-sizing: border-box;
}

.nest-container-full {
  width: 100%;
  display: block;
  padding: 12px;
  box-sizing: border-box;
}

.nest-container-row {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.component-item.can-nest .component-wrapper > [class*='el-row'] {
  width: 100%;
}

.component-item.can-nest .nest-container-row {
  margin-left: calc(var(--el-row-gutter, 0) / -2);
  margin-right: calc(var(--el-row-gutter, 0) / -2);
}

.nest-empty {
  min-height: 60px;
  width: 100%;
  padding: 16px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  transition: all 0.2s;
}

.nest-empty:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.ghost {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #409eff;
}

.chosen {
  cursor: grabbing;
}

.drag {
  opacity: 0.8;
}

.component-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  display: flex;
  gap: 4px;
  align-items: center;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 2px;
}

.drag-handle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
}

.drag-handle:hover {
  background: #66b1ff;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
