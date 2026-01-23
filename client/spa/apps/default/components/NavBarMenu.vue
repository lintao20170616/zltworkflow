<template>
  <el-menu :default-active="activeIndex" mode="horizontal" :ellipsis="false" class="navbar-menu" @select="handleSelect">
    <el-menu-item v-for="system in systemList" :key="system.id" :index="String(system.id)">
      {{ system.title }}
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{
  systemList: Array<{
    id: number;
    title: string;
    name?: string;
    menus?: any[];
  }>;
}>();

const emit = defineEmits({
  changeSystem: (value: string) => typeof value === 'string',
});

const route = useRoute();
const activeIndex = ref('1');

const handleSelect = (key: string) => {
  activeIndex.value = key;
  emit('changeSystem', key);
};

watch(
  () => route.path,
  () => {
    // 可以根据路由自动激活对应的系统
  },
  { immediate: true },
);
</script>

<style scoped lang="less">
.navbar-menu {
  background-color: transparent;
  border-bottom: none;

  :deep(.el-menu--horizontal) {
    border-bottom: none;

    .el-menu-item {
      color: var(--navbar-item-color) !important;
      height: var(--header-height) !important;
      line-height: var(--header-height) !important;
      border-bottom: 2px solid transparent !important;
      margin: 0 4px;

      &:hover {
        color: var(--navbar-item-hover-color) !important;
        border-bottom: 2px solid var(--navbar-item-hover-border) !important;
        background-color: transparent !important;
      }

      &.is-active {
        color: var(--navbar-item-active-color) !important;
        border-bottom: 2px solid var(--navbar-item-active-border) !important;
        background-color: var(--navbar-item-active-bg) !important;

        &:hover {
          color: var(--navbar-item-active-color) !important;
          border-bottom: 2px solid var(--navbar-item-active-border) !important;
          background-color: var(--navbar-item-active-bg) !important;
        }
      }
    }
  }
}
</style>
