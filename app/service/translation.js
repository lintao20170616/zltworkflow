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

  async batchUpdateStatus(ids, status) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: '翻译ID列表不能为空' };
    }

    if (typeof status === 'undefined') {
      return { success: false, message: '状态不能为空' };
    }

    const translationIds = ids.map((id) => Number(id)).filter((id) => id > 0);

    if (translationIds.length === 0) {
      return { success: false, message: '无效的翻译ID列表' };
    }

    try {
      const [affectedRows] = await ctx.model.Translation.update(
        { status: Number(status) },
        {
          where: {
            id: { [Op.in]: translationIds },
          },
        },
      );

      return { success: true, data: { affectedRows } };
    } catch (error) {
      ctx.logger.error('[TranslationService] batchUpdateStatus error:', error);
      return { success: false, message: '批量更新状态失败' };
    }
  }

  async getSourceTextCount() {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    try {
      const count = await ctx.model.Translation.count({
        distinct: true,
        col: 'key',
        where: {
          sourceText: {
            [Op.ne]: null,
          },
        },
      });

      return { success: true, data: { count } };
    } catch (error) {
      ctx.logger.error('[TranslationService] getSourceTextCount error:', error);
      return { success: false, message: '获取源文案数量失败' };
    }
  }

  async translateWithAI(translationId) {
    const { ctx } = this;
    try {
      const translation = await ctx.model.Translation.findByPk(Number(translationId), {
        include: [
          {
            model: ctx.model.TranslationProject,
            as: 'project',
            include: [
              {
                model: ctx.model.Language,
                as: 'sourceLanguage',
                attributes: ['id', 'code', 'name', 'nativeName'],
              },
            ],
          },
          {
            model: ctx.model.Language,
            as: 'language',
            attributes: ['id', 'code', 'name', 'nativeName'],
          },
        ],
      });

      if (!translation) {
        return { success: false, message: '翻译内容不存在' };
      }

      if (!translation.sourceText || !translation.sourceText.trim()) {
        return { success: false, message: '源文本为空，无法翻译' };
      }

      const project = translation.project;
      if (!project) {
        return { success: false, message: '项目不存在' };
      }

      const sourceLanguage = project.sourceLanguage;
      const targetLanguage = translation.language;

      if (!sourceLanguage || !targetLanguage) {
        return { success: false, message: '语言信息不完整' };
      }

      if (!ctx.service.ollama || !ctx.service.ollama.isEnabled()) {
        return { success: false, message: 'Ollama服务未启用' };
      }

      const sourceLangName = sourceLanguage.nativeName || sourceLanguage.name || sourceLanguage.code;
      const targetLangName = targetLanguage.nativeName || targetLanguage.name || targetLanguage.code;
      const sourceText = translation.sourceText.trim();

      const prompt = `请将以下${sourceLangName}文本翻译成${targetLangName}，只返回翻译结果，不要添加任何解释或说明：

${sourceText}`;

      translation.status = 2;
      await translation.save();

      try {
        const response = await ctx.service.ollama.ollamaChat([{ role: 'user', content: prompt }], {
          temperature: 0.3,
          maxTokens: 2000,
        });

        if (!response || !response.content) {
          throw new Error('Ollama返回结果为空');
        }

        const translatedText = response.content.trim();

        translation.translatedText = translatedText;
        translation.status = 3;
        translation.translatorId = 0;
        await translation.save();

        return { success: true, data: translation };
      } catch (error) {
        translation.status = 1;
        await translation.save();
        ctx.logger.error('[TranslationService] translateWithAI Ollama error:', error);
        return { success: false, message: `AI翻译失败: ${error.message}` };
      }
    } catch (error) {
      ctx.logger.error('[TranslationService] translateWithAI error:', error);
      return { success: false, message: `翻译失败: ${error.message}` };
    }
  }

  async pullTranslations(projectId) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    try {
      const project = await ctx.model.TranslationProject.findByPk(Number(projectId), {
        include: [
          {
            model: ctx.model.Language,
            as: 'sourceLanguage',
            attributes: ['id', 'code', 'name', 'nativeName'],
          },
        ],
      });

      if (!project) {
        return { success: false, message: '项目不存在' };
      }

      const targetLanguageIds = project.targetLanguageIds || [];
      if (targetLanguageIds.length === 0) {
        return { success: false, message: '项目未配置目标语言' };
      }

      const targetLanguages = await ctx.model.Language.findAll({
        where: {
          id: { [Op.in]: targetLanguageIds },
        },
        attributes: ['id', 'code', 'name', 'nativeName'],
        order: [['sort', 'ASC']],
      });

      const result = {};
      const statistics = {};

      for (const targetLanguage of targetLanguages) {
        const translations = await ctx.model.Translation.findAll({
          where: {
            projectId: Number(projectId),
            languageId: targetLanguage.id,
            status: 3,
          },
          attributes: ['key', 'translatedText'],
        });

        const translationMap = {};
        for (const translation of translations) {
          if (translation.key && translation.translatedText) {
            translationMap[translation.key] = translation.translatedText;
          }
        }

        result[targetLanguage.code] = translationMap;
        statistics[targetLanguage.code] = {
          languageName: targetLanguage.name,
          languageCode: targetLanguage.code,
          count: Object.keys(translationMap).length,
        };
      }

      return {
        success: true,
        data: {
          translations: result,
          statistics,
          projectName: project.name,
        },
      };
    } catch (error) {
      ctx.logger.error('[TranslationService] pullTranslations error:', error);
      return { success: false, message: `拉取翻译内容失败: ${error.message}` };
    }
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
