<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
    </div>
    <div v-if="!selectedComponent" class="panel-empty">
      <el-empty description="请选择一个组件" />
    </div>
    <div v-else class="panel-content">
      <div class="component-info">
        <el-tag type="info" size="small">{{ componentName }}</el-tag>
      </div>
      <el-form :model="formData" label-width="100px" size="default">
        <template v-for="group in groupedProperties" :key="group.name">
          <div v-if="group.name" class="property-group">
            <div class="group-title">{{ group.name }}</div>
          </div>
          <el-form-item v-for="property in group.properties" :key="property.key" :label="property.label" :required="property.required">
            <style-editor v-if="property.type === 'style'" :model-value="getModelValue(property)" @update:model-value="handleStyleUpdate(property, $event)" />
            <component
              :is="getComponentName(property.type)"
              v-else
              v-bind="getComponentProps(property)"
              :model-value="getModelValue(property)"
              @update:model-value="handleModelUpdate(property, $event)"
              @change="handlePropertyChange(property)"
              @input="handlePropertyChange(property)"
              @blur="handleBlur(property)"
              @keyup.enter="handlePropertyChange(property)"
            >
              <template v-if="property.type === 'select' && property.options">
                <el-option v-for="option in property.options" :key="option.value" :label="option.label" :value="option.value" />
              </template>
            </component>
            <div v-if="property.description" class="property-description">
              {{ property.description }}
            </div>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useLowcodeStore } from '@app/store/lowcode';
import { getPropertySchemas, getComponentSchema, type PropertySchema } from './componentSchemas';
import StyleEditor from './StyleEditor.vue';

const store = useLowcodeStore();
const selectedComponent = computed(() => store.selectedComponent);
const formData = ref<Record<string, any>>({});
const jsonInputs = ref<Record<string, string>>({});

const componentName = computed(() => {
  if (!selectedComponent.value) return '';
  const schema = getComponentSchema(selectedComponent.value.type);
  return schema ? schema.name : selectedComponent.value.type;
});

const propertySchemas = computed<PropertySchema[]>(() => {
  if (!selectedComponent.value) return [];
  return getPropertySchemas(selectedComponent.value.type);
});

const groupedProperties = computed(() => {
  const schemas = propertySchemas.value;
  const groups: Record<string, PropertySchema[]> = {};
  const ungrouped: PropertySchema[] = [];

  schemas.forEach((schema) => {
    if (schema.group) {
      if (!groups[schema.group]) {
        groups[schema.group] = [];
      }
      groups[schema.group].push(schema);
    } else {
      ungrouped.push(schema);
    }
  });

  const result: Array<{ name: string; properties: PropertySchema[] }> = [];
  Object.keys(groups).forEach((groupName) => {
    result.push({ name: groupName, properties: groups[groupName] });
  });
  if (ungrouped.length > 0) {
    result.push({ name: '', properties: ungrouped });
  }

  return result;
});

watch(
  selectedComponent,
  (component) => {
    if (component) {
      const schemas = getPropertySchemas(component.type);
      const newFormData: Record<string, any> = {};
      const newJsonInputs: Record<string, string> = {};

      schemas.forEach((schema) => {
        if (schema.type === 'text') {
          newFormData[schema.key] = component.text ?? schema.defaultValue ?? '';
        } else if (schema.type === 'style') {
          newFormData[schema.key] = component.style ?? schema.defaultValue ?? {};
        } else if (component.props.hasOwnProperty(schema.key)) {
          newFormData[schema.key] = component.props[schema.key];
        } else if (schema.defaultValue !== undefined) {
          newFormData[schema.key] = schema.defaultValue;
        } else {
          newFormData[schema.key] = getDefaultValue(schema.type);
        }

        if (schema.type === 'json') {
          if (!newJsonInputs[schema.key]) {
            newJsonInputs[schema.key] = JSON.stringify(newFormData[schema.key], null, 2);
          }
        }
      });

      formData.value = newFormData;
      jsonInputs.value = newJsonInputs;
    } else {
      formData.value = {};
      jsonInputs.value = {};
    }
  },
  { immediate: true },
);

const handlePropertyChange = (property: PropertySchema) => {
  if (!selectedComponent.value) return;

  if (property.type === 'text') {
    store.updateComponentText(selectedComponent.value.id, formData.value[property.key] || '');
  } else if (property.type === 'style') {
    const style = formData.value[property.key] || {};
    store.updateComponentStyle(selectedComponent.value.id, style);
  } else {
    const props: Record<string, any> = {};
    propertySchemas.value.forEach((schema) => {
      if (schema.type !== 'text' && schema.type !== 'style' && formData.value.hasOwnProperty(schema.key)) {
        props[schema.key] = formData.value[schema.key];
      }
    });
    store.updateComponentProps(selectedComponent.value.id, props);
  }
};

const handleJsonChange = (key: string) => {
  try {
    const value = JSON.parse(jsonInputs.value[key] || '{}');
    formData.value[key] = value;
    const property = propertySchemas.value.find((p) => p.key === key);
    if (property) {
      handlePropertyChange(property);
    }
  } catch (error) {
    console.error('Invalid JSON:', error);
  }
};

function getDefaultValue(type: string): any {
  switch (type) {
    case 'input':
    case 'textarea':
      return '';
    case 'number':
      return 0;
    case 'switch':
      return false;
    case 'select':
      return '';
    case 'json':
      return {};
    default:
      return '';
  }
}

const getComponentName = (type: string): string => {
  const componentMap: Record<string, string> = {
    input: 'el-input',
    text: 'el-input',
    textarea: 'el-input',
    number: 'el-input-number',
    select: 'el-select',
    switch: 'el-switch',
    color: 'el-color-picker',
    json: 'el-input',
    style: 'el-input',
  };
  return componentMap[type] || 'el-input';
};

const getComponentProps = (property: PropertySchema): Record<string, any> => {
  const props: Record<string, any> = {};

  if (property.type === 'input' || property.type === 'text') {
    props.placeholder = property.placeholder;
  } else if (property.type === 'textarea' || property.type === 'json') {
    props.type = 'textarea';
    props.rows = property.type === 'json' ? 4 : 3;
    props.placeholder = property.placeholder || (property.type === 'json' ? '{}' : '');
  } else if (property.type === 'number') {
    if (property.min !== undefined) props.min = property.min;
    if (property.max !== undefined) props.max = property.max;
    if (property.step !== undefined) props.step = property.step;
    props.placeholder = property.placeholder;
  } else if (property.type === 'select') {
    props.placeholder = property.placeholder;
    props.style = { width: '100%' };
  }

  return props;
};

const getModelValue = (property: PropertySchema): any => {
  if (property.type === 'json') {
    return jsonInputs.value[property.key] || '';
  }
  if (property.type === 'style') {
    return formData.value[property.key] || {};
  }
  return formData.value[property.key];
};

const handleModelUpdate = (property: PropertySchema, value: any): void => {
  if (property.type === 'json') {
    jsonInputs.value[property.key] = value;
  } else {
    formData.value[property.key] = value;
  }
};

const handleBlur = (property: PropertySchema): void => {
  if (property.type === 'json') {
    handleJsonChange(property.key);
  }
};

const handleStyleUpdate = (property: PropertySchema, style: Record<string, string>) => {
  if (!selectedComponent.value) return;
  store.updateComponentStyle(selectedComponent.value.id, style);
  formData.value[property.key] = style;
};
</script>

<style scoped>
.property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.component-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.property-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.property-group {
  margin-top: 16px;
  margin-bottom: 8px;
}

.property-group:first-child {
  margin-top: 0;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}
</style>
