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
    component: () => import('../views/auth/login.vue'),
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
        component: () => import('../views/dashboard/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'userinfo',
        name: 'UserInfo',
        component: () => import('../views/user/info.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'chatbot',
        name: 'ChatBot',
        component: () => import('../views/chatbot/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'system',
        name: 'SystemManage',
        component: () => import('../views/system/manage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'menu',
        name: 'MenuManage',
        component: () => import('../views/menu/manage.vue'),
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
