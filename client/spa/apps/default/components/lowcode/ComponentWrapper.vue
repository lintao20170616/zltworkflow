<template>
  <div
    class="component-wrapper"
    :class="{ selected: isSelected, 'is-container': !previewMode && isContainer }"
    :data-component-id="config.id"
    :style="wrapperStyle"
    @click.stop="handleSelect"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div v-if="!previewMode" class="wrapper-overlay">
      <div v-if="isHover && !isSelected" class="hover-actions">
        <el-button type="primary" size="small" circle :icon="CopyDocument" @click.stop="handleDuplicate" />
        <el-button type="danger" size="small" circle :icon="Delete" @click.stop="handleDelete" />
      </div>
      <div v-if="isSelected" class="selected-border" />
    </div>
    <component :is="config.type" v-bind="componentProps" :style="config.style" :class="config.class" class="lowcode-component">
      <template v-if="config.type === 'el-button'">
        {{ config.props?.label ?? '按钮' }}
      </template>
      <template v-if="config.type === 'el-select' && selectOptions.length">
        <el-option v-for="opt in selectOptions" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
      </template>
      <template v-else-if="isContainer && config.children?.length">
        <component-wrapper v-for="child in config.children" :key="child.id" :config="child" :preview-mode="previewMode" :parent-config="config" />
      </template>
      <div v-if="!previewMode && isContainer && !config.children?.length" class="empty-container">
        <span class="empty-hint">拖拽组件到此处</span>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CopyDocument, Delete } from '@element-plus/icons-vue';
import { useLowcodeStore, CONTAINER_COMPONENTS, type ComponentConfig } from '@app/store/lowcode';

const store = useLowcodeStore();

const props = withDefaults(
  defineProps<{
    config: ComponentConfig;
    previewMode?: boolean;
    parentConfig?: ComponentConfig;
  }>(),
  { previewMode: false },
);
const emit = defineEmits<{
  select: [id: string];
  duplicate: [id: string];
  delete: [id: string];
}>();

const isSelected = computed(() => store.selectedComponentId === props.config.id);
const isHover = ref(false);
const isContainer = computed(() => CONTAINER_COMPONENTS.includes(props.config.type));

const selectOptions = computed(() => {
  if (props.config.type !== 'el-select') return [];
  const opts = props.config.props?.options;
  return Array.isArray(opts) ? opts : [];
});

const componentProps = computed(() => {
  const p = { ...props.config.props };
  if (props.config.type === 'el-select') {
    const { options, ...rest } = p;
    return rest;
  }
  return p;
});

const wrapperStyle = computed(() => {
  if (props.parentConfig?.type === 'el-row') {
    const gutter = props.parentConfig.props?.gutter ?? 0;
    if (gutter > 0) {
      const gutterValue = gutter / 2;
      return {
        paddingLeft: `${gutterValue}px`,
        paddingRight: `${gutterValue}px`,
      };
    }
  }
  return {};
});

const handleSelect = () => {
  emit('select', props.config.id);
  store.selectComponent(props.config.id);
};

const handleDuplicate = () => {
  emit('duplicate', props.config.id);
  store.duplicateComponent(props.config.id);
};

const handleDelete = () => {
  emit('delete', props.config.id);
  store.removeComponent(props.config.id);
};
</script>

<style scoped lang="less">
.component-wrapper {
  position: relative;
  display: inline-block;
  min-height: 24px;
}
.is-container {
  padding: 5px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
}
.component-wrapper.selected .selected-border {
  position: absolute;
  inset: -2px;
  border: 2px solid #409eff;
  border-radius: 4px;
  pointer-events: none;
}

.wrapper-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  margin-left: 0;
}

.wrapper-overlay .hover-actions {
  position: absolute;
  top: -12px;
  right: 0;
  display: flex;
  gap: 4px;
  pointer-events: auto;
}

.component-wrapper:hover .hover-actions {
  z-index: 10;
}

.lowcode-component {
  pointer-events: auto;
}

.empty-container {
  min-height: 48px;
  padding: 16px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.empty-hint {
  user-select: none;
}

:deep(.el-form),
:deep(.el-card__body),
:deep(.el-tabs__content) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-row) {
  .component-wrapper {
    box-sizing: border-box;
  }
}
</style>
