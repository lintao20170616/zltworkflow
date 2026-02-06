<template>
  <div class="preview-panel">
    <div class="panel-header">
      <h3>预览</h3>
      <div class="preview-controls">
        <el-button-group>
          <el-button :type="previewMode === 'pc' ? 'primary' : 'default'" size="small" @click="previewMode = 'pc'"> PC </el-button>
          <el-button :type="previewMode === 'mobile' ? 'primary' : 'default'" size="small" @click="previewMode = 'mobile'"> 移动 </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="preview-content" :class="{ 'mobile-view': previewMode === 'mobile' }">
      <lowcode-renderer :config="renderConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLowcodeStore } from '@app/store/lowcode';
import LowcodeRenderer from './LowcodeRenderer.vue';

const store = useLowcodeStore();
const previewMode = ref<'pc' | 'mobile'>('pc');

const renderConfig = computed(() => store.exportConfig());
</script>

<style scoped>
.preview-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.preview-content.mobile-view {
  max-width: 375px;
  margin: 0 auto;
  background: #fff;
}
</style>
