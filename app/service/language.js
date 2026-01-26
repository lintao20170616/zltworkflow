const { Service } = require('egg');

class LanguageService extends Service {
  async list({ keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ code: { [Op.like]: kw } }, { name: { [Op.like]: kw } }, { nativeName: { [Op.like]: kw } }];
    }

    const languages = await ctx.model.Language.findAll({
      where,
      order: [
        ['sort', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    return { success: true, data: languages };
  }

  async create({ code, name, nativeName, flag, status = 1, sort = 0 }) {
    const { ctx } = this;
    const existing = await ctx.model.Language.findOne({ where: { code: String(code) } });
    if (existing) {
      return { success: false, message: '语言代码已存在' };
    }

    const language = await ctx.model.Language.create({
      code: String(code),
      name: String(name),
      nativeName: nativeName ? String(nativeName) : null,
      flag: flag ? String(flag) : null,
      status: Number(status),
      sort: Number(sort),
    });

    return { success: true, data: language };
  }

  async update(id, { code, name, nativeName, flag, status, sort }) {
    const { ctx } = this;
    const language = await ctx.model.Language.findByPk(Number(id));
    if (!language) {
      return { success: false, message: '语言不存在' };
    }

    if (typeof code !== 'undefined' && String(code) !== language.code) {
      const existing = await ctx.model.Language.findOne({ where: { code: String(code) } });
      if (existing) {
        return { success: false, message: '语言代码已存在' };
      }
      language.code = String(code);
    }

    if (typeof name !== 'undefined') {
      language.name = String(name);
    }
    if (typeof nativeName !== 'undefined') {
      language.nativeName = nativeName ? String(nativeName) : null;
    }
    if (typeof flag !== 'undefined') {
      language.flag = flag ? String(flag) : null;
    }
    if (typeof status !== 'undefined') {
      language.status = Number(status);
    }
    if (typeof sort !== 'undefined') {
      language.sort = Number(sort);
    }

    await language.save();
    return { success: true, data: language };
  }

  async delete(id) {
    const { ctx } = this;
    const language = await ctx.model.Language.findByPk(Number(id));
    if (!language) {
      return { success: false, message: '语言不存在' };
    }
    await language.destroy();
    return { success: true };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const language = await ctx.model.Language.findByPk(Number(id));
    if (!language) {
      return { success: false, message: '语言不存在' };
    }
    language.status = Number(status);
    await language.save();
    return { success: true, data: language };
  }
}

module.exports = LanguageService;
