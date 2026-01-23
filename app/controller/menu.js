const Controller = require('egg').Controller;

class MenuController extends Controller {
  async list() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { systemId, keyword, status } = ctx.request.query;
      const result = await ctx.service.menu.list({ systemId, keyword, status });
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[MenuController] list error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async create() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { systemId, parentId, title, name, path, icon, component, status = 1, sort = 0 } = ctx.request.body || {};
      if (!systemId || !title || !String(title).trim() || !name || !String(name).trim() || !path || !String(path).trim()) {
        ctx.body = { code: 400, message: 'systemId/title/name/path 不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.menu.create({
        systemId,
        parentId: parentId ?? null,
        title,
        name,
        path,
        icon,
        component,
        status,
        sort,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '创建成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[MenuController] create error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async update() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body || {};
      const result = await ctx.service.menu.update(id, updates);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[MenuController] update error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async delete() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { id } = ctx.params;
      const result = await ctx.service.menu.delete(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '删除成功', data: null };
    } catch (error) {
      ctx.logger.error('[MenuController] delete error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async updateStatus() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body || {};
      if (typeof status === 'undefined') {
        ctx.body = { code: 400, message: 'status 不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.menu.updateStatus(id, status);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[MenuController] updateStatus error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = MenuController;
