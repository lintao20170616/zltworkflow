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

  // 聊天机器人接口
  router.post('/api/chatbot/send', controller.chatbot.sendMessage);
  router.get('/api/chatbot/conversations', controller.chatbot.getConversations);
  router.get('/api/chatbot/messages/:conversationId', controller.chatbot.getMessages);
  router.post('/api/chatbot/conversations', controller.chatbot.createConversation);
  router.delete('/api/chatbot/conversations/:id', controller.chatbot.deleteConversation);
  router.get('/api/chatbot/test-ollama', controller.chatbot.testOllama);

  router.get('/error', controller.pages.errorPage);
  // 通用匹配，渲染页面
  router.get('/**', controller.pages.index);
};
