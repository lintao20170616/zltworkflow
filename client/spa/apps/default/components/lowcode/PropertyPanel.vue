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
            <el-input
              v-if="property.type === 'input'"
              v-model="formData[property.key]"
              :placeholder="property.placeholder"
              @change="handlePropertyChange(property)"
            />
            <el-input
              v-else-if="property.type === 'text'"
              v-model="formData[property.key]"
              :placeholder="property.placeholder"
              @input="handlePropertyChange(property)"
            />
            <el-input
              v-else-if="property.type === 'textarea'"
              v-model="formData[property.key]"
              type="textarea"
              :rows="3"
              :placeholder="property.placeholder"
              @change="handlePropertyChange(property)"
            />
            <el-input-number
              v-else-if="property.type === 'number'"
              v-model="formData[property.key]"
              :min="property.min"
              :max="property.max"
              :step="property.step"
              :placeholder="property.placeholder"
              @change="handlePropertyChange(property)"
            />
            <el-select
              v-else-if="property.type === 'select'"
              v-model="formData[property.key]"
              :placeholder="property.placeholder"
              style="width: 100%"
              @change="handlePropertyChange(property)"
            >
              <el-option v-for="option in property.options" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-switch v-else-if="property.type === 'switch'" v-model="formData[property.key]" @change="handlePropertyChange(property)" />
            <el-color-picker v-else-if="property.type === 'color'" v-model="formData[property.key]" @change="handlePropertyChange(property)" />
            <el-input
              v-else-if="property.type === 'json' || property.type === 'style'"
              v-model="jsonInputs[property.key]"
              type="textarea"
              :rows="4"
              :placeholder="property.placeholder || '{}'"
              @blur="handleJsonChange(property.key)"
            />
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
          newJsonInputs[schema.key] = JSON.stringify(newFormData[schema.key], null, 2);
        } else if (component.props.hasOwnProperty(schema.key)) {
          newFormData[schema.key] = component.props[schema.key];
        } else if (schema.defaultValue !== undefined) {
          newFormData[schema.key] = schema.defaultValue;
        } else {
          newFormData[schema.key] = getDefaultValue(schema.type);
        }

        if (schema.type === 'json' || schema.type === 'style') {
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
    try {
      const style = JSON.parse(jsonInputs.value[property.key] || '{}');
      store.updateComponentStyle(selectedComponent.value.id, style);
      formData.value[property.key] = style;
    } catch (error) {
      console.error('Invalid style JSON:', error);
    }
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

const handleChange = () => {
  if (selectedComponent.value) {
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
