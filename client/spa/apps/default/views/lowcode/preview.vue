<template>
  <div class="preview-page">
    <div class="preview-header">
      <h3>页面预览</h3>
      <div class="preview-controls">
        <el-button-group>
          <el-button :type="previewMode === 'pc' ? 'primary' : 'default'" size="small" @click="previewMode = 'pc'"> PC </el-button>
          <el-button :type="previewMode === 'mobile' ? 'primary' : 'default'" size="small" @click="previewMode = 'mobile'"> 移动 </el-button>
        </el-button-group>
        <el-button :icon="ArrowLeft" size="small" @click="goBack">返回</el-button>
      </div>
    </div>
    <div class="preview-content" :class="{ 'mobile-view': previewMode === 'mobile' }">
      <lowcode-renderer :config="renderConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import type { PageConfig } from '@app/store/lowcode';
import LowcodeRenderer from '@app/components/lowcode/LowcodeRenderer.vue';

const route = useRoute();
const router = useRouter();
const previewMode = ref<'pc' | 'mobile'>('pc');
const renderConfig = ref<PageConfig>({
  version: '1.0.0',
  page: { title: '', layout: 'container' },
  components: [],
});

const loadConfig = () => {
  const configKey = route.query.configKey as string | undefined;
  if (configKey) {
    try {
      const configJson = sessionStorage.getItem(configKey);
      if (configJson) {
        const config = JSON.parse(configJson);
        renderConfig.value = config;
        sessionStorage.removeItem(configKey);
      }
    } catch (error) {
      console.error('Failed to load config from sessionStorage:', error);
    }
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.preview-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.preview-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.preview-controls {
  display: flex;
  gap: 12px;
  align-items: center;
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
