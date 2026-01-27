const Controller = require('egg').Controller;

class TranslationTaskController extends Controller {
  async list() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { projectId, translatorId, reviewerId, status } = ctx.request.query;
      const result = await ctx.service.translationTask.list({ projectId, translatorId, reviewerId, status });
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationTaskController] list error:', error);
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
      const { projectId, translatorId, reviewerId, status = 1, dueDate } = ctx.request.body || {};
      if (!projectId) {
        ctx.body = { code: 400, message: '项目ID不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translationTask.create({
        projectId,
        translatorId,
        reviewerId,
        status,
        dueDate,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '创建成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationTaskController] create error:', error);
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
      const { translatorId, reviewerId, status, progress, dueDate } = ctx.request.body || {};
      const result = await ctx.service.translationTask.update(id, {
        translatorId,
        reviewerId,
        status,
        progress,
        dueDate,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationTaskController] update error:', error);
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
      const result = await ctx.service.translationTask.updateStatus(id, status);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationTaskController] updateStatus error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async getStatistics() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { projectId } = ctx.request.query;
      const result = await ctx.service.translationTask.getStatistics(projectId);
      ctx.body = { code: 0, message: 'success', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationTaskController] getStatistics error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = TranslationTaskController;
