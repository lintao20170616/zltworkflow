<template>
  <div class="lowcode-renderer-wrapper">
    <vue-draggable
      v-model="components"
      :animation="200"
      handle=".drag-handle"
      ghost-class="ghost"
      chosen-class="chosen"
      drag-class="drag"
      group="components"
      @start="handleDragStart"
      @end="handleDragEnd"
      @update="handleDragUpdate"
    >
      <component-item
        v-for="component in components"
        :key="component.id"
        :component="component"
        :selected="selectedComponentId === component.id"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
      />
    </vue-draggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useLowcodeStore, type ComponentConfig } from '@app/store/lowcode';
import ComponentItem from './ComponentItem.vue';

const props = defineProps<{
  components: ComponentConfig[];
  selectedComponentId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
  delete: [id: string];
}>();

const store = useLowcodeStore();

const components = computed({
  get: () => props.components,
  set: (value: ComponentConfig[]) => {
    store.components = value;
    store.saveHistory();
  },
});

const handleDragStart = () => {
  // 拖拽开始
};

const handleDragEnd = () => {
  // 拖拽结束
};

const handleDragUpdate = () => {
  // 拖拽更新，自动触发 v-model 更新
};
</script>

<style scoped>
.lowcode-renderer-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;
}

.lowcode-renderer-wrapper > * {
  margin: 0;
  padding: 0;
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
