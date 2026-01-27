const { Service } = require('egg');

class TranslationTaskService extends Service {
  async list({ projectId, translatorId, reviewerId, status } = {}) {
    const { ctx } = this;
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

  async create({ projectId, translatorId, reviewerId, status = 1, dueDate }) {
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
        translatorId: translatorId ? Number(translatorId) : null,
        reviewerId: reviewerId ? Number(reviewerId) : null,
        status: Number(status),
        totalCount,
        progress: 0,
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
}

module.exports = TranslationTaskService;
