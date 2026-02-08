<template>
  <router-view />
</template>

<script setup lang="ts">
import { useUserStore } from './store/user';
import { useMenuStore } from './store/menu';
import { onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const menuStore = useMenuStore();

onMounted(async () => {
  const isLoggedIn = await userStore.checkLoginStatus();
  if (isLoggedIn) {
    await menuStore.fetchSystemMenuTree();
  }
  if (route.path === '/' && isLoggedIn) {
    router.push('/');
  } else if (route.path !== '/' && !isLoggedIn) {
    console.log('跳转到登录页面');
    router.push('/login');
  }
});

watch(
  () => route.path,
  async (newPath) => {
    if (newPath !== '/') {
      const isLoggedIn = await userStore.checkLoginStatus();
      if (!isLoggedIn) {
        menuStore.clearMenuData();
        router.push('/login');
      } else if (menuStore.systemList.length === 0) {
        await menuStore.fetchSystemMenuTree();
      }
    }
  },
);
</script>
