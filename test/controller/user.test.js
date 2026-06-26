const { app, mock } = require('egg-mock/bootstrap');
const assert = require('assert');

describe('UserController', () => {
  describe('POST /api/user/login', () => {
    it('should return success when login with correct credentials', async () => {
      app.mockCsrf();
      app.mockService('user', 'validateUser', async () => ({
        success: true,
        user: { id: 1, username: 'admin', email: 'admin@test.com', status: 1 },
      }));

      const result = await app.httpRequest().post('/api/user/login').send({ username: 'admin', password: 'password' });

      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.body.code, 0);
    });

    it('should return error when login failed', async () => {
      app.mockCsrf();
      app.mockService('user', 'validateUser', async () => ({
        success: false,
        message: '密码错误',
      }));

      const result = await app.httpRequest().post('/api/user/login').send({ username: 'admin', password: 'wrong' });

      assert.strictEqual(result.status, 401);
      assert.strictEqual(result.body.code, 401);
      assert.strictEqual(result.body.message, '密码错误');
    });
  });
});
