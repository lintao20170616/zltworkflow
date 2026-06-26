module.exports = (app) => {
  const { router, controller } = app;
  // 渲染错误页面，服务器的一些错误会跳转到此页面，可以传递 msg 和 redirectUrl 两个参数
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/register', controller.user.register);
  router.get('/api/user/info', controller.user.getCurrentUser);
  router.post('/api/user/logout', controller.user.logout);
  router.get('/api/user/list', controller.user.getUserList);

  // 系统管理接口
  router.get('/api/system/list', controller.system.list);
  router.post('/api/system', controller.system.create);
  router.put('/api/system/:id', controller.system.update);
  router.delete('/api/system/:id', controller.system.delete);
  router.patch('/api/system/:id/status', controller.system.updateStatus);
  router.get('/api/system/menu-tree', controller.system.menuTree);

  // 菜单管理接口
  router.get('/api/menu/list', controller.menu.list);
  router.post('/api/menu', controller.menu.create);
  router.put('/api/menu/:id', controller.menu.update);
  router.delete('/api/menu/:id', controller.menu.delete);
  router.patch('/api/menu/:id/status', controller.menu.updateStatus);

  // 语言管理接口
  router.get('/api/language/list', controller.language.list);
  router.post('/api/language', controller.language.create);
  router.put('/api/language/:id', controller.language.update);
  router.delete('/api/language/:id', controller.language.delete);
  router.patch('/api/language/:id/status', controller.language.updateStatus);

  // 翻译平台接口
  router.get('/api/translation/projects', controller.translationProject.list);
  router.get('/api/translation/projects/:id', controller.translationProject.getById);
  router.post('/api/translation/projects', controller.translationProject.create);
  router.put('/api/translation/projects/:id', controller.translationProject.update);
  router.delete('/api/translation/projects/:id', controller.translationProject.delete);
  router.patch('/api/translation/projects/:id/status', controller.translationProject.updateStatus);

  router.get('/api/translation/contents', controller.translation.list);
  router.post('/api/translation/contents', controller.translation.create);
  router.put('/api/translation/contents/:id', controller.translation.update);
  router.delete('/api/translation/contents/:id', controller.translation.delete);
  router.post('/api/translation/contents/:id/translate-with-ai', controller.translation.translateWithAI);
  router.post('/api/translation/contents/batch-update-status', controller.translation.batchUpdateStatus);

  router.get('/api/translation/tasks', controller.translationTask.list);
  router.get('/api/translation/tasks/statistics', controller.translationTask.getStatistics);
  router.get('/api/translation/tasks/weekly-count', controller.translationTask.getWeeklyTaskCount);
  router.get('/api/translation/tasks/:id', controller.translationTask.getDetail);
  router.get('/api/translation/tasks/:id/translations', controller.translationTask.getTranslations);
  router.post('/api/translation/tasks', controller.translationTask.create);
  router.put('/api/translation/tasks/:id', controller.translationTask.update);
  router.patch('/api/translation/tasks/:id/status', controller.translationTask.updateStatus);
  router.post('/api/translation/tasks/:id/backfill', controller.translationTask.backfill);
  router.post('/api/translation/tasks/:id/batch-translate-with-ai', controller.translationTask.batchTranslateWithAI);
  router.delete('/api/translation/tasks/:id', controller.translationTask.delete);
  router.get('/api/translation/source-text-count', controller.translation.getSourceTextCount);

  router.get('/api/translation/pullTranslations', controller.translation.pullTranslations);
  router.post('/api/translation/push-default-json', controller.translation.pushDefaultJson);

  router.get('/error', controller.pages.errorPage);
  // 通用匹配，渲染页面（静态资源由 Egg.js static 中间件自动处理）
  router.get('/**', controller.pages.index);
};
