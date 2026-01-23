import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/layout',
  },
  {
    path: '/login',
    name: 'Login',
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

export default router;
