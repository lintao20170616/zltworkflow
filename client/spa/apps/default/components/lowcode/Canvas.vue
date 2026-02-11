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
import { getDefaultProps, getDefaultText, getDefaultStyle } from './componentDefaults';
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
      const newComponent: ComponentConfig = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: componentMeta.type,
        props: getDefaultProps(componentMeta.type),
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
