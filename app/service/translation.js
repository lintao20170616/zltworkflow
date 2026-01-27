const { Service } = require('egg');

class TranslationService extends Service {
  async list({ projectId, languageId, keyword, status, page = 1, pageSize = 20 } = {}) {
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

    const currentPage = Number(page) || 1;
    const limit = Number(pageSize) || 20;
    const offset = (currentPage - 1) * limit;

    const { count, rows: translations } = await ctx.model.Translation.findAndCountAll({
      where,
      include: [
        {
          model: ctx.model.Language,
          as: 'language',
          attributes: ['id', 'code', 'name', 'nativeName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      data: translations,
      pagination: {
        total: count,
        current: currentPage,
        pageSize: limit,
      },
    };
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

  async pushDefaultJson(projectId, defaultJsonPath, defaultJsonData) {
    const { ctx } = this;
    const path = require('path');
    const fs = require('fs');

    try {
      const project = await ctx.model.TranslationProject.findByPk(Number(projectId));
      if (!project) {
        return { success: false, message: '项目不存在' };
      }

      const targetLanguageIds = project.targetLanguageIds || [];
      if (targetLanguageIds.length === 0) {
        return { success: false, message: '项目未配置目标语言' };
      }

      const taskNumber = await ctx.service.translationTask.generateTaskNumber();
      const task = await ctx.model.TranslationTask.create({
        projectId: Number(projectId),
        taskNumber,
        projectName: project.name,
        status: 1,
        isBackfilled: 0,
        textCount: 0,
        progress: 0,
        totalCount: 0,
      });

      let defaultJson;
      if (defaultJsonData) {
        defaultJson = defaultJsonData;
      } else {
        const jsonPath = defaultJsonPath || path.join(ctx.app.baseDir, '../client/spa/apps/default/i18n/locales/default.json');
        if (!fs.existsSync(jsonPath)) {
          await task.destroy();
          return { success: false, message: 'default.json 文件不存在' };
        }
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        defaultJson = JSON.parse(fileContent);
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      for (const [uuid, sourceText] of Object.entries(defaultJson)) {
        for (const languageId of targetLanguageIds) {
          try {
            const existing = await ctx.model.Translation.findOne({
              where: {
                projectId: Number(projectId),
                key: String(uuid),
                languageId: Number(languageId),
              },
            });

            if (existing) {
              continue;
            }

            await ctx.model.Translation.create({
              projectId: Number(projectId),
              key: String(uuid),
              sourceText: String(sourceText),
              languageId: Number(languageId),
              translatedText: null,
              status: 1,
              taskId: task.id,
            });

            successCount++;
          } catch (error) {
            failCount++;
            errors.push(`创建翻译记录失败 (UUID: ${uuid}, Language: ${languageId}): ${error.message}`);
            ctx.logger.error(`[TranslationService] pushDefaultJson error:`, error);
          }
        }
      }

      task.textCount = successCount;
      task.totalCount = successCount;
      await task.save();

      return {
        success: true,
        data: {
          taskId: task.id,
          taskNumber: task.taskNumber,
          successCount,
          failCount,
          errors: errors.slice(0, 10),
        },
      };
    } catch (error) {
      ctx.logger.error('[TranslationService] pushDefaultJson error:', error);
      return { success: false, message: `推送失败: ${error.message}` };
    }
  }
}

module.exports = TranslationService;
