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
      <template v-else-if="component.type === 'el-divider'">
        <template v-if="component.text">{{ component.text }}</template>
      </template>
      <template v-else-if="hasTextContent(component)">
        {{ component.text }}
      </template>
      <template v-else-if="hasChildren(component)">
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
            <template v-else-if="child.type === 'el-divider'">
              <template v-if="child.text">{{ child.text }}</template>
            </template>
            <template v-else-if="hasTextContent(child)">
              {{ child.text }}
            </template>
            <template v-else-if="hasChildren(child)">
              <lowcode-renderer :config="{ version: config.version, page: config.page, components: child.children ?? [] }" />
            </template>
          </component>
        </template>
        <lowcode-renderer v-else :config="{ version: config.version, page: config.page, components: component.children ?? [] }" />
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { PageConfig, ComponentConfig } from '@app/store/lowcode';

defineProps<{
  config: PageConfig;
}>();

const getChildComponentName = (parentType: string, propKey: string): string => {
  const childComponentMap: Record<string, Record<string, string>> = {
    'el-table': {
      columns: 'el-table-column',
    },
    'el-list': {
      data: 'el-list-item',
    },
    'el-select': {
      options: 'el-option',
    },
  };
  return childComponentMap[parentType]?.[propKey] || '';
};

const hasTextContent = (component: ComponentConfig): boolean => {
  return component.text !== undefined && component.text !== null && component.text !== '';
};

const hasChildren = (component: ComponentConfig): boolean => {
  return Array.isArray(component.children) && component.children.length > 0;
};

const renderTableColumns = (component: ComponentConfig): boolean => {
  return component.type === 'el-table' && Array.isArray(component.props?.columns) && component.props.columns.length > 0;
};

const renderListItems = (component: ComponentConfig): boolean => {
  return component.type === 'el-list' && Array.isArray(component.props?.data) && component.props.data.length > 0;
};

const renderSelectOptions = (component: ComponentConfig): boolean => {
  return component.type === 'el-select' && Array.isArray(component.props?.options) && component.props.options.length > 0;
};

const getComponentStyle = (component: ComponentConfig): Record<string, string> => {
  return component.style || {};
};
</script>

<style scoped></style>
