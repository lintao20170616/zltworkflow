<template>
  <div class="canvas-container" @drop="handleDrop" @dragover.prevent>
    <div v-if="components.length === 0" class="canvas-empty">
      <el-empty description="从左侧组件库拖拽组件到此处" />
    </div>
    <div v-else class="canvas-content">
      <lowcode-renderer-wrapper :components="components" :selected-component-id="selectedComponentId" @select="handleSelect" @delete="handleDelete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLowcodeStore, type ComponentConfig } from '@app/store/lowcode';
import LowcodeRendererWrapper from './LowcodeRendererWrapper.vue';

const store = useLowcodeStore();

const components = computed({
  get: () => store.components,
  set: (value: ComponentConfig[]) => {
    store.components = value;
    store.saveHistory();
  },
});

const selectedComponentId = computed(() => store.selectedComponentId);

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
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
        style: getDefaultStyle(componentMeta.type),
      };
      store.addComponent(newComponent);
      store.selectComponent(newComponent.id);
    } catch (error) {
      console.error('Failed to parse component data:', error);
    }
  }
};

const handleSelect = (componentId: string) => {
  store.selectComponent(componentId);
};

const handleDelete = (componentId: string) => {
  store.removeComponent(componentId);
};

const handleDragStart = () => {
  // 拖拽开始
};

const handleDragEnd = () => {
  // 拖拽结束
};

const handleDragUpdate = () => {
  // 拖拽更新，自动触发 v-model 更新
};

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
    'el-link': '链接',
    'el-divider': '分割线',
    'el-alert': '这是一条警告提示',
    'el-avatar': 'A',
  };
  return textMap[type];
}

function getDefaultStyle(type: string): Record<string, string> {
  const defaultStyleMap: Record<string, Record<string, string>> = {
    'el-button': { display: 'inline-block' },
    'el-text': { display: 'inline-block' },
    'el-link': { display: 'inline-block' },
    'el-divider': { width: '100%', display: 'block' },
    'el-space': { width: '100%' },
    'el-image': { width: '300px', height: '200px', display: 'inline-block' },
    'el-avatar': { display: 'inline-block' },
    'el-badge': { display: 'inline-block' },
    'el-alert': { width: '100%' },
    'el-form': { width: '100%' },
    'el-form-item': { width: '100%' },
    'el-input': { width: '200px', display: 'inline-block' },
    'el-input-number': { width: '200px', display: 'inline-block' },
    'el-select': { width: '200px', display: 'inline-block' },
    'el-date-picker': { width: '200px', display: 'inline-block' },
    'el-checkbox': { display: 'inline-block' },
    'el-radio': { display: 'inline-block' },
    'el-switch': { display: 'inline-block' },
    'el-slider': { width: '300px', display: 'inline-block' },
    'el-rate': { display: 'inline-block' },
    'el-table': { width: '100%' },
    'el-card': { width: '100%' },
    'el-list': { width: '100%' },
    'el-tag': { display: 'inline-block' },
    'el-row': { width: '100%' },
    'el-col': { width: '100%' },
    'el-container': { width: '100%', minHeight: '200px' },
  };
  return defaultStyleMap[type] || { display: 'inline-block' };
}
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 20px;
}

.canvas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.canvas-content {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  min-height: 100%;
  padding: 20px;
  line-height: normal;
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
</style>
