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

const textContentComponents = ['el-button', 'el-text', 'el-tag', 'el-link', 'el-alert', 'el-avatar'];

function hasTextContent(type: string): boolean {
  return textContentComponents.includes(type);
}
</script>

<style scoped>
.lowcode-renderer {
  width: 100%;
}
</style>
