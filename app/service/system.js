const { Service } = require('egg');

class SystemService extends Service {
  async list({ keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ code: { [Op.like]: kw } }, { name: { [Op.like]: kw } }];
    }

    const systems = await ctx.model.System.findAll({
      where,
      order: [
        ['sort', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    return { success: true, data: systems };
  }

  async create({ code, name, status = 1, sort = 0 }) {
    const { ctx } = this;
    const existing = await ctx.model.System.findOne({ where: { code: String(code) } });
    if (existing) {
      return { success: false, message: '系统编码已存在' };
    }

    const system = await ctx.model.System.create({
      code: String(code),
      name: String(name),
      status: Number(status),
      sort: Number(sort),
    });

    return { success: true, data: system };
  }

  async update(id, { code, name, status, sort }) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }

    if (typeof code !== 'undefined' && String(code) !== system.code) {
      const existing = await ctx.model.System.findOne({ where: { code: String(code) } });
      if (existing) {
        return { success: false, message: '系统编码已存在' };
      }
      system.code = String(code);
    }

    if (typeof name !== 'undefined') {
      system.name = String(name);
    }
    if (typeof status !== 'undefined') {
      system.status = Number(status);
    }
    if (typeof sort !== 'undefined') {
      system.sort = Number(sort);
    }

    await system.save();
    return { success: true, data: system };
  }

  async delete(id) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }
    await system.destroy();
    return { success: true };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }
    system.status = Number(status);
    await system.save();
    return { success: true, data: system };
  }
}

module.exports = SystemService;
