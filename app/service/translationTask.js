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
          attributes: ['id', 'name', 'description'],
        },
        {
          model: ctx.model.Translation,
          as: 'translations',
          include: [
            {
              model: ctx.model.Language,
              as: 'language',
              attributes: ['id', 'code', 'name', 'nativeName'],
            },
          ],
        },
      ],
    });

    if (!task) {
      return { success: false, message: '任务不存在' };
    }

    return { success: true, data: task };
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
