const { Service } = require('egg');

class TranslationService extends Service {
  async list({ projectId, languageId, keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (projectId) {
      where.projectId = Number(projectId);
    }
    if (languageId) {
      where.languageId = Number(languageId);
    }
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ key: { [Op.like]: kw } }, { sourceText: { [Op.like]: kw } }, { translatedText: { [Op.like]: kw } }];
    }

    const translations = await ctx.model.Translation.findAll({
      where,
      include: [
        {
          model: ctx.model.Language,
          as: 'language',
          attributes: ['id', 'code', 'name', 'nativeName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, data: translations };
  }

  async create({ projectId, key, sourceText, languageId, translatedText, status = 1, translatorId, reviewerId }) {
    const { ctx } = this;
    try {
      const existing = await ctx.model.Translation.findOne({
        where: {
          projectId: Number(projectId),
          key: String(key),
          languageId: Number(languageId),
        },
      });

      if (existing) {
        return { success: false, message: '该键值在此语言下已存在' };
      }

      const translation = await ctx.model.Translation.create({
        projectId: Number(projectId),
        key: String(key),
        sourceText: sourceText ? String(sourceText) : null,
        languageId: Number(languageId),
        translatedText: translatedText ? String(translatedText) : null,
        status: Number(status),
        translatorId: translatorId ? Number(translatorId) : null,
        reviewerId: reviewerId ? Number(reviewerId) : null,
      });

      return { success: true, data: translation };
    } catch (error) {
      ctx.logger.error('[TranslationService] create error:', error);
      return { success: false, message: '创建翻译内容失败' };
    }
  }

  async update(id, { key, sourceText, translatedText, status, translatorId, reviewerId }) {
    const { ctx } = this;
    const translation = await ctx.model.Translation.findByPk(Number(id));
    if (!translation) {
      return { success: false, message: '翻译内容不存在' };
    }

    if (typeof key !== 'undefined') {
      translation.key = String(key);
    }
    if (typeof sourceText !== 'undefined') {
      translation.sourceText = sourceText ? String(sourceText) : null;
    }
    if (typeof translatedText !== 'undefined') {
      translation.translatedText = translatedText ? String(translatedText) : null;
    }
    if (typeof status !== 'undefined') {
      translation.status = Number(status);
    }
    if (typeof translatorId !== 'undefined') {
      translation.translatorId = translatorId ? Number(translatorId) : null;
    }
    if (typeof reviewerId !== 'undefined') {
      translation.reviewerId = reviewerId ? Number(reviewerId) : null;
    }

    await translation.save();
    return { success: true, data: translation };
  }

  async delete(id) {
    const { ctx } = this;
    const translation = await ctx.model.Translation.findByPk(Number(id));
    if (!translation) {
      return { success: false, message: '翻译内容不存在' };
    }
    await translation.destroy();
    return { success: true };
  }
}

module.exports = TranslationService;
