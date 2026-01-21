import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../store';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/layout',
    component: () => import('../components/Layout.vue'),
    redirect: '/layout/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'user-info',
        name: 'UserInfo',
        component: () => import('../views/UserInfo.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'chatbot',
        name: 'ChatBot',
        component: () => import('../views/ChatBot.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.user) {
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
