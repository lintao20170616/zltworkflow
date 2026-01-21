const Controller = require('egg').Controller;

class UserController extends Controller {
  async test() {
    this.ctx.body = { code: 0, message: 'success', data: 'Hello world' };
  }

  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    if (!username || !password) {
      ctx.body = { code: 400, message: '用户名和密码不能为空', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.user.validateUser(username, password);

      if (!result.success) {
        ctx.body = { code: 401, message: result.message, data: null };
        ctx.status = 401;
        return;
      }
      const user = result.user;
      ctx.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
      };
      ctx.body = {
        code: 0,
        message: '登录成功',
        data: {
          userInfo: {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
          },
        },
      };
    } catch (error) {
      ctx.logger.error('[UserController] login error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async register() {
    const { ctx } = this;
    const { username, password, confirmPassword, email } = ctx.request.body;

    if (!username || !password || !confirmPassword) {
      ctx.body = { code: 400, message: '用户名、密码和确认密码不能为空', data: null };
      ctx.status = 400;
      return;
    }

    if (password !== confirmPassword) {
      ctx.body = { code: 400, message: '两次输入的密码不一致', data: null };
      ctx.status = 400;
      return;
    }

    if (username.length < 3 || username.length > 50) {
      ctx.body = { code: 400, message: '用户名长度为3-50个字符', data: null };
      ctx.status = 400;
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      ctx.body = { code: 400, message: '用户名只能包含字母、数字和下划线', data: null };
      ctx.status = 400;
      return;
    }

    if (password.length < 6) {
      ctx.body = { code: 400, message: '密码至少6位', data: null };
      ctx.status = 400;
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.body = { code: 400, message: '邮箱格式不正确', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.user.createUser(username, password, email);

      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }

      const user = result.user;
      ctx.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
      };

      ctx.body = {
        code: 0,
        message: '注册成功',
        data: {
          userInfo: user,
        },
      };
    } catch (error) {
      ctx.logger.error('[UserController] register error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async getCurrentUser() {
    const { ctx } = this;
    if (ctx.session && ctx.session.user) {
      ctx.body = {
        code: 0,
        message: 'success',
        data: {
          userInfo: ctx.session.user,
        },
      };
    } else {
      ctx.logger.warn('[UserController] Session 已过期或不存在');
      ctx.body = {
        code: 401,
        message: '未登录',
      };
      ctx.status = 401;
    }
  }

  async logout() {
    const { ctx } = this;
    ctx.session.user = null;
    ctx.body = { code: 0, message: '退出成功', data: null };
  }

  async getUserList() {
    const { ctx } = this;
    try {
      const result = await ctx.service.user.getUserList();
      if (!result.success) {
        ctx.body = { code: 500, message: result.message, data: null };
        ctx.status = 500;
        return;
      }
      ctx.body = {
        code: 0,
        message: 'success',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[UserController] getUserList error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = UserController;
