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
      :src="iframeSrc"
      :title="iframeTitle"
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Loading, WarningFilled } from '@element-plus/icons-vue';
import { useMenuStore } from '../store';

interface Props {
  src?: string;
  title?: string;
  fullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '嵌入页面',
  fullscreen: false,
});

const route = useRoute();
const menuStore = useMenuStore();

const iframeSrc = computed(() => {
  if (props.src) {
    return props.src;
  }

  if (route.name === 'Iframe' && route.params.systemId && route.params.pathMatch) {
    const systemCode = String(route.params.systemId);
    const menuPath = `/${Array.isArray(route.params.pathMatch) ? route.params.pathMatch.join('/') : route.params.pathMatch}`;
    const system = menuStore.systemList.find((sys) => sys.code === systemCode);

    if (system && system.externalUrl) {
      const baseUrl = system.externalUrl.trim();
      const path = menuPath.trim();

      if (baseUrl && path) {
        const baseUrlEndsWithSlash = baseUrl.endsWith('/');
        const pathStartsWithSlash = path.startsWith('/');

        if (baseUrlEndsWithSlash && pathStartsWithSlash) {
          return baseUrl + path.slice(1);
        } else if (!baseUrlEndsWithSlash && !pathStartsWithSlash) {
          return baseUrl + '/' + path;
        } else {
          return baseUrl + path;
        }
      }
    }
  }

  return '';
});

const iframeTitle = computed(() => {
  if (props.title && props.title !== '嵌入页面') {
    return props.title;
  }

  if (route.name === 'Iframe' && route.params.systemId && route.params.pathMatch) {
    const systemCode = String(route.params.systemId);
    const menuPath = `/${Array.isArray(route.params.pathMatch) ? route.params.pathMatch.join('/') : route.params.pathMatch}`;
    const system = menuStore.systemList.find((sys) => sys.code === systemCode);

    if (system) {
      const getMenuByPath = (items: any[], path: string): any | undefined => {
        for (const item of items) {
          if (item?.path === path) return item;
          const children = item?.children;
          if (Array.isArray(children) && children.length > 0) {
            const found = getMenuByPath(children, path);
            if (found) return found;
          }
        }
        return undefined;
      };

      const menuItem = getMenuByPath(system.children || [], menuPath);
      if (menuItem) {
        return menuItem.title;
      }
      return system.name;
    }
  }

  return '嵌入页面';
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
  iframeRef.value.src = iframeSrc.value;
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
  () => iframeSrc.value,
  () => {
    if (iframeSrc.value) {
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
