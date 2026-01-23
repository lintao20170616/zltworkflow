const { Service } = require('egg');

class MenuService extends Service {
  async list({ systemId, keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (systemId) {
      where.systemId = Number(systemId);
    }
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ title: { [Op.like]: kw } }, { name: { [Op.like]: kw } }, { path: { [Op.like]: kw } }];
    }

    const menus = await ctx.model.Menu.findAll({
      where,
      order: [
        ['sort', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    return { success: true, data: menus };
  }

  async create({ systemId, parentId = null, title, name, path, icon = null, component = null, status = 1, sort = 0 }) {
    const { ctx } = this;

    const system = await ctx.model.System.findByPk(Number(systemId));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }

    if (parentId) {
      const parent = await ctx.model.Menu.findByPk(Number(parentId));
      if (!parent) {
        return { success: false, message: '父菜单不存在' };
      }
      if (Number(parent.systemId) !== Number(systemId)) {
        return { success: false, message: '父菜单不属于当前系统' };
      }
    }

    const menu = await ctx.model.Menu.create({
      systemId: Number(systemId),
      parentId: parentId ? Number(parentId) : null,
      title: String(title),
      name: String(name),
      path: String(path),
      icon: icon ? String(icon) : null,
      component: component ? String(component) : null,
      status: Number(status),
      sort: Number(sort),
    });

    return { success: true, data: menu };
  }

  async update(id, updates = {}) {
    const { ctx } = this;
    const menu = await ctx.model.Menu.findByPk(Number(id));
    if (!menu) {
      return { success: false, message: '菜单不存在' };
    }

    if (typeof updates.systemId !== 'undefined' && Number(updates.systemId) !== Number(menu.systemId)) {
      const system = await ctx.model.System.findByPk(Number(updates.systemId));
      if (!system) {
        return { success: false, message: '系统不存在' };
      }
      menu.systemId = Number(updates.systemId);
    }

    if ('parentId' in updates) {
      const parentId = updates.parentId;
      if (!parentId) {
        menu.parentId = null;
      } else {
        if (Number(parentId) === Number(menu.id)) {
          return { success: false, message: '父菜单不能是自己' };
        }
        const parent = await ctx.model.Menu.findByPk(Number(parentId));
        if (!parent) {
          return { success: false, message: '父菜单不存在' };
        }
        if (Number(parent.systemId) !== Number(menu.systemId)) {
          return { success: false, message: '父菜单不属于当前系统' };
        }
        menu.parentId = Number(parentId);
      }
    }

    if (typeof updates.title !== 'undefined') {
      menu.title = String(updates.title);
    }
    if (typeof updates.name !== 'undefined') {
      menu.name = String(updates.name);
    }
    if (typeof updates.path !== 'undefined') {
      menu.path = String(updates.path);
    }
    if ('icon' in updates) {
      menu.icon = updates.icon ? String(updates.icon) : null;
    }
    if ('component' in updates) {
      menu.component = updates.component ? String(updates.component) : null;
    }
    if (typeof updates.status !== 'undefined') {
      menu.status = Number(updates.status);
    }
    if (typeof updates.sort !== 'undefined') {
      menu.sort = Number(updates.sort);
    }

    await menu.save();
    return { success: true, data: menu };
  }

  async delete(id) {
    const { ctx } = this;
    const menu = await ctx.model.Menu.findByPk(Number(id));
    if (!menu) {
      return { success: false, message: '菜单不存在' };
    }
    await menu.destroy();
    return { success: true };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const menu = await ctx.model.Menu.findByPk(Number(id));
    if (!menu) {
      return { success: false, message: '菜单不存在' };
    }
    menu.status = Number(status);
    await menu.save();
    return { success: true, data: menu };
  }
}

module.exports = MenuService;
