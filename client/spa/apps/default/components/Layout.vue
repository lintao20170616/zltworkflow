<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>ZLT Admin</h2>
      </div>
      <el-menu :default-active="activeMenu" router class="sidebar-menu" :ellipsis="false">
        <el-menu-item v-for="item in menuList" :key="item.id" :index="item.path" :route="{ name: item.name }">
          <el-icon>
            <component :is="getIcon(item.icon)" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <nav-bar-menu :system-list="systemList" @change-system="handleChangeSystem" />
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><user /></el-icon>
              <span>{{ userStore.user?.username || '用户' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-header class="tabs-header">
        <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange" @tab-remove="handleTabRemove">
          <el-tab-pane v-for="tab in tabs" :key="tab.fullPath" :name="tab.fullPath" :label="tab.title" :closable="tab.closable" />
        </el-tabs>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component, route: viewRoute }">
          <keep-alive>
            <component :is="Component" :key="viewRoute.fullPath" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { Odometer, User, ChatLineRound, ArrowDown, Setting, Menu as MenuIcon, HomeFilled } from '@element-plus/icons-vue';
import { useUserStore, useMenuStore } from '../store';
import NavBarMenu from './NavBarMenu.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const menuStore = useMenuStore();
const currentSystemId = ref<number | null>(1);

const systemList = computed(() => menuStore.systemList);

const handleChangeSystem = (value: string) => {
  currentSystemId.value = Number(value);
};

const menuList = computed(() => {
  if (currentSystemId.value && systemList.value.length > 0) {
    return systemList.value.find((sys) => sys.id === currentSystemId.value)?.children || [];
  }
  return [];
});

const activeMenu = computed(() => {
  return route.path;
});

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Odometer,
    User,
    ChatLineRound,
    Setting,
    Menu: MenuIcon,
    HomeFilled,
  };
  return iconMap[iconName] || Odometer;
};

type LayoutTab = {
  fullPath: string;
  path: string;
  title: string;
  closable: boolean;
};

const DASHBOARD_PATH = '/layout/dashboard';

const tabs = ref<LayoutTab[]>([]);
const activeTab = ref('');

const getMenuTitleByPath = (items: any[], path: string): string | undefined => {
  for (const item of items) {
    if (item?.path === path) return item?.title;
    const children = item?.children;
    if (Array.isArray(children) && children.length > 0) {
      const title = getMenuTitleByPath(children, path);
      if (title) return title;
    }
  }
  return undefined;
};

const getAllMenuItems = computed(() => {
  const allItems: any[] = [];
  menuStore.systemList.forEach((sys) => {
    if (sys.children) {
      allItems.push(...sys.children);
    }
  });
  return allItems;
});

const upsertTab = (r: RouteLocationNormalizedLoaded) => {
  if (!r?.fullPath?.startsWith('/layout')) return;

  const titleFromMenu = getMenuTitleByPath(getAllMenuItems.value, r.path);
  const titleFromRoute = typeof r.meta?.title === 'string' ? (r.meta.title as string) : undefined;
  const title = titleFromMenu || titleFromRoute || (typeof r.name === 'string' ? r.name : r.path);

  const closable = r.path !== DASHBOARD_PATH;
  const existing = tabs.value.find((t) => t.fullPath === r.fullPath);
  if (existing) {
    existing.title = title;
    existing.path = r.path;
    existing.closable = closable;
    return;
  }

  tabs.value.push({
    fullPath: r.fullPath,
    path: r.path,
    title,
    closable,
  });
};

watch(
  () => route.fullPath,
  () => {
    activeTab.value = route.fullPath;
    upsertTab(route);
  },
  { immediate: true },
);

const handleTabChange = (name: string) => {
  if (name && name !== route.fullPath) {
    router.push(name);
  }
};

const handleTabRemove = (name: string) => {
  const removing = tabs.value.find((t) => t.fullPath === name);
  if (!removing || !removing.closable) return;

  const idx = tabs.value.findIndex((t) => t.fullPath === name);
  if (idx < 0) return;

  const isRemovingActive = name === route.fullPath;
  tabs.value.splice(idx, 1);

  if (!isRemovingActive) return;

  const next = tabs.value[idx] || tabs.value[idx - 1] || tabs.value[0];
  if (next?.fullPath) router.push(next.fullPath);
};

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
  }
};
onMounted(() => {});
</script>

<style scoped lang="less">
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: var(--sidebar-bg);
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--sidebar-logo-bg);
    color: var(--bg-white);

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .sidebar-menu {
    border-right: none;
    background-color: var(--sidebar-bg);

    &:not(.el-menu--collapse) {
      width: var(--sidebar-width);
    }

    :deep(.el-menu-item) {
      color: var(--menu-item-color);

      &:hover {
        background-color: var(--menu-item-hover-bg);
        color: var(--menu-item-hover-color);
      }

      &.is-active {
        background-color: var(--menu-item-active-bg);
        color: var(--menu-item-active-color);

        &:hover {
          background-color: var(--menu-item-active-bg);
          color: var(--menu-item-active-color);
        }
      }
    }
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  padding: var(--header-padding);

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--user-info-color);

    span {
      margin-left: 8px;
      margin-right: 8px;
    }
  }
}

.tabs-header {
  padding: var(--tabs-header-padding);
  background-color: var(--tabs-header-bg);
  border-bottom: 1px solid var(--tabs-header-border);
  height: var(--tabs-header-height);
  display: flex;
  align-items: center;

  :deep(.el-tabs__header) {
    margin: 0;
  }
}

.main-content {
  background-color: var(--main-content-bg);
  padding: var(--main-content-padding);
  overflow-y: auto;
}
</style>
