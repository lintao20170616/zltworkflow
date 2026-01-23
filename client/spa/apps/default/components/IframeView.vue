<template>
  <div class="iframe-view" :class="{ 'iframe-view--fullscreen': fullscreen }">
    <div v-if="loading" class="iframe-view__loading">
      <el-icon class="is-loading"><loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-if="error" class="iframe-view__error">
      <el-icon><warning-filled /></el-icon>
      <span>{{ error }}</span>
      <el-button type="primary" size="small" @click="handleRetry">重试</el-button>
    </div>
    <iframe
      ref="iframeRef"
      :src="src"
      :title="title"
      class="iframe-view__frame"
      :class="{ 'iframe-view__frame--hidden': loading || error }"
      frameborder="0"
      allowfullscreen
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Loading, WarningFilled } from '@element-plus/icons-vue';

interface Props {
  src: string;
  title?: string;
  fullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '嵌入页面',
  fullscreen: false,
});

const iframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(true);
const error = ref<string>('');

const handleLoad = () => {
  loading.value = false;
  error.value = '';
};

const handleError = () => {
  loading.value = false;
  error.value = '页面加载失败，请检查URL是否正确';
};

const handleRetry = () => {
  if (!iframeRef.value) return;
  loading.value = true;
  error.value = '';
  iframeRef.value.src = props.src;
};

const handleMessage = (event: MessageEvent) => {
  if (!iframeRef.value || event.source !== iframeRef.value.contentWindow) {
    return;
  }
};

const sendMessage = (data: any) => {
  if (!iframeRef.value?.contentWindow) return;
  iframeRef.value.contentWindow.postMessage(data, '*');
};

watch(
  () => props.src,
  () => {
    if (props.src) {
      loading.value = true;
      error.value = '';
    }
  },
);

onMounted(() => {
  window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
});

defineExpose({
  sendMessage,
  iframe: iframeRef,
});
</script>

<style scoped lang="less">
.iframe-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
  }

  &__loading,
  &__error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    z-index: 10;

    .el-icon {
      font-size: 48px;
      color: var(--el-color-primary);
    }

    span {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  &__error {
    .el-icon {
      color: var(--el-color-error);
    }
  }

  &__frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;

    &--hidden {
      visibility: hidden;
    }
  }
}
</style>
