const Controller = require('egg').Controller;

class TranslationController extends Controller {
  async list() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { projectId, languageId, keyword, status, page, pageSize } = ctx.request.query;
      const result = await ctx.service.translation.list({ projectId, languageId, keyword, status, page, pageSize });
      ctx.body = { code: 0, message: 'success', data: { data: result.data, pagination: result.pagination } };
    } catch (error) {
      ctx.logger.error('[TranslationController] create error:', error);
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
      const { projectId, key, sourceText, languageId, translatedText, status = 1 } = ctx.request.body || {};
      if (!projectId || !key || !String(key).trim() || !languageId) {
        ctx.body = { code: 400, message: '项目ID、翻译键和语言ID不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translation.create({ projectId, key, sourceText, languageId, translatedText, status });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '创建成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] create error:', error);
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
      const { key, sourceText, translatedText, status } = ctx.request.body || {};
      const result = await ctx.service.translation.update(id, {
        key,
        sourceText,
        translatedText,
        status,
      });
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] update error:', error);
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
      const result = await ctx.service.translation.delete(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '删除成功', data: null };
    } catch (error) {
      ctx.logger.error('[TranslationController] delete error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async translateWithAI() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { id } = ctx.params;
      const result = await ctx.service.translation.translateWithAI(id);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: 'AI翻译成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] translateWithAI error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async pullTranslations() {
    const { ctx } = this;
    try {
      const { projectId } = ctx.request.query;
      if (!projectId) {
        ctx.body = { code: 400, message: '项目ID不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translation.pullTranslations(projectId);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '拉取成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] pullTranslations error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async pushDefaultJson() {
    const { ctx } = this;
    try {
      const { projectId, defaultJsonPath, defaultJson } = ctx.request.body || {};
      if (!projectId) {
        ctx.body = { code: 400, message: '项目ID不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translation.pushDefaultJson(projectId, defaultJsonPath, defaultJson);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '推送成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] pushDefaultJson error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async batchUpdateStatus() {
    const { ctx } = this;
    if (!ctx.session.user?.id) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }
    try {
      const { ids, status } = ctx.request.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        ctx.body = { code: 400, message: '翻译ID列表不能为空', data: null };
        ctx.status = 400;
        return;
      }
      if (typeof status === 'undefined') {
        ctx.body = { code: 400, message: '状态不能为空', data: null };
        ctx.status = 400;
        return;
      }
      const result = await ctx.service.translation.batchUpdateStatus(ids, status);
      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }
      ctx.body = { code: 0, message: '批量更新成功', data: result.data };
    } catch (error) {
      ctx.logger.error('[TranslationController] batchUpdateStatus error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = TranslationController;
