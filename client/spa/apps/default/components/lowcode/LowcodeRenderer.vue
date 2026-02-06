<template>
  <div class="lowcode-renderer">
    <component
      :is="component.type"
      v-for="component in config.components"
      :key="component.id"
      v-bind="component.props"
      :style="getComponentStyle(component)"
      :class="component.class"
    >
      <template v-if="renderTableColumns(component)">
        <component
          :is="getChildComponentName(component.type, 'columns')"
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
      <template v-else-if="renderListItems(component)">
        <component :is="getChildComponentName(component.type, 'data')" v-for="(item, index) in component.props.data" :key="item.id || index">
          <span>{{ item.content || item.label || JSON.stringify(item) }}</span>
        </component>
      </template>
      <template v-else-if="renderSelectOptions(component)">
        <component
          :is="getChildComponentName(component.type, 'options')"
          v-for="option in component.props.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </template>
      <template v-else-if="hasTextContent(component.type) && component.text !== undefined">
        {{ component.text }}
      </template>
      <template v-else-if="canNest(component.type) && component.children && component.children.length > 0">
        <template v-if="component.type === 'el-row' || component.type === 'el-col'">
          <component
            :is="child.type"
            v-for="child in component.children"
            :key="child.id"
            v-bind="child.props"
            :style="getComponentStyle(child)"
            :class="child.class"
          >
            <template v-if="renderTableColumns(child)">
              <component
                :is="getChildComponentName(child.type, 'columns')"
                v-for="col in child.props.columns"
                :key="col.prop"
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :fixed="col.fixed"
                :sortable="col.sortable"
              />
            </template>
            <template v-else-if="renderListItems(child)">
              <component :is="getChildComponentName(child.type, 'data')" v-for="(item, index) in child.props.data" :key="item.id || index">
                <span>{{ item.content || item.label || JSON.stringify(item) }}</span>
              </component>
            </template>
            <template v-else-if="renderSelectOptions(child)">
              <component
                :is="getChildComponentName(child.type, 'options')"
                v-for="option in child.props.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </template>
            <template v-else-if="hasTextContent(child.type) && child.text !== undefined">
              {{ child.text }}
            </template>
            <template v-else-if="canNest(child.type) && child.children && child.children.length > 0">
              <lowcode-renderer :config="{ version: config.version, page: config.page, components: child.children }" />
            </template>
          </component>
        </template>
        <lowcode-renderer v-else :config="{ version: config.version, page: config.page, components: component.children }" />
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { PageConfig, ComponentConfig } from '@app/store/lowcode';
import { getComponentSchema, canComponentNest, getChildComponentName } from './componentSchemas';

defineProps<{
  config: PageConfig;
}>();

const hasTextContentProperty = (type: string): boolean => {
  const schema = getComponentSchema(type);
  if (!schema) return false;
  return schema.properties.some((prop) => prop.type === 'text');
};

const hasTextContent = (type: string): boolean => {
  return hasTextContentProperty(type);
};

const canNest = (type: string): boolean => {
  return canComponentNest(type);
};

const renderTableColumns = (component: ComponentConfig): boolean => {
  const schema = getComponentSchema(component.type);
  if (!schema || component.type !== 'el-table') return false;
  const hasColumnsProp = schema.properties.some((prop) => prop.key === 'columns');
  return hasColumnsProp && component.props.columns && Array.isArray(component.props.columns);
};

const renderListItems = (component: ComponentConfig): boolean => {
  const schema = getComponentSchema(component.type);
  if (!schema || component.type !== 'el-list') return false;
  const hasDataProp = schema.properties.some((prop) => prop.key === 'data');
  return hasDataProp && component.props.data && Array.isArray(component.props.data);
};

const renderSelectOptions = (component: ComponentConfig): boolean => {
  const schema = getComponentSchema(component.type);
  if (!schema || component.type !== 'el-select') return false;
  const hasOptionsProp = schema.properties.some((prop) => prop.key === 'options');
  return hasOptionsProp && component.props.options && Array.isArray(component.props.options);
};

const getComponentStyle = (component: ComponentConfig): Record<string, string> => {
  const style = { ...component.style };
  if (component.type === 'el-row' && component.props.gutter !== undefined) {
    style['--el-row-gutter'] = `${component.props.gutter}px`;
  }
  return style;
};
</script>

<style scoped>
.lowcode-renderer {
  width: 100%;
}

.lowcode-renderer :deep(.el-row > *:not(.el-col)) {
  padding-left: calc(var(--el-row-gutter, 0) / 2);
  padding-right: calc(var(--el-row-gutter, 0) / 2);
  box-sizing: border-box;
}

.lowcode-renderer :deep(.el-form-item__content) {
  width: auto;
}

.lowcode-renderer :deep(.el-form-item__content > .el-input),
.lowcode-renderer :deep(.el-form-item__content > .el-select),
.lowcode-renderer :deep(.el-form-item__content > .el-date-picker),
.lowcode-renderer :deep(.el-form-item__content > .el-textarea),
.lowcode-renderer :deep(.el-form-item__content > .el-input-number) {
  width: auto;
  min-width: 200px;
}

.lowcode-renderer :deep(.el-input .el-input__wrapper),
.lowcode-renderer :deep(.el-select .el-select__wrapper),
.lowcode-renderer :deep(.el-date-picker .el-input__wrapper) {
  width: auto;
  min-width: 200px;
}
</style>
