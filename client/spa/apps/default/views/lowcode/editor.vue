<template>
  <div class="lowcode-editor">
    <div class="editor-header">
      <div class="header-left">
        <h2>低代码页面编辑器</h2>
      </div>
      <div class="header-right">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button :icon="DocumentChecked" :loading="saving" @click="saveProject">保存</el-button>
        <el-button :icon="Download" @click="exportConfig">导出JSON</el-button>
        <el-button :type="previewMode ? 'primary' : 'default'" @click="togglePreview">
          {{ previewMode ? '编辑' : '预览' }}
        </el-button>
        <el-button :icon="RefreshLeft" :disabled="!canUndo" @click="undo">撤销</el-button>
        <el-button :icon="RefreshRight" :disabled="!canRedo" @click="redo">重做</el-button>
      </div>
    </div>
    <div class="editor-body">
      <div class="editor-left">
        <component-library />
      </div>
      <div class="editor-center">
        <canvas-area />
      </div>
      <div class="editor-right">
        <property-panel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download, RefreshLeft, RefreshRight, DocumentChecked, ArrowLeft } from '@element-plus/icons-vue';
import { useLowcodeStore } from '@app/store/lowcode';
import ComponentLibrary from '@app/components/lowcode/ComponentLibrary.vue';
import CanvasArea from '@app/components/lowcode/CanvasArea.vue';
import PropertyPanel from '@app/components/lowcode/PropertyPanel.vue';

const STORAGE_KEY = 'lowcode_projects';

const route = useRoute();
const router = useRouter();
const store = useLowcodeStore();
const saving = ref(false);
const canUndo = computed(() => store.canUndo);
const canRedo = computed(() => store.canRedo);
const previewMode = computed(() => store.previewMode);
const togglePreview = () => store.togglePreview();
const projectId = computed(() => route.query.projectId as string | undefined);

const undo = () => {
  store.undo();
};

const redo = () => {
  store.redo();
};

const loadProject = () => {
  if (!projectId.value) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const projects = JSON.parse(stored);
    const project = projects.find((p: any) => p.id === projectId.value);

    if (project && project.config) {
      store.loadConfig(project.config);
    }
  } catch (error) {
    console.error('Failed to load project:', error);
  }
};

const saveProject = async () => {
  if (!projectId.value) {
    ElMessage.warning('请先创建项目');
    return;
  }

  saving.value = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];
    const projectIndex = projects.findIndex((p: any) => p.id === projectId.value);

    if (projectIndex !== -1) {
      const config = store.exportConfig();
      projects[projectIndex] = {
        ...projects[projectIndex],
        config,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      ElMessage.success('保存成功');
    } else {
      ElMessage.error('项目不存在');
    }
  } catch (error) {
    ElMessage.error('保存失败');
    console.error(error);
  } finally {
    saving.value = false;
  }
};

const exportConfig = () => {
  const config = store.exportConfig();
  const jsonStr = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'page-config.json';
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success('配置已导出');
};

const goBack = () => {
  router.push('/lowcode/projects');
};

onMounted(() => {
  loadProject();
});
</script>

<style scoped>
.lowcode-editor {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.editor-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-left {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  background: #fff;
}

.editor-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.editor-right {
  width: 320px;
  border-left: 1px solid #e4e7ed;
  background: #fff;
}
</style>
