<template>
  <div class="style-editor">
    <div v-if="styleEntries.length === 0" class="style-empty">
      <el-text type="info" size="small">暂无样式，点击下方按钮添加</el-text>
    </div>
    <div v-else class="style-list">
      <div v-for="(entry, index) in styleEntries" :key="index" class="style-item">
        <el-input
          v-model="entry.key"
          placeholder="属性名，如：width"
          size="small"
          class="style-key"
          @input="handleValueChange(index)"
          @blur="handleKeyChange(index)"
        />
        <el-input
          v-model="entry.value"
          placeholder="属性值，如：100px"
          size="small"
          class="style-value"
          @input="handleValueChange(index)"
          @blur="handleValueChange(index)"
        />
        <el-button type="danger" :icon="Delete" size="small" circle @click="removeStyle(index)" />
      </div>
    </div>
    <div class="style-actions">
      <el-button type="primary" :icon="Plus" size="small" @click="addStyle">添加样式</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>];
}>();

interface StyleEntry {
  key: string;
  value: string;
}

const styleEntries = ref<StyleEntry[]>([]);

const updateEntries = () => {
  const entries: StyleEntry[] = [];
  const styleObj = props.modelValue || {};
  Object.keys(styleObj).forEach((key) => {
    if (key) {
      entries.push({
        key,
        value: styleObj[key] || '',
      });
    }
  });
  styleEntries.value = entries;
};

const emitUpdate = () => {
  const style: Record<string, string> = {};
  styleEntries.value.forEach((entry) => {
    const key = entry.key?.trim();
    if (key) {
      style[key] = entry.value?.trim() || '';
    }
  });
  emit('update:modelValue', style);
};

const addStyle = () => {
  styleEntries.value.push({ key: '', value: '' });
};

const removeStyle = (index: number) => {
  styleEntries.value.splice(index, 1);
  emitUpdate();
};

const handleKeyChange = (index: number) => {
  emitUpdate();
};

const handleValueChange = (index: number) => {
  emitUpdate();
};

watch(
  () => props.modelValue,
  () => {
    updateEntries();
  },
  { immediate: true, deep: true },
);
</script>

<style scoped>
.style-editor {
  width: 100%;
}

.style-empty {
  padding: 12px;
  text-align: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.style-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.style-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.style-key {
  flex: 0 0 100px;
}

.style-value {
  flex: 1;
}

.style-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
