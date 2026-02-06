<template>
  <div class="component-library">
    <div class="library-header">
      <h3>组件库</h3>
    </div>
    <el-tabs v-model="activeCategory" tab-position="left" class="library-tabs">
      <el-tab-pane v-for="category in categories" :key="category.key" :name="category.key">
        <template #label>
          <el-tooltip :content="category.label" placement="right">
            <el-icon><component :is="category.icon" /></el-icon>
          </el-tooltip>
        </template>
        <div class="component-list">
          <div
            v-for="component in category.components"
            :key="component.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
            @dragend="handleDragEnd"
          >
            <div class="component-icon">
              <el-icon :size="24">
                <component :is="component.icon" />
              </el-icon>
            </div>
            <div class="component-name">{{ component.name }}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Document,
  Edit,
  Search,
  Calendar,
  Check,
  CircleCheck,
  Switch,
  DataAnalysis,
  CreditCard,
  List,
  PriceTag,
  Grid,
  Box,
  Menu,
} from '@element-plus/icons-vue';

interface ComponentMeta {
  type: string;
  name: string;
  icon: any;
  category: string;
}

const activeCategory = ref('basic');

const categories = [
  {
    key: 'basic',
    label: '基础组件',
    icon: Menu,
    components: [
      { type: 'el-button', name: '按钮', icon: Document, category: 'basic' },
      { type: 'el-text', name: '文本', icon: Edit, category: 'basic' },
    ],
  },
  {
    key: 'form',
    label: '表单组件',
    icon: Edit,
    components: [
      { type: 'el-input', name: '输入框', icon: Edit, category: 'form' },
      { type: 'el-select', name: '选择器', icon: Search, category: 'form' },
      { type: 'el-date-picker', name: '日期选择', icon: Calendar, category: 'form' },
      { type: 'el-checkbox', name: '复选框', icon: Check, category: 'form' },
      { type: 'el-radio', name: '单选框', icon: CircleCheck, category: 'form' },
      { type: 'el-switch', name: '开关', icon: Switch, category: 'form' },
    ],
  },
  {
    key: 'display',
    label: '数据展示',
    icon: DataAnalysis,
    components: [
      { type: 'el-table', name: '表格', icon: DataAnalysis, category: 'display' },
      { type: 'el-card', name: '卡片', icon: CreditCard, category: 'display' },
      { type: 'el-list', name: '列表', icon: List, category: 'display' },
      { type: 'el-tag', name: '标签', icon: PriceTag, category: 'display' },
    ],
  },
  {
    key: 'layout',
    label: '布局组件',
    icon: Grid,
    components: [
      { type: 'el-row', name: '栅格行', icon: Grid, category: 'layout' },
      { type: 'el-col', name: '栅格列', icon: Grid, category: 'layout' },
      { type: 'el-container', name: '容器', icon: Box, category: 'layout' },
    ],
  },
];

const handleDragStart = (event: DragEvent, component: ComponentMeta) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(component));
  }
};

const handleDragEnd = () => {
  // 拖拽结束处理
};
</script>

<style scoped>
.component-library {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.library-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.library-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.library-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  height: 100%;
}

.library-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 16px 0;
  flex-shrink: 0;
}

.library-tabs :deep(.el-tabs__nav-wrap) {
  height: 100%;
}

.library-tabs :deep(.el-tabs__nav) {
  flex-direction: column;
  width: 100%;
}

.library-tabs :deep(.el-tabs__item) {
  padding: 16px;
  text-align: center;
  height: auto;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.library-tabs :deep(.el-tabs__item .el-icon) {
  font-size: 20px;
}

.library-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  background: #fff;
}

.component-item:hover {
  border-color: #409eff;
  color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  margin-bottom: 8px;
  color: #606266;
}

.component-item:hover .component-icon {
  color: #409eff;
}

.component-name {
  font-size: 12px;
  color: #606266;
}

.component-item:hover .component-name {
  color: #409eff;
}
</style>
