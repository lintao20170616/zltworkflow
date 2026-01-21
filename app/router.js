module.exports = (app) => {
  const { router, controller } = app;
  // 渲染错误页面，服务器的一些错误会跳转到此页面，可以传递 msg 和 redirectUrl 两个参数
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/register', controller.user.register);
  router.get('/api/user/info', controller.user.getCurrentUser);
  router.post('/api/user/logout', controller.user.logout);
  router.get('/api/user/list', controller.user.getUserList);
  router.get('/error', controller.pages.errorPage);
  // 通用匹配，渲染页面
  router.get('/**', controller.pages.index);
};
