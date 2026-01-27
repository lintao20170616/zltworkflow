const { Service } = require('egg');

class TranslationProjectService extends Service {
  async list({ keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ name: { [Op.like]: kw } }, { description: { [Op.like]: kw } }];
    }

    const projects = await ctx.model.TranslationProject.findAll({
      where,
      include: [
        {
          model: ctx.model.Language,
          as: 'sourceLanguage',
          attributes: ['id', 'code', 'name', 'nativeName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const projectList = projects.map((project) => {
      const projectData = project.toJSON();
      return {
        ...projectData,
        targetLanguageIds: projectData.targetLanguageIds || [],
      };
    });

    return { success: true, data: projectList };
  }

  async getById(id) {
    const { ctx } = this;
    const project = await ctx.model.TranslationProject.findByPk(Number(id), {
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

    const projectData = project.toJSON();
    const targetLanguageIds = projectData.targetLanguageIds || [];

    let targetLanguages = [];
    if (targetLanguageIds.length > 0) {
      targetLanguages = await ctx.model.Language.findAll({
        where: {
          id: targetLanguageIds,
        },
        attributes: ['id', 'code', 'name', 'nativeName'],
        order: [['sort', 'ASC']],
      });
    }

    return {
      success: true,
      data: {
        ...projectData,
        targetLanguageIds,
        targetLanguages: targetLanguages.map((lang) => lang.toJSON()),
      },
    };
  }

  async create({ name, description, sourceLanguageId, targetLanguageIds, status = 1, createdBy }) {
    const { ctx } = this;
    try {
      const project = await ctx.model.TranslationProject.create({
        name: String(name),
        description: description ? String(description) : null,
        sourceLanguageId: Number(sourceLanguageId),
        targetLanguageIds: Array.isArray(targetLanguageIds) ? targetLanguageIds : [],
        status: Number(status),
        createdBy: createdBy ? Number(createdBy) : null,
      });

      return { success: true, data: project };
    } catch (error) {
      ctx.logger.error('[TranslationProjectService] create error:', error);
      return { success: false, message: '创建项目失败' };
    }
  }

  async update(id, { name, description, sourceLanguageId, targetLanguageIds, status }) {
    const { ctx } = this;
    const project = await ctx.model.TranslationProject.findByPk(Number(id));
    if (!project) {
      return { success: false, message: '项目不存在' };
    }

    if (typeof name !== 'undefined') {
      project.name = String(name);
    }
    if (typeof description !== 'undefined') {
      project.description = description ? String(description) : null;
    }
    if (typeof sourceLanguageId !== 'undefined') {
      project.sourceLanguageId = Number(sourceLanguageId);
    }
    if (typeof targetLanguageIds !== 'undefined') {
      project.targetLanguageIds = Array.isArray(targetLanguageIds) ? targetLanguageIds : [];
    }
    if (typeof status !== 'undefined') {
      project.status = Number(status);
    }

    await project.save();
    return { success: true, data: project };
  }

  async delete(id) {
    const { ctx } = this;
    const project = await ctx.model.TranslationProject.findByPk(Number(id));
    if (!project) {
      return { success: false, message: '项目不存在' };
    }
    await project.destroy();
    return { success: true };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const project = await ctx.model.TranslationProject.findByPk(Number(id));
    if (!project) {
      return { success: false, message: '项目不存在' };
    }
    project.status = Number(status);
    await project.save();
    return { success: true, data: project };
  }
}

module.exports = TranslationProjectService;
