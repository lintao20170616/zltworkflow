const { app, mock } = require('egg-mock/bootstrap');
const assert = require('assert');

describe('UserService', () => {
  let ctx;
  let userService;

  beforeEach(() => {
    ctx = app.mockContext();
    userService = ctx.service.user;
  });

  describe('findByUsername', () => {
    it('should return null when user not exist', async () => {
      const result = await userService.findByUsername('notexist');
      assert.strictEqual(result, null);
    });
  });

  describe('validateUser', () => {
    it('should return error when user not exist', async () => {
      const result = await userService.validateUser('notexist', 'password');
      assert.deepStrictEqual(result, { success: false, message: '用户名不存在' });
    });

    it('should return error when password is wrong', async () => {
      app.mockService('user', 'findByUsername', async () => ({
        status: 1,
        validatePassword: async () => false,
      }));
      const result = await userService.validateUser('admin', 'wrongpassword');
      assert.deepStrictEqual(result, { success: false, message: '密码错误' });
    });

    it('should return error when user is disabled', async () => {
      app.mockService('user', 'findByUsername', async () => ({
        status: 0,
      }));
      const result = await userService.validateUser('admin', 'password');
      assert.deepStrictEqual(result, { success: false, message: '用户已被禁用' });
    });
  });

  describe('createUser', () => {
    it('should return error when username exists', async () => {
      app.mockService('user', 'findByUsername', async () => ({ id: 1 }));
      const result = await userService.createUser('admin', 'password', 'admin@test.com');
      assert.deepStrictEqual(result, { success: false, message: '用户名已存在' });
    });
  });
});
