<template>
  <div class="component-item" :class="{ selected: selected }" @click.stop="$emit('select', component.id)">
    <div v-if="selected" class="component-actions">
      <div class="drag-handle" title="拖拽移动">
        <el-icon><sort /></el-icon>
      </div>
      <el-button type="danger" size="small" :icon="Delete" circle @click.stop="$emit('delete', component.id)" />
    </div>
    <div class="component-wrapper" :style="component.style" :class="component.class">
      <component :is="component.type" v-bind="component.props">
        <template v-if="hasTextContent(component.type) && component.text !== undefined">
          {{ component.text }}
        </template>
        <template v-else-if="component.children && component.children.length > 0">
          <component-item
            v-for="child in component.children"
            :key="child.id"
            :component="child"
            :selected="false"
            @select="$emit('select', $event)"
            @delete="$emit('delete', $event)"
          />
        </template>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Sort } from '@element-plus/icons-vue';
import type { ComponentConfig } from '@app/store/lowcode';
import ComponentItem from './ComponentItem.vue';

defineProps<{
  component: ComponentConfig;
  selected: boolean;
}>();

defineEmits<{
  select: [id: string];
  delete: [id: string];
}>();

const textContentComponents = ['el-button', 'el-text', 'el-tag', 'el-link', 'el-alert'];

function hasTextContent(type: string): boolean {
  return textContentComponents.includes(type);
}
</script>

<style scoped>
.component-item {
  position: relative;
  margin-bottom: 12px;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.component-item:hover {
  background: #f0f9ff;
}

.component-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.component-wrapper {
  pointer-events: none;
}

.component-actions {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
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
