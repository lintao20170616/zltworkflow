<template>
  <router-view />
</template>

<script setup lang="ts">
import { useUserStore } from './store/user';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const userStore = useUserStore();
onMounted(async () => {
  const isLoggedIn = await userStore.checkLoginStatus();
  if (!isLoggedIn) {
    router.push('/');
  }
});
// App 根组件
</script>
