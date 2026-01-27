const { Service } = require('egg');

class TranslationTaskService extends Service {
  async list({ projectId, translatorId, reviewerId, status, taskNumber, projectName, isBackfilled } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;
    const where = {};

    if (projectId) {
      where.projectId = Number(projectId);
    }
    if (translatorId) {
      where.translatorId = Number(translatorId);
    }
    if (reviewerId) {
      where.reviewerId = Number(reviewerId);
    }
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (taskNumber && String(taskNumber).trim()) {
      where.taskNumber = { [Op.like]: `%${String(taskNumber).trim()}%` };
    }
    if (projectName && String(projectName).trim()) {
      where.projectName = { [Op.like]: `%${String(projectName).trim()}%` };
    }
    if (typeof isBackfilled !== 'undefined' && isBackfilled !== '') {
      where.isBackfilled = Number(isBackfilled);
    }

    const tasks = await ctx.model.TranslationTask.findAll({
      where,
      include: [
        {
          model: ctx.model.TranslationProject,
          as: 'project',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, data: tasks };
  }

  async create({ projectId, taskNumber, projectName, translatorId, reviewerId, status = 1, dueDate }) {
    const { ctx } = this;
    try {
      const project = await ctx.model.TranslationProject.findByPk(Number(projectId));
      if (!project) {
        return { success: false, message: '项目不存在' };
      }

      const totalCount = await ctx.model.Translation.count({
        where: { projectId: Number(projectId) },
      });

      const task = await ctx.model.TranslationTask.create({
        projectId: Number(projectId),
        taskNumber: taskNumber || (await this.generateTaskNumber()),
        projectName: projectName || project.name,
        translatorId: translatorId ? Number(translatorId) : null,
        reviewerId: reviewerId ? Number(reviewerId) : null,
        status: Number(status),
        totalCount,
        progress: 0,
        textCount: 0,
        isBackfilled: 0,
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      return { success: true, data: task };
    } catch (error) {
      ctx.logger.error('[TranslationTaskService] create error:', error);
      return { success: false, message: '创建任务失败' };
    }
  }

  async update(id, { translatorId, reviewerId, status, progress, dueDate }) {
    const { ctx } = this;
    const task = await ctx.model.TranslationTask.findByPk(Number(id));
    if (!task) {
      return { success: false, message: '任务不存在' };
    }

    if (typeof translatorId !== 'undefined') {
      task.translatorId = translatorId ? Number(translatorId) : null;
    }
    if (typeof reviewerId !== 'undefined') {
      task.reviewerId = reviewerId ? Number(reviewerId) : null;
    }
    if (typeof status !== 'undefined') {
      task.status = Number(status);
    }
    if (typeof progress !== 'undefined') {
      task.progress = Number(progress);
    }
    if (typeof dueDate !== 'undefined') {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();
    return { success: true, data: task };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const task = await ctx.model.TranslationTask.findByPk(Number(id));
    if (!task) {
      return { success: false, message: '任务不存在' };
    }
    task.status = Number(status);
    await task.save();
    return { success: true, data: task };
  }

  async getStatistics(projectId) {
    const { ctx } = this;
    const where = projectId ? { projectId: Number(projectId) } : {};

    const total = await ctx.model.TranslationTask.count({ where });
    const byStatus = await ctx.model.TranslationTask.findAll({
      where,
      attributes: ['status', [ctx.app.Sequelize.fn('COUNT', ctx.app.Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    return {
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {}),
      },
    };
  }

  async generateTaskNumber() {
    const { ctx } = this;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TASK-${dateStr}-`;
    const todayTasks = await ctx.model.TranslationTask.count({
      where: {
        taskNumber: {
          [ctx.app.Sequelize.Op.like]: `${prefix}%`,
        },
      },
    });
    const sequence = String(todayTasks + 1).padStart(6, '0');
    return `${prefix}${sequence}`;
  }

  async getDetail(taskId) {
    const { ctx } = this;
    const task = await ctx.model.TranslationTask.findByPk(Number(taskId), {
      include: [
        {
          model: ctx.model.TranslationProject,
          as: 'project',
          attributes: ['id', 'name', 'description', 'targetLanguageIds'],
        },
      ],
    });

    if (!task) {
      return { success: false, message: '任务不存在' };
    }

    const taskData = task.toJSON();
    const project = taskData.project;
    let targetLanguages = [];
    if (project && project.targetLanguageIds && project.targetLanguageIds.length > 0) {
      targetLanguages = await ctx.model.Language.findAll({
        where: {
          id: project.targetLanguageIds,
        },
        attributes: ['id', 'code', 'name', 'nativeName'],
        order: [['sort', 'ASC']],
      });
    }

    return {
      success: true,
      data: {
        ...taskData,
        project: {
          ...project,
          targetLanguages: targetLanguages.map((lang) => lang.toJSON()),
        },
      },
    };
  }

  async getTranslations(taskId, { languageId, page = 1, pageSize = 20 } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {
      taskId: Number(taskId),
    };

    if (languageId) {
      where.languageId = Number(languageId);
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

  async backfill(taskId) {
    const { ctx } = this;
    const path = require('path');
    const fs = require('fs');

    const task = await ctx.model.TranslationTask.findByPk(Number(taskId), {
      include: [
        {
          model: ctx.model.Translation,
          as: 'translations',
          where: {
            status: 3,
          },
          include: [
            {
              model: ctx.model.Language,
              as: 'language',
              attributes: ['id', 'code', 'name'],
            },
          ],
        },
      ],
    });

    if (!task) {
      return { success: false, message: '任务不存在' };
    }

    const translations = task.translations || [];
    const translationsByLang = {};

    translations.forEach((trans) => {
      const langCode = trans.language?.code || 'unknown';
      if (!translationsByLang[langCode]) {
        translationsByLang[langCode] = {};
      }
      translationsByLang[langCode][trans.key] = trans.translatedText || '';
    });

    const localesDir = path.join(ctx.app.baseDir, '../client/spa/apps/default/i18n/locales');
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const [langCode, translations] of Object.entries(translationsByLang)) {
      const filePath = path.join(localesDir, `${langCode}.json`);
      try {
        let existingData = {};
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          existingData = JSON.parse(fileContent);
        }
        const mergedData = { ...existingData, ...translations };
        fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2), 'utf-8');
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`回填 ${langCode}.json 失败: ${error.message}`);
        ctx.logger.error(`[TranslationTaskService] backfill error for ${langCode}:`, error);
      }
    }

    if (successCount > 0) {
      task.isBackfilled = 1;
      await task.save();
    }

    return {
      success: true,
      data: {
        successCount,
        failCount,
        errors,
      },
    };
  }

  async batchTranslateWithAI(taskId) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    const Op = ctx.app.Sequelize.Op;
    try {
      // 1. 获取任务信息和项目信息
      const task = await ctx.model.TranslationTask.findByPk(Number(taskId), {
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
        ],
        transaction,
      });

      if (!task) {
        await transaction.rollback();
        return { success: false, message: '任务不存在' };
      }

      if (!ctx.service.ollama || !ctx.service.ollama.isEnabled()) {
        await transaction.rollback();
        return { success: false, message: 'Ollama服务未启用' };
      }

      // 2. 获取所有待翻译内容（状态为1-待翻译或2-翻译中）

      const translations = await ctx.model.Translation.findAll({
        where: {
          taskId: Number(taskId),
          status: { [Op.in]: [1, 2] },
        },
        include: [
          {
            model: ctx.model.Language,
            as: 'language',
            attributes: ['id', 'code', 'name', 'nativeName'],
          },
        ],
        transaction,
      });

      if (translations.length === 0) {
        await transaction.commit();
        return { success: true, data: { successCount: 0, failCount: 0, errors: [] } };
      }

      const project = task.project;
      const sourceLanguage = project.sourceLanguage;
      if (!sourceLanguage) {
        await transaction.rollback();
        return { success: false, message: '项目源语言信息不完整' };
      }

      // 3. 按目标语言分组待翻译内容
      const sourceLangName = sourceLanguage.nativeName || sourceLanguage.name || sourceLanguage.code;
      const translationsByLanguage = {};

      for (const translation of translations) {
        const targetLanguage = translation.language;
        if (!targetLanguage || !translation.sourceText || !translation.sourceText.trim()) {
          continue;
        }

        const langId = targetLanguage.id;
        if (!translationsByLanguage[langId]) {
          translationsByLanguage[langId] = {
            language: targetLanguage,
            items: [],
          };
        }
        translationsByLanguage[langId].items.push(translation);
      }

      // 4. 按语言组进行批量翻译
      let successCount = 0;
      let failCount = 0;
      const errors = [];
      const totalCount = translations.length;
      const updateBatches = {
        success: [],
        fail: [],
      };

      for (const langId in translationsByLanguage) {
        const langGroup = translationsByLanguage[langId];
        const targetLanguage = langGroup.language;
        const isTargetChinese = targetLanguage.code && targetLanguage.code.startsWith('zh');
        const targetLangName = targetLanguage.nativeName || targetLanguage.name || targetLanguage.code;
        const items = langGroup.items;

        // 4.1 如果目标语言是中文，直接复制源文本
        if (isTargetChinese) {
          for (const translation of items) {
            updateBatches.success.push({
              id: translation.id,
              translatedText: translation.sourceText.trim(),
              status: 3,
              translatorId: 0,
            });
            successCount++;
          }
          continue;
        }

        // 4.2 调用AI批量翻译
        try {
          // 构建翻译项列表
          const translationItems = items.map((item, index) => ({
            id: item.id,
            key: item.key,
            index: index + 1,
            text: item.sourceText.trim(),
          }));

          const itemsText = translationItems.map((item) => `${item.index}. [${item.key}] ${item.text}`).join('\n');

          // 根据源语言选择prompt语言
          const prompt = `请将以下${sourceLangName}文本批量翻译成${targetLangName}。

要求：
1. 返回JSON格式，格式为：{"translations": [{"index": 1, "key": "xxx", "translation": "翻译结果"}, ...]}
2. 保持原有的顺序和key
3. 只返回翻译结果，不要添加任何解释或说明
4. 确保返回的JSON格式正确，可以直接解析

待翻译内容：
${itemsText}

请直接返回JSON，不要添加任何其他文字：`;

          // 调用AI翻译
          const response = await ctx.service.ollama.ollamaChat([{ role: 'user', content: prompt }], {
            temperature: 0.3,
            maxTokens: Math.max(4000, items.length * 100),
          });

          if (!response || !response.content) {
            throw new Error('Ollama返回结果为空');
          }

          // 解析AI返回的JSON结果
          let resultData;
          try {
            const content = response.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              resultData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('无法解析JSON格式');
            }
          } catch (parseError) {
            ctx.logger.error('[TranslationTaskService] batchTranslateWithAI JSON parse error:', parseError, 'Response:', response.content);
            throw new Error('AI返回结果格式错误，无法解析JSON');
          }

          if (!resultData.translations || !Array.isArray(resultData.translations)) {
            throw new Error('AI返回结果格式错误，缺少translations数组');
          }

          // 构建翻译结果映射表
          const translationResults = {};
          for (const result of resultData.translations) {
            if (result.index && result.translation) {
              translationResults[result.index] = result.translation.trim();
            }
          }

          // 匹配翻译结果并准备批量更新
          for (const translation of items) {
            const itemIndex = translationItems.findIndex((item) => item.id === translation.id) + 1;
            const translatedText = translationResults[itemIndex];

            if (translatedText) {
              updateBatches.success.push({
                id: translation.id,
                translatedText,
                status: 3,
                translatorId: 0,
              });
              successCount++;
            } else {
              updateBatches.fail.push({
                id: translation.id,
                status: 1,
              });
              failCount++;
              errors.push(`翻译ID ${translation.id} (key: ${translation.key}): AI返回结果中缺少该条翻译`);
            }
          }
        } catch (error) {
          // AI翻译失败，将所有项标记为失败
          for (const translation of items) {
            updateBatches.fail.push({
              id: translation.id,
              status: 1,
            });
            failCount++;
            errors.push(`翻译ID ${translation.id} (key: ${translation.key}): ${error.message}`);
          }
          ctx.logger.error(`[TranslationTaskService] batchTranslateWithAI error for language ${langId}:`, error);
        }
      }

      // 5.1 批量更新成功的翻译记录（使用并行更新减少总耗时）
      if (updateBatches.success.length > 0) {
        await Promise.all(
          updateBatches.success.map((item) =>
            ctx.model.Translation.update(
              {
                translatedText: item.translatedText,
                status: item.status,
                translatorId: item.translatorId,
              },
              {
                where: { id: item.id },
                transaction,
              },
            ),
          ),
        );
      }

      // 5.2 批量更新失败的翻译记录（一次性更新所有失败项）
      if (updateBatches.fail.length > 0) {
        const failIds = updateBatches.fail.map((item) => item.id);
        await ctx.model.Translation.update(
          { status: 1 },
          {
            where: { id: { [Op.in]: failIds } },
            transaction,
          },
        );
      }

      // 6. 更新任务统计信息
      const completedCount = await ctx.model.Translation.count({
        where: {
          taskId: Number(taskId),
          status: 3,
        },
        transaction,
      });

      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      await task.update(
        {
          textCount: completedCount,
          progress,
        },
        { transaction },
      );

      await transaction.commit();

      return {
        success: true,
        data: {
          successCount,
          failCount,
          totalCount,
          errors: errors.slice(0, 20),
        },
      };
    } catch (error) {
      await transaction.rollback();
      ctx.logger.error('[TranslationTaskService] batchTranslateWithAI error:', error);
      return { success: false, message: `批量翻译失败: ${error.message}` };
    }
  }

  async delete(id) {
    const { ctx } = this;
    const task = await ctx.model.TranslationTask.findByPk(Number(id));
    if (!task) {
      return { success: false, message: '任务不存在' };
    }
    await task.destroy();
    return { success: true };
  }
}

module.exports = TranslationTaskService;
