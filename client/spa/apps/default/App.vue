<template>
  <router-view />
</template>

<script setup lang="ts">
import { useUserStore } from './store/user';
import { onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

onMounted(async () => {
  const isLoggedIn = await userStore.checkLoginStatus();
  if (route.path === '/' && isLoggedIn) {
    router.push('/layout');
  } else if (route.path !== '/' && !isLoggedIn) {
    router.push('/');
  }
});

watch(
  () => route.path,
  async (newPath) => {
    if (newPath !== '/') {
      const isLoggedIn = await userStore.checkLoginStatus();
      if (!isLoggedIn) {
        router.push('/');
      }
    }
  },
);
</script>
