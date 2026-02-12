const experimentRoutes = [
  {
    path: '/javascript-test',
    name: 'JavascriptTest',
    component: () => import('../views/experiment/javascriptTest.vue'),
    meta: { requiresAuth: true },
  },
];

export default experimentRoutes;
