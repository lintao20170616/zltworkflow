const Controller = require('egg').Controller;

class SystemController extends Controller {
  async list() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { keyword, status } = ctx.request.query;
      const result = await ctx.service.system.list({ keyword, status });
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[SystemController] list error:', error);
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
      const { code, name, status = 1, isExternal = 0, externalUrl, sort = 0 } = ctx.request.body || {};
      if (!code || !String(code).trim() || !name || !String(name).trim()) {
        ctx.body = { code: 400, message: '系统编码和系统名称不能为空', data: null };
        ctx.status = 400;
        return;
      }
      if (Number(isExternal) === 1 && (!externalUrl || !String(externalUrl).trim())) {
        ctx.body = { code: 400, message: '外部系统必须填写外部系统URL', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.system.create({ code, name, status, isExternal, externalUrl, sort });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '创建成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[SystemController] create error:', error);
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
      const { code, name, status, isExternal, externalUrl, sort } = ctx.request.body || {};
      if (typeof isExternal !== 'undefined' && Number(isExternal) === 1 && (!externalUrl || !String(externalUrl).trim())) {
        ctx.body = { code: 400, message: '外部系统必须填写外部系统URL', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.system.update(id, { code, name, status, isExternal, externalUrl, sort });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[SystemController] update error:', error);
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
      const result = await ctx.service.system.delete(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '删除成功', data: null };
    } catch (error) {
      ctx.logger.error('[SystemController] delete error:', error);
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
      const result = await ctx.service.system.updateStatus(id, status);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[SystemController] updateStatus error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async menuTree() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { systemId, status } = ctx.request.query;
      const result = await ctx.service.system.menuTree({ systemId, status });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[SystemController] menuTree error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = SystemController;
