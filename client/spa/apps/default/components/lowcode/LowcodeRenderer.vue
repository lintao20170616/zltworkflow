<template>
  <div class="lowcode-renderer">
    <component
      :is="component.type"
      v-for="component in config.components"
      :key="component.id"
      v-bind="component.props"
      :style="component.style"
      :class="component.class"
    >
      <template v-if="hasTextContent(component.type) && component.text !== undefined">
        {{ component.text }}
      </template>
      <template v-else-if="component.children && component.children.length > 0">
        <lowcode-renderer :config="{ version: config.version, page: config.page, components: component.children }" />
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { PageConfig } from '@app/store/lowcode';

defineProps<{
  config: PageConfig;
}>();

const textContentComponents = ['el-button', 'el-text', 'el-tag', 'el-link', 'el-alert'];

function hasTextContent(type: string): boolean {
  return textContentComponents.includes(type);
}
</script>

<style scoped>
.lowcode-renderer {
  width: 100%;
}
</style>
