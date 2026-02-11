<template>
  <el-form ref="formRef" :model="formModel" v-bind="formComponent.props" :style="getComponentStyle(formComponent)">
    <lowcode-renderer
      :config="{ version: pageConfig.version, page: pageConfig.page, components: formComponent.children ?? [] }"
      :form-model="formModel"
      :form-ref="formRef"
      :on-submit="onSubmit"
    />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { PageConfig, ComponentConfig } from '@app/store/lowcode';
import { buildFormModel } from './formUtils';
import LowcodeRenderer from './LowcodeRenderer.vue';

const props = defineProps<{
  formComponent: ComponentConfig;
  pageConfig: PageConfig;
  onSubmit?: (data: Record<string, any>) => void;
}>();

const formRef = ref();
const formModel = reactive<Record<string, any>>(buildFormModel(props.formComponent.children));

watch(
  () => props.formComponent.children,
  (children) => {
    const next = buildFormModel(children);
    Object.keys(formModel).forEach((k) => delete formModel[k]);
    Object.assign(formModel, next);
  },
  { deep: true },
);

const getComponentStyle = (component: ComponentConfig): Record<string, string> => {
  return component.style || {};
};
</script>
