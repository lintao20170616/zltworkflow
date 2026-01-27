const Controller = require('egg').Controller;

class TranslationProjectController extends Controller {
  async list() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { keyword, status } = ctx.request.query;
      const result = await ctx.service.translationProject.list({ keyword, status });
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] list error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async getById() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { id } = ctx.params;
      const result = await ctx.service.translationProject.getById(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] getById error:', error);
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
      const { name, description, sourceLanguageId, targetLanguageIds, status = 1 } = ctx.request.body || {};
      if (!name || !String(name).trim() || !sourceLanguageId) {
        ctx.body = { code: 400, message: '项目名称和源语言不能为空', data: null };
        ctx.status = 400;
        return;
      }
      if (!Array.isArray(targetLanguageIds) || targetLanguageIds.length === 0) {
        ctx.body = { code: 400, message: '至少需要选择一个目标语言', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translationProject.create({
        name,
        description,
        sourceLanguageId,
        targetLanguageIds,
        status,
        createdBy: ctx.session.user.id,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '创建成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] create error:', error);
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
      const { name, description, sourceLanguageId, targetLanguageIds, status } = ctx.request.body || {};
      const result = await ctx.service.translationProject.update(id, {
        name,
        description,
        sourceLanguageId,
        targetLanguageIds,
        status,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] update error:', error);
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
      const result = await ctx.service.translationProject.delete(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '删除成功', data: null };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] delete error:', error);
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
      const result = await ctx.service.translationProject.updateStatus(id, status);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationProjectController] updateStatus error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = TranslationProjectController;
