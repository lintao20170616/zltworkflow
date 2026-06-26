const { app, mock, assert } = require('egg-mock/bootstrap');

before(() => {
  console.log('=== 后端测试环境初始化 ===');
});

after(() => {
  console.log('=== 后端测试环境清理 ===');
});

module.exports = { app, mock, assert };
